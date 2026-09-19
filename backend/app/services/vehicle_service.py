import math
from datetime import date, datetime, timezone
from typing import Optional, Any
from fastapi import HTTPException, status
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

from app.models.vehicle import Vehicle, VehicleType, EnergyType, VehicleStatus
from app.models.vehicle_maintenance import VehicleMaintenanceRecord, MaintenanceStatus
from app.models.vehicle_history import VehicleActivity
from app.models.user import User, UserRole, UserStatus
from app.models.route import Route, RouteStatus
from app.schemas.vehicle import (
    VehicleCreate,
    VehicleUpdate,
    AssignDriverRequest,
    UpdateVehicleStatusRequest,
    UpdateVehicleLoadRequest,
    UpdateVehicleLocationRequest,
    VehicleLocationResponse,
    VehicleSummaryResponse,
    VehicleUtilizationResponse,
    VehicleAttentionItem,
    VehicleAttentionResponse,
    VehicleDashboardResponse,
    VehicleActivityResponse,
    CurrentRouteBrief,
    DriverBrief,
)
from app.schemas.vehicle_maintenance import (
    MaintenanceCreate,
    MaintenanceUpdate,
    MaintenanceResponse,
)


class VehicleService:
    @staticmethod
    async def generate_vehicle_code(db: AsyncSession) -> str:
        """Generate unique vehicle code (e.g. VEH-001, VEH-002)."""
        stmt = select(Vehicle.vehicle_code)
        codes = (await db.execute(stmt)).scalars().all()

        max_num = 0
        for c in codes:
            if c and c.startswith("VEH-"):
                num_part = c.replace("VEH-", "")
                if num_part.isdigit():
                    num = int(num_part)
                    if num > max_num:
                        max_num = num

        next_num = max(max_num + 1, len(codes) + 1)
        candidate = f"VEH-{next_num:03d}"
        while candidate in codes:
            next_num += 1
            candidate = f"VEH-{next_num:03d}"
        return candidate

    @staticmethod
    async def log_activity(
        db: AsyncSession,
        vehicle_id: int,
        activity_type: str,
        description: str,
        route_id: Optional[int] = None,
    ) -> VehicleActivity:
        """Record an operational activity in the vehicle audit trail."""
        activity = VehicleActivity(
            vehicle_id=vehicle_id,
            activity_type=activity_type,
            description=description,
            route_id=route_id,
        )
        db.add(activity)
        return activity

    @classmethod
    async def get_vehicle_by_id_or_code(
        cls,
        db: AsyncSession,
        identifier: int | str,
        load_relations: bool = True,
    ) -> Vehicle:
        """Fetch vehicle by integer ID or string vehicle_code."""
        stmt = select(Vehicle)
        if load_relations:
            stmt = stmt.options(selectinload(Vehicle.driver))

        if isinstance(identifier, int) or (isinstance(identifier, str) and identifier.isdigit()):
            stmt = stmt.where(Vehicle.id == int(identifier))
        else:
            stmt = stmt.where(Vehicle.vehicle_code == str(identifier))

        vehicle = (await db.execute(stmt)).scalar_one_or_none()
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vehicle '{identifier}' not found.",
            )
        return vehicle

    @classmethod
    async def get_current_route_for_vehicle(
        cls,
        db: AsyncSession,
        vehicle_id: int,
    ) -> Optional[CurrentRouteBrief]:
        """Query Route table for currently active route assigned to this vehicle."""
        active_statuses = [
            RouteStatus.IN_PROGRESS,
            RouteStatus.PAUSED,
            RouteStatus.AT_RISK,
            RouteStatus.PLANNED,
        ]
        stmt = (
            select(Route)
            .where(
                and_(
                    Route.vehicle_id == vehicle_id,
                    Route.status.in_(active_statuses),
                )
            )
            .order_by(desc(Route.scheduled_date), desc(Route.id))
            .limit(1)
        )
        active_route = (await db.execute(stmt)).scalar_one_or_none()
        if active_route:
            return CurrentRouteBrief(
                id=active_route.id,
                route_code=active_route.route_code,
                name=active_route.name,
                status=active_route.status.value,
                scheduled_date=active_route.scheduled_date,
                zone=active_route.zone,
            )
        return None

    @classmethod
    async def create_vehicle(
        cls,
        db: AsyncSession,
        vehicle_in: VehicleCreate,
    ) -> Vehicle:
        """Register a new fleet vehicle with validation and auto-generated code."""
        # 1. Check duplicate registration number if provided
        if vehicle_in.registration_number:
            reg_stmt = select(Vehicle).where(Vehicle.registration_number == vehicle_in.registration_number)
            if (await db.execute(reg_stmt)).scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Registration number '{vehicle_in.registration_number}' is already registered.",
                )

        # 2. Check driver if assigned
        driver_id = vehicle_in.driver_id
        if driver_id is not None:
            driver = await cls._validate_driver_for_assignment(db, driver_id)

        vehicle_code = await cls.generate_vehicle_code(db)

        new_vehicle = Vehicle(
            vehicle_code=vehicle_code,
            name=vehicle_in.name,
            vehicle_type=vehicle_in.vehicle_type,
            registration_number=vehicle_in.registration_number,
            license_plate=vehicle_in.registration_number,
            capacity_kg=vehicle_in.capacity_kg,
            current_load_kg=0.0,
            energy_type=vehicle_in.energy_type,
            status=VehicleStatus.AVAILABLE,
            zone=vehicle_in.zone,
            driver_id=driver_id,
            is_active=True,
        )
        db.add(new_vehicle)
        await db.flush()

        await cls.log_activity(
            db=db,
            vehicle_id=new_vehicle.id,
            activity_type="VEHICLE_CREATED",
            description=f"Vehicle {new_vehicle.name} ({new_vehicle.vehicle_code}) registered into fleet.",
        )

        await db.commit()
        await db.refresh(new_vehicle)
        vehicle = await cls.get_vehicle_by_id_or_code(db, new_vehicle.id)
        vehicle.current_route = await cls.get_current_route_for_vehicle(db, vehicle.id)
        return vehicle

    @classmethod
    async def get_vehicles(
        cls,
        db: AsyncSession,
        page: int = 1,
        page_size: int = 10,
        status_filter: Optional[str] = None,
        vehicle_type: Optional[str] = None,
        energy_type: Optional[str] = None,
        zone: Optional[str] = None,
        driver_id: Optional[int] = None,
        min_capacity: Optional[float] = None,
        max_capacity: Optional[float] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> dict[str, Any]:
        """Get paginated list of vehicles with filters, search, and sorting."""
        base_query = select(Vehicle)

        if status_filter:
            try:
                base_query = base_query.where(Vehicle.status == VehicleStatus(status_filter.upper()))
            except ValueError:
                pass
        if vehicle_type:
            try:
                base_query = base_query.where(Vehicle.vehicle_type == VehicleType(vehicle_type.upper()))
            except ValueError:
                pass
        if energy_type:
            try:
                base_query = base_query.where(Vehicle.energy_type == EnergyType(energy_type.upper()))
            except ValueError:
                pass
        if zone:
            base_query = base_query.where(Vehicle.zone.ilike(f"%{zone}%"))
        if driver_id:
            base_query = base_query.where(Vehicle.driver_id == driver_id)
        if min_capacity is not None:
            base_query = base_query.where(Vehicle.capacity_kg >= min_capacity)
        if max_capacity is not None:
            base_query = base_query.where(Vehicle.capacity_kg <= max_capacity)

        if search:
            search_pat = f"%{search}%"
            # Join user for driver search
            base_query = base_query.outerjoin(User, Vehicle.driver_id == User.id).where(
                or_(
                    Vehicle.vehicle_code.ilike(search_pat),
                    Vehicle.name.ilike(search_pat),
                    Vehicle.registration_number.ilike(search_pat),
                    User.first_name.ilike(search_pat),
                    User.last_name.ilike(search_pat),
                )
            )

        # Count total
        count_stmt = select(func.count()).select_from(base_query.subquery())
        total = (await db.execute(count_stmt)).scalar() or 0

        # Sort column
        sort_column = getattr(Vehicle, sort_by, Vehicle.created_at)
        if sort_order.lower() == "asc":
            base_query = base_query.order_by(sort_column.asc())
        else:
            base_query = base_query.order_by(sort_column.desc())

        offset = (page - 1) * page_size
        paginated_stmt = (
            base_query.options(selectinload(Vehicle.driver))
            .offset(offset)
            .limit(page_size)
        )

        vehicles = list((await db.execute(paginated_stmt)).scalars().unique().all())

        # Populate current route for each vehicle
        for v in vehicles:
            v.current_route = await cls.get_current_route_for_vehicle(db, v.id)

        pages = math.ceil(total / page_size) if page_size > 0 else 1
        return {
            "items": vehicles,
            "page": page,
            "page_size": page_size,
            "total": total,
            "pages": pages,
        }

    @classmethod
    async def get_vehicle_detail(
        cls,
        db: AsyncSession,
        identifier: int | str,
    ) -> Vehicle:
        """Get full vehicle details including driver, current route, maintenance, and activity."""
        vehicle = await cls.get_vehicle_by_id_or_code(db, identifier, load_relations=True)
        vehicle.current_route = await cls.get_current_route_for_vehicle(db, vehicle.id)

        # Maintenance records (newest first)
        m_stmt = (
            select(VehicleMaintenanceRecord)
            .where(VehicleMaintenanceRecord.vehicle_id == vehicle.id)
            .order_by(desc(VehicleMaintenanceRecord.service_date))
            .limit(10)
        )
        vehicle.recent_maintenance = list((await db.execute(m_stmt)).scalars().all())

        # Recent activities (newest first)
        a_stmt = (
            select(VehicleActivity)
            .where(VehicleActivity.vehicle_id == vehicle.id)
            .order_by(desc(VehicleActivity.created_at))
            .limit(20)
        )
        vehicle.recent_activities = list((await db.execute(a_stmt)).scalars().all())

        return vehicle

    @classmethod
    async def update_vehicle(
        cls,
        db: AsyncSession,
        identifier: int | str,
        vehicle_in: VehicleUpdate,
    ) -> Vehicle:
        """Update administrative details of a vehicle."""
        vehicle = await cls.get_vehicle_by_id_or_code(db, identifier)

        if vehicle_in.registration_number and vehicle_in.registration_number != vehicle.registration_number:
            dup_stmt = select(Vehicle).where(
                and_(
                    Vehicle.registration_number == vehicle_in.registration_number,
                    Vehicle.id != vehicle.id,
                )
            )
            if (await db.execute(dup_stmt)).scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Registration number '{vehicle_in.registration_number}' is already in use.",
                )
            vehicle.registration_number = vehicle_in.registration_number
            vehicle.license_plate = vehicle_in.registration_number

        if vehicle_in.capacity_kg is not None:
            if vehicle_in.capacity_kg < vehicle.current_load_kg:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"New capacity ({vehicle_in.capacity_kg} kg) cannot be less than current load ({vehicle.current_load_kg} kg).",
                )
            vehicle.capacity_kg = vehicle_in.capacity_kg

        if vehicle_in.name is not None:
            vehicle.name = vehicle_in.name
        if vehicle_in.vehicle_type is not None:
            vehicle.vehicle_type = vehicle_in.vehicle_type
        if vehicle_in.energy_type is not None:
            vehicle.energy_type = vehicle_in.energy_type
        if vehicle_in.zone is not None:
            vehicle.zone = vehicle_in.zone

        await cls.log_activity(
            db=db,
            vehicle_id=vehicle.id,
            activity_type="VEHICLE_UPDATED",
            description="Vehicle administrative specifications updated.",
        )

        await db.commit()
        return await cls.get_vehicle_detail(db, vehicle.id)

    @classmethod
    async def deactivate_vehicle(
        cls,
        db: AsyncSession,
        identifier: int | str,
    ) -> dict[str, str]:
        """Deactivate vehicle if not currently assigned to an active route."""
        vehicle = await cls.get_vehicle_by_id_or_code(db, identifier)

        # Check for active routes
        r_stmt = select(Route).where(
            and_(
                Route.vehicle_id == vehicle.id,
                Route.status.in_([RouteStatus.PLANNED, RouteStatus.IN_PROGRESS, RouteStatus.PAUSED, RouteStatus.AT_RISK]),
            )
        )
        active_route = (await db.execute(r_stmt)).scalar_one_or_none()
        if active_route:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot deactivate vehicle '{vehicle.vehicle_code}' while assigned to active route '{active_route.route_code}'. Complete or cancel the route first.",
            )

        vehicle.is_active = False
        vehicle.status = VehicleStatus.INACTIVE

        await cls.log_activity(
            db=db,
            vehicle_id=vehicle.id,
            activity_type="STATUS_CHANGED",
            description="Vehicle deactivated and marked INACTIVE.",
        )

        await db.commit()
        return {"message": f"Vehicle {vehicle.vehicle_code} deactivated successfully."}

    @classmethod
    async def reactivate_vehicle(
        cls,
        db: AsyncSession,
        identifier: int | str,
    ) -> dict[str, str]:
        """Reactivate vehicle to AVAILABLE status."""
        vehicle = await cls.get_vehicle_by_id_or_code(db, identifier)

        vehicle.is_active = True
        vehicle.status = VehicleStatus.AVAILABLE

        await cls.log_activity(
            db=db,
            vehicle_id=vehicle.id,
            activity_type="STATUS_CHANGED",
            description="Vehicle reactivated and marked AVAILABLE.",
        )

        await db.commit()
        return {"message": f"Vehicle {vehicle.vehicle_code} reactivated successfully."}

    @classmethod
    async def assign_driver(
        cls,
        db: AsyncSession,
        identifier: int | str,
        req: AssignDriverRequest,
    ) -> Vehicle:
        """Assign an active DRIVER to a vehicle."""
        vehicle = await cls.get_vehicle_by_id_or_code(db, identifier)

        if not vehicle.is_active or vehicle.status == VehicleStatus.INACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot assign driver to inactive vehicle {vehicle.vehicle_code}.",
            )

        driver = await cls._validate_driver_for_assignment(db, req.driver_id, exclude_vehicle_id=vehicle.id)
        vehicle.driver_id = driver.id
        vehicle.driver = driver

        await cls.log_activity(
            db=db,
            vehicle_id=vehicle.id,
            activity_type="DRIVER_ASSIGNED",
            description=f"Driver {driver.full_name} assigned to vehicle.",
        )

        await db.commit()
        return await cls.get_vehicle_detail(db, vehicle.id)

    @classmethod
    async def remove_driver(
        cls,
        db: AsyncSession,
        identifier: int | str,
    ) -> dict[str, str]:
        """Unassign driver from vehicle, guarding against active routes in execution."""
        vehicle = await cls.get_vehicle_by_id_or_code(db, identifier)

        r_stmt = select(Route).where(
            and_(
                Route.vehicle_id == vehicle.id,
                Route.status.in_([RouteStatus.IN_PROGRESS, RouteStatus.PAUSED, RouteStatus.AT_RISK]),
            )
        )
        active_route = (await db.execute(r_stmt)).scalar_one_or_none()
        if active_route:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot remove driver while vehicle is executing active route '{active_route.route_code}'.",
            )

        vehicle.driver_id = None
        await cls.log_activity(
            db=db,
            vehicle_id=vehicle.id,
            activity_type="DRIVER_REMOVED",
            description="Driver unassigned from vehicle.",
        )

        await db.commit()
        return {"message": f"Driver removed from vehicle {vehicle.vehicle_code} successfully."}

    @classmethod
    async def update_vehicle_status(
        cls,
        db: AsyncSession,
        identifier: int | str,
        req: UpdateVehicleStatusRequest,
    ) -> Vehicle:
        """Transition vehicle operational status with strict validation."""
        vehicle = await cls.get_vehicle_by_id_or_code(db, identifier)
        target = req.status

        if vehicle.status == target:
            return await cls.get_vehicle_detail(db, vehicle.id)

        # Inactive vehicle cannot be moved to operational states directly without reactivation
        if not vehicle.is_active or vehicle.status == VehicleStatus.INACTIVE:
            if target != VehicleStatus.AVAILABLE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot transition INACTIVE vehicle directly to {target.value}. Reactivate first.",
                )

        # Vehicles in MAINTENANCE or OFFLINE cannot transition directly to ON_ROUTE without being AVAILABLE
        if vehicle.status in [VehicleStatus.MAINTENANCE, VehicleStatus.OFFLINE] and target == VehicleStatus.ON_ROUTE:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Vehicle is currently in {vehicle.status.value} status and cannot be deployed directly on route.",
            )

        # Moving to MAINTENANCE or OFFLINE or INACTIVE while in active route execution
        if target in [VehicleStatus.MAINTENANCE, VehicleStatus.OFFLINE, VehicleStatus.INACTIVE]:
            r_stmt = select(Route).where(
                and_(
                    Route.vehicle_id == vehicle.id,
                    Route.status.in_([RouteStatus.IN_PROGRESS, RouteStatus.PAUSED]),
                )
            )
            if (await db.execute(r_stmt)).scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Cannot set vehicle {vehicle.vehicle_code} to {target.value} while an active route is in progress.",
                )

        old_status = vehicle.status.value
        vehicle.status = target

        await cls.log_activity(
            db=db,
            vehicle_id=vehicle.id,
            activity_type="STATUS_CHANGED",
            description=f"Status transitioned from {old_status} to {target.value}.",
        )

        await db.commit()
        return await cls.get_vehicle_detail(db, vehicle.id)

    @classmethod
    async def update_vehicle_load(
        cls,
        db: AsyncSession,
        identifier: int | str,
        req: UpdateVehicleLoadRequest,
    ) -> dict[str, Any]:
        """Update vehicle current payload weight with capacity validation."""
        vehicle = await cls.get_vehicle_by_id_or_code(db, identifier)

        if req.current_load_kg < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vehicle current load cannot be negative.",
            )

        if req.current_load_kg > vehicle.capacity_kg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Current load ({req.current_load_kg} kg) exceeds vehicle capacity ({vehicle.capacity_kg} kg).",
            )

        vehicle.current_load_kg = req.current_load_kg

        await cls.log_activity(
            db=db,
            vehicle_id=vehicle.id,
            activity_type="LOAD_UPDATED",
            description=f"Payload load updated to {req.current_load_kg} kg ({vehicle.capacity_utilization}% capacity).",
        )

        await db.commit()
        return {
            "vehicle_id": vehicle.id,
            "vehicle_code": vehicle.vehicle_code,
            "current_load_kg": vehicle.current_load_kg,
            "capacity_kg": vehicle.capacity_kg,
            "capacity_utilization": vehicle.capacity_utilization,
        }

    @classmethod
    async def update_vehicle_location(
        cls,
        db: AsyncSession,
        identifier: int | str,
        req: UpdateVehicleLocationRequest,
    ) -> VehicleLocationResponse:
        """Update GPS latitude and longitude telemetry."""
        vehicle = await cls.get_vehicle_by_id_or_code(db, identifier)

        now = datetime.now(timezone.utc)
        vehicle.current_latitude = req.latitude
        vehicle.current_longitude = req.longitude
        vehicle.latitude = req.latitude
        vehicle.longitude = req.longitude
        vehicle.last_location_update = now

        await db.commit()
        return VehicleLocationResponse(
            vehicle_id=vehicle.id,
            latitude=vehicle.current_latitude,
            longitude=vehicle.current_longitude,
            last_updated=vehicle.last_location_update,
        )

    @classmethod
    async def get_vehicle_location(
        cls,
        db: AsyncSession,
        identifier: int | str,
    ) -> VehicleLocationResponse:
        """Retrieve latest GPS location data for a vehicle."""
        vehicle = await cls.get_vehicle_by_id_or_code(db, identifier)
        return VehicleLocationResponse(
            vehicle_id=vehicle.id,
            latitude=vehicle.current_latitude or vehicle.latitude,
            longitude=vehicle.current_longitude or vehicle.longitude,
            last_updated=vehicle.last_location_update,
        )

    @classmethod
    async def add_maintenance_record(
        cls,
        db: AsyncSession,
        identifier: int | str,
        req: MaintenanceCreate,
    ) -> VehicleMaintenanceRecord:
        """Add a maintenance record to a vehicle."""
        vehicle = await cls.get_vehicle_by_id_or_code(db, identifier)

        record = VehicleMaintenanceRecord(
            vehicle_id=vehicle.id,
            service_type=req.service_type,
            service_date=req.service_date,
            next_service_date=req.next_service_date,
            odometer_km=req.odometer_km,
            status=req.status,
            notes=req.notes,
        )
        db.add(record)

        # If maintenance is IN_PROGRESS, set vehicle status to MAINTENANCE
        if req.status == MaintenanceStatus.IN_PROGRESS:
            vehicle.status = VehicleStatus.MAINTENANCE

        await cls.log_activity(
            db=db,
            vehicle_id=vehicle.id,
            activity_type="MAINTENANCE_SCHEDULED",
            description=f"Maintenance logged: {req.service_type} ({req.status.value}).",
        )

        await db.commit()
        await db.refresh(record)
        return record

    @classmethod
    async def get_maintenance_history(
        cls,
        db: AsyncSession,
        identifier: int | str,
        page: int = 1,
        page_size: int = 10,
        status_filter: Optional[str] = None,
    ) -> dict[str, Any]:
        """Get paginated maintenance history for a vehicle."""
        vehicle = await cls.get_vehicle_by_id_or_code(db, identifier)

        query = select(VehicleMaintenanceRecord).where(VehicleMaintenanceRecord.vehicle_id == vehicle.id)
        if status_filter:
            try:
                query = query.where(VehicleMaintenanceRecord.status == MaintenanceStatus(status_filter.upper()))
            except ValueError:
                pass

        count_stmt = select(func.count()).select_from(query.subquery())
        total = (await db.execute(count_stmt)).scalar() or 0

        offset = (page - 1) * page_size
        paginated_stmt = query.order_by(desc(VehicleMaintenanceRecord.service_date)).offset(offset).limit(page_size)
        items = list((await db.execute(paginated_stmt)).scalars().all())

        return {
            "items": items,
            "page": page,
            "page_size": page_size,
            "total": total,
            "pages": math.ceil(total / page_size) if page_size > 0 else 1,
        }

    @classmethod
    async def update_maintenance_record(
        cls,
        db: AsyncSession,
        identifier: int | str,
        maintenance_id: int,
        req: MaintenanceUpdate,
    ) -> VehicleMaintenanceRecord:
        """Update an existing maintenance record."""
        vehicle = await cls.get_vehicle_by_id_or_code(db, identifier)

        stmt = select(VehicleMaintenanceRecord).where(
            and_(
                VehicleMaintenanceRecord.id == maintenance_id,
                VehicleMaintenanceRecord.vehicle_id == vehicle.id,
            )
        )
        record = (await db.execute(stmt)).scalar_one_or_none()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Maintenance record {maintenance_id} not found for vehicle {vehicle.vehicle_code}.",
            )

        if req.service_type is not None:
            record.service_type = req.service_type
        if req.service_date is not None:
            record.service_date = req.service_date
        if req.next_service_date is not None:
            record.next_service_date = req.next_service_date
        if req.odometer_km is not None:
            record.odometer_km = req.odometer_km
        if req.status is not None:
            record.status = req.status
            if req.status == MaintenanceStatus.COMPLETED and vehicle.status == VehicleStatus.MAINTENANCE:
                vehicle.status = VehicleStatus.AVAILABLE
                await cls.log_activity(
                    db=db,
                    vehicle_id=vehicle.id,
                    activity_type="MAINTENANCE_COMPLETED",
                    description=f"Maintenance {record.service_type} completed; vehicle restored to AVAILABLE.",
                )
        if req.notes is not None:
            record.notes = req.notes

        await db.commit()
        await db.refresh(record)
        return record

    @classmethod
    async def get_vehicle_history(
        cls,
        db: AsyncSession,
        identifier: int | str,
        limit: int = 50,
    ) -> list[VehicleActivityResponse]:
        """Get chronological audit log activities for a vehicle."""
        vehicle = await cls.get_vehicle_by_id_or_code(db, identifier)
        stmt = (
            select(VehicleActivity)
            .where(VehicleActivity.vehicle_id == vehicle.id)
            .order_by(desc(VehicleActivity.created_at))
            .limit(limit)
        )
        return list((await db.execute(stmt)).scalars().all())

    @classmethod
    async def get_fleet_summary(cls, db: AsyncSession) -> VehicleSummaryResponse:
        """Calculate counts for the Vehicle fleet KPI summary cards."""
        stmt = select(Vehicle.status, Vehicle.is_active, func.count(Vehicle.id)).group_by(Vehicle.status, Vehicle.is_active)
        rows = (await db.execute(stmt)).all()

        total = 0
        active = 0
        status_map = {s: 0 for s in VehicleStatus}

        for st_val, is_act, count in rows:
            total += count
            if is_act:
                active += count
            status_map[st_val] = status_map.get(st_val, 0) + count

        return VehicleSummaryResponse(
            total=total,
            active=active,
            on_route=status_map.get(VehicleStatus.ON_ROUTE, 0),
            available=status_map.get(VehicleStatus.AVAILABLE, 0),
            idle=status_map.get(VehicleStatus.IDLE, 0),
            maintenance=status_map.get(VehicleStatus.MAINTENANCE, 0),
            offline=status_map.get(VehicleStatus.OFFLINE, 0),
            inactive=status_map.get(VehicleStatus.INACTIVE, 0),
        )

    @classmethod
    async def get_fleet_utilization(cls, db: AsyncSession) -> VehicleUtilizationResponse:
        """Calculate aggregate fleet payload capacity and distribution breakdown."""
        stmt = select(Vehicle).where(Vehicle.is_active == True)
        vehicles = list((await db.execute(stmt)).scalars().all())

        if not vehicles:
            return VehicleUtilizationResponse(
                total_capacity_kg=0.0,
                current_load_kg=0.0,
                utilization_percentage=0.0,
                vehicles_below_50_percent=0,
                vehicles_50_to_75_percent=0,
                vehicles_75_to_90_percent=0,
                vehicles_above_90_percent=0,
            )

        total_cap = sum(v.capacity_kg for v in vehicles)
        total_load = sum(v.current_load_kg for v in vehicles)
        util_pct = round((total_load / total_cap * 100), 2) if total_cap > 0 else 0.0

        b_50 = 0
        b_50_75 = 0
        b_75_90 = 0
        b_90 = 0

        for v in vehicles:
            u = v.capacity_utilization
            if u < 50.0:
                b_50 += 1
            elif 50.0 <= u < 75.0:
                b_50_75 += 1
            elif 75.0 <= u < 90.0:
                b_75_90 += 1
            else:
                b_90 += 1

        return VehicleUtilizationResponse(
            total_capacity_kg=round(total_cap, 2),
            current_load_kg=round(total_load, 2),
            utilization_percentage=util_pct,
            vehicles_below_50_percent=b_50,
            vehicles_50_to_75_percent=b_50_75,
            vehicles_75_to_90_percent=b_75_90,
            vehicles_above_90_percent=b_90,
        )

    @classmethod
    async def get_vehicles_attention(cls, db: AsyncSession) -> VehicleAttentionResponse:
        """Identify fleet units requiring immediate operational or maintenance attention."""
        items: list[VehicleAttentionItem] = []

        # 1. High Load vehicles (>= 90%)
        hl_stmt = select(Vehicle).where(
            and_(
                Vehicle.is_active == True,
                (Vehicle.current_load_kg / Vehicle.capacity_kg) >= 0.9,
            )
        )
        high_load_vehicles = list((await db.execute(hl_stmt)).scalars().all())
        for v in high_load_vehicles:
            items.append(
                VehicleAttentionItem(
                    vehicle_id=v.id,
                    vehicle_code=v.vehicle_code,
                    type="HIGH_LOAD",
                    severity="critical" if v.capacity_utilization >= 95.0 else "warning",
                    message=f"{v.capacity_utilization}% capacity - Near collection limit ({v.current_load_kg}kg / {v.capacity_kg}kg)",
                    action_type="view_vehicle",
                    target_id=v.vehicle_code,
                )
            )

        # 2. Overdue Maintenance
        today = date.today()
        m_stmt = (
            select(VehicleMaintenanceRecord)
            .join(Vehicle, VehicleMaintenanceRecord.vehicle_id == Vehicle.id)
            .where(
                and_(
                    Vehicle.is_active == True,
                    or_(
                        VehicleMaintenanceRecord.status == MaintenanceStatus.OVERDUE,
                        and_(
                            VehicleMaintenanceRecord.next_service_date != None,
                            VehicleMaintenanceRecord.next_service_date < today,
                            VehicleMaintenanceRecord.status != MaintenanceStatus.COMPLETED,
                        ),
                    ),
                )
            )
            .options(joinedload(VehicleMaintenanceRecord.vehicle))
        )
        overdue_records = list((await db.execute(m_stmt)).scalars().all())
        for m in overdue_records:
            v = m.vehicle
            items.append(
                VehicleAttentionItem(
                    vehicle_id=v.id,
                    vehicle_code=v.vehicle_code,
                    type="MAINTENANCE_OVERDUE",
                    severity="warning",
                    message=f"Maintenance overdue for {m.service_type} (due: {m.next_service_date or m.service_date})",
                    action_type="view_maintenance",
                    target_id=v.vehicle_code,
                )
            )

        # 3. Offline vehicles
        off_stmt = select(Vehicle).where(
            and_(
                Vehicle.is_active == True,
                Vehicle.status == VehicleStatus.OFFLINE,
            )
        )
        offline_vehicles = list((await db.execute(off_stmt)).scalars().all())
        for v in offline_vehicles:
            items.append(
                VehicleAttentionItem(
                    vehicle_id=v.id,
                    vehicle_code=v.vehicle_code,
                    type="OFFLINE",
                    severity="critical",
                    message=f"Vehicle offline - Signal unavailable (Last active location: {v.zone or 'Unknown'})",
                    action_type="view_vehicle",
                    target_id=v.vehicle_code,
                )
            )

        # 4. Route delay / issue
        r_stmt = (
            select(Route)
            .join(Vehicle, Route.vehicle_id == Vehicle.id)
            .where(Route.status == RouteStatus.AT_RISK)
            .options(joinedload(Route.vehicle))
        )
        at_risk_routes = list((await db.execute(r_stmt)).scalars().all())
        for r in at_risk_routes:
            if r.vehicle:
                items.append(
                    VehicleAttentionItem(
                        vehicle_id=r.vehicle.id,
                        vehicle_code=r.vehicle.vehicle_code,
                        type="ROUTE_ISSUE",
                        severity="warning",
                        message=f"Active route {r.route_code} flagged AT RISK ({r.name})",
                        action_type="view_route",
                        target_id=r.route_code,
                    )
                )

        return VehicleAttentionResponse(items=items, total=len(items))

    @classmethod
    async def get_vehicle_dashboard(cls, db: AsyncSession) -> VehicleDashboardResponse:
        """Composite endpoint supplying complete dashboard state for Vehicles page."""
        summary = await cls.get_fleet_summary(db)
        utilization = await cls.get_fleet_utilization(db)
        attention = await cls.get_vehicles_attention(db)

        # Recent activities (last 10)
        a_stmt = select(VehicleActivity).order_by(desc(VehicleActivity.created_at)).limit(10)
        recent_activity = list((await db.execute(a_stmt)).scalars().all())

        # Recently added vehicles (last 5)
        v_stmt = select(Vehicle).options(joinedload(Vehicle.driver)).order_by(desc(Vehicle.created_at)).limit(5)
        recent_vehicles = list((await db.execute(v_stmt)).scalars().all())
        for v in recent_vehicles:
            v.current_route = await cls.get_current_route_for_vehicle(db, v.id)

        # Maintenance overview breakdown
        m_counts_stmt = select(VehicleMaintenanceRecord.status, func.count(VehicleMaintenanceRecord.id)).group_by(VehicleMaintenanceRecord.status)
        m_rows = (await db.execute(m_counts_stmt)).all()
        m_breakdown = {r[0].value if hasattr(r[0], "value") else str(r[0]): r[1] for r in m_rows}

        maintenance_overview = {
            "scheduled": m_breakdown.get("SCHEDULED", 0),
            "in_progress": m_breakdown.get("IN_PROGRESS", 0),
            "completed": m_breakdown.get("COMPLETED", 0),
            "overdue": m_breakdown.get("OVERDUE", 0),
        }

        return VehicleDashboardResponse(
            summary=summary,
            utilization=utilization,
            attention_items=attention.items,
            recent_activity=recent_activity,
            recent_vehicles=recent_vehicles,
            maintenance_overview=maintenance_overview,
        )

    # -------------------------------------------------------------------------
    # Internal Validation Helpers
    # -------------------------------------------------------------------------

    @classmethod
    async def _validate_driver_for_assignment(
        cls,
        db: AsyncSession,
        driver_id: int,
        exclude_vehicle_id: Optional[int] = None,
    ) -> User:
        """Validate driver existence, role, status, and assignment conflicts."""
        d_stmt = select(User).where(User.id == driver_id)
        driver = (await db.execute(d_stmt)).scalar_one_or_none()
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Driver with id {driver_id} not found.",
            )

        if driver.role not in [UserRole.DRIVER, UserRole.COLLECTOR]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User {driver.full_name} has role '{driver.role.value}'. Only users with DRIVER role can be assigned.",
            )

        if driver.status != UserStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Driver {driver.full_name} account is not active (status: {driver.status.value}).",
            )

        # Check if driver is already assigned to another active vehicle
        v_stmt = select(Vehicle).where(
            and_(
                Vehicle.driver_id == driver_id,
                Vehicle.is_active == True,
            )
        )
        if exclude_vehicle_id:
            v_stmt = v_stmt.where(Vehicle.id != exclude_vehicle_id)

        conflicting_vehicle = (await db.execute(v_stmt)).scalar_one_or_none()
        if conflicting_vehicle:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Driver {driver.full_name} is already assigned to vehicle '{conflicting_vehicle.name}' ({conflicting_vehicle.vehicle_code}).",
            )

        return driver
