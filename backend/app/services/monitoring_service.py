import math
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select, func, and_, or_, desc, distinct
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.models.bin import Bin, BinStatus, WasteType, CollectionStatus, CollectionPriority, ConnectivityStatus
from app.models.sensor import Sensor
from app.models.bin_telemetry import BinTelemetry
from app.models.bin_collection import BinCollectionHistory
from app.models.bin_activity import BinActivity
from app.models.vehicle import Vehicle, VehicleStatus, VehicleType, EnergyType
from app.models.vehicle_history import VehicleActivity
from app.models.route import Route, RouteStatus, RoutePriority
from app.models.route_stop import RouteStop, StopStatus, StopPriority
from app.models.user import User

from app.schemas.monitoring import (
    MonitoringSummaryResponse,
    MonitoringMapBin,
    MonitoringMapVehicle,
    MonitoringMapRouteStop,
    MonitoringMapRoute,
    MonitoringMapResponse,
    MonitoringRouteBrief,
    MonitoringBinItem,
    MonitoringBinListResponse,
    MonitoringVehicleItem,
    MonitoringVehicleListResponse,
    MonitoringRouteItem,
    MonitoringRouteListResponse,
    MonitoringStopDetail,
    MonitoringRouteDetailResponse,
    MonitoringSensorHealthResponse,
    MonitoringNetworkHealthResponse,
    MonitoringZoneResponse,
    MonitoringCollectionItem,
    MonitoringCollectionListResponse,
    MonitoringActivityItem,
    MonitoringActivityListResponse,
    MonitoringAlertItem,
    MonitoringAlertListResponse,
    MonitoringLiveSnapshotResponse,
)


