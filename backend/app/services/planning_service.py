import random
import uuid
from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, delete
from sqlalchemy.orm import selectinload

from app.models.collection_plan import CollectionPlan, PlanStatus, PlanHorizon, PlanStrategy
from app.models.collection_plan_item import CollectionPlanItem, CollectionPlanVehicle, PlanItemAssignmentStatus
from app.models.planning_constraints import PlanningConstraint, CollectionWindow
from app.models.planning_conflict import PlanningConflict, ConflictType, ConflictSeverity
from app.models.planning_route_proposal import PlanningRouteProposal, PlanningRouteProposalStop
from app.models.bin import Bin, BinStatus, CollectionPriority
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.user import User, UserRole, UserStatus
from app.models.route import Route, RouteStatus, RoutePriority
from app.models.route_stop import RouteStop, StopStatus

from app.schemas.planning import (
    CollectionPlanCreate,
    CollectionPlanUpdate,
    PlanningConstraintUpdate,
    CollectionWindowCreate,
    OptimizationPreviewRequest,
)

from app.services.planning_priority_service import planning_priority_service
from app.services.planning_validation_service import planning_validation_service
from app.services.planning_optimization_service import planning_optimization_service
from app.services.route_service import RouteService


class PlanningService:
    """Core service for Collection Planning lifecycle, CRUD, constraint validation, and route handover."""

    @staticmethod
    async def generate_plan_code(db: AsyncSession) -> str:
        """Generates unique plan code e.g. PLAN-001, PLAN-002."""
        res = await db.execute(select(CollectionPlan.plan_code))
        codes = res.scalars().all()
        max_num = 0
        for c in codes:
            if c and c.startswith("PLAN-"):
                try:
                    num = int(c.split("-")[1])
                    if num > max_num:
                        max_num = num
                except ValueError:
                    pass
        return f"PLAN-{max_num + 1:03d}"

    @classmethod
    async def get_summary(cls, db: AsyncSession) -> Dict[str, Any]:
        """Calculates high-level planning operational metrics for dashboard/summary API."""
        # 1. Bins requiring collection (fill >= 70% or overflow)
        bins_res = await db.execute(
            select(Bin).where(or_(Bin.fill_level >= 70.0, Bin.status == BinStatus.CRITICAL))
        )
        prio_bins = bins_res.scalars().all()

        total_est_waste = sum((b.capacity_kg or 240.0) * ((b.fill_level or 70.0) / 100.0) for b in prio_bins)

        # 2. Available vehicles
        veh_res = await db.execute(select(Vehicle).where(Vehicle.status == VehicleStatus.AVAILABLE))
        avail_vehs = len(veh_res.scalars().all())

        # 3. Available drivers
        drv_res = await db.execute(
            select(User).where(and_(User.role == UserRole.DRIVER, User.status == UserStatus.ACTIVE))
        )
        avail_drvs = len(drv_res.scalars().all())

        # 4. Plan counts
        plans_res = await db.execute(select(CollectionPlan))
        all_plans = plans_res.scalars().all()
        active_count = sum(1 for p in all_plans if p.status in [PlanStatus.DRAFT, PlanStatus.CALCULATING, PlanStatus.READY, PlanStatus.IN_PROGRESS])
        ready_count = sum(1 for p in all_plans if p.status == PlanStatus.READY)

        # 5. Unassigned bins in active plans
        unassigned_count = sum(p.unassigned_bins for p in all_plans if p.status in [PlanStatus.DRAFT, PlanStatus.CALCULATING, PlanStatus.READY])

        # 6. Critical blocking conflicts
        conflicts_res = await db.execute(
            select(PlanningConflict).where(and_(PlanningConflict.blocking == True, PlanningConflict.resolved == False))
        )
        critical_conflicts = len(conflicts_res.scalars().all())

        return {
            "bins_requiring_collection": len(prio_bins),
            "estimated_waste_kg": round(total_est_waste, 1),
            "available_vehicles": avail_vehs,
            "available_drivers": avail_drvs,
            "active_plans_count": active_count,
            "ready_plans_count": ready_count,
            "unassigned_bins": unassigned_count,
            "critical_conflicts_count": critical_conflicts,
        }

    @classmethod
    async def get_plans(
        cls,
        db: AsyncSession,
        status_filter: Optional[PlanStatus] = None,
        date_filter: Optional[date] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[CollectionPlan], int]:
        """Retrieves collection plans with optional filtering."""
        query = select(CollectionPlan).order_by(CollectionPlan.created_at.desc())

        if status_filter:
            query = query.where(CollectionPlan.status == status_filter)
        if date_filter:
            query = query.where(CollectionPlan.planning_date == date_filter)

        count_query = select(func.count()).select_from(query.subquery())
        total = (await db.execute(count_query)).scalar_one()

        plans = (await db.execute(query.offset(offset).limit(limit))).scalars().all()
        return list(plans), total

    @classmethod
    async def get_plan(cls, db: AsyncSession, plan_id: int) -> CollectionPlan:
        """Fetches a single collection plan by ID."""
        res = await db.execute(
            select(CollectionPlan)
            .where(CollectionPlan.id == plan_id)
            .options(
                selectinload(CollectionPlan.items),
                selectinload(CollectionPlan.assigned_vehicles),
                selectinload(CollectionPlan.conflicts),
                selectinload(CollectionPlan.proposals).selectinload(PlanningRouteProposal.stops),
            )
        )
        plan = res.scalar_one_or_none()
        if not plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Collection Plan ID {plan_id} not found.")
        return plan

    @classmethod
    async def create_plan(
        cls,
        db: AsyncSession,
        obj_in: CollectionPlanCreate,
        creator_id: Optional[int] = None,
    ) -> CollectionPlan:
        """Creates a new Collection Plan, populating target bin items."""
        code = await cls.generate_plan_code(db)

        plan = CollectionPlan(
            plan_code=code,
            planning_date=obj_in.planning_date,
            horizon=obj_in.horizon,
            strategy=obj_in.strategy,
            start_time=obj_in.start_time,
            end_time=obj_in.end_time,
            status=PlanStatus.DRAFT,
            created_by_id=creator_id,
        )
        db.add(plan)
        await db.flush()

        # Target bins selection
        bin_query = select(Bin).where(Bin.status != BinStatus.INACTIVE)
        if obj_in.bin_ids:
            bin_query = bin_query.where(Bin.id.in_(obj_in.bin_ids))
        elif obj_in.target_zones:
            bin_query = bin_query.where(Bin.zone.in_(obj_in.target_zones))
        else:
            # Default to bins with fill >= 60% or overflow
            bin_query = bin_query.where(or_(Bin.fill_level >= 60.0, Bin.status == BinStatus.CRITICAL))

        target_bins = (await db.execute(bin_query)).scalars().all()

        total_kg = 0.0
        for b in target_bins:
            pred_fill = getattr(b, "predicted_fill_percentage", None) or b.fill_level or 0.0
            overflow = b.status == BinStatus.CRITICAL or pred_fill >= 90.0
            prio_str, est_kg = planning_priority_service.calculate_bin_priority(b, pred_fill, overflow)
            total_kg += est_kg

            item = CollectionPlanItem(
                plan_id=plan.id,
                bin_id=b.id,
                zone=b.zone,
                priority=prio_str,
                estimated_waste_kg=est_kg,
                current_fill_percentage=b.fill_level or 0.0,
                predicted_fill_percentage=pred_fill,
                predicted_overflow=overflow,
                prediction_confidence=0.92,
                collection_window="MORNING",
                assignment_status=PlanItemAssignmentStatus.UNASSIGNED,
            )
            db.add(item)

        plan.total_bins = len(target_bins)
        plan.unassigned_bins = len(target_bins)
        plan.estimated_waste_kg = round(total_kg, 1)

        plan_id = plan.id
        await db.commit()
        return await cls.get_plan(db, plan_id)

    @classmethod
    async def update_plan(
        cls,
        db: AsyncSession,
        plan_id: int,
        obj_in: CollectionPlanUpdate,
    ) -> CollectionPlan:
        """Updates plan metadata or status with validation."""
        plan = await cls.get_plan(db, plan_id)

        if obj_in.status and obj_in.status != plan.status:
            if not planning_validation_service.validate_state_transition(plan.status, obj_in.status):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid plan state transition from {plan.status.value} to {obj_in.status.value}.",
                )
            plan.status = obj_in.status

        if obj_in.strategy:
            plan.strategy = obj_in.strategy
        if obj_in.horizon:
            plan.horizon = obj_in.horizon
        if obj_in.start_time:
            plan.start_time = obj_in.start_time
        if obj_in.end_time:
            plan.end_time = obj_in.end_time

        await db.commit()
        return await cls.get_plan(db, plan_id)

    @classmethod
    async def calculate_and_optimize_plan(cls, db: AsyncSession, plan_id: int) -> CollectionPlan:
        """Runs optimization engine on a plan, generating route proposals."""
        plan = await cls.get_plan(db, plan_id)
        plan.status = PlanStatus.CALCULATING
        await db.flush()

        # Clear existing proposals & conflicts
        await db.execute(delete(PlanningRouteProposal).where(PlanningRouteProposal.plan_id == plan_id))
        await db.execute(delete(PlanningConflict).where(PlanningConflict.plan_id == plan_id))
        await db.execute(delete(CollectionPlanVehicle).where(CollectionPlanVehicle.plan_id == plan_id))
        plan.proposals = []
        plan.conflicts = []
        plan.assigned_vehicles = []

        # Fetch bins & available resources
        items = plan.items
        bin_ids = [it.bin_id for it in items]
        bins_res = await db.execute(select(Bin).where(Bin.id.in_(bin_ids)))
        target_bins = list(bins_res.scalars().all())

        vehs_res = await db.execute(select(Vehicle).where(Vehicle.status == VehicleStatus.AVAILABLE))
        available_vehicles = list(vehs_res.scalars().all())

        drvs_res = await db.execute(select(User).where(and_(User.role == UserRole.DRIVER, User.status == UserStatus.ACTIVE)))
        available_drivers = list(drvs_res.scalars().all())

        # Run optimization
        opt_res = await planning_optimization_service.optimize_plan_allocations(
            session=db,
            target_bins=target_bins,
            available_vehicles=available_vehicles,
            available_drivers=available_drivers,
            strategy=plan.strategy,
        )

        # Create proposals & plan vehicles
        unassigned_set = set(opt_res["unassigned_bin_ids"])

        for prop_data in opt_res["proposals"]:
            prop = PlanningRouteProposal(
                plan=plan,
                plan_id=plan.id,
                vehicle_id=prop_data["vehicle_id"],
                driver_id=prop_data["driver_id"],
                estimated_distance_km=prop_data["estimated_distance_km"],
                estimated_duration_minutes=prop_data["estimated_duration_minutes"],
                estimated_load_kg=prop_data["estimated_load_kg"],
                utilization_percentage=prop_data["utilization_percentage"],
                stop_count=prop_data["stop_count"],
                status="PROPOSED",
            )
            db.add(prop)
            await db.flush()

            for sdata in prop_data["stops"]:
                pstop = PlanningRouteProposalStop(
                    proposal=prop,
                    proposal_id=prop.id,
                    bin_id=sdata["bin_id"],
                    sequence=sdata["sequence"],
                    estimated_arrival=sdata["estimated_arrival"],
                    estimated_collection_kg=sdata["estimated_collection_kg"],
                )
                db.add(pstop)

            # Record vehicle allocation
            cpv = CollectionPlanVehicle(
                plan=plan,
                plan_id=plan.id,
                vehicle_id=prop_data["vehicle_id"],
                driver_id=prop_data["driver_id"],
                planned_load_kg=prop_data["estimated_load_kg"],
                utilization_percentage=prop_data["utilization_percentage"],
                planned_stops=prop_data["stop_count"],
                estimated_distance_km=prop_data["estimated_distance_km"],
                estimated_duration_minutes=prop_data["estimated_duration_minutes"],
                assignment_status="ALLOCATED",
            )
            db.add(cpv)

        # Update items assignment status
        for it in items:
            if it.bin_id in unassigned_set:
                it.assignment_status = PlanItemAssignmentStatus.UNASSIGNED
            else:
                it.assignment_status = PlanItemAssignmentStatus.ASSIGNED

        # Detect conflicts
        detected_conflicts = await planning_validation_service.detect_plan_conflicts(
            session=db,
            plan=plan,
            items=items,
            assigned_vehicles=plan.assigned_vehicles,
        )

        for cdata in detected_conflicts:
            conflict = PlanningConflict(
                plan=plan,
                plan_id=plan.id,
                type=cdata["type"],
                severity=cdata["severity"],
                message=cdata["message"],
                entity_type=cdata.get("entity_type"),
                entity_id=cdata.get("entity_id"),
                blocking=cdata.get("blocking", False),
            )
            db.add(conflict)

        # Update metrics
        plan.assigned_bins = opt_res["assigned_bins_count"]
        plan.unassigned_bins = len(unassigned_set)
        plan.estimated_distance_km = opt_res["total_distance_km"]
        plan.estimated_duration_minutes = opt_res["total_duration_minutes"]
        plan.average_vehicle_utilization = opt_res["average_utilization"]

        # Transition status to READY if no blocking conflicts, else DRAFT
        has_blocking = any(c.get("blocking") for c in detected_conflicts)
        plan.status = PlanStatus.DRAFT if has_blocking else PlanStatus.READY

        plan_id = plan.id
        await db.commit()
        return await cls.get_plan(db, plan_id)

    @classmethod
    async def generate_and_handover_routes(cls, db: AsyncSession, plan_id: int) -> List[Route]:
        """Hands over calculated route proposals to the existing RouteService to create actual Routes & RouteStops."""
        plan = await cls.get_plan(db, plan_id)

        if plan.status != PlanStatus.READY and plan.status != PlanStatus.DRAFT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Plan {plan.plan_code} must be in READY or DRAFT state to generate routes (Current: {plan.status.value}).",
            )

        if not plan.proposals:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Plan {plan.plan_code} has no calculated route proposals. Please calculate plan first.",
            )

        created_routes = []
        for prop in plan.proposals:
            route_code = await RouteService.generate_route_code(db)

            # Create actual Route using existing model
            new_route = Route(
                route_code=route_code,
                name=f"{plan.plan_code} - Route {route_code}",
                zone=prop.stops[0].bin.zone if prop.stops else "Central Zone",
                vehicle_id=prop.vehicle_id,
                driver_id=prop.driver_id,
                scheduled_date=plan.planning_date,
                start_time=plan.start_time,
                status=RouteStatus.PLANNED,
                priority=RoutePriority.HIGH if prop.utilization_percentage > 85.0 else RoutePriority.MEDIUM,
                total_stops=prop.stop_count,
                completed_stops=0,
                total_distance_km=prop.estimated_distance_km,
                estimated_duration_minutes=prop.estimated_duration_minutes,
                current_load_kg=0.0,
            )
            db.add(new_route)
            await db.flush()

            # Create RouteStops
            for prop_stop in prop.stops:
                rstop = RouteStop(
                    route_id=new_route.id,
                    bin_id=prop_stop.bin_id,
                    sequence_number=prop_stop.sequence,
                    status=StopStatus.PENDING,
                    eta=prop_stop.estimated_arrival or "09:00:00",
                )
                db.add(rstop)

            created_routes.append(new_route)

        plan.status = PlanStatus.IN_PROGRESS
        await db.commit()
        return created_routes

    @classmethod
    async def cancel_plan(cls, db: AsyncSession, plan_id: int) -> CollectionPlan:
        """Cancels a plan."""
        plan = await cls.get_plan(db, plan_id)
        if plan.status == PlanStatus.COMPLETED:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot cancel a COMPLETED plan.")

        plan.status = PlanStatus.CANCELLED
        await db.commit()
        return await cls.get_plan(db, plan_id)

    @classmethod
    async def get_constraints(cls, db: AsyncSession) -> PlanningConstraint:
        """Fetches or initializes global planning constraints."""
        res = await db.execute(select(PlanningConstraint))
        constraint = res.scalars().first()
        if not constraint:
            constraint = PlanningConstraint(
                max_vehicle_utilization=90.0,
                max_route_duration_minutes=480,
                max_stops=30,
                respect_collection_windows=True,
                distance_weight=30,
                capacity_weight=25,
                priority_weight=30,
                time_weight=15,
                config_json={},
            )
            db.add(constraint)
            await db.commit()
            await db.refresh(constraint)
        return constraint

    @classmethod
    async def update_constraints(cls, db: AsyncSession, obj_in: PlanningConstraintUpdate) -> PlanningConstraint:
        """Updates global planning constraints."""
        constraint = await cls.get_constraints(db)

        if obj_in.max_vehicle_utilization is not None:
            constraint.max_vehicle_utilization = obj_in.max_vehicle_utilization
        if obj_in.max_route_duration_minutes is not None:
            constraint.max_route_duration_minutes = obj_in.max_route_duration_minutes
        if obj_in.max_stops is not None:
            constraint.max_stops = obj_in.max_stops
        if obj_in.respect_collection_windows is not None:
            constraint.respect_collection_windows = obj_in.respect_collection_windows

        # Validate weights sum to 100 if any weight is updated
        d_w = obj_in.distance_weight if obj_in.distance_weight is not None else constraint.distance_weight
        c_w = obj_in.capacity_weight if obj_in.capacity_weight is not None else constraint.capacity_weight
        p_w = obj_in.priority_weight if obj_in.priority_weight is not None else constraint.priority_weight
        t_w = obj_in.time_weight if obj_in.time_weight is not None else constraint.time_weight

        if (d_w + c_w + p_w + t_w) != 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Optimization weights must sum to 100 (Got: {d_w + c_w + p_w + t_w}).",
            )

        constraint.distance_weight = d_w
        constraint.capacity_weight = c_w
        constraint.priority_weight = p_w
        constraint.time_weight = t_w

        if obj_in.config_json is not None:
            constraint.config_json = obj_in.config_json

        await db.commit()
        await db.refresh(constraint)
        return constraint

    @classmethod
    async def get_windows(cls, db: AsyncSession) -> List[CollectionWindow]:
        """Fetches collection windows."""
        res = await db.execute(select(CollectionWindow).order_by(CollectionWindow.id))
        windows = res.scalars().all()
        if not windows:
            # Seed default windows
            defaults = [
                CollectionWindow(name="MORNING", start_time="06:00:00", end_time="12:00:00", active=True),
                CollectionWindow(name="AFTERNOON", start_time="12:00:00", end_time="17:00:00", active=True),
                CollectionWindow(name="EVENING", start_time="17:00:00", end_time="22:00:00", active=True),
            ]
            for dw in defaults:
                db.add(dw)
            await db.commit()
            res = await db.execute(select(CollectionWindow).order_by(CollectionWindow.id))
            windows = res.scalars().all()
        return list(windows)


planning_service = PlanningService()
