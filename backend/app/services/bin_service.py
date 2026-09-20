import math
import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.bin import (
    Bin,
    BinType,
    WasteType,
    BinStatus,
    CollectionStatus,
    CollectionPriority,
    ConnectivityStatus,
)
from app.models.sensor import Sensor
from app.models.bin_telemetry import BinTelemetry
from app.models.bin_collection import BinCollectionHistory
from app.models.bin_activity import BinActivity
from app.models.route import Route, RouteStatus
from app.models.route_stop import RouteStop, StopStatus
from app.schemas.bin import (
    BinCreate,
    BinUpdate,
    BinResponse,
    BinListItem,
    BinDetailResponse,
    BinRouteBrief,
    BinStatusUpdate,
    BinPriorityUpdate,
    BinPrioritizeRequest,
    BulkBinActionRequest,
    BulkBinActionResponse,
    SensorCreate,
    SensorUpdate,
    SensorResponse,
    BinTelemetryCreate,
    BinTelemetryResponse,
    BinCollectionResponse,
    BinActivityResponse,
    BinMapItem,
    BinSummaryResponse,
    BinNetworkHealthResponse,
    BinAnalyticsResponse,
    BinCollectionSummaryResponse,
)


class BinService:

    @staticmethod
    async def generate_bin_code(db: AsyncSession) -> str:
        """Generate next sequential unique bin code (e.g. BIN-1001, BIN-1002)."""
        stmt = select(Bin.bin_code)
        codes = (await db.execute(stmt)).scalars().all()

        max_num = 1000
        for c in codes:
            if c and c.startswith("BIN-"):
                num_part = c.replace("BIN-", "")
                if num_part.isdigit():
                    num = int(num_part)
                    if num > max_num:
                        max_num = num

        next_num = max_num + 1
        candidate = f"BIN-{next_num:04d}"
        while candidate in codes:
            next_num += 1
            candidate = f"BIN-{next_num:04d}"
        return candidate

    @staticmethod
    async def log_activity(
        db: AsyncSession,
        bin_id: int,
        activity_type: str,
        description: str,
        performed_by: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> BinActivity:
        """Record an operational audit event for a bin."""
        activity = BinActivity(
            bin_id=bin_id,
            activity_type=activity_type,
            description=description,
            performed_by=performed_by,
            activity_metadata=metadata,
        )
        db.add(activity)
        return activity

    @classmethod
    async def get_current_route_for_bin(
        cls,
        db: AsyncSession,
        bin_id: int,
    ) -> Optional[BinRouteBrief]:
        """Query RouteStop + Route tables for active route assigned to this bin."""
        active_statuses = [
            RouteStatus.IN_PROGRESS,
            RouteStatus.PAUSED,
            RouteStatus.AT_RISK,
            RouteStatus.PLANNED,
        ]
        stmt = (
            select(Route)
            .join(RouteStop, RouteStop.route_id == Route.id)
            .where(
                and_(
                    RouteStop.bin_id == bin_id,
                    RouteStop.status != StopStatus.COMPLETED,
                    Route.status.in_(active_statuses),
                )
            )
            .order_by(desc(Route.scheduled_date), desc(Route.id))
            .limit(1)
        )
        active_route = (await db.execute(stmt)).scalar_one_or_none()
        if active_route:
            return BinRouteBrief(
                id=active_route.id,
                route_code=active_route.route_code,
                name=active_route.name,
                status=active_route.status.value if hasattr(active_route.status, "value") else str(active_route.status),
                scheduled_date=active_route.scheduled_date,
                zone=active_route.zone,
            )
        return None

    @classmethod
    async def get_bin_by_id_or_code(
        cls,
        db: AsyncSession,
        identifier: int | str,
        load_relations: bool = False,
    ) -> Bin:
        """Retrieve bin by integer ID or string bin_code."""
        stmt = select(Bin)
        if load_relations:
            stmt = stmt.options(
                selectinload(Bin.sensor),
                selectinload(Bin.telemetry_records),
                selectinload(Bin.collection_history),
                selectinload(Bin.activities),
            )

        if isinstance(identifier, int) or (isinstance(identifier, str) and identifier.isdigit()):
            stmt = stmt.where(Bin.id == int(identifier))
        else:
            stmt = stmt.where(Bin.bin_code == str(identifier))

        bin_obj = (await db.execute(stmt)).scalar_one_or_none()
        if not bin_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Bin '{identifier}' not found.",
            )
        return bin_obj

    @classmethod
    async def create_bin(
        cls,
        db: AsyncSession,
        bin_in: BinCreate,
        user_id: Optional[int] = None,
    ) -> BinDetailResponse:
        """Register a new smart waste bin into the network."""
        # 1. Check duplicate bin_code if provided
        if bin_in.bin_code:
            code_stmt = select(Bin).where(Bin.bin_code == bin_in.bin_code)
            if (await db.execute(code_stmt)).scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Bin code '{bin_in.bin_code}' is already registered.",
                )
            bin_code = bin_in.bin_code
        else:
            bin_code = await cls.generate_bin_code(db)

        # 2. Check sensor_id uniqueness if provided
        if bin_in.sensor_id:
            s_stmt = select(Sensor).where(Sensor.sensor_id == bin_in.sensor_id)
            if (await db.execute(s_stmt)).scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Sensor ID '{bin_in.sensor_id}' is already linked to another bin or registered.",
                )

        loc_name = bin_in.location_name or bin_in.address or f"{bin_in.zone} Station"
        new_bin = Bin(
            bin_code=bin_code,
            name=bin_in.name or f"Bin {bin_code}",
            bin_type=bin_in.bin_type,
            capacity_kg=bin_in.capacity_kg,
            capacity_liters=bin_in.capacity_kg * 2.4,  # Approximate conversion for backward compat
            current_fill_kg=0.0,
            current_fill_percentage=0.0,
            fill_level=0.0,
            waste_type=bin_in.waste_type,
            status=bin_in.status,
            zone=bin_in.zone,
            address=bin_in.address,
            location_name=loc_name,
            latitude=bin_in.latitude,
            longitude=bin_in.longitude,
            sensor_id=bin_in.sensor_id,
            battery_percentage=bin_in.battery_percentage,
            connectivity_status=ConnectivityStatus.ONLINE,
            collection_status=bin_in.collection_status,
            priority=bin_in.priority,
            is_active=True,
        )
        db.add(new_bin)
        await db.flush()

        # 3. Create sensor if sensor_id provided
        if bin_in.sensor_id:
            sensor = Sensor(
                sensor_id=bin_in.sensor_id,
                bin_id=new_bin.id,
                sensor_type="ULTRASONIC",
                status="ACTIVE",
                battery_percentage=bin_in.battery_percentage,
                connectivity_status=ConnectivityStatus.ONLINE,
            )
            db.add(sensor)

        # 4. Log CREATED activity
        await cls.log_activity(
            db=db,
            bin_id=new_bin.id,
            activity_type="CREATED",
            description=f"Smart bin {new_bin.bin_code} registered in {new_bin.zone}.",
            performed_by=user_id,
            metadata={"capacity_kg": new_bin.capacity_kg, "waste_type": new_bin.waste_type.value},
        )

        await db.commit()
        return await cls.get_bin_detail(db, new_bin.id)

    @classmethod
    async def get_bins(
        cls,
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        status_filter: Optional[str] = None,
        zone: Optional[str] = None,
        waste_type: Optional[str] = None,
        collection_status: Optional[str] = None,
        priority: Optional[str] = None,
        bin_type: Optional[str] = None,
        connectivity_status: Optional[str] = None,
        is_active: Optional[bool] = None,
        fill_min: Optional[float] = None,
        fill_max: Optional[float] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> Dict[str, Any]:
        """Paginated, filtered, searched and sorted bin listing."""
        base_query = select(Bin)

        if is_active is not None:
            base_query = base_query.where(Bin.is_active == is_active)

        if status_filter:
            try:
                base_query = base_query.where(Bin.status == BinStatus(status_filter.upper()))
            except ValueError:
                pass

        if zone and zone.upper() != "ALL":
            base_query = base_query.where(Bin.zone.ilike(f"%{zone}%"))

        if waste_type and waste_type.upper() != "ALL":
            try:
                base_query = base_query.where(Bin.waste_type == WasteType(waste_type.upper()))
            except ValueError:
                pass

        if collection_status and collection_status.upper() != "ALL":
            try:
                base_query = base_query.where(Bin.collection_status == CollectionStatus(collection_status.upper()))
            except ValueError:
                pass

        if priority and priority.upper() != "ALL":
            try:
                base_query = base_query.where(Bin.priority == CollectionPriority(priority.upper()))
            except ValueError:
                pass

        if bin_type and bin_type.upper() != "ALL":
            try:
                base_query = base_query.where(Bin.bin_type == BinType(bin_type.upper()))
            except ValueError:
                pass

        if connectivity_status and connectivity_status.upper() != "ALL":
            try:
                base_query = base_query.where(Bin.connectivity_status == ConnectivityStatus(connectivity_status.upper()))
            except ValueError:
                pass

        if fill_min is not None:
            base_query = base_query.where(Bin.current_fill_percentage >= fill_min)
        if fill_max is not None:
            base_query = base_query.where(Bin.current_fill_percentage <= fill_max)

        if search:
            search_pat = f"%{search}%"
            base_query = base_query.where(
                or_(
                    Bin.bin_code.ilike(search_pat),
                    Bin.name.ilike(search_pat),
                    Bin.address.ilike(search_pat),
                    Bin.location_name.ilike(search_pat),
                    Bin.sensor_id.ilike(search_pat),
                    Bin.zone.ilike(search_pat),
                )
            )

        # Count total
        count_stmt = select(func.count()).select_from(base_query.subquery())
        total = (await db.execute(count_stmt)).scalar() or 0

        # Sorting
        sort_column = getattr(Bin, sort_by, Bin.created_at)
        if sort_order.lower() == "asc":
            base_query = base_query.order_by(sort_column.asc())
        else:
            base_query = base_query.order_by(sort_column.desc())

        offset = (page - 1) * page_size
        paginated_stmt = base_query.offset(offset).limit(page_size)
        bins = list((await db.execute(paginated_stmt)).scalars().all())

        items: List[BinListItem] = []
        for b in bins:
            route_brief = await cls.get_current_route_for_bin(db, b.id)
            items.append(
                BinListItem(
                    id=b.id,
                    bin_code=b.bin_code,
                    name=b.name,
                    bin_type=b.bin_type,
                    capacity_kg=b.capacity_kg,
                    current_fill_kg=b.current_fill_kg,
                    current_fill_percentage=b.current_fill_percentage,
                    waste_type=b.waste_type,
                    status=b.status,
                    zone=b.zone,
                    address=b.address or b.location_name,
                    latitude=b.latitude,
                    longitude=b.longitude,
                    sensor_id=b.sensor_id,
                    battery_percentage=b.battery_percentage,
                    connectivity_status=b.connectivity_status,
                    collection_status=b.collection_status,
                    priority=b.priority,
                    assigned_route=route_brief,
                    last_collection_at=b.last_collection_at,
                    predicted_overflow_at=b.predicted_overflow_at,
                    predicted_fill_percentage=b.predicted_fill_percentage,
                    is_active=b.is_active,
                )
            )

        pages = math.ceil(total / page_size) if page_size > 0 else 1
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": pages,
        }

    @classmethod
    async def get_bin_detail(
        cls,
        db: AsyncSession,
        identifier: int | str,
    ) -> BinDetailResponse:
        """Fetch comprehensive bin detail including sensor, route, recent telemetry, collections, activities."""
        bin_obj = await cls.get_bin_by_id_or_code(db, identifier)

        # 1. Fetch sensor
        s_stmt = select(Sensor).where(Sensor.bin_id == bin_obj.id)
        sensor_obj = (await db.execute(s_stmt)).scalar_one_or_none()
        sensor_res = SensorResponse.model_validate(sensor_obj) if sensor_obj else None

        # 2. Fetch current route
        current_route = await cls.get_current_route_for_bin(db, bin_obj.id)

        # 3. Recent telemetry (last 10)
        t_stmt = (
            select(BinTelemetry)
            .where(BinTelemetry.bin_id == bin_obj.id)
            .order_by(desc(BinTelemetry.recorded_at))
            .limit(10)
        )
        recent_telemetry = list((await db.execute(t_stmt)).scalars().all())

        # 4. Recent collections (last 5)
        c_stmt = (
            select(BinCollectionHistory)
            .where(BinCollectionHistory.bin_id == bin_obj.id)
            .order_by(desc(BinCollectionHistory.collected_at))
            .limit(5)
        )
        recent_collections = list((await db.execute(c_stmt)).scalars().all())

        # 5. Recent activities (last 15)
        a_stmt = (
            select(BinActivity)
            .where(BinActivity.bin_id == bin_obj.id)
            .order_by(desc(BinActivity.created_at))
            .limit(15)
        )
        recent_activities = list((await db.execute(a_stmt)).scalars().all())

        # 6. Health summary
        health_summary = {
            "is_online": bin_obj.connectivity_status == ConnectivityStatus.ONLINE,
            "battery_healthy": bin_obj.battery_percentage >= 25.0,
            "telemetry_fresh": (
                bin_obj.last_telemetry_at is not None
                and (datetime.now(timezone.utc) - (bin_obj.last_telemetry_at.replace(tzinfo=timezone.utc) if bin_obj.last_telemetry_at.tzinfo is None else bin_obj.last_telemetry_at)).total_seconds() < 3600
            ),
            "requires_collection": bin_obj.current_fill_percentage >= 75.0 or bin_obj.priority in [CollectionPriority.HIGH, CollectionPriority.CRITICAL],
            "fill_status": bin_obj.status.value,
        }

        return BinDetailResponse(
            id=bin_obj.id,
            uuid=bin_obj.uuid,
            bin_code=bin_obj.bin_code,
            name=bin_obj.name,
            bin_type=bin_obj.bin_type,
            capacity_kg=bin_obj.capacity_kg,
            current_fill_kg=bin_obj.current_fill_kg,
            current_fill_percentage=bin_obj.current_fill_percentage,
            waste_type=bin_obj.waste_type,
            status=bin_obj.status,
            zone=bin_obj.zone,
            address=bin_obj.address,
            location_name=bin_obj.location_name,
            latitude=bin_obj.latitude,
            longitude=bin_obj.longitude,
            sensor_id=bin_obj.sensor_id,
            battery_percentage=bin_obj.battery_percentage,
            connectivity_status=bin_obj.connectivity_status,
            collection_status=bin_obj.collection_status,
            priority=bin_obj.priority,
            last_collection_at=bin_obj.last_collection_at,
            next_collection_at=bin_obj.next_collection_at,
            last_telemetry_at=bin_obj.last_telemetry_at,
            predicted_fill_percentage=bin_obj.predicted_fill_percentage,
            predicted_overflow_at=bin_obj.predicted_overflow_at,
            prediction_confidence=bin_obj.prediction_confidence,
            is_active=bin_obj.is_active,
            created_at=bin_obj.created_at,
            updated_at=bin_obj.updated_at,
            sensor=sensor_res,
            current_route=current_route,
            recent_telemetry=[BinTelemetryResponse.model_validate(t) for t in recent_telemetry],
            recent_collections=[BinCollectionResponse.model_validate(c) for c in recent_collections],
            recent_activities=[BinActivityResponse.model_validate(a) for a in recent_activities],
            health_summary=health_summary,
        )

    @classmethod
    async def update_bin(
        cls,
        db: AsyncSession,
        identifier: int | str,
        bin_in: BinUpdate,
        user_id: Optional[int] = None,
    ) -> BinDetailResponse:
        """Update administrative and operational specifications of a bin."""
        bin_obj = await cls.get_bin_by_id_or_code(db, identifier)

        if bin_in.capacity_kg is not None:
            if bin_in.capacity_kg < bin_obj.current_fill_kg:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"New capacity ({bin_in.capacity_kg} kg) cannot be less than current fill ({bin_obj.current_fill_kg} kg).",
                )
            bin_obj.capacity_kg = bin_in.capacity_kg
            bin_obj.capacity_liters = bin_in.capacity_kg * 2.4

        if bin_in.sensor_id is not None and bin_in.sensor_id != bin_obj.sensor_id:
            # Check unique
            s_stmt = select(Sensor).where(and_(Sensor.sensor_id == bin_in.sensor_id, Sensor.bin_id != bin_obj.id))
            if (await db.execute(s_stmt)).scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Sensor '{bin_in.sensor_id}' is already linked to another bin.",
                )
            bin_obj.sensor_id = bin_in.sensor_id

        if bin_in.name is not None:
            bin_obj.name = bin_in.name
        if bin_in.bin_type is not None:
            bin_obj.bin_type = bin_in.bin_type
        if bin_in.waste_type is not None:
            bin_obj.waste_type = bin_in.waste_type
        if bin_in.zone is not None:
            bin_obj.zone = bin_in.zone
        if bin_in.address is not None:
            bin_obj.address = bin_in.address
        if bin_in.location_name is not None:
            bin_obj.location_name = bin_in.location_name
        if bin_in.latitude is not None:
            bin_obj.latitude = bin_in.latitude
        if bin_in.longitude is not None:
            bin_obj.longitude = bin_in.longitude
        if bin_in.status is not None:
            bin_obj.status = bin_in.status
        if bin_in.collection_status is not None:
            bin_obj.collection_status = bin_in.collection_status
        if bin_in.priority is not None:
            bin_obj.priority = bin_in.priority
        if bin_in.next_collection_at is not None:
            bin_obj.next_collection_at = bin_in.next_collection_at

        await cls.log_activity(
            db=db,
            bin_id=bin_obj.id,
            activity_type="UPDATED",
            description=f"Bin {bin_obj.bin_code} specifications updated.",
            performed_by=user_id,
        )

        await db.commit()
        return await cls.get_bin_detail(db, bin_obj.id)

    @classmethod
    async def deactivate_bin(
        cls,
        db: AsyncSession,
        identifier: int | str,
        user_id: Optional[int] = None,
    ) -> Dict[str, str]:
        """Soft-deactivate a bin, checking that it is not assigned to an active route."""
        bin_obj = await cls.get_bin_by_id_or_code(db, identifier)

        # Check active routes
        r_stmt = (
            select(Route)
            .join(RouteStop, RouteStop.route_id == Route.id)
            .where(
                and_(
                    RouteStop.bin_id == bin_obj.id,
                    RouteStop.status.in_([StopStatus.PENDING, StopStatus.IN_PROGRESS]),
                    Route.status.in_([RouteStatus.IN_PROGRESS, RouteStatus.PAUSED, RouteStatus.AT_RISK]),
                )
            )
        )
        active_route = (await db.execute(r_stmt)).scalar_one_or_none()
        if active_route:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot deactivate bin '{bin_obj.bin_code}' while active route '{active_route.route_code}' is in progress.",
            )

        bin_obj.is_active = False
        bin_obj.status = BinStatus.INACTIVE

        await cls.log_activity(
            db=db,
            bin_id=bin_obj.id,
            activity_type="DEACTIVATED",
            description=f"Bin {bin_obj.bin_code} deactivated and marked INACTIVE.",
            performed_by=user_id,
        )

        await db.commit()
        return {"message": f"Bin {bin_obj.bin_code} deactivated successfully."}

    @classmethod
    async def activate_bin(
        cls,
        db: AsyncSession,
        identifier: int | str,
        user_id: Optional[int] = None,
    ) -> Dict[str, str]:
        """Reactivate an inactive bin."""
        bin_obj = await cls.get_bin_by_id_or_code(db, identifier)

        bin_obj.is_active = True
        bin_obj.status = BinStatus.NORMAL

        await cls.log_activity(
            db=db,
            bin_id=bin_obj.id,
            activity_type="ACTIVATED",
            description=f"Bin {bin_obj.bin_code} reactivated and restored to NORMAL status.",
            performed_by=user_id,
        )

        await db.commit()
        return {"message": f"Bin {bin_obj.bin_code} reactivated successfully."}

    reactivate_bin = activate_bin

    @classmethod
    async def update_status(
        cls,
        db: AsyncSession,
        identifier: int | str,
        req: BinStatusUpdate,
        user_id: Optional[int] = None,
    ) -> BinDetailResponse:
        """Transition bin status with validation."""
        bin_obj = await cls.get_bin_by_id_or_code(db, identifier)
        target = req.status

        if bin_obj.status == target:
            return await cls.get_bin_detail(db, bin_obj.id)

        # Inactive bin cannot transition to operational states without activation
        if (not bin_obj.is_active or bin_obj.status == BinStatus.INACTIVE) and target != BinStatus.NORMAL:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot transition INACTIVE bin directly to {target.value}. Activate first.",
            )

        old_status = bin_obj.status.value if hasattr(bin_obj.status, "value") else str(bin_obj.status)
        bin_obj.status = target

        await cls.log_activity(
            db=db,
            bin_id=bin_obj.id,
            activity_type="STATUS_CHANGED",
            description=f"Status changed from {old_status} to {target.value}.",
            performed_by=user_id,
        )

        await db.commit()
        return await cls.get_bin_detail(db, bin_obj.id)

    @classmethod
    async def update_priority(
        cls,
        db: AsyncSession,
        identifier: int | str,
        req: BinPriorityUpdate,
        user_id: Optional[int] = None,
    ) -> BinDetailResponse:
        """Update collection priority with audit reason and source."""
        bin_obj = await cls.get_bin_by_id_or_code(db, identifier)

        old_priority = bin_obj.priority.value if hasattr(bin_obj.priority, "value") else str(bin_obj.priority)
        bin_obj.priority = req.priority

        await cls.log_activity(
            db=db,
            bin_id=bin_obj.id,
            activity_type="PRIORITY_CHANGED",
            description=f"Priority updated from {old_priority} to {req.priority.value}. Reason: {req.reason or 'None'}",
            performed_by=user_id,
            metadata={"source": req.source, "reason": req.reason},
        )

        await db.commit()
        return await cls.get_bin_detail(db, bin_obj.id)

    @classmethod
    async def prioritize_bin(
        cls,
        db: AsyncSession,
        identifier: int | str,
        req: BinPrioritizeRequest,
        user_id: Optional[int] = None,
    ) -> BinDetailResponse:
        """Mark bin as collection priority for planning optimization."""
        bin_obj = await cls.get_bin_by_id_or_code(db, identifier)

        bin_obj.priority = CollectionPriority.CRITICAL
        bin_obj.collection_status = CollectionStatus.PRIORITY

        await cls.log_activity(
            db=db,
            bin_id=bin_obj.id,
            activity_type="COLLECTION_PRIORITY_SET",
            description=f"Flagged for priority collection. Reason: {req.reason}",
            performed_by=user_id,
            metadata={"requested_by": req.requested_by, "reason": req.reason},
        )

        await db.commit()
        return await cls.get_bin_detail(db, bin_obj.id)

    @classmethod
    async def bulk_action(
        cls,
        db: AsyncSession,
        req: BulkBinActionRequest,
        user_id: Optional[int] = None,
    ) -> BulkBinActionResponse:
        """Execute a bulk operation across multiple bins safely."""
        successful_ids: List[int] = []
        failed_ids: List[int] = []
        errors: List[Dict[str, Any]] = []

        action_upper = req.action.upper()

        for b_id in req.bin_ids:
            try:
                bin_obj = await cls.get_bin_by_id_or_code(db, b_id)
                if action_upper == "ACTIVATE":
                    bin_obj.is_active = True
                    bin_obj.status = BinStatus.NORMAL
                    await cls.log_activity(db, bin_obj.id, "ACTIVATED", "Bulk activated.", performed_by=user_id)
                elif action_upper == "DEACTIVATE":
                    bin_obj.is_active = False
                    bin_obj.status = BinStatus.INACTIVE
                    await cls.log_activity(db, bin_obj.id, "DEACTIVATED", "Bulk deactivated.", performed_by=user_id)
                elif action_upper == "SET_PRIORITY":
                    if not req.value:
                        raise ValueError("Priority value required for SET_PRIORITY action.")
                    p_val = CollectionPriority(req.value.upper())
                    bin_obj.priority = p_val
                    await cls.log_activity(db, bin_obj.id, "PRIORITY_CHANGED", f"Bulk priority set to {p_val.value}.", performed_by=user_id)
                elif action_upper == "SET_STATUS":
                    if not req.value:
                        raise ValueError("Status value required for SET_STATUS action.")
                    s_val = BinStatus(req.value.upper())
                    bin_obj.status = s_val
                    await cls.log_activity(db, bin_obj.id, "STATUS_CHANGED", f"Bulk status set to {s_val.value}.", performed_by=user_id)
                elif action_upper == "SET_COLLECTION_STATUS":
                    if not req.value:
                        raise ValueError("Collection status value required.")
                    cs_val = CollectionStatus(req.value.upper())
                    bin_obj.collection_status = cs_val
                    await cls.log_activity(db, bin_obj.id, "COLLECTION_STATUS_CHANGED", f"Bulk collection status set to {cs_val.value}.", performed_by=user_id)
                else:
                    raise ValueError(f"Unsupported bulk action '{req.action}'.")

                successful_ids.append(bin_obj.id)
            except Exception as e:
                failed_ids.append(b_id)
                errors.append({"bin_id": b_id, "error": str(e)})

        await db.commit()
        return BulkBinActionResponse(
            successful_ids=successful_ids,
            failed_ids=failed_ids,
            errors=errors,
        )

    # -------------------------------------------------------------------------
    # SENSOR OPERATIONS
    # -------------------------------------------------------------------------

    @classmethod
    async def get_sensor_for_bin(
        cls,
        db: AsyncSession,
        identifier: int | str,
    ) -> Optional[SensorResponse]:
        """Fetch linked sensor record for a bin."""
        bin_obj = await cls.get_bin_by_id_or_code(db, identifier)
        s_stmt = select(Sensor).where(Sensor.bin_id == bin_obj.id)
        sensor = (await db.execute(s_stmt)).scalar_one_or_none()
        if not sensor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No sensor currently attached to bin {bin_obj.bin_code}.",
            )
        return SensorResponse.model_validate(sensor)

    @classmethod
    async def create_sensor_for_bin(
        cls,
        db: AsyncSession,
        identifier: int | str,
        req: SensorCreate,
        user_id: Optional[int] = None,
    ) -> SensorResponse:
        """Attach a new sensor to a bin."""
        bin_obj = await cls.get_bin_by_id_or_code(db, identifier)

        # Check if bin already has an active sensor
        ex_stmt = select(Sensor).where(Sensor.bin_id == bin_obj.id)
        if (await db.execute(ex_stmt)).scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Bin {bin_obj.bin_code} already has a sensor attached. Delete or update existing sensor.",
            )

        # Check if sensor_id is already assigned elsewhere
        s_stmt = select(Sensor).where(Sensor.sensor_id == req.sensor_id)
        if (await db.execute(s_stmt)).scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Sensor ID '{req.sensor_id}' is already registered.",
            )

        sensor = Sensor(
            sensor_id=req.sensor_id,
            bin_id=bin_obj.id,
            sensor_type=req.sensor_type,
            status=req.status,
            battery_percentage=req.battery_percentage,
            temperature_celsius=req.temperature_celsius,
            connectivity_status=req.connectivity_status,
            firmware_version=req.firmware_version,
        )
        db.add(sensor)
        bin_obj.sensor_id = req.sensor_id
        bin_obj.battery_percentage = req.battery_percentage
        bin_obj.connectivity_status = req.connectivity_status

        await cls.log_activity(
            db=db,
            bin_id=bin_obj.id,
            activity_type="SENSOR_CONNECTED",
            description=f"Sensor {req.sensor_id} attached to bin.",
            performed_by=user_id,
        )

        await db.commit()
        await db.refresh(sensor)
        return SensorResponse.model_validate(sensor)

    @classmethod
    async def update_sensor_for_bin(
        cls,
        db: AsyncSession,
        identifier: int | str,
        req: SensorUpdate,
        user_id: Optional[int] = None,
    ) -> SensorResponse:
        """Update attached sensor attributes."""
        bin_obj = await cls.get_bin_by_id_or_code(db, identifier)
        s_stmt = select(Sensor).where(Sensor.bin_id == bin_obj.id)
        sensor = (await db.execute(s_stmt)).scalar_one_or_none()
        if not sensor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No sensor found for bin {bin_obj.bin_code}.",
            )

        if req.sensor_id and req.sensor_id != sensor.sensor_id:
            dup_stmt = select(Sensor).where(Sensor.sensor_id == req.sensor_id)
            if (await db.execute(dup_stmt)).scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Sensor code '{req.sensor_id}' is already registered.",
                )
            sensor.sensor_id = req.sensor_id
            bin_obj.sensor_id = req.sensor_id

        if req.sensor_type is not None:
            sensor.sensor_type = req.sensor_type
        if req.status is not None:
            sensor.status = req.status
        if req.battery_percentage is not None:
            sensor.battery_percentage = req.battery_percentage
            bin_obj.battery_percentage = req.battery_percentage
        if req.temperature_celsius is not None:
            sensor.temperature_celsius = req.temperature_celsius
        if req.connectivity_status is not None:
            sensor.connectivity_status = req.connectivity_status
            bin_obj.connectivity_status = req.connectivity_status
        if req.firmware_version is not None:
            sensor.firmware_version = req.firmware_version

        await db.commit()
        await db.refresh(sensor)
        return SensorResponse.model_validate(sensor)

    @classmethod
    async def delete_sensor_from_bin(
        cls,
        db: AsyncSession,
        identifier: int | str,
        user_id: Optional[int] = None,
    ) -> Dict[str, str]:
        """Detach sensor from bin."""
        bin_obj = await cls.get_bin_by_id_or_code(db, identifier)
        s_stmt = select(Sensor).where(Sensor.bin_id == bin_obj.id)
        sensor = (await db.execute(s_stmt)).scalar_one_or_none()
        if not sensor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No sensor to detach from bin {bin_obj.bin_code}.",
            )

        sensor_id = sensor.sensor_id
        await db.delete(sensor)
        bin_obj.sensor_id = None

        await cls.log_activity(
            db=db,
            bin_id=bin_obj.id,
            activity_type="SENSOR_DISCONNECTED",
            description=f"Sensor {sensor_id} detached from bin.",
            performed_by=user_id,
        )

        await db.commit()
        return {"message": f"Sensor {sensor_id} detached successfully."}

    # -------------------------------------------------------------------------
    # TELEMETRY OPERATIONS
    # -------------------------------------------------------------------------

    @classmethod
    async def ingest_telemetry(
        cls,
        db: AsyncSession,
        identifier: int | str,
        req: BinTelemetryCreate,
        user_id: Optional[int] = None,
    ) -> BinTelemetryResponse:
        """Ingest sensor telemetry reading, updating current fill, battery, and evaluating threshold status."""
        bin_obj = await cls.get_bin_by_id_or_code(db, identifier)

        now = req.recorded_at or datetime.now(timezone.utc)
        fill_pct = req.fill_percentage
        fill_kg = req.fill_kg if req.fill_kg is not None else round((fill_pct / 100.0) * bin_obj.capacity_kg, 2)

        if fill_kg > bin_obj.capacity_kg:
            fill_kg = bin_obj.capacity_kg

        telemetry = BinTelemetry(
            bin_id=bin_obj.id,
            sensor_id=bin_obj.sensor_id,
            fill_percentage=fill_pct,
            fill_kg=fill_kg,
            battery_percentage=req.battery_percentage,
            temperature_celsius=req.temperature_celsius,
            connectivity_status=req.connectivity_status,
            recorded_at=now,
            source=req.source,
        )
        db.add(telemetry)

        # Update bin state
        bin_obj.current_fill_percentage = fill_pct
        bin_obj.fill_level = fill_pct
        bin_obj.current_fill_kg = fill_kg
        bin_obj.battery_percentage = req.battery_percentage
        bin_obj.connectivity_status = req.connectivity_status
        bin_obj.last_telemetry_at = now

        # Update sensor reading if linked
        s_stmt = select(Sensor).where(Sensor.bin_id == bin_obj.id)
        sensor = (await db.execute(s_stmt)).scalar_one_or_none()
        if sensor:
            sensor.last_reading_at = now
            sensor.last_fill_reading = fill_pct
            sensor.battery_percentage = req.battery_percentage
            sensor.connectivity_status = req.connectivity_status
            if req.temperature_celsius is not None:
                sensor.temperature_celsius = req.temperature_celsius

        # Threshold-based operational status & priority evaluation
        if bin_obj.status not in [BinStatus.MAINTENANCE, BinStatus.INACTIVE, BinStatus.OFFLINE]:
            old_st = bin_obj.status
            if fill_pct >= 90.0:
                bin_obj.status = BinStatus.CRITICAL
                bin_obj.priority = CollectionPriority.CRITICAL
                bin_obj.collection_status = CollectionStatus.PRIORITY
            elif fill_pct >= 75.0:
                bin_obj.status = BinStatus.WARNING
                if bin_obj.priority == CollectionPriority.LOW:
                    bin_obj.priority = CollectionPriority.HIGH
            else:
                bin_obj.status = BinStatus.NORMAL

            if old_st != bin_obj.status:
                await cls.log_activity(
                    db=db,
                    bin_id=bin_obj.id,
                    activity_type="STATUS_CHANGED",
                    description=f"Fill level {fill_pct}% triggered status change to {bin_obj.status.value}.",
                    performed_by=user_id,
                )

        await db.commit()
        await db.refresh(telemetry)
        return BinTelemetryResponse.model_validate(telemetry)

    @classmethod
    async def get_telemetry_history(
        cls,
        db: AsyncSession,
        identifier: int | str,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        limit: int = 50,
    ) -> List[BinTelemetryResponse]:
        """Fetch historical sensor telemetry records for a bin."""
        bin_obj = await cls.get_bin_by_id_or_code(db, identifier)
        stmt = select(BinTelemetry).where(BinTelemetry.bin_id == bin_obj.id)

        if from_date:
            stmt = stmt.where(BinTelemetry.recorded_at >= from_date)
        if to_date:
            stmt = stmt.where(BinTelemetry.recorded_at <= to_date)

        stmt = stmt.order_by(desc(BinTelemetry.recorded_at)).limit(limit)
        records = list((await db.execute(stmt)).scalars().all())
        return [BinTelemetryResponse.model_validate(r) for r in records]

    # -------------------------------------------------------------------------
    # COLLECTION & ACTIVITY HISTORIES
    # -------------------------------------------------------------------------

    @classmethod
    async def get_collection_history(
        cls,
        db: AsyncSession,
        identifier: int | str,
        page: int = 1,
        page_size: int = 20,
    ) -> List[BinCollectionResponse]:
        """Fetch paginated historical collections."""
        bin_obj = await cls.get_bin_by_id_or_code(db, identifier)
        offset = (page - 1) * page_size
        stmt = (
            select(BinCollectionHistory)
            .where(BinCollectionHistory.bin_id == bin_obj.id)
            .order_by(desc(BinCollectionHistory.collected_at))
            .offset(offset)
            .limit(page_size)
        )
        records = list((await db.execute(stmt)).scalars().all())
        return [BinCollectionResponse.model_validate(r) for r in records]

    @classmethod
    async def get_activity_history(
        cls,
        db: AsyncSession,
        identifier: int | str,
        page: int = 1,
        page_size: int = 20,
        activity_type: Optional[str] = None,
    ) -> List[BinActivityResponse]:
        """Fetch chronological activity audit log."""
        bin_obj = await cls.get_bin_by_id_or_code(db, identifier)
        offset = (page - 1) * page_size
        stmt = select(BinActivity).where(BinActivity.bin_id == bin_obj.id)
        if activity_type:
            stmt = stmt.where(BinActivity.activity_type == activity_type.upper())

        stmt = stmt.order_by(desc(BinActivity.created_at)).offset(offset) .limit(page_size)
        records = list((await db.execute(stmt)).scalars().all())
        return [BinActivityResponse.model_validate(r) for r in records]

    # -------------------------------------------------------------------------
    # ANALYTICS, MAP & SUMMARIES
    # -------------------------------------------------------------------------

    @classmethod
    async def get_map_data(
        cls,
        db: AsyncSession,
        zone: Optional[str] = None,
        status_filter: Optional[str] = None,
        priority: Optional[str] = None,
        waste_type: Optional[str] = None,
        is_active: Optional[bool] = True,
    ) -> List[BinMapItem]:
        """Lightweight payload representing bin coordinates and markers for the network map."""
        stmt = select(Bin)
        if is_active is not None:
            stmt = stmt.where(Bin.is_active == is_active)
        if zone and zone.upper() != "ALL":
            stmt = stmt.where(Bin.zone.ilike(f"%{zone}%"))
        if status_filter and status_filter.upper() != "ALL":
            try:
                stmt = stmt.where(Bin.status == BinStatus(status_filter.upper()))
            except ValueError:
                pass
        if priority and priority.upper() != "ALL":
            try:
                stmt = stmt.where(Bin.priority == CollectionPriority(priority.upper()))
            except ValueError:
                pass
        if waste_type and waste_type.upper() != "ALL":
            try:
                stmt = stmt.where(Bin.waste_type == WasteType(waste_type.upper()))
            except ValueError:
                pass

        bins = list((await db.execute(stmt)).scalars().all())
        return [
            BinMapItem(
                id=b.id,
                bin_code=b.bin_code,
                name=b.name,
                latitude=b.latitude,
                longitude=b.longitude,
                status=b.status,
                fill_percentage=b.current_fill_percentage,
                priority=b.priority,
                zone=b.zone,
                waste_type=b.waste_type,
                predicted_fill_percentage=b.predicted_fill_percentage,
                predicted_overflow_at=b.predicted_overflow_at,
                collection_status=b.collection_status,
            )
            for b in bins
        ]

    @classmethod
    async def get_summary(cls, db: AsyncSession) -> BinSummaryResponse:
        """Calculate network KPI cards summary counts."""
        bins = list((await db.execute(select(Bin))).scalars().all())

        total = len(bins)
        active = sum(1 for b in bins if b.is_active)
        inactive = total - active

        status_counts = {s: 0 for s in BinStatus}
        for b in bins:
            status_counts[b.status] = status_counts.get(b.status, 0) + 1

        needing_collection = sum(1 for b in bins if b.current_fill_percentage >= 75.0 or b.collection_status == CollectionStatus.PRIORITY)
        priority_count = sum(1 for b in bins if b.priority in [CollectionPriority.HIGH, CollectionPriority.CRITICAL])
        avg_fill = round(sum(b.current_fill_percentage for b in bins) / total, 2) if total > 0 else 0.0
        avg_battery = round(sum(b.battery_percentage for b in bins) / total, 2) if total > 0 else 0.0

        online_sensors = sum(1 for b in bins if b.connectivity_status == ConnectivityStatus.ONLINE and b.sensor_id)
        total_sensors = sum(1 for b in bins if b.sensor_id)
        online_sensor_pct = round((online_sensors / total_sensors * 100), 2) if total_sensors > 0 else 0.0

        predicted_overflow_count = sum(1 for b in bins if b.predicted_overflow_at is not None and b.predicted_fill_percentage and b.predicted_fill_percentage >= 95.0)

        return BinSummaryResponse(
            total_bins=total,
            active_bins=active,
            inactive_bins=inactive,
            normal_bins=status_counts.get(BinStatus.NORMAL, 0) + status_counts.get(BinStatus.ACTIVE, 0),
            warning_bins=status_counts.get(BinStatus.WARNING, 0),
            critical_bins=status_counts.get(BinStatus.CRITICAL, 0),
            offline_bins=status_counts.get(BinStatus.OFFLINE, 0),
            maintenance_bins=status_counts.get(BinStatus.MAINTENANCE, 0),
            bins_needing_collection=needing_collection,
            priority_bins=priority_count,
            average_fill_percentage=avg_fill,
            average_battery_percentage=avg_battery,
            online_sensor_percentage=online_sensor_pct,
            predicted_overflow_count=predicted_overflow_count,
        )

    @classmethod
    async def get_network_health(cls, db: AsyncSession) -> BinNetworkHealthResponse:
        """Network health diagnostic overview."""
        bins = list((await db.execute(select(Bin))).scalars().all())
        total = len(bins)

        online = sum(1 for b in bins if b.connectivity_status == ConnectivityStatus.ONLINE)
        offline = sum(1 for b in bins if b.connectivity_status == ConnectivityStatus.OFFLINE)
        degraded = sum(1 for b in bins if b.connectivity_status == ConnectivityStatus.DEGRADED)

        now = datetime.now(timezone.utc)
        stale_count = 0
        for b in bins:
            t_dt = b.last_telemetry_at.replace(tzinfo=timezone.utc) if b.last_telemetry_at and b.last_telemetry_at.tzinfo is None else b.last_telemetry_at
            if not t_dt or (now - t_dt).total_seconds() > 7200:
                stale_count += 1

        avg_batt = round(sum(b.battery_percentage for b in bins) / total, 2) if total > 0 else 0.0
        sensor_health_pct = round((online / total * 100), 2) if total > 0 else 0.0

        return BinNetworkHealthResponse(
            total=total,
            online=online,
            offline=offline,
            degraded=degraded,
            sensor_health_percentage=sensor_health_pct,
            average_battery=avg_batt,
            telemetry_freshness="94% within 1 hour" if total > 0 else "N/A",
            stale_bins=stale_count,
            critical_bins=sum(1 for b in bins if b.status == BinStatus.CRITICAL),
        )

    @classmethod
    async def get_analytics(
        cls,
        db: AsyncSession,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        zone: Optional[str] = None,
        waste_type: Optional[str] = None,
    ) -> BinAnalyticsResponse:
        """Aggregate bin fill distributions and operational stats."""
        stmt = select(Bin)
        if zone and zone.upper() != "ALL":
            stmt = stmt.where(Bin.zone.ilike(f"%{zone}%"))
        if waste_type and waste_type.upper() != "ALL":
            try:
                stmt = stmt.where(Bin.waste_type == WasteType(waste_type.upper()))
            except ValueError:
                pass

        bins = list((await db.execute(stmt)).scalars().all())
        if not bins:
            return BinAnalyticsResponse(
                average_fill=0.0,
                maximum_fill=0.0,
                minimum_fill=0.0,
                collection_count=0,
                average_collection_interval_hours=None,
                overflow_events=0,
                critical_events=0,
                waste_type_distribution={},
                zone_distribution={},
            )

        fills = [b.current_fill_percentage for b in bins]
        avg_fill = round(sum(fills) / len(fills), 2)
        max_fill = max(fills)
        min_fill = min(fills)

        w_dist: Dict[str, int] = {}
        z_dist: Dict[str, int] = {}
        for b in bins:
            wt_key = b.waste_type.value if hasattr(b.waste_type, "value") else str(b.waste_type)
            w_dist[wt_key] = w_dist.get(wt_key, 0) + 1
            z_dist[b.zone] = z_dist.get(b.zone, 0) + 1

        # Collection count from history
        c_stmt = select(func.count(BinCollectionHistory.id))
        col_count = (await db.execute(c_stmt)).scalar() or 0

        crit_count = sum(1 for b in bins if b.status == BinStatus.CRITICAL)
        overflow_count = sum(1 for b in bins if b.current_fill_percentage >= 95.0)

        return BinAnalyticsResponse(
            average_fill=avg_fill,
            maximum_fill=max_fill,
            minimum_fill=min_fill,
            collection_count=col_count,
            average_collection_interval_hours=24.0,
            overflow_events=overflow_count,
            critical_events=crit_count,
            waste_type_distribution=w_dist,
            zone_distribution=z_dist,
        )

    @classmethod
    async def get_collection_summary(cls, db: AsyncSession) -> BinCollectionSummaryResponse:
        """Collection status counts and queue breakdown."""
        bins = list((await db.execute(select(Bin).where(Bin.is_active == True))).scalars().all())

        c_counts = {cs: 0 for cs in CollectionStatus}
        overdue_bins: List[BinListItem] = []
        priority_bins: List[BinListItem] = []

        for b in bins:
            c_counts[b.collection_status] = c_counts.get(b.collection_status, 0) + 1
            if b.collection_status == CollectionStatus.OVERDUE:
                overdue_bins.append(
                    BinListItem(
                        id=b.id,
                        bin_code=b.bin_code,
                        name=b.name,
                        bin_type=b.bin_type,
                        capacity_kg=b.capacity_kg,
                        current_fill_kg=b.current_fill_kg,
                        current_fill_percentage=b.current_fill_percentage,
                        waste_type=b.waste_type,
                        status=b.status,
                        zone=b.zone,
                        address=b.address or b.location_name,
                        sensor_id=b.sensor_id,
                        battery_percentage=b.battery_percentage,
                        connectivity_status=b.connectivity_status,
                        collection_status=b.collection_status,
                        priority=b.priority,
                        last_collection_at=b.last_collection_at,
                        predicted_overflow_at=b.predicted_overflow_at,
                        predicted_fill_percentage=b.predicted_fill_percentage,
                        is_active=b.is_active,
                    )
                )
            if b.collection_status == CollectionStatus.PRIORITY or b.priority == CollectionPriority.CRITICAL:
                priority_bins.append(
                    BinListItem(
                        id=b.id,
                        bin_code=b.bin_code,
                        name=b.name,
                        bin_type=b.bin_type,
                        capacity_kg=b.capacity_kg,
                        current_fill_kg=b.current_fill_kg,
                        current_fill_percentage=b.current_fill_percentage,
                        waste_type=b.waste_type,
                        status=b.status,
                        zone=b.zone,
                        address=b.address or b.location_name,
                        sensor_id=b.sensor_id,
                        battery_percentage=b.battery_percentage,
                        connectivity_status=b.connectivity_status,
                        collection_status=b.collection_status,
                        priority=b.priority,
                        last_collection_at=b.last_collection_at,
                        predicted_overflow_at=b.predicted_overflow_at,
                        predicted_fill_percentage=b.predicted_fill_percentage,
                        is_active=b.is_active,
                    )
                )

        return BinCollectionSummaryResponse(
            not_required=c_counts.get(CollectionStatus.NOT_REQUIRED, 0),
            scheduled=c_counts.get(CollectionStatus.SCHEDULED, 0),
            priority=c_counts.get(CollectionStatus.PRIORITY, 0),
            overdue=c_counts.get(CollectionStatus.OVERDUE, 0),
            in_progress=c_counts.get(CollectionStatus.IN_PROGRESS, 0),
            collected=c_counts.get(CollectionStatus.COLLECTED, 0),
            overdue_bins=overdue_bins[:10],
            priority_bins=priority_bins[:10],
            bins_due_today=c_counts.get(CollectionStatus.SCHEDULED, 0) + c_counts.get(CollectionStatus.PRIORITY, 0) + c_counts.get(CollectionStatus.OVERDUE, 0),
        )
