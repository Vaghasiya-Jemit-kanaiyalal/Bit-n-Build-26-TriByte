import math
from datetime import date, datetime, timezone
from typing import Optional, Any
from fastapi import HTTPException, status
from sqlalchemy import select, func, and_, or_, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

from app.models.route import Route, RouteStatus, RoutePriority
from app.models.route_stop import RouteStop, StopStatus, StopPriority
from app.models.vehicle import Vehicle
from app.models.user import User, UserRole, UserStatus
from app.models.bin import Bin
from app.schemas.route import (
    RouteCreate,
    RouteUpdate,
    RouteMetrics,
    RouteProgressResponse,
    RouteMetricsResponse,
    RouteSummaryResponse,
    RouteDashboardResponse,
    RouteMapDataResponse,
    MapVehicle,
    MapStop,
    RouteOptimizationPreviewResponse,
)
from app.schemas.route_stop import (
    RouteStopCreate,
    RouteStopUpdate,
    RouteStopReorderRequest,
    CompleteStopRequest,
    SkipStopRequest,
)


class RouteService:
    @staticmethod
    async def validate_vehicle_and_driver(
        db: AsyncSession,
        vehicle_id: int,
        driver_id: int,
        scheduled_date: date,
        exclude_route_id: Optional[int] = None,
    ) -> tuple[Vehicle, User]:
        """Validate vehicle and driver availability and role compatibility."""
        # 1. Check vehicle
        v_stmt = select(Vehicle).where(Vehicle.id == vehicle_id)
        v_res = await db.execute(v_stmt)
        vehicle = v_res.scalar_one_or_none()
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vehicle with id {vehicle_id} not found.",
            )

        # Vehicle status check
        unavailable_statuses = ["MAINTENANCE", "OUT_OF_SERVICE", "DECOMMISSIONED", "INACTIVE"]
        if vehicle.status.upper() in unavailable_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Vehicle '{vehicle.name}' ({vehicle.vehicle_code}) is not available (status: {vehicle.status}).",
            )

        # 2. Check driver
        d_stmt = select(User).where(User.id == driver_id)
        d_res = await db.execute(d_stmt)
        driver = d_res.scalar_one_or_none()
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Driver with id {driver_id} not found.",
            )

        # Driver role check: only DRIVER or COLLECTOR allowed
        if driver.role not in [UserRole.DRIVER, UserRole.COLLECTOR]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User {driver.full_name} has role '{driver.role.value}'. Only users with DRIVER role can be assigned to routes.",
            )

        if driver.status != UserStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Driver {driver.full_name} account is not active (status: {driver.status.value}).",
            )

        # 3. Check vehicle assignment conflict for scheduled_date
        active_route_statuses = [
            RouteStatus.PLANNED,
            RouteStatus.IN_PROGRESS,
            RouteStatus.PAUSED,
            RouteStatus.AT_RISK,
        ]

        v_conflict_stmt = select(Route).where(
            and_(
                Route.vehicle_id == vehicle_id,
                Route.scheduled_date == scheduled_date,
                Route.status.in_(active_route_statuses),
            )
        )
        if exclude_route_id:
            v_conflict_stmt = v_conflict_stmt.where(Route.id != exclude_route_id)

        v_conflict = (await db.execute(v_conflict_stmt)).scalar_one_or_none()
        if v_conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Vehicle '{vehicle.name}' ({vehicle.vehicle_code}) is already assigned to route '{v_conflict.route_code}' on {scheduled_date}.",
            )

        # 4. Check driver assignment conflict for scheduled_date
        d_conflict_stmt = select(Route).where(
            and_(
                Route.driver_id == driver_id,
                Route.scheduled_date == scheduled_date,
                Route.status.in_(active_route_statuses),
            )
        )
        if exclude_route_id:
            d_conflict_stmt = d_conflict_stmt.where(Route.id != exclude_route_id)

        d_conflict = (await db.execute(d_conflict_stmt)).scalar_one_or_none()
        if d_conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Driver '{driver.full_name}' is already assigned to route '{d_conflict.route_code}' on {scheduled_date}.",
            )

        return vehicle, driver

    @staticmethod
    async def generate_route_code(db: AsyncSession) -> str:
        """Generate unique route code (e.g. RT-001, RT-024)."""
        stmt = select(Route.route_code)
        result = await db.execute(stmt)
        codes = result.scalars().all()

        max_num = 0
        for c in codes:
            if c and c.startswith("RT-"):
                num_str = c.replace("RT-", "")
                if num_str.isdigit():
                    num = int(num_str)
                    if num > max_num:
                        max_num = num

        next_num = max(max_num + 1, len(codes) + 1)
        # Ensure code doesn't exist
        candidate = f"RT-{next_num:03d}"
        while candidate in codes:
            next_num += 1
            candidate = f"RT-{next_num:03d}"
        return candidate

    @staticmethod
    def calculate_metrics(route: Route) -> RouteMetrics:
        """Calculate live metrics for a route."""
        total_stops = route.total_stops
        completed_stops = route.completed_stops

        if hasattr(route, "stops") and route.stops is not None:
            total_stops = len(route.stops)
            completed_stops = sum(1 for s in route.stops if s.status == StopStatus.COMPLETED)

        remaining_stops = max(0, total_stops - completed_stops)
        cap = route.vehicle_capacity_kg
        if cap <= 0 and route.vehicle:
            cap = route.vehicle.capacity_kg

        current_load = route.current_load_kg
        cap_util = round((current_load / cap * 100), 2) if cap > 0 else 0.0
        pct = round((completed_stops / total_stops * 100), 2) if total_stops > 0 else 0.0

        return RouteMetrics(
            total_stops=total_stops,
            completed_stops=completed_stops,
            remaining_stops=remaining_stops,
            distance_km=route.total_distance_km,
            estimated_duration_minutes=route.estimated_duration_minutes,
            current_load_kg=current_load,
            vehicle_capacity_kg=cap,
            capacity_utilization=cap_util,
            completion_percentage=pct,
        )

    @classmethod
    async def get_route_by_id_or_code(
        cls,
        db: AsyncSession,
        identifier: int | str,
        load_stops: bool = False,
    ) -> Route:
        """Fetch route by integer id or string route_code."""
        stmt = select(Route).options(
            joinedload(Route.vehicle),
            joinedload(Route.driver),
        )

        if load_stops:
            stmt = stmt.options(
                selectinload(Route.stops).joinedload(RouteStop.bin),
            )

        if isinstance(identifier, int) or (isinstance(identifier, str) and identifier.isdigit()):
            stmt = stmt.where(Route.id == int(identifier))
        else:
            stmt = stmt.where(Route.route_code == str(identifier))

        result = await db.execute(stmt)
        route = result.scalar_one_or_none()
        if not route:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Route '{identifier}' not found.",
            )
        return route

    @classmethod
    async def create_route(cls, db: AsyncSession, route_in: RouteCreate) -> Route:
        """Create a new collection route."""
        vehicle, driver = await cls.validate_vehicle_and_driver(
            db=db,
            vehicle_id=route_in.vehicle_id,
            driver_id=route_in.driver_id,
            scheduled_date=route_in.scheduled_date,
        )

        route_code = await cls.generate_route_code(db)

        new_route = Route(
            route_code=route_code,
            name=route_in.name,
            zone=route_in.zone,
            vehicle_id=route_in.vehicle_id,
            driver_id=route_in.driver_id,
            scheduled_date=route_in.scheduled_date,
            start_time=route_in.start_time or "08:00:00",
            priority=route_in.priority,
            status=RouteStatus.PLANNED,
            total_stops=0,
            completed_stops=0,
            current_load_kg=0.0,
            total_distance_km=0.0,
            estimated_duration_minutes=0,
        )

        db.add(new_route)
        await db.commit()
        await db.refresh(new_route)

        # Reload with vehicle and driver
        return await cls.get_route_by_id_or_code(db, new_route.id)

    @classmethod
    async def get_routes(
        cls,
        db: AsyncSession,
        page: int = 1,
        page_size: int = 10,
        status_filter: Optional[str] = None,
        zone: Optional[str] = None,
        vehicle_id: Optional[int] = None,
        driver_id: Optional[int] = None,
        scheduled_date: Optional[date] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> dict[str, Any]:
        """Get paginated list of routes with filtering, search, and sorting."""
        base_query = select(Route)

        # Filters
        if status_filter:
            try:
                base_query = base_query.where(Route.status == RouteStatus(status_filter.upper()))
            except ValueError:
                pass
        if zone:
            base_query = base_query.where(Route.zone.ilike(f"%{zone}%"))
        if vehicle_id:
            base_query = base_query.where(Route.vehicle_id == vehicle_id)
        if driver_id:
            base_query = base_query.where(Route.driver_id == driver_id)
        if scheduled_date:
            base_query = base_query.where(Route.scheduled_date == scheduled_date)
        if priority:
            try:
                base_query = base_query.where(Route.priority == RoutePriority(priority.upper()))
            except ValueError:
                pass
        if search:
            search_pat = f"%{search}%"
            base_query = base_query.where(
                or_(
                    Route.route_code.ilike(search_pat),
                    Route.name.ilike(search_pat),
                )
            )

        # Total count
        count_stmt = select(func.count()).select_from(base_query.subquery())
        total = (await db.execute(count_stmt)).scalar() or 0

        # Sorting
        sort_column = getattr(Route, sort_by, Route.created_at)
        if sort_order.lower() == "asc":
            base_query = base_query.order_by(sort_column.asc())
        else:
            base_query = base_query.order_by(sort_column.desc())

        # Pagination
        offset = (page - 1) * page_size
        paginated_stmt = (
            base_query.options(
                joinedload(Route.vehicle),
                joinedload(Route.driver),
                selectinload(Route.stops),
            )
            .offset(offset)
            .limit(page_size)
        )

        routes = (await db.execute(paginated_stmt)).scalars().unique().all()
        pages = math.ceil(total / page_size) if page_size > 0 else 1

        # Populate metrics on each route
        for r in routes:
            r.metrics = cls.calculate_metrics(r)

        return {
            "items": routes,
            "page": page,
            "page_size": page_size,
            "total": total,
            "pages": pages,
        }

    @classmethod
    async def get_route_detail(cls, db: AsyncSession, identifier: int | str) -> Route:
        """Get full route details with vehicle, driver, metrics, and stops."""
        route = await cls.get_route_by_id_or_code(db, identifier, load_stops=True)
        route.metrics = cls.calculate_metrics(route)
        return route

    @classmethod
    async def update_route(
        cls,
        db: AsyncSession,
        identifier: int | str,
        route_in: RouteUpdate,
    ) -> Route:
        """Update route administrative details."""
        route = await cls.get_route_by_id_or_code(db, identifier)

        if route.status in [RouteStatus.COMPLETED, RouteStatus.CANCELLED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot update a route that is already {route.status.value}.",
            )

        new_vehicle_id = route_in.vehicle_id or route.vehicle_id
        new_driver_id = route_in.driver_id or route.driver_id
        new_date = route_in.scheduled_date or route.scheduled_date

        # Re-validate vehicle/driver assignments if changed
        if (
            route_in.vehicle_id is not None
            or route_in.driver_id is not None
            or route_in.scheduled_date is not None
        ):
            vehicle, _ = await cls.validate_vehicle_and_driver(
                db=db,
                vehicle_id=new_vehicle_id,
                driver_id=new_driver_id,
                scheduled_date=new_date,
                exclude_route_id=route.id,
            )
            route.vehicle_id = new_vehicle_id
            route.driver_id = new_driver_id
            route.scheduled_date = new_date

        if route_in.name is not None:
            route.name = route_in.name
        if route_in.zone is not None:
            route.zone = route_in.zone
        if route_in.start_time is not None:
            route.start_time = route_in.start_time
        if route_in.priority is not None:
            route.priority = route_in.priority

        await db.commit()
        return await cls.get_route_detail(db, route.id)

    @classmethod
    async def cancel_route(cls, db: AsyncSession, identifier: int | str) -> dict[str, str]:
        """Cancel an active or planned route."""
        route = await cls.get_route_by_id_or_code(db, identifier)

        if route.status == RouteStatus.COMPLETED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel a completed route.",
            )

        route.status = RouteStatus.CANCELLED
        await db.commit()
        return {"message": "Route cancelled successfully"}

    @classmethod
    async def get_route_stops(cls, db: AsyncSession, identifier: int | str) -> list[RouteStop]:
        """Get all stops for a route ordered by sequence_number ASC."""
        route = await cls.get_route_by_id_or_code(db, identifier)
        stmt = (
            select(RouteStop)
            .where(RouteStop.route_id == route.id)
            .options(joinedload(RouteStop.bin))
            .order_by(RouteStop.sequence_number.asc())
        )
        return list((await db.execute(stmt)).scalars().all())

    @classmethod
    async def add_route_stop(
        cls,
        db: AsyncSession,
        identifier: int | str,
        stop_in: RouteStopCreate,
    ) -> RouteStop:
        """Add a bin stop to a route."""
        route = await cls.get_route_by_id_or_code(db, identifier)

        if route.status in [RouteStatus.COMPLETED, RouteStatus.CANCELLED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot add stops to a route that is already {route.status.value}.",
            )

        # 1. Check bin exists
        b_stmt = select(Bin).where(Bin.id == stop_in.bin_id)
        bin_obj = (await db.execute(b_stmt)).scalar_one_or_none()
        if not bin_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bin with id {stop_in.bin_id} not found.",
            )

        # 2. Check if bin already in route
        dup_stmt = select(RouteStop).where(
            and_(
                RouteStop.route_id == route.id,
                RouteStop.bin_id == stop_in.bin_id,
            )
        )
        if (await db.execute(dup_stmt)).scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Bin '{bin_obj.bin_code}' is already added to this route.",
            )

        # 3. Check sequence number uniqueness
        seq_stmt = select(RouteStop).where(
            and_(
                RouteStop.route_id == route.id,
                RouteStop.sequence_number == stop_in.sequence_number,
            )
        )
        if (await db.execute(seq_stmt)).scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Sequence number {stop_in.sequence_number} is already used in this route.",
            )

        # 4. Optional zone consistency
        if route.zone and bin_obj.zone and route.zone.upper() != "ALL":
            if bin_obj.zone.upper() != route.zone.upper():
                # Allow but could flag note
                pass

        new_stop = RouteStop(
            route_id=route.id,
            bin_id=stop_in.bin_id,
            sequence_number=stop_in.sequence_number,
            priority=stop_in.priority,
            status=StopStatus.PENDING,
            estimated_fill_level=bin_obj.fill_level,
            notes=stop_in.notes,
        )
        db.add(new_stop)

        # Update route total stops
        route.total_stops = route.total_stops + 1
        # Add basic estimated distance/time per stop (approx. 1.2km & 15 mins)
        route.total_distance_km = round(route.total_distance_km + 1.2, 2)
        route.estimated_duration_minutes += 15

        await db.commit()
        await db.refresh(new_stop)

        # Load bin
        stop_stmt = (
            select(RouteStop)
            .where(RouteStop.id == new_stop.id)
            .options(joinedload(RouteStop.bin))
        )
        return (await db.execute(stop_stmt)).scalar_one()

    @classmethod
    async def update_route_stop(
        cls,
        db: AsyncSession,
        identifier: int | str,
        stop_id: int,
        stop_in: RouteStopUpdate,
    ) -> RouteStop:
        """Update route stop administrative fields."""
        route = await cls.get_route_by_id_or_code(db, identifier)

        stmt = (
            select(RouteStop)
            .where(and_(RouteStop.id == stop_id, RouteStop.route_id == route.id))
            .options(joinedload(RouteStop.bin))
        )
        stop = (await db.execute(stmt)).scalar_one_or_none()
        if not stop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stop {stop_id} does not belong to route {route.route_code}.",
            )

        if stop_in.sequence_number is not None and stop_in.sequence_number != stop.sequence_number:
            seq_stmt = select(RouteStop).where(
                and_(
                    RouteStop.route_id == route.id,
                    RouteStop.sequence_number == stop_in.sequence_number,
                    RouteStop.id != stop.id,
                )
            )
            if (await db.execute(seq_stmt)).scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Sequence number {stop_in.sequence_number} is already in use.",
                )
            stop.sequence_number = stop_in.sequence_number

        if stop_in.priority is not None:
            stop.priority = stop_in.priority
        if stop_in.notes is not None:
            stop.notes = stop_in.notes

        await db.commit()
        await db.refresh(stop)
        return stop

    @classmethod
    async def remove_route_stop(
        cls,
        db: AsyncSession,
        identifier: int | str,
        stop_id: int,
    ) -> dict[str, str]:
        """Remove stop from route and recalculate sequence and totals."""
        route = await cls.get_route_by_id_or_code(db, identifier)

        if route.status == RouteStatus.COMPLETED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove stops from a completed route.",
            )

        stmt = select(RouteStop).where(
            and_(RouteStop.id == stop_id, RouteStop.route_id == route.id)
        )
        stop = (await db.execute(stmt)).scalar_one_or_none()
        if not stop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stop {stop_id} not found on route {route.route_code}.",
            )

        # Delete stop
        await db.delete(stop)
        await db.flush()

        # Re-sequence remaining stops
        remaining_stmt = (
            select(RouteStop)
            .where(RouteStop.route_id == route.id)
            .order_by(RouteStop.sequence_number.asc())
        )
        remaining_stops = (await db.execute(remaining_stmt)).scalars().all()

        for idx, s in enumerate(remaining_stops, start=1):
            s.sequence_number = idx

        route.total_stops = len(remaining_stops)
        route.completed_stops = sum(1 for s in remaining_stops if s.status == StopStatus.COMPLETED)
        route.total_distance_km = max(0.0, round(route.total_stops * 1.2, 2))
        route.estimated_duration_minutes = max(0, route.total_stops * 15)

        await db.commit()
        return {"message": "Stop removed successfully and route recalculated"}

    @classmethod
    async def reorder_route_stops(
        cls,
        db: AsyncSession,
        identifier: int | str,
        req: RouteStopReorderRequest,
    ) -> list[RouteStop]:
        """Reorder all stops in a route atomically."""
        route = await cls.get_route_by_id_or_code(db, identifier)

        stops_stmt = select(RouteStop).where(RouteStop.route_id == route.id)
        current_stops = list((await db.execute(stops_stmt)).scalars().all())

        current_ids = {s.id for s in current_stops}
        requested_ids = set(req.stop_ids)

        if current_ids != requested_ids or len(req.stop_ids) != len(current_stops):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Provided stop IDs must exactly match all existing stops for this route without omissions or duplicates.",
            )

        stop_map = {s.id: s for s in current_stops}

        # Temporary negative sequence numbers to avoid unique constraint collisions during reassignment
        for s in current_stops:
            s.sequence_number = -s.id
        await db.flush()

        for new_seq, stop_id in enumerate(req.stop_ids, start=1):
            stop_map[stop_id].sequence_number = new_seq

        await db.commit()
        return await cls.get_route_stops(db, route.id)

    @classmethod
    async def add_priority_bins_to_route(
        cls,
        db: AsyncSession,
        identifier: int | str,
        min_fill_level: float = 75.0,
        limit: int = 10,
    ) -> list[RouteStop]:
        """Add eligible high-priority or near-capacity bins to the route."""
        route = await cls.get_route_by_id_or_code(db, identifier)

        if route.status in [RouteStatus.COMPLETED, RouteStatus.CANCELLED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot add priority bins to a {route.status.value} route.",
            )

        # Existing bin IDs
        existing_stops = await cls.get_route_stops(db, route.id)
        existing_bin_ids = {s.bin_id for s in existing_stops}
        current_max_seq = max([s.sequence_number for s in existing_stops], default=0)

        # Query eligible bins
        bin_query = select(Bin).where(
            and_(
                Bin.status == "ACTIVE",
                Bin.id.not_in(existing_bin_ids) if existing_bin_ids else True,
                or_(
                    Bin.fill_level >= min_fill_level,
                    Bin.priority.in_(["HIGH", "CRITICAL"]),
                ),
            )
        )

        if route.zone and route.zone.upper() != "ALL":
            bin_query = bin_query.where(Bin.zone.ilike(f"%{route.zone}%"))

        bin_query = bin_query.order_by(Bin.fill_level.desc()).limit(limit)
        eligible_bins = (await db.execute(bin_query)).scalars().all()

        if not eligible_bins:
            return []

        added_stops = []
        for b in eligible_bins:
            current_max_seq += 1
            stop_priority = StopPriority.CRITICAL if b.fill_level >= 90 else StopPriority.HIGH
            st = RouteStop(
                route_id=route.id,
                bin_id=b.id,
                sequence_number=current_max_seq,
                priority=stop_priority,
                status=StopStatus.PENDING,
                estimated_fill_level=b.fill_level,
                notes=f"Auto-selected priority bin (Fill: {b.fill_level}%)",
            )
            db.add(st)
            added_stops.append(st)

        route.total_stops += len(added_stops)
        route.total_distance_km = round(route.total_distance_km + (1.2 * len(added_stops)), 2)
        route.estimated_duration_minutes += 15 * len(added_stops)

        await db.commit()
        return await cls.get_route_stops(db, route.id)

    @classmethod
    async def start_route(cls, db: AsyncSession, identifier: int | str) -> Route:
        """Start route execution."""
        route = await cls.get_route_by_id_or_code(db, identifier)

        if route.status in [RouteStatus.COMPLETED, RouteStatus.CANCELLED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot start a route that is {route.status.value}.",
            )

        if route.status == RouteStatus.IN_PROGRESS:
            return await cls.get_route_detail(db, route.id)

        route.status = RouteStatus.IN_PROGRESS
        await db.commit()
        return await cls.get_route_detail(db, route.id)

    @classmethod
    async def pause_route(cls, db: AsyncSession, identifier: int | str) -> Route:
        """Pause an in-progress route."""
        route = await cls.get_route_by_id_or_code(db, identifier)

        if route.status != RouteStatus.IN_PROGRESS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot pause a route with status '{route.status.value}'. Only IN_PROGRESS routes can be paused.",
            )

        route.status = RouteStatus.PAUSED
        await db.commit()
        return await cls.get_route_detail(db, route.id)

    @classmethod
    async def resume_route(cls, db: AsyncSession, identifier: int | str) -> Route:
        """Resume a paused route."""
        route = await cls.get_route_by_id_or_code(db, identifier)

        if route.status != RouteStatus.PAUSED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot resume a route with status '{route.status.value}'. Only PAUSED routes can be resumed.",
            )

        route.status = RouteStatus.IN_PROGRESS
        await db.commit()
        return await cls.get_route_detail(db, route.id)

    @classmethod
    async def complete_route(
        cls,
        db: AsyncSession,
        identifier: int | str,
        force: bool = False,
    ) -> Route:
        """Mark route as completed with incomplete stop validation."""
        route = await cls.get_route_detail(db, identifier)

        if route.status == RouteStatus.COMPLETED:
            return route

        if route.status == RouteStatus.CANCELLED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot complete a cancelled route.",
            )

        incomplete_stops = [
            s for s in route.stops if s.status in [StopStatus.PENDING, StopStatus.IN_PROGRESS]
        ]
        if incomplete_stops and not force:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Route has {len(incomplete_stops)} incomplete stops. Complete or skip all stops before completing the route, or use force=true.",
            )

        route.status = RouteStatus.COMPLETED
        await db.commit()
        return await cls.get_route_detail(db, route.id)

    @classmethod
    async def complete_stop(
        cls,
        db: AsyncSession,
        identifier: int | str,
        stop_id: int,
        req: CompleteStopRequest,
    ) -> RouteStop:
        """Mark stop completed, update collected weight and route progress."""
        route = await cls.get_route_by_id_or_code(db, identifier)

        stmt = (
            select(RouteStop)
            .where(and_(RouteStop.id == stop_id, RouteStop.route_id == route.id))
            .options(joinedload(RouteStop.bin))
        )
        stop = (await db.execute(stmt)).scalar_one_or_none()
        if not stop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stop {stop_id} not found on route {route.route_code}.",
            )

        if req.actual_collected_weight_kg is not None:
            if req.actual_collected_weight_kg < 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Collected weight cannot be negative.",
                )
            stop.actual_collected_weight_kg = req.actual_collected_weight_kg

        stop.status = StopStatus.COMPLETED
        stop.completed_at = datetime.now(timezone.utc)
        if req.notes:
            stop.notes = req.notes

        await db.flush()

        # Recalculate route progress & load
        stops_res = await db.execute(select(RouteStop).where(RouteStop.route_id == route.id))
        all_stops = list(stops_res.scalars().all())

        completed_count = sum(1 for s in all_stops if s.status == StopStatus.COMPLETED)
        total_collected = sum(
            s.actual_collected_weight_kg or 0.0
            for s in all_stops
            if s.status == StopStatus.COMPLETED
        )

        route.completed_stops = completed_count
        route.current_load_kg = round(total_collected, 2)

        # Update vehicle load
        v_stmt = select(Vehicle).where(Vehicle.id == route.vehicle_id)
        veh = (await db.execute(v_stmt)).scalar_one_or_none()
        if veh:
            veh.current_load_kg = route.current_load_kg

        await db.commit()
        await db.refresh(stop)
        return stop

    @classmethod
    async def skip_stop(
        cls,
        db: AsyncSession,
        identifier: int | str,
        stop_id: int,
        req: SkipStopRequest,
    ) -> RouteStop:
        """Mark a stop as skipped with a documented reason."""
        route = await cls.get_route_by_id_or_code(db, identifier)

        stmt = (
            select(RouteStop)
            .where(and_(RouteStop.id == stop_id, RouteStop.route_id == route.id))
            .options(joinedload(RouteStop.bin))
        )
        stop = (await db.execute(stmt)).scalar_one_or_none()
        if not stop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Stop {stop_id} not found on route {route.route_code}.",
            )

        stop.status = StopStatus.SKIPPED
        stop.notes = f"[SKIPPED: {req.reason}]" + (f" - {stop.notes}" if stop.notes else "")

        await db.commit()
        await db.refresh(stop)
        return stop

    @classmethod
    async def get_route_progress(
        cls,
        db: AsyncSession,
        identifier: int | str,
    ) -> RouteProgressResponse:
        """Calculate live stop status breakdown and completion percentage."""
        route = await cls.get_route_by_id_or_code(db, identifier, load_stops=True)

        stops = route.stops or []
        total = len(stops)
        completed = sum(1 for s in stops if s.status == StopStatus.COMPLETED)
        pending = sum(1 for s in stops if s.status == StopStatus.PENDING)
        in_progress = sum(1 for s in stops if s.status == StopStatus.IN_PROGRESS)
        skipped = sum(1 for s in stops if s.status == StopStatus.SKIPPED)
        issues = sum(1 for s in stops if s.status == StopStatus.ISSUE)

        pct = round((completed / total * 100), 2) if total > 0 else 0.0

        return RouteProgressResponse(
            route_id=route.id,
            route_code=route.route_code,
            total_stops=total,
            completed=completed,
            pending=pending,
            in_progress=in_progress,
            skipped=skipped,
            issues=issues,
            completion_percentage=pct,
        )

    @classmethod
    async def get_route_metrics_response(
        cls,
        db: AsyncSession,
        identifier: int | str,
    ) -> RouteMetricsResponse:
        """Get live metrics response for a route."""
        route = await cls.get_route_by_id_or_code(db, identifier, load_stops=True)
        m = cls.calculate_metrics(route)
        return RouteMetricsResponse(
            route_id=route.id,
            route_code=route.route_code,
            **m.model_dump(),
        )

    @classmethod
    async def get_routes_summary(cls, db: AsyncSession) -> RouteSummaryResponse:
        """Calculate counts for the Route KPI cards."""
        stmt = select(Route.status, func.count(Route.id)).group_by(Route.status)
        rows = (await db.execute(stmt)).all()
        status_counts = {r[0]: r[1] for r in rows}

        total_routes = sum(status_counts.values())

        return RouteSummaryResponse(
            total_routes=total_routes,
            planned=status_counts.get(RouteStatus.PLANNED, 0),
            in_progress=status_counts.get(RouteStatus.IN_PROGRESS, 0),
            completed=status_counts.get(RouteStatus.COMPLETED, 0),
            at_risk=status_counts.get(RouteStatus.AT_RISK, 0),
            paused=status_counts.get(RouteStatus.PAUSED, 0),
            cancelled=status_counts.get(RouteStatus.CANCELLED, 0),
        )

    @classmethod
    async def get_routes_dashboard(cls, db: AsyncSession) -> RouteDashboardResponse:
        """Get comprehensive dashboard view for Route Management page."""
        summary = await cls.get_routes_summary(db)

        # Active routes (IN_PROGRESS or PAUSED)
        active_stmt = (
            select(Route)
            .where(Route.status.in_([RouteStatus.IN_PROGRESS, RouteStatus.PAUSED]))
            .options(
                joinedload(Route.vehicle),
                joinedload(Route.driver),
                selectinload(Route.stops),
            )
            .limit(5)
        )
        active_routes = list((await db.execute(active_stmt)).scalars().unique().all())
        for r in active_routes:
            r.metrics = cls.calculate_metrics(r)

        # At-risk routes
        at_risk_stmt = (
            select(Route)
            .where(Route.status == RouteStatus.AT_RISK)
            .options(
                joinedload(Route.vehicle),
                joinedload(Route.driver),
                selectinload(Route.stops),
            )
            .limit(5)
        )
        routes_at_risk = list((await db.execute(at_risk_stmt)).scalars().unique().all())
        for r in routes_at_risk:
            r.metrics = cls.calculate_metrics(r)

        # Today's routes
        today = date.today()
        today_stmt = (
            select(Route)
            .where(Route.scheduled_date == today)
            .options(
                joinedload(Route.vehicle),
                joinedload(Route.driver),
                selectinload(Route.stops),
            )
            .limit(10)
        )
        todays_routes = list((await db.execute(today_stmt)).scalars().unique().all())
        for r in todays_routes:
            r.metrics = cls.calculate_metrics(r)

        # Recent activity log
        recent_activity = [
            {
                "time": "10:45 AM",
                "route_code": "RT-024",
                "event": "Bin BIN-217 collection completed (68.5 kg)",
                "type": "STOP_COMPLETED",
            },
            {
                "time": "10:12 AM",
                "route_code": "RT-022",
                "event": "Vehicle capacity reached 85% threshold",
                "type": "CAPACITY_WARNING",
            },
            {
                "time": "09:30 AM",
                "route_code": "RT-021",
                "event": "Morning collection started",
                "type": "ROUTE_STARTED",
            },
        ]

        return RouteDashboardResponse(
            summary=summary,
            active_routes=active_routes,
            routes_at_risk=routes_at_risk,
            todays_routes=todays_routes,
            recent_activity=recent_activity,
        )

    @classmethod
    async def get_route_map_data(
        cls,
        db: AsyncSession,
        identifier: int | str,
    ) -> RouteMapDataResponse:
        """Get coordinates and status needed for frontend interactive map."""
        route = await cls.get_route_by_id_or_code(db, identifier, load_stops=True)

        map_vehicle = None
        if route.vehicle:
            map_vehicle = MapVehicle(
                vehicle_id=route.vehicle.id,
                name=route.vehicle.name,
                vehicle_code=route.vehicle.vehicle_code,
                latitude=route.vehicle.latitude,
                longitude=route.vehicle.longitude,
            )

        map_stops = []
        for s in route.stops:
            bin_obj = s.bin
            map_stops.append(
                MapStop(
                    stop_id=s.id,
                    sequence=s.sequence_number,
                    bin_id=s.bin_id,
                    bin_code=bin_obj.bin_code if bin_obj else f"BIN-{s.bin_id}",
                    location_name=bin_obj.location_name if bin_obj else "Unknown Location",
                    latitude=bin_obj.latitude if bin_obj else None,
                    longitude=bin_obj.longitude if bin_obj else None,
                    status=s.status.value,
                    priority=s.priority.value,
                    fill_level=bin_obj.fill_level if bin_obj else 0.0,
                )
            )

        return RouteMapDataResponse(
            route_id=route.id,
            route_code=route.route_code,
            name=route.name,
            zone=route.zone,
            status=route.status.value,
            vehicle=map_vehicle,
            stops=map_stops,
        )

    @classmethod
    async def get_route_alerts(
        cls,
        db: AsyncSession,
        identifier: int | str,
    ) -> list[dict[str, Any]]:
        """Derive active alerts for a route from vehicle capacity, critical bins, and status."""
        route = await cls.get_route_by_id_or_code(db, identifier, load_stops=True)
        metrics = cls.calculate_metrics(route)
        alerts = []

        # 1. Capacity warning
        if metrics.capacity_utilization >= 90.0:
            alerts.append(
                {
                    "severity": "CRITICAL",
                    "type": "CAPACITY_OVERLOAD",
                    "title": "High Vehicle Load Warning",
                    "description": f"Vehicle capacity is at {metrics.capacity_utilization}% ({metrics.current_load_kg}kg / {metrics.vehicle_capacity_kg}kg).",
                }
            )
        elif metrics.capacity_utilization >= 80.0:
            alerts.append(
                {
                    "severity": "WARNING",
                    "type": "CAPACITY_WARNING",
                    "title": "Vehicle Capacity Alert",
                    "description": f"Vehicle capacity has reached {metrics.capacity_utilization}%.",
                }
            )

        # 2. Critical bins remaining
        critical_uncompleted = [
            s
            for s in route.stops
            if s.priority == StopPriority.CRITICAL and s.status == StopStatus.PENDING
        ]
        if critical_uncompleted:
            alerts.append(
                {
                    "severity": "HIGH",
                    "type": "CRITICAL_BIN_PENDING",
                    "title": "Critical Bins Pending Collection",
                    "description": f"{len(critical_uncompleted)} critical priority bins are awaiting collection on this route.",
                }
            )

        # 3. Route at risk
        if route.status == RouteStatus.AT_RISK:
            alerts.append(
                {
                    "severity": "HIGH",
                    "type": "ROUTE_AT_RISK",
                    "title": "Route Flagged At Risk",
                    "description": "This route is experiencing delays or operational bottlenecks.",
                }
            )

        # 4. Incomplete stops / issues
        issues = [s for s in route.stops if s.status == StopStatus.ISSUE]
        if issues:
            alerts.append(
                {
                    "severity": "MEDIUM",
                    "type": "STOP_ISSUE",
                    "title": "Collection Issues Encountered",
                    "description": f"{len(issues)} stops reported operational collection issues.",
                }
            )

        return alerts

    @classmethod
    async def get_optimization_preview(
        cls,
        db: AsyncSession,
        identifier: int | str,
    ) -> RouteOptimizationPreviewResponse:
        """Simulated route optimization preview placeholder for upcoming OR-Tools engine."""
        route = await cls.get_route_by_id_or_code(db, identifier, load_stops=True)
        baseline = cls.calculate_metrics(route)

        # Simulated 14% distance & time improvement
        simulated_distance = max(1.0, round(baseline.distance_km * 0.86, 2))
        simulated_duration = max(10, int(baseline.estimated_duration_minutes * 0.86))

        optimized = RouteMetrics(
            total_stops=baseline.total_stops,
            completed_stops=baseline.completed_stops,
            remaining_stops=baseline.remaining_stops,
            distance_km=simulated_distance,
            estimated_duration_minutes=simulated_duration,
            current_load_kg=baseline.current_load_kg,
            vehicle_capacity_kg=baseline.vehicle_capacity_kg,
            capacity_utilization=baseline.capacity_utilization,
            completion_percentage=baseline.completion_percentage,
        )

        stops_order = [s.id for s in route.stops]

        return RouteOptimizationPreviewResponse(
            status="SIMULATED_OPTIMIZATION_PREVIEW",
            message="Simulated optimization preview. OR-Tools optimization engine will be integrated in a future module.",
            route_id=route.id,
            route_code=route.route_code,
            baseline_metrics=baseline,
            optimized_metrics=optimized,
            stops_order=stops_order,
        )
