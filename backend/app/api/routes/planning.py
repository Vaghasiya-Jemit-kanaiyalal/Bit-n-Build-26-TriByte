from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_

from app.db.database import get_db
from app.core.dependencies import (
    get_current_user,
    require_admin,
    require_driver,
    require_analyst,
    require_roles,
)
from app.models.user import User, UserRole, UserStatus
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.bin import Bin, BinStatus, CollectionPriority
from app.models.collection_plan import CollectionPlan, PlanStatus
from app.models.route import Route

from app.schemas.planning import (
    CollectionPlanCreate,
    CollectionPlanUpdate,
    CollectionPlanResponse,
    CollectionPlanListResponse,
    PlanningConstraintResponse,
    PlanningConstraintUpdate,
    CollectionWindowResponse,
    CollectionWindowCreate,
    OptimizationPreviewRequest,
    OptimizationPreviewResponse,
    PlanningSummaryResponse,
    RouteProposalResponse,
)

from app.services.planning_service import planning_service
from app.services.planning_optimization_service import planning_optimization_service
from app.services.planning_validation_service import planning_validation_service
from app.services.planning_priority_service import planning_priority_service

router = APIRouter(prefix="/planning", tags=["Collection Planning"])


# --- Summary & Key Operational Indicators ---
@router.get(
    "/summary",
    response_model=PlanningSummaryResponse,
    summary="Get planning module summary indicators",
)
async def get_planning_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns high-level planning operational indicators and metrics."""
    return await planning_service.get_summary(db)


# --- Available Resources Endpoints ---
@router.get(
    "/available-vehicles",
    summary="Get available fleet vehicles for planning",
)
async def get_available_vehicles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(select(Vehicle).where(Vehicle.status == VehicleStatus.AVAILABLE))
    vehs = res.scalars().all()
    return [
        {
            "id": v.id,
            "vehicle_code": v.vehicle_code,
            "name": v.name,
            "capacity_kg": v.capacity_kg,
            "vehicle_type": v.vehicle_type,
            "zone": v.zone,
            "status": v.status,
        }
        for v in vehs
    ]


@router.get(
    "/available-drivers",
    summary="Get active collection drivers for planning",
)
async def get_available_drivers(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(
        select(User).where(and_(User.role == UserRole.DRIVER, User.status == UserStatus.ACTIVE))
    )
    drivers = res.scalars().all()
    return [
        {
            "id": d.id,
            "full_name": d.full_name,
            "email": d.email,
            "phone": d.phone,
            "organization": d.organization,
        }
        for d in drivers
    ]


@router.get(
    "/priority-bins",
    summary="Get priority bins requiring collection planning",
)
async def get_priority_bins(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    res = await db.execute(
        select(Bin).where(or_(Bin.fill_level >= 60.0, Bin.status == BinStatus.OVERFLOW))
    )
    bins = res.scalars().all()

    items = []
    for b in bins:
        pred_fill = b.predicted_fill_level or b.fill_level or 0.0
        overflow = b.status == BinStatus.OVERFLOW or pred_fill >= 90.0
        prio_str, est_kg = planning_priority_service.calculate_bin_priority(b, pred_fill, overflow)
        items.append({
            "id": b.id,
            "bin_code": b.bin_code,
            "zone": b.zone,
            "fill_level": b.fill_level,
            "predicted_fill_level": pred_fill,
            "predicted_overflow": overflow,
            "priority": prio_str,
            "estimated_waste_kg": est_kg,
            "latitude": b.latitude,
            "longitude": b.longitude,
        })
    return items


# --- Optimization Preview ---
@router.post(
    "/optimization-preview",
    response_model=OptimizationPreviewResponse,
    summary="Preview optimization route proposals before saving",
)
async def preview_optimization(
    req: OptimizationPreviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Runs heuristic optimization preview for selected bins and vehicles without creating persistent routes."""
    # Fetch bins
    bins_res = await db.execute(select(Bin).where(Bin.id.in_(req.bin_ids)))
    target_bins = list(bins_res.scalars().all())

    # Fetch vehicles
    if req.vehicle_ids:
        vehs_res = await db.execute(select(Vehicle).where(Vehicle.id.in_(req.vehicle_ids)))
    else:
        vehs_res = await db.execute(select(Vehicle).where(Vehicle.status == VehicleStatus.AVAILABLE))
    available_vehicles = list(vehs_res.scalars().all())

    # Fetch drivers
    if req.driver_ids:
        drvs_res = await db.execute(select(User).where(User.id.in_(req.driver_ids)))
    else:
        drvs_res = await db.execute(select(User).where(and_(User.role == UserRole.DRIVER, User.status == UserStatus.ACTIVE)))
    available_drivers = list(drvs_res.scalars().all())

    result = await planning_optimization_service.optimize_plan_allocations(
        session=db,
        target_bins=target_bins,
        available_vehicles=available_vehicles,
        available_drivers=available_drivers,
        strategy=req.strategy,
        max_utilization_pct=req.max_utilization,
        max_stops_per_route=req.max_stops,
    )

    # Format proposals schema
    formatted_proposals = []
    for idx, pdata in enumerate(result["proposals"]):
        formatted_proposals.append({
            "id": idx + 1,
            "plan_id": 0,
            "vehicle_id": pdata["vehicle_id"],
            "driver_id": pdata["driver_id"],
            "estimated_distance_km": pdata["estimated_distance_km"],
            "estimated_duration_minutes": pdata["estimated_duration_minutes"],
            "estimated_load_kg": pdata["estimated_load_kg"],
            "utilization_percentage": pdata["utilization_percentage"],
            "stop_count": pdata["stop_count"],
            "status": "PROPOSED",
            "vehicle_code": pdata["vehicle_code"],
            "driver_name": pdata["driver_name"],
            "stops": [
                {
                    "id": sidx + 1,
                    "proposal_id": idx + 1,
                    "bin_id": s["bin_id"],
                    "sequence": s["sequence"],
                    "estimated_arrival": s["estimated_arrival"],
                    "estimated_collection_kg": s["estimated_collection_kg"],
                    "bin_code": s["bin_code"],
                    "latitude": s["latitude"],
                    "longitude": s["longitude"],
                }
                for sidx, s in enumerate(pdata["stops"])
            ],
        })

    return {
        "strategy": req.strategy,
        "proposed_routes": formatted_proposals,
        "unassigned_bin_ids": result["unassigned_bin_ids"],
        "total_bins_evaluated": len(target_bins),
        "assigned_bins_count": result["assigned_bins_count"],
        "total_estimated_distance_km": result["total_distance_km"],
        "total_estimated_duration_minutes": result["total_duration_minutes"],
        "average_utilization_percentage": result["average_utilization"],
        "conflicts": [],
    }