class MonitoringService:

    # =========================================================================
    # 1. SUMMARY
    # =========================================================================
    @classmethod
    async def get_summary(cls, db: AsyncSession) -> MonitoringSummaryResponse:
        """Calculate live fleet and bin operational KPIs."""
        now = datetime.now(timezone.utc)

        # 1. Bins metrics
        bin_stmt = select(
            func.count(Bin.id).label("total"),
            func.count(Bin.id).filter(Bin.status == BinStatus.CRITICAL).label("critical"),
            func.count(Bin.id).filter(Bin.status == BinStatus.WARNING).label("warning"),
            func.count(Bin.id).filter(Bin.connectivity_status == ConnectivityStatus.ONLINE).label("online"),
            func.count(Bin.id).filter(Bin.connectivity_status == ConnectivityStatus.OFFLINE).label("offline"),
        ).where(Bin.is_active == True)
        bin_row = (await db.execute(bin_stmt)).one()

        total_bins = bin_row.total or 0
        critical_bins = bin_row.critical or 0
        warning_bins = bin_row.warning or 0
        bins_online = bin_row.online or 0
        bins_offline = bin_row.offline or 0

        # 2. Vehicles metrics
        veh_stmt = select(
            func.count(Vehicle.id).label("total"),
            func.count(Vehicle.id).filter(Vehicle.status == VehicleStatus.ON_ROUTE).label("active"),
        ).where(Vehicle.is_active == True)
        veh_row = (await db.execute(veh_stmt)).one()

        total_vehicles = veh_row.total or 0
        active_vehicles = veh_row.active or 0

        # 3. Routes metrics
        active_route_statuses = [RouteStatus.IN_PROGRESS, RouteStatus.AT_RISK]
        route_stmt = select(func.count(Route.id)).where(Route.status.in_(active_route_statuses))
        active_routes = (await db.execute(route_stmt)).scalar() or 0

        # 4. Active collections (stops on active routes)
        col_stmt = (
            select(func.count(RouteStop.id))
            .join(Route, RouteStop.route_id == Route.id)
            .where(
                and_(
                    Route.status.in_(active_route_statuses),
                    RouteStop.status.in_([StopStatus.PENDING, StopStatus.IN_PROGRESS]),
                )
            )
        )
        active_collections = (await db.execute(col_stmt)).scalar() or 0

        # 5. Sensor health
        sensor_stmt = select(
            func.count(Sensor.id).label("total"),
            func.count(Sensor.id).filter(Sensor.connectivity_status == ConnectivityStatus.ONLINE).label("online"),
        )
        sensor_row = (await db.execute(sensor_stmt)).one()
        total_sensors = sensor_row.total or 0
        online_sensors = sensor_row.online or 0

        sensor_health_pct = round((online_sensors / total_sensors * 100), 2) if total_sensors > 0 else 100.0
        network_health_pct = round((bins_online / total_bins * 100), 2) if total_bins > 0 else 100.0

        # 6. Alerts count
        alerts = await cls.get_alerts_list(db)
        unacknowledged_alerts = len([a for a in alerts if a.acknowledged_at is None])
        critical_alerts = len([a for a in alerts if a.severity == "CRITICAL"])

        return MonitoringSummaryResponse(
            bins_monitored=total_bins,
            bins_online=bins_online,
            bins_offline=bins_offline,
            critical_bins=critical_bins,
            warning_bins=warning_bins,
            active_vehicles=active_vehicles,
            total_vehicles=total_vehicles,
            active_routes=active_routes,
            active_collections=active_collections,
            sensor_health_percentage=sensor_health_pct,
            network_health_percentage=network_health_pct,
            unacknowledged_alerts=unacknowledged_alerts,
            critical_alerts=critical_alerts,
            last_updated=now,
        )

    # =========================================================================
    # 2. LIVE MAP DATA
    # =========================================================================
    @classmethod
    async def get_map_data(
        cls,
        db: AsyncSession,
        zone: Optional[str] = None,
        bin_status: Optional[str] = None,
        vehicle_status: Optional[str] = None,
        route_status: Optional[str] = None,
        waste_type: Optional[str] = None,
        collection_status: Optional[str] = None,
    ) -> MonitoringMapResponse:
        """Fetch lightweight live GIS map data for bins, vehicles, and active routes."""

        # 1. Bins query
        bin_q = select(Bin).where(Bin.is_active == True)
        if zone and zone.upper() != "ALL":
            bin_q = bin_q.where(Bin.zone.ilike(f"%{zone}%"))
        if bin_status and bin_status.upper() != "ALL":
            try:
                bin_q = bin_q.where(Bin.status == BinStatus(bin_status.upper()))
            except ValueError:
                pass
        if waste_type and waste_type.upper() != "ALL":
            try:
                bin_q = bin_q.where(Bin.waste_type == WasteType(waste_type.upper()))
            except ValueError:
                pass
        if collection_status and collection_status.upper() != "ALL":
            try:
                bin_q = bin_q.where(Bin.collection_status == CollectionStatus(collection_status.upper()))
            except ValueError:
                pass

        bins_db = (await db.execute(bin_q)).scalars().all()
        map_bins: List[MonitoringMapBin] = [
            MonitoringMapBin(
                id=b.id,
                uuid=b.uuid,
                bin_code=b.bin_code,
                name=b.name,
                latitude=b.latitude,
                longitude=b.longitude,
                status=b.status,
                fill_percentage=b.current_fill_percentage,
                capacity_kg=b.capacity_kg,
                current_fill_kg=b.current_fill_kg,
                waste_type=b.waste_type,
                zone=b.zone,
                collection_status=b.collection_status,
                priority=b.priority,
                last_telemetry_at=b.last_telemetry_at,
                predicted_fill_percentage=b.predicted_fill_percentage,
                predicted_overflow_at=b.predicted_overflow_at,
            )
            for b in bins_db
        ]

        # 2. Vehicles query
        veh_q = select(Vehicle).options(selectinload(Vehicle.driver)).where(Vehicle.is_active == True)
        if zone and zone.upper() != "ALL":
            veh_q = veh_q.where(Vehicle.zone.ilike(f"%{zone}%"))
        if vehicle_status and vehicle_status.upper() != "ALL":
            try:
                veh_q = veh_q.where(Vehicle.status == VehicleStatus(vehicle_status.upper()))
            except ValueError:
                pass

        vehicles_db = (await db.execute(veh_q)).scalars().all()

        # Cache active routes by vehicle_id
        active_routes_stmt = select(Route).where(
            Route.status.in_([RouteStatus.IN_PROGRESS, RouteStatus.PLANNED, RouteStatus.AT_RISK, RouteStatus.PAUSED])
        )
        active_routes_db = (await db.execute(active_routes_stmt)).scalars().all()
        route_by_vehicle = {r.vehicle_id: r for r in active_routes_db}

        map_vehicles: List[MonitoringMapVehicle] = []
        for v in vehicles_db:
            rt = route_by_vehicle.get(v.id)
            d_name = f"{v.driver.first_name} {v.driver.last_name}" if v.driver else None
            map_vehicles.append(
                MonitoringMapVehicle(
                    id=v.id,
                    uuid=v.uuid,
                    vehicle_code=v.vehicle_code,
                    name=v.name,
                    vehicle_type=v.vehicle_type,
                    latitude=v.latitude,
                    longitude=v.longitude,
                    status=v.status,
                    current_load_kg=v.current_load_kg,
                    capacity_kg=v.capacity_kg,
                    utilization_percentage=v.capacity_utilization,
                    route_id=rt.id if rt else None,
                    route_code=rt.route_code if rt else None,
                    driver_id=v.driver_id,
                    driver_name=d_name,
                    zone=v.zone,
                )
            )

        # 3. Routes query
        route_q = (
            select(Route)
            .options(
                selectinload(Route.driver),
                selectinload(Route.vehicle),
                selectinload(Route.stops).selectinload(RouteStop.bin),
            )
            .where(
                Route.status.in_([
                    RouteStatus.IN_PROGRESS,
                    RouteStatus.PLANNED,
                    RouteStatus.AT_RISK,
                    RouteStatus.PAUSED,
                ])
            )
        )
        if zone and zone.upper() != "ALL":
            route_q = route_q.where(Route.zone.ilike(f"%{zone}%"))
        if route_status and route_status.upper() != "ALL":
            try:
                route_q = route_q.where(Route.status == RouteStatus(route_status.upper()))
            except ValueError:
                pass

        routes_db = (await db.execute(route_q)).scalars().all()
        map_routes: List[MonitoringMapRoute] = []
        for r in routes_db:
            stops_list = sorted(r.stops, key=lambda s: s.sequence_number)
            tot_stops = len(stops_list)
            comp_stops = len([s for s in stops_list if s.status == StopStatus.COMPLETED])
            prog_pct = round((comp_stops / tot_stops * 100), 2) if tot_stops > 0 else 0.0

            route_stops_payload: List[MonitoringMapRouteStop] = []
            for s in stops_list:
                b_code = s.bin.bin_code if s.bin else "UNKNOWN"
                b_lat = s.bin.latitude if s.bin else None
                b_lng = s.bin.longitude if s.bin else None
                route_stops_payload.append(
                    MonitoringMapRouteStop(
                        stop_id=s.id,
                        bin_id=s.bin_id,
                        bin_code=b_code,
                        sequence_number=s.sequence_number,
                        status=s.status,
                        latitude=b_lat,
                        longitude=b_lng,
                    )
                )

            d_name = f"{r.driver.first_name} {r.driver.last_name}" if r.driver else None
            v_code = r.vehicle.vehicle_code if r.vehicle else None

            map_routes.append(
                MonitoringMapRoute(
                    id=r.id,
                    uuid=r.uuid,
                    route_code=r.route_code,
                    name=r.name,
                    status=r.status,
                    zone=r.zone,
                    vehicle_id=r.vehicle_id,
                    vehicle_code=v_code,
                    driver_id=r.driver_id,
                    driver_name=d_name,
                    total_stops=tot_stops,
                    completed_stops=comp_stops,
                    progress_percentage=prog_pct,
                    polyline=getattr(r, "polyline", None),
                    stops=route_stops_payload,
                )
            )

        # 4. Distinct zones
        distinct_zones_stmt = select(distinct(Bin.zone)).where(Bin.is_active == True)
        zones_res = list((await db.execute(distinct_zones_stmt)).scalars().all())

        return MonitoringMapResponse(
            bins=map_bins,
            vehicles=map_vehicles,
            routes=map_routes,
            zones=zones_res,
        )

    # =========================================================================
    # 3. MONITORED BINS LIST
    # =========================================================================
    @classmethod
    async def get_bins(
        cls,
        db: AsyncSession,
        search: Optional[str] = None,
        zone: Optional[str] = None,
        status_filter: Optional[str] = None,
        waste_type: Optional[str] = None,
        collection_status: Optional[str] = None,
        priority: Optional[str] = None,
        is_active: Optional[bool] = True,
        is_online: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "current_fill_percentage",
        sort_order: str = "desc",
    ) -> MonitoringBinListResponse:
        """Paginated, filtered list of monitored bins with live metrics."""
        base_query = select(Bin)

        if is_active is not None:
            base_query = base_query.where(Bin.is_active == is_active)

        if zone and zone.upper() != "ALL":
            base_query = base_query.where(Bin.zone.ilike(f"%{zone}%"))

        if status_filter and status_filter.upper() != "ALL":
            try:
                base_query = base_query.where(Bin.status == BinStatus(status_filter.upper()))
            except ValueError:
                pass

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

        if is_online is not None:
            if is_online:
                base_query = base_query.where(Bin.connectivity_status == ConnectivityStatus.ONLINE)
            else:
                base_query = base_query.where(Bin.connectivity_status != ConnectivityStatus.ONLINE)

        if search:
            search_pat = f"%{search}%"
            base_query = base_query.where(
                or_(
                    Bin.bin_code.ilike(search_pat),
                    Bin.name.ilike(search_pat),
                    Bin.address.ilike(search_pat),
                    Bin.sensor_id.ilike(search_pat),
                    Bin.zone.ilike(search_pat),
                )
            )

        # Count total
        count_stmt = select(func.count()).select_from(base_query.subquery())
        total = (await db.execute(count_stmt)).scalar() or 0

        # Sorting
        sort_col = getattr(Bin, sort_by, Bin.current_fill_percentage)
        if sort_order.lower() == "asc":
            base_query = base_query.order_by(sort_col.asc())
        else:
            base_query = base_query.order_by(sort_col.desc())

        offset = (page - 1) * page_size
        paginated_stmt = base_query.offset(offset).limit(page_size)
        bins_db = (await db.execute(paginated_stmt)).scalars().all()

        # Batch load active routes for these bins
        bin_ids = [b.id for b in bins_db]
        assigned_routes: Dict[int, MonitoringRouteBrief] = {}
        if bin_ids:
            r_stmt = (
                select(RouteStop, Route, User, Vehicle)
                .join(Route, RouteStop.route_id == Route.id)
                .outerjoin(User, Route.driver_id == User.id)
                .outerjoin(Vehicle, Route.vehicle_id == Vehicle.id)
                .where(
                    and_(
                        RouteStop.bin_id.in_(bin_ids),
                        Route.status.in_([RouteStatus.IN_PROGRESS, RouteStatus.PLANNED, RouteStatus.AT_RISK, RouteStatus.PAUSED]),
                    )
                )
            )
            for stop, route, driver, vehicle in (await db.execute(r_stmt)).all():
                d_name = f"{driver.first_name} {driver.last_name}" if driver else None
                v_code = vehicle.vehicle_code if vehicle else None
                assigned_routes[stop.bin_id] = MonitoringRouteBrief(
                    route_id=route.id,
                    route_code=route.route_code,
                    name=route.name,
                    status=route.status.value,
                    driver_name=d_name,
                    vehicle_code=v_code,
                )

        items: List[MonitoringBinItem] = []
        for b in bins_db:
            items.append(
                MonitoringBinItem(
                    id=b.id,
                    uuid=b.uuid,
                    bin_code=b.bin_code,
                    name=b.name,
                    zone=b.zone,
                    address=b.address or b.location_name,
                    latitude=b.latitude,
                    longitude=b.longitude,
                    capacity_kg=b.capacity_kg,
                    current_fill_kg=b.current_fill_kg,
                    current_fill_percentage=b.current_fill_percentage,
                    waste_type=b.waste_type,
                    status=b.status,
                    collection_status=b.collection_status,
                    priority=b.priority,
                    sensor_id=b.sensor_id,
                    sensor_connectivity=b.connectivity_status,
                    battery_percentage=b.battery_percentage,
                    last_telemetry_at=b.last_telemetry_at,
                    predicted_fill_percentage=b.predicted_fill_percentage,
                    predicted_overflow_at=b.predicted_overflow_at,
                    assigned_route=assigned_routes.get(b.id),
                )
            )

        total_pages = math.ceil(total / page_size) if total > 0 else 1
        return MonitoringBinListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    # =========================================================================
    # 4. MONITORED VEHICLES LIST
    # =========================================================================
    @classmethod
    async def get_vehicles(
        cls,
        db: AsyncSession,
        search: Optional[str] = None,
        status_filter: Optional[str] = None,
        zone: Optional[str] = None,
        vehicle_type: Optional[str] = None,
        energy_type: Optional[str] = None,
        driver_id: Optional[int] = None,
        route_id: Optional[int] = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "current_load_kg",
        sort_order: str = "desc",
    ) -> MonitoringVehicleListResponse:
        """Paginated, filtered list of fleet vehicles with real-time operational status."""
        base_query = select(Vehicle).options(selectinload(Vehicle.driver)).where(Vehicle.is_active == True)

        if zone and zone.upper() != "ALL":
            base_query = base_query.where(Vehicle.zone.ilike(f"%{zone}%"))

        if status_filter and status_filter.upper() != "ALL":
            try:
                base_query = base_query.where(Vehicle.status == VehicleStatus(status_filter.upper()))
            except ValueError:
                pass

        if vehicle_type and vehicle_type.upper() != "ALL":
            try:
                base_query = base_query.where(Vehicle.vehicle_type == VehicleType(vehicle_type.upper()))
            except ValueError:
                pass

        if energy_type and energy_type.upper() != "ALL":
            try:
                base_query = base_query.where(Vehicle.energy_type == EnergyType(energy_type.upper()))
            except ValueError:
                pass

        if driver_id:
            base_query = base_query.where(Vehicle.driver_id == driver_id)

        if search:
            search_pat = f"%{search}%"
            base_query = base_query.where(
                or_(
                    Vehicle.vehicle_code.ilike(search_pat),
                    Vehicle.name.ilike(search_pat),
                    Vehicle.registration_number.ilike(search_pat),
                    Vehicle.zone.ilike(search_pat),
                )
            )

        # Count total
        count_stmt = select(func.count()).select_from(base_query.subquery())
        total = (await db.execute(count_stmt)).scalar() or 0

        # Sort
        sort_col = getattr(Vehicle, sort_by, Vehicle.current_load_kg)
        if sort_order.lower() == "asc":
            base_query = base_query.order_by(sort_col.asc())
        else:
            base_query = base_query.order_by(sort_col.desc())

        offset = (page - 1) * page_size
        paginated_stmt = base_query.offset(offset).limit(page_size)
        vehicles_db = (await db.execute(paginated_stmt)).scalars().all()

        # Cache active routes
        v_ids = [v.id for v in vehicles_db]
        route_map: Dict[int, Route] = {}
        if v_ids:
            r_stmt = select(Route).where(
                and_(
                    Route.vehicle_id.in_(v_ids),
                    Route.status.in_([RouteStatus.IN_PROGRESS, RouteStatus.PLANNED, RouteStatus.AT_RISK, RouteStatus.PAUSED]),
                )
            )
            for r in (await db.execute(r_stmt)).scalars().all():
                route_map[r.vehicle_id] = r

        items: List[MonitoringVehicleItem] = []
        for v in vehicles_db:
            rt = route_map.get(v.id)
            d_name = f"{v.driver.first_name} {v.driver.last_name}" if v.driver else None
            items.append(
                MonitoringVehicleItem(
                    vehicle_id=v.id,
                    uuid=v.uuid,
                    vehicle_code=v.vehicle_code,
                    name=v.name,
                    vehicle_type=v.vehicle_type,
                    registration_number=v.registration_number,
                    status=v.status,
                    capacity_kg=v.capacity_kg,
                    current_load_kg=v.current_load_kg,
                    utilization_percentage=v.capacity_utilization,
                    energy_type=v.energy_type,
                    driver_id=v.driver_id,
                    driver_name=d_name,
                    zone=v.zone,
                    latitude=v.latitude,
                    longitude=v.longitude,
                    last_location_update=v.last_location_update,
                    current_route_id=rt.id if rt else None,
                    current_route_code=rt.route_code if rt else None,
                )
            )

        total_pages = math.ceil(total / page_size) if total > 0 else 1
        return MonitoringVehicleListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    # =========================================================================
    # 5. MONITORED ROUTES
    # =========================================================================
    @classmethod
    async def get_routes(
        cls,
        db: AsyncSession,
        status_filter: Optional[str] = None,
        zone: Optional[str] = None,
        vehicle_id: Optional[int] = None,
        driver_id: Optional[int] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> MonitoringRouteListResponse:
        """Paginated list of routes with live stop progress metrics."""
        base_query = select(Route).options(
            selectinload(Route.driver),
            selectinload(Route.vehicle),
            selectinload(Route.stops),
        )

        if status_filter and status_filter.upper() != "ALL":
            try:
                base_query = base_query.where(Route.status == RouteStatus(status_filter.upper()))
            except ValueError:
                pass
        else:
            # Default to active & planned routes
            base_query = base_query.where(
                Route.status.in_([
                    RouteStatus.IN_PROGRESS,
                    RouteStatus.PLANNED,
                    RouteStatus.AT_RISK,
                    RouteStatus.PAUSED,
                    RouteStatus.COMPLETED,
                ])
            )

        if zone and zone.upper() != "ALL":
            base_query = base_query.where(Route.zone.ilike(f"%{zone}%"))

        if vehicle_id:
            base_query = base_query.where(Route.vehicle_id == vehicle_id)
        if driver_id:
            base_query = base_query.where(Route.driver_id == driver_id)

        # Count total
        count_stmt = select(func.count()).select_from(base_query.subquery())
        total = (await db.execute(count_stmt)).scalar() or 0

        offset = (page - 1) * page_size
        paginated_stmt = base_query.order_by(desc(Route.scheduled_date), Route.start_time).offset(offset).limit(page_size)
        routes_db = (await db.execute(paginated_stmt)).scalars().all()

        items: List[MonitoringRouteItem] = []
        now = datetime.now(timezone.utc)
        for r in routes_db:
            stops = r.stops
            tot_stops = len(stops)
            comp_stops = len([s for s in stops if s.status == StopStatus.COMPLETED])
            skip_stops = len([s for s in stops if s.status == StopStatus.SKIPPED])
            rem_stops = tot_stops - comp_stops - skip_stops
            prog_pct = round((comp_stops / tot_stops * 100), 2) if tot_stops > 0 else 0.0

            elapsed = None
            d_name = f"{r.driver.first_name} {r.driver.last_name}" if r.driver else None
            v_code = r.vehicle.vehicle_code if r.vehicle else None

            items.append(
                MonitoringRouteItem(
                    route_id=r.id,
                    uuid=r.uuid,
                    route_code=r.route_code,
                    name=r.name,
                    status=r.status,
                    priority=r.priority,
                    zone=r.zone,
                    vehicle_id=r.vehicle_id,
                    vehicle_code=v_code,
                    driver_id=r.driver_id,
                    driver_name=d_name,
                    total_stops=tot_stops,
                    completed_stops=comp_stops,
                    remaining_stops=rem_stops,
                    skipped_stops=skip_stops,
                    progress_percentage=prog_pct,
                    distance_km=r.total_distance_km,
                    estimated_duration_minutes=r.estimated_duration_minutes,
                    elapsed_minutes=elapsed,
                    start_time=r.start_time,
                    estimated_end_time=r.estimated_completion_time,
                    last_activity_at=r.updated_at or r.created_at,
                )
            )

        total_pages = math.ceil(total / page_size) if total > 0 else 1
        return MonitoringRouteListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    # =========================================================================
    # 6. ROUTE MONITORING DETAILS
    # =========================================================================
    @classmethod
    async def get_route_detail(cls, db: AsyncSession, route_id: int | str) -> MonitoringRouteDetailResponse:
        """Fetch detailed monitoring snapshot of a specific route with ordered stops and current active stop."""
        stmt = (
            select(Route)
            .options(
                selectinload(Route.driver),
                selectinload(Route.vehicle),
                selectinload(Route.stops).selectinload(RouteStop.bin),
            )
        )
        if isinstance(route_id, int) or (isinstance(route_id, str) and route_id.isdigit()):
            stmt = stmt.where(Route.id == int(route_id))
        else:
            stmt = stmt.where(Route.route_code == str(route_id))

        route_obj = (await db.execute(stmt)).scalar_one_or_none()
        if not route_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Route '{route_id}' not found.",
            )

        stops_list = sorted(route_obj.stops, key=lambda s: s.sequence_number)
        tot_stops = len(stops_list)
        comp_stops = len([s for s in stops_list if s.status == StopStatus.COMPLETED])
        skip_stops = len([s for s in stops_list if s.status == StopStatus.SKIPPED])
        rem_stops = tot_stops - comp_stops - skip_stops
        prog_pct = round((comp_stops / tot_stops * 100), 2) if tot_stops > 0 else 0.0

        now = datetime.now(timezone.utc)
        elapsed = None

        stops_payload: List[MonitoringStopDetail] = []
        current_stop_payload: Optional[MonitoringStopDetail] = None

        for s in stops_list:
            b = s.bin
            b_code = b.bin_code if b else "UNKNOWN"
            b_name = b.name if b else "Unknown Bin"
            b_loc = (b.address or b.location_name) if b else None
            b_lat = b.latitude if b else None
            b_lng = b.longitude if b else None
            b_fill = b.current_fill_percentage if b else 0.0
            b_cap = b.capacity_kg if b else 100.0
            b_waste = b.waste_type.value if b else "ORGANIC"

            stop_item = MonitoringStopDetail(
                stop_id=s.id,
                uuid=getattr(s, "uuid", None),
                sequence_number=s.sequence_number,
                status=s.status,
                priority=s.priority,
                bin_id=s.bin_id,
                bin_code=b_code,
                bin_name=b_name,
                location_name=b_loc,
                latitude=b_lat,
                longitude=b_lng,
                fill_level=b_fill,
                capacity_kg=b_cap,
                waste_type=b_waste,
                scheduled_arrival_time=s.eta,
                actual_arrival_time=s.arrived_at,
                actual_departure_time=s.completed_at,
                actual_collected_weight_kg=s.actual_collected_weight_kg,
                notes=s.notes,
            )
            stops_payload.append(stop_item)

            if current_stop_payload is None and s.status in [StopStatus.IN_PROGRESS, StopStatus.PENDING]:
                current_stop_payload = stop_item

        d_name = f"{route_obj.driver.first_name} {route_obj.driver.last_name}" if route_obj.driver else None
        v_code = route_obj.vehicle.vehicle_code if route_obj.vehicle else None
        v_name = route_obj.vehicle.name if route_obj.vehicle else None

        return MonitoringRouteDetailResponse(
            route_id=route_obj.id,
            uuid=route_obj.uuid,
            route_code=route_obj.route_code,
            name=route_obj.name,
            status=route_obj.status,
            priority=route_obj.priority,
            zone=route_obj.zone,
            scheduled_date=str(route_obj.scheduled_date),
            start_time=route_obj.start_time,
            estimated_completion_time=route_obj.estimated_completion_time,
            vehicle_id=route_obj.vehicle_id,
            vehicle_code=v_code,
            vehicle_name=v_name,
            driver_id=route_obj.driver_id,
            driver_name=d_name,
            total_stops=tot_stops,
            completed_stops=comp_stops,
            remaining_stops=rem_stops,
            skipped_stops=skip_stops,
            progress_percentage=prog_pct,
            distance_km=route_obj.total_distance_km,
            estimated_duration_minutes=route_obj.estimated_duration_minutes,
            elapsed_minutes=None,
            current_stop=current_stop_payload,
            stops=stops_payload,
            last_activity_at=route_obj.updated_at or route_obj.created_at,
        )

    # =========================================================================
    # 7. SENSOR & NETWORK HEALTH
    # =========================================================================
    @classmethod
    async def get_sensor_health(cls, db: AsyncSession) -> MonitoringSensorHealthResponse:
        """Calculate sensor and telemetry health metrics."""
        now = datetime.now(timezone.utc)
        fresh_cutoff = now - timedelta(seconds=settings.MONITORING_TELEMETRY_ONLINE_SECONDS)

        sensors = (await db.execute(select(Sensor))).scalars().all()
        total_sensors = len(sensors)

        if total_sensors == 0:
            return MonitoringSensorHealthResponse(
                total_sensors=0,
                online=0,
                offline=0,
                degraded=0,
                low_battery=0,
                average_battery_percentage=100.0,
                connectivity_percentage=100.0,
                telemetry_freshness_percentage=100.0,
                last_updated=now,
            )

        online_count = len([s for s in sensors if s.connectivity_status == ConnectivityStatus.ONLINE])
        offline_count = len([s for s in sensors if s.connectivity_status == ConnectivityStatus.OFFLINE])
        degraded_count = len([s for s in sensors if s.connectivity_status == ConnectivityStatus.DEGRADED])
        low_battery_count = len([s for s in sensors if s.battery_percentage <= 20.0])

        avg_battery = round(sum(s.battery_percentage for s in sensors) / total_sensors, 2)
        conn_pct = round((online_count / total_sensors * 100), 2)

        fresh_count = len([s for s in sensors if s.last_reading_at and (s.last_reading_at.replace(tzinfo=timezone.utc) if s.last_reading_at.tzinfo is None else s.last_reading_at) >= fresh_cutoff])
        freshness_pct = round((fresh_count / total_sensors * 100), 2)

        return MonitoringSensorHealthResponse(
            total_sensors=total_sensors,
            online=online_count,
            offline=offline_count,
            degraded=degraded_count,
            low_battery=low_battery_count,
            average_battery_percentage=avg_battery,
            connectivity_percentage=conn_pct,
            telemetry_freshness_percentage=freshness_pct,
            last_updated=now,
        )

    @classmethod
    async def get_network_health(cls, db: AsyncSession) -> MonitoringNetworkHealthResponse:
        """Overall device network connectivity and telemetry status."""
        now = datetime.now(timezone.utc)
        online_cutoff = now - timedelta(seconds=settings.MONITORING_TELEMETRY_ONLINE_SECONDS)
        stale_cutoff = now - timedelta(seconds=settings.MONITORING_TELEMETRY_STALE_SECONDS)

        bins = (await db.execute(select(Bin).where(Bin.is_active == True))).scalars().all()
        total = len(bins)

        if total == 0:
            return MonitoringNetworkHealthResponse(
                total_devices=0,
                connected=0,
                stale=0,
                offline=0,
                connectivity_percentage=100.0,
                telemetry_freshness="100% within freshness threshold",
                low_battery_count=0,
                sensor_failure_count=0,
                last_updated=now,
            )

        connected = 0
        stale = 0
        offline = 0
        low_batt = 0
        failures = 0

        for b in bins:
            if b.battery_percentage <= 20.0:
                low_batt += 1
            if b.status == BinStatus.OFFLINE or b.connectivity_status == ConnectivityStatus.OFFLINE:
                offline += 1
                failures += 1
            elif b.last_telemetry_at:
                t_dt = b.last_telemetry_at.replace(tzinfo=timezone.utc) if b.last_telemetry_at.tzinfo is None else b.last_telemetry_at
                if t_dt >= online_cutoff:
                    connected += 1
                elif t_dt >= stale_cutoff:
                    stale += 1
                else:
                    offline += 1
            else:
                stale += 1

        conn_pct = round((connected / total * 100), 2)
        freshness_str = f"{conn_pct}% fresh within {int(settings.MONITORING_TELEMETRY_ONLINE_SECONDS / 60)} min"

        return MonitoringNetworkHealthResponse(
            total_devices=total,
            connected=connected,
            stale=stale,
            offline=offline,
            connectivity_percentage=conn_pct,
            telemetry_freshness=freshness_str,
            low_battery_count=low_batt,
            sensor_failure_count=failures,
            last_updated=now,
        )

    # =========================================================================
    # 8. ZONE LIVE STATUS
    # =========================================================================
    @classmethod
    async def get_zones(cls, db: AsyncSession) -> List[MonitoringZoneResponse]:
        """Aggregate real-time operational status per distinct zone."""
        # Find all distinct zones
        zones_stmt = select(distinct(Bin.zone)).where(Bin.is_active == True)
        zone_names = [z for z in (await db.execute(zones_stmt)).scalars().all() if z]

        # In case no bins exist yet, fetch zones from routes or vehicles
        if not zone_names:
            r_zones = (await db.execute(select(distinct(Route.zone)))).scalars().all()
            zone_names = [z for z in r_zones if z]

        all_bins = (await db.execute(select(Bin).where(Bin.is_active == True))).scalars().all()
        all_vehicles = (await db.execute(select(Vehicle).where(Vehicle.is_active == True))).scalars().all()
        active_routes = (await db.execute(
            select(Route).where(Route.status.in_([RouteStatus.IN_PROGRESS, RouteStatus.AT_RISK]))
        )).scalars().all()

        active_collections_stmt = (
            select(RouteStop, Route)
            .join(Route, RouteStop.route_id == Route.id)
            .where(
                and_(
                    Route.status.in_([RouteStatus.IN_PROGRESS, RouteStatus.AT_RISK]),
                    RouteStop.status.in_([StopStatus.PENDING, StopStatus.IN_PROGRESS]),
                )
            )
        )
        active_collections = (await db.execute(active_collections_stmt)).all()

        alerts = await cls.get_alerts_list(db)

        zone_responses: List[MonitoringZoneResponse] = []
        for zn in sorted(zone_names):
            z_bins = [b for b in all_bins if b.zone and b.zone.lower() == zn.lower()]
            z_vehs = [v for v in all_vehicles if v.zone and v.zone.lower() == zn.lower() and v.status == VehicleStatus.ON_ROUTE]
            z_routes = [r for r in active_routes if r.zone and r.zone.lower() == zn.lower()]
            z_cols = [c for c, r in active_collections if r.zone and r.zone.lower() == zn.lower()]
            z_alerts = [a for a in alerts if a.zone and a.zone.lower() == zn.lower()]

            tot_b = len(z_bins)
            crit_b = len([b for b in z_bins if b.status == BinStatus.CRITICAL or b.current_fill_percentage >= 90.0])
            warn_b = len([b for b in z_bins if b.status == BinStatus.WARNING or (75.0 <= b.current_fill_percentage < 90.0)])
            online_b = len([b for b in z_bins if b.connectivity_status == ConnectivityStatus.ONLINE])
            off_b = tot_b - online_b
            avg_fill = round(sum(b.current_fill_percentage for b in z_bins) / tot_b, 2) if tot_b > 0 else 0.0

            # Determine zone health status
            if crit_b > 0 or any(a.severity == "CRITICAL" for a in z_alerts):
                zone_status = "Critical"
            elif warn_b > 0 or len(z_alerts) > 0:
                zone_status = "Attention"
            else:
                zone_status = "Healthy"

            last_act = None
            if z_bins:
                telemetries = [b.last_telemetry_at for b in z_bins if b.last_telemetry_at]
                if telemetries:
                    last_act = max(telemetries)

            zone_responses.append(
                MonitoringZoneResponse(
                    zone=zn,
                    total_bins=tot_b,
                    online_bins=online_b,
                    offline_bins=off_b,
                    critical_bins=crit_b,
                    warning_bins=warn_b,
                    average_fill_percentage=avg_fill,
                    active_vehicles=len(z_vehs),
                    active_routes=len(z_routes),
                    active_collections=len(z_cols),
                    active_alerts=len(z_alerts),
                    status=zone_status,
                    last_activity=last_act,
                )
            )

        return zone_responses

    # =========================================================================
    # 9. CURRENT COLLECTION OPERATIONS
    # =========================================================================
    @classmethod
    async def get_collections(
        cls,
        db: AsyncSession,
        zone: Optional[str] = None,
        status_filter: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> MonitoringCollectionListResponse:
        """List active/recent collection tasks from active route stops."""
        stmt = (
            select(RouteStop, Route, Bin, Vehicle, User)
            .join(Route, RouteStop.route_id == Route.id)
            .join(Bin, RouteStop.bin_id == Bin.id)
            .outerjoin(Vehicle, Route.vehicle_id == Vehicle.id)
            .outerjoin(User, Route.driver_id == User.id)
        )

        if status_filter and status_filter.upper() != "ALL":
            try:
                stmt = stmt.where(RouteStop.status == StopStatus(status_filter.upper()))
            except ValueError:
                pass
        else:
            # Default to active/in-progress collections
            stmt = stmt.where(
                RouteStop.status.in_([StopStatus.IN_PROGRESS, StopStatus.PENDING, StopStatus.COMPLETED])
            )

        if zone and zone.upper() != "ALL":
            stmt = stmt.where(Route.zone.ilike(f"%{zone}%"))

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await db.execute(count_stmt)).scalar() or 0

        offset = (page - 1) * page_size
        paginated_stmt = stmt.order_by(Route.scheduled_date.desc(), RouteStop.sequence_number).offset(offset).limit(page_size)
        rows = (await db.execute(paginated_stmt)).all()

        items: List[MonitoringCollectionItem] = []
        for stop, route, b, vehicle, driver in rows:
            d_name = f"{driver.first_name} {driver.last_name}" if driver else None
            v_code = vehicle.vehicle_code if vehicle else None
            items.append(
                MonitoringCollectionItem(
                    collection_id=stop.id,
                    route_stop_id=stop.id,
                    bin_id=b.id,
                    bin_code=b.bin_code,
                    bin_name=b.name,
                    fill_percentage=b.current_fill_percentage,
                    waste_type=b.waste_type.value,
                    route_id=route.id,
                    route_code=route.route_code,
                    vehicle_id=vehicle.id if vehicle else None,
                    vehicle_code=v_code,
                    driver_id=driver.id if driver else None,
                    driver_name=d_name,
                    status=stop.status,
                    started_at=stop.arrived_at or route.created_at,
                    estimated_completion=stop.eta or route.estimated_completion_time,
                    zone=route.zone,
                )
            )

        total_pages = math.ceil(total / page_size) if total > 0 else 1
        return MonitoringCollectionListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    # =========================================================================
    # 10. LIVE ACTIVITY FEED
    # =========================================================================
    @classmethod
    async def get_activity(
        cls,
        db: AsyncSession,
        limit: int = 50,
        zone: Optional[str] = None,
        event_type: Optional[str] = None,
        severity: Optional[str] = None,
        since: Optional[datetime] = None,
    ) -> MonitoringActivityListResponse:
        """Unified chronological live activity feed from BinActivity, VehicleActivity, and collections."""
        # 1. Bin activities
        b_stmt = select(BinActivity, Bin).join(Bin, BinActivity.bin_id == Bin.id)
        if since:
            b_stmt = b_stmt.where(BinActivity.created_at >= since)
        if zone and zone.upper() != "ALL":
            b_stmt = b_stmt.where(Bin.zone.ilike(f"%{zone}%"))
        b_rows = (await db.execute(b_stmt.order_by(desc(BinActivity.created_at)).limit(limit))).all()

        # 2. Vehicle activities
        v_stmt = select(VehicleActivity, Vehicle).join(Vehicle, VehicleActivity.vehicle_id == Vehicle.id)
        if since:
            v_stmt = v_stmt.where(VehicleActivity.created_at >= since)
        if zone and zone.upper() != "ALL":
            v_stmt = v_stmt.where(Vehicle.zone.ilike(f"%{zone}%"))
        v_rows = (await db.execute(v_stmt.order_by(desc(VehicleActivity.created_at)).limit(limit))).all()

        # 3. Collection history
        c_stmt = (
            select(BinCollectionHistory, Bin)
            .join(Bin, BinCollectionHistory.bin_id == Bin.id)
        )
        if since:
            c_stmt = c_stmt.where(BinCollectionHistory.collected_at >= since)
        if zone and zone.upper() != "ALL":
            c_stmt = c_stmt.where(Bin.zone.ilike(f"%{zone}%"))
        c_rows = (await db.execute(c_stmt.order_by(desc(BinCollectionHistory.collected_at)).limit(limit))).all()

        combined: List[MonitoringActivityItem] = []

        for act, b in b_rows:
            sev = "INFO"
            if "CRITICAL" in act.activity_type or "OFFLINE" in act.activity_type:
                sev = "CRITICAL"
            elif "WARNING" in act.activity_type or "PRIORITY" in act.activity_type:
                sev = "WARNING"
            elif "ACTIVATED" in act.activity_type:
                sev = "SUCCESS"

            combined.append(
                MonitoringActivityItem(
                    id=f"ACT-BIN-{act.id}",
                    event_type=act.activity_type,
                    title=f"Bin {b.bin_code}: {act.activity_type.replace('_', ' ').title()}",
                    description=act.description,
                    severity=sev,
                    entity_type="BIN",
                    entity_id=b.bin_code,
                    bin_id=b.id,
                    zone=b.zone,
                    created_at=act.created_at,
                )
            )

        for act, v in v_rows:
            sev = "INFO"
            if "MAINTENANCE" in act.activity_type or "OVERLOAD" in act.activity_type:
                sev = "WARNING"
            elif "ON_ROUTE" in act.activity_type or "COMPLETED" in act.activity_type:
                sev = "SUCCESS"

            combined.append(
                MonitoringActivityItem(
                    id=f"ACT-VEH-{act.id}",
                    event_type=act.activity_type,
                    title=f"Vehicle {v.vehicle_code}: {act.activity_type.replace('_', ' ').title()}",
                    description=act.description,
                    severity=sev,
                    entity_type="VEHICLE",
                    entity_id=v.vehicle_code,
                    vehicle_id=v.id,
                    route_id=act.route_id,
                    zone=v.zone,
                    created_at=act.created_at,
                )
            )

        for ch, b in c_rows:
            combined.append(
                MonitoringActivityItem(
                    id=f"ACT-COL-{ch.id}",
                    event_type="COLLECTION_COMPLETED",
                    title=f"Collection Completed: {b.bin_code}",
                    description=f"Collected {ch.collected_weight_kg:.1f} kg ({ch.collected_fill_percentage:.0f}% fill) from {b.name}.",
                    severity="SUCCESS",
                    entity_type="BIN",
                    entity_id=b.bin_code,
                    bin_id=b.id,
                    route_id=ch.route_id,
                    vehicle_id=ch.vehicle_id,
                    zone=b.zone,
                    created_at=ch.collected_at,
                )
            )

        # Filter by severity or event_type if specified
        if severity and severity.upper() != "ALL":
            combined = [a for a in combined if a.severity.upper() == severity.upper()]
        if event_type and event_type.upper() != "ALL":
            combined = [a for a in combined if event_type.upper() in a.event_type.upper()]

        # Sort chronologically descending
        combined.sort(key=lambda a: a.created_at, reverse=True)
        trimmed = combined[:limit]

        return MonitoringActivityListResponse(
            items=trimmed,
            total=len(combined),
        )

    # =========================================================================
    # 11. LIVE ALERT STRIP (Operational Alerts Derivation)
    # =========================================================================
    @classmethod
    async def get_alerts_list(cls, db: AsyncSession) -> List[MonitoringAlertItem]:
        """Derive all current operational alerts from live system conditions."""
        alerts: List[MonitoringAlertItem] = []
        now = datetime.now(timezone.utc)

        # 1. Critical Bins & Overflows
        b_stmt = select(Bin).where(
            and_(
                Bin.is_active == True,
                or_(
                    Bin.status == BinStatus.CRITICAL,
                    Bin.current_fill_percentage >= 90.0,
                    Bin.priority == CollectionPriority.CRITICAL,
                ),
            )
        )
        for b in (await db.execute(b_stmt)).scalars().all():
            alerts.append(
                MonitoringAlertItem(
                    alert_id=f"ALT-BIN-{b.id}-CRIT",
                    type="CRITICAL_FILL",
                    severity="CRITICAL",
                    title=f"Critical Bin Fill ({b.current_fill_percentage:.0f}%)",
                    message=f"Bin {b.bin_code} ({b.name}) reached {b.current_fill_percentage:.0f}% capacity in {b.zone}.",
                    status="ACTIVE",
                    source="BIN",
                    entity_type="BIN",
                    entity_id=str(b.id),
                    zone=b.zone,
                    created_at=b.last_telemetry_at or b.updated_at or now,
                )
            )

        # 2. Offline / Low Battery Sensors
        s_stmt = select(Sensor, Bin).join(Bin, Sensor.bin_id == Bin.id).where(
            or_(
                Sensor.connectivity_status == ConnectivityStatus.OFFLINE,
                Sensor.battery_percentage <= 20.0,
            )
        )
        for s, b in (await db.execute(s_stmt)).all():
            if s.connectivity_status == ConnectivityStatus.OFFLINE:
                alerts.append(
                    MonitoringAlertItem(
                        alert_id=f"ALT-SNS-{s.id}-OFF",
                        type="SENSOR_OFFLINE",
                        severity="CRITICAL",
                        title=f"Sensor Offline: {s.sensor_id}",
                        message=f"Sensor {s.sensor_id} on Bin {b.bin_code} has stopped transmitting telemetry.",
                        status="ACTIVE",
                        source="SENSOR",
                        entity_type="SENSOR",
                        entity_id=str(s.id),
                        zone=b.zone,
                        created_at=s.last_reading_at or s.updated_at or now,
                    )
                )
            if s.battery_percentage <= 20.0:
                alerts.append(
                    MonitoringAlertItem(
                        alert_id=f"ALT-SNS-{s.id}-BATT",
                        type="LOW_BATTERY",
                        severity="WARNING",
                        title=f"Low Battery: {s.sensor_id} ({s.battery_percentage:.0f}%)",
                        message=f"Sensor {s.sensor_id} on Bin {b.bin_code} has {s.battery_percentage:.0f}% battery remaining.",
                        status="ACTIVE",
                        source="SENSOR",
                        entity_type="SENSOR",
                        entity_id=str(s.id),
                        zone=b.zone,
                        created_at=s.last_reading_at or s.updated_at or now,
                    )
                )

        # 3. Vehicle Overload & Maintenance
        v_stmt = select(Vehicle).where(
            and_(
                Vehicle.is_active == True,
                or_(
                    Vehicle.status == VehicleStatus.MAINTENANCE,
                    Vehicle.status == VehicleStatus.OFFLINE,
                    Vehicle.current_load_kg > Vehicle.capacity_kg,
                ),
            )
        )
        for v in (await db.execute(v_stmt)).scalars().all():
            if v.current_load_kg > v.capacity_kg:
                alerts.append(
                    MonitoringAlertItem(
                        alert_id=f"ALT-VEH-{v.id}-LOAD",
                        type="VEHICLE_OVERLOAD",
                        severity="CRITICAL",
                        title=f"Vehicle Overload: {v.vehicle_code}",
                        message=f"Vehicle {v.vehicle_code} exceeds maximum capacity ({v.current_load_kg:.0f}/{v.capacity_kg:.0f} kg).",
                        status="ACTIVE",
                        source="VEHICLE",
                        entity_type="VEHICLE",
                        entity_id=str(v.id),
                        zone=v.zone,
                        created_at=v.last_location_update or v.updated_at or now,
                    )
                )
            elif v.status == VehicleStatus.MAINTENANCE:
                alerts.append(
                    MonitoringAlertItem(
                        alert_id=f"ALT-VEH-{v.id}-MAINT",
                        type="VEHICLE_MAINTENANCE",
                        severity="WARNING",
                        title=f"Vehicle In Maintenance: {v.vehicle_code}",
                        message=f"Vehicle {v.vehicle_code} is currently in maintenance and unavailable for routing.",
                        status="ACTIVE",
                        source="VEHICLE",
                        entity_type="VEHICLE",
                        entity_id=str(v.id),
                        zone=v.zone,
                        created_at=v.updated_at or now,
                    )
                )

        # 4. Route Risk
        r_stmt = select(Route).where(Route.status == RouteStatus.AT_RISK)
        for r in (await db.execute(r_stmt)).scalars().all():
            alerts.append(
                MonitoringAlertItem(
                    alert_id=f"ALT-RT-{r.id}-RISK",
                    type="ROUTE_AT_RISK",
                    severity="CRITICAL",
                    title=f"Route At Risk: {r.route_code}",
                    message=f"Collection route {r.route_code} in {r.zone} has fallen behind schedule.",
                    status="ACTIVE",
                    source="ROUTE",
                    entity_type="ROUTE",
                    entity_id=str(r.id),
                    zone=r.zone,
                    created_at=r.updated_at or r.created_at or now,
                )
            )

        return alerts

    @classmethod
    async def get_alerts(
        cls,
        db: AsyncSession,
        severity: Optional[str] = None,
        alert_type: Optional[str] = None,
        zone: Optional[str] = None,
        status_filter: Optional[str] = None,
        limit: int = 50,
    ) -> MonitoringAlertListResponse:
        """Filterable active operational alert strip."""
        alerts = await cls.get_alerts_list(db)

        if severity and severity.upper() != "ALL":
            alerts = [a for a in alerts if a.severity.upper() == severity.upper()]
        if alert_type and alert_type.upper() != "ALL":
            alerts = [a for a in alerts if alert_type.upper() in a.type.upper()]
        if zone and zone.upper() != "ALL":
            alerts = [a for a in alerts if a.zone and a.zone.lower() == zone.lower()]
        if status_filter and status_filter.upper() != "ALL":
            alerts = [a for a in alerts if a.status.upper() == status_filter.upper()]

        alerts.sort(key=lambda a: (0 if a.severity == "CRITICAL" else 1, a.created_at), reverse=False)
        trimmed = alerts[:limit]
        return MonitoringAlertListResponse(items=trimmed, total=len(alerts))

    # =========================================================================
    # 12. LIVE OPERATIONS SNAPSHOT (Single Polling Endpoint)
    # =========================================================================
    @classmethod
    async def get_live_snapshot(cls, db: AsyncSession) -> MonitoringLiveSnapshotResponse:
        """Composite real-time operations snapshot for efficient frontend polling."""
        now = datetime.now(timezone.utc)

        summary = await cls.get_summary(db)
        map_data = await cls.get_map_data(db)
        sensor_health = await cls.get_sensor_health(db)
        network_health = await cls.get_network_health(db)
        zones = await cls.get_zones(db)
        routes = (await cls.get_routes(db, page=1, page_size=25)).items
        vehicles = (await cls.get_vehicles(db, page=1, page_size=25)).items
        collections = (await cls.get_collections(db, page=1, page_size=25)).items
        activity = (await cls.get_activity(db, limit=25)).items
        alerts = (await cls.get_alerts(db, limit=25)).items

        return MonitoringLiveSnapshotResponse(
            timestamp=now,
            summary=summary,
            map=map_data,
            sensor_health=sensor_health,
            network_health=network_health,
            zones=zones,
            routes=routes,
            vehicles=vehicles,
            collections=collections,
            activity=activity,
            alerts=alerts,
        )