# --- Collection Plans Endpoints ---
@router.get(
    "/plans",
    response_model=CollectionPlanListResponse,
    summary="List collection plans with optional filtering",
)
async def list_collection_plans(
    status_filter: Optional[PlanStatus] = Query(None, alias="status"),
    date_filter: Optional[date] = Query(None, alias="date"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plans, total = await planning_service.get_plans(
        db=db,
        status_filter=status_filter,
        date_filter=date_filter,
        limit=limit,
        offset=offset,
    )
    return {"total": total, "plans": plans}


@router.post(
    "/plans",
    response_model=CollectionPlanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new collection plan",
)
async def create_collection_plan(
    obj_in: CollectionPlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return await planning_service.create_plan(db, obj_in, creator_id=current_user.id)


@router.get(
    "/plans/{plan_id}",
    response_model=CollectionPlanResponse,
    summary="Get collection plan by ID",
)
async def get_collection_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await planning_service.get_plan(db, plan_id)


@router.patch(
    "/plans/{plan_id}",
    response_model=CollectionPlanResponse,
    summary="Update collection plan status or strategy",
)
async def update_collection_plan(
    plan_id: int,
    obj_in: CollectionPlanUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return await planning_service.update_plan(db, plan_id, obj_in)


@router.post(
    "/plans/{plan_id}/calculate",
    response_model=CollectionPlanResponse,
    summary="Calculate and optimize collection plan",
)
async def calculate_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return await planning_service.calculate_and_optimize_plan(db, plan_id)


@router.post(
    "/plans/{plan_id}/generate",
    summary="Generate actual routes from approved plan proposals",
)
async def generate_plan_routes(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Hands over route proposals to RouteService to create active Route and RouteStop records."""
    created_routes = await planning_service.generate_and_handover_routes(db, plan_id)
    return {
        "message": f"Successfully generated {len(created_routes)} routes from plan ID {plan_id}.",
        "routes": [
            {
                "id": r.id,
                "route_code": r.route_code,
                "name": r.name,
                "vehicle_id": r.vehicle_id,
                "driver_id": r.driver_id,
                "total_stops": r.total_stops,
                "status": r.status.value,
            }
            for r in created_routes
        ],
    }


@router.post(
    "/plans/{plan_id}/cancel",
    response_model=CollectionPlanResponse,
    summary="Cancel a collection plan",
)
async def cancel_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return await planning_service.cancel_plan(db, plan_id)


# --- Constraints & Collection Windows ---
@router.get(
    "/constraints",
    response_model=PlanningConstraintResponse,
    summary="Get global planning constraints and optimization weights",
)
async def get_planning_constraints(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await planning_service.get_constraints(db)


@router.patch(
    "/constraints",
    response_model=PlanningConstraintResponse,
    summary="Update global planning constraints and optimization weights",
)
async def update_planning_constraints(
    obj_in: PlanningConstraintUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return await planning_service.update_constraints(db, obj_in)


@router.get(
    "/windows",
    response_model=List[CollectionWindowResponse],
    summary="Get collection time windows",
)
async def get_collection_windows(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await planning_service.get_windows(db)
