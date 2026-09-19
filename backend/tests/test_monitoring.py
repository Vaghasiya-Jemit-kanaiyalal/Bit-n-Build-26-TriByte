import uuid
from datetime import datetime, timezone, timedelta
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, hash_password
from app.models.user import User, UserRole, UserStatus
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
from app.models.vehicle import Vehicle, VehicleType, EnergyType, VehicleStatus
from app.models.vehicle_history import VehicleActivity
from app.models.route import Route, RouteStatus, RoutePriority
from app.models.route_stop import RouteStop, StopStatus, StopPriority


async def create_test_user(
    db: AsyncSession,
    role: UserRole = UserRole.ADMIN,
    status: UserStatus = UserStatus.ACTIVE,
    email: str | None = None,
) -> User:
    unique_str = uuid.uuid4().hex[:6]
    user = User(
        uuid=uuid.uuid4(),
        first_name="Test",
        last_name=role.value,
        email=email or f"user_{unique_str}@wastewise.ai",
        password_hash=hash_password("Password123!"),
        role=role,
        status=status,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


def auth_header(user: User) -> dict[str, str]:
    token = create_access_token(str(user.uuid), user.role.value)
    return {"Authorization": f"Bearer {token}"}


async def create_test_bin(
    db: AsyncSession,
    capacity: float = 100.0,
    fill_level: float = 0.0,
    status: BinStatus = BinStatus.NORMAL,
    priority: CollectionPriority = CollectionPriority.LOW,
    collection_status: CollectionStatus = CollectionStatus.NOT_REQUIRED,
    zone: str = "Central Zone",
    waste_type: WasteType = WasteType.ORGANIC,
    code: str | None = None,
    latitude: float | None = 22.3072,
    longitude: float | None = 73.1812,
    last_telemetry_at: datetime | None = None,
) -> Bin:
    unique_str = uuid.uuid4().hex[:6]
    bin_obj = Bin(
        uuid=uuid.uuid4(),
        bin_code=code or f"BIN-{unique_str}",
        name=f"Bin {unique_str}",
        bin_type=BinType.STANDARD,
        capacity_kg=capacity,
        current_fill_kg=(capacity * fill_level) / 100.0,
        current_fill_percentage=fill_level,
        waste_type=waste_type,
        status=status,
        zone=zone,
        address=f"Location {unique_str}",
        latitude=latitude,
        longitude=longitude,
        battery_percentage=90.0,
        connectivity_status=ConnectivityStatus.ONLINE,
        collection_status=collection_status,
        priority=priority,
        last_telemetry_at=last_telemetry_at or datetime.now(timezone.utc),
        is_active=True,
    )
    db.add(bin_obj)
    await db.commit()
    await db.refresh(bin_obj)
    return bin_obj


async def create_test_vehicle(
    db: AsyncSession,
    capacity: float = 1200.0,
    current_load: float = 0.0,
    status: VehicleStatus = VehicleStatus.AVAILABLE,
    zone: str = "Central Zone",
    code: str | None = None,
    latitude: float | None = 22.3150,
    longitude: float | None = 73.1850,
) -> Vehicle:
    unique_str = uuid.uuid4().hex[:6]
    veh = Vehicle(
        uuid=uuid.uuid4(),
        vehicle_code=code or f"VEH-{unique_str}",
        name=f"Truck {unique_str}",
        vehicle_type=VehicleType.COMPACTOR,
        registration_number=f"REG-{unique_str}",
        capacity_kg=capacity,
        current_load_kg=current_load,
        energy_type=EnergyType.DIESEL,
        status=status,
        zone=zone,
        latitude=latitude,
        longitude=longitude,
        last_location_update=datetime.now(timezone.utc),
        is_active=True,
    )
    db.add(veh)
    await db.commit()
    await db.refresh(veh)
    return veh


async def create_test_route(
    db: AsyncSession,
    vehicle_id: int,
    driver_id: int,
    status: RouteStatus = RouteStatus.IN_PROGRESS,
    zone: str = "Central Zone",
) -> Route:
    unique_str = uuid.uuid4().hex[:6]
    rt = Route(
        uuid=uuid.uuid4(),
        route_code=f"RT-{unique_str}",
        name=f"Route {unique_str}",
        zone=zone,
        vehicle_id=vehicle_id,
        driver_id=driver_id,
        scheduled_date=datetime.now(timezone.utc).date(),
        start_time="08:00:00",
        status=status,
        priority=RoutePriority.HIGH,
        total_distance_km=15.0,
        estimated_duration_minutes=90,
    )
    db.add(rt)
    await db.commit()
    await db.refresh(rt)
    return rt


# ============================================================================
# 1. AUTHENTICATION & RBAC
# ============================================================================
@pytest.mark.asyncio
async def test_01_admin_can_access_monitoring(client: AsyncClient, db_session: AsyncSession):
    """1. Test that Admin can access monitoring endpoints."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    res = await client.get("/api/v1/admin/monitoring/summary", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert "bins_monitored" in data
    assert "active_vehicles" in data
    assert "active_routes" in data


@pytest.mark.asyncio
async def test_02_driver_cannot_access_monitoring(client: AsyncClient, db_session: AsyncSession):
    """2. Test that DRIVER role is forbidden from admin monitoring."""
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    res = await client.get("/api/v1/admin/monitoring/summary", headers=auth_header(driver))
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_03_viewer_analyst_cannot_access_monitoring(client: AsyncClient, db_session: AsyncSession):
    """3. Test that VIEWER role is forbidden from admin monitoring."""
    viewer = await create_test_user(db_session, role=UserRole.VIEWER)
    res = await client.get("/api/v1/admin/monitoring/summary", headers=auth_header(viewer))
    assert res.status_code == 403


# ============================================================================
# 2. OPERATIONAL SUMMARY & ACCURACY
# ============================================================================
@pytest.mark.asyncio
async def test_04_summary_counts_accuracy(client: AsyncClient, db_session: AsyncSession):
    """4. Test that monitoring summary accurately reflects database state."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    # Seed 1 critical bin and 1 normal bin
    await create_test_bin(db_session, fill_level=95.0, status=BinStatus.CRITICAL)
    await create_test_bin(db_session, fill_level=40.0, status=BinStatus.NORMAL)

    # Seed 1 on-route vehicle
    await create_test_vehicle(db_session, status=VehicleStatus.ON_ROUTE)

    res = await client.get("/api/v1/admin/monitoring/summary", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert data["bins_monitored"] >= 2
    assert data["critical_bins"] >= 1
    assert data["active_vehicles"] >= 1
    assert "last_updated" in data


# ============================================================================
# 3. LIVE MAP DATA
# ============================================================================
@pytest.mark.asyncio
async def test_05_map_data_endpoint(client: AsyncClient, db_session: AsyncSession):
    """5. Test live map data returns bins, vehicles, and routes."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)

    b = await create_test_bin(db_session, latitude=22.3100, longitude=73.1800, zone="North Zone")
    v = await create_test_vehicle(db_session, latitude=22.3200, longitude=73.1900, status=VehicleStatus.ON_ROUTE, zone="North Zone")
    r = await create_test_route(db_session, vehicle_id=v.id, driver_id=driver.id, zone="North Zone")

    stop = RouteStop(route_id=r.id, bin_id=b.id, sequence_number=1, status=StopStatus.PENDING)
    db_session.add(stop)
    await db_session.commit()

    res = await client.get("/api/v1/admin/monitoring/map-data?zone=North Zone", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert "bins" in data
    assert "vehicles" in data
    assert "routes" in data
    assert any(bin_item["id"] == b.id for bin_item in data["bins"])
    assert any(veh_item["id"] == v.id for veh_item in data["vehicles"])
    assert any(route_item["id"] == r.id for route_item in data["routes"])


# ============================================================================
# 4. ROUTE PROGRESS & STOP METRICS
# ============================================================================
@pytest.mark.asyncio
async def test_06_route_progress_calculation(client: AsyncClient, db_session: AsyncSession):
    """6. Test route progress percentage and stops calculation."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    v = await create_test_vehicle(db_session)
    r = await create_test_route(db_session, vehicle_id=v.id, driver_id=driver.id)

    b1 = await create_test_bin(db_session)
    b2 = await create_test_bin(db_session)
    b3 = await create_test_bin(db_session)

    # 1 completed, 1 in_progress, 1 pending = 33.33% completion
    s1 = RouteStop(route_id=r.id, bin_id=b1.id, sequence_number=1, status=StopStatus.COMPLETED)
    s2 = RouteStop(route_id=r.id, bin_id=b2.id, sequence_number=2, status=StopStatus.IN_PROGRESS)
    s3 = RouteStop(route_id=r.id, bin_id=b3.id, sequence_number=3, status=StopStatus.PENDING)
    db_session.add_all([s1, s2, s3])
    await db_session.commit()

    res = await client.get(f"/api/v1/admin/monitoring/routes/{r.id}", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert data["total_stops"] == 3
    assert data["completed_stops"] == 1
    assert data["progress_percentage"] == 33.33
    assert data["current_stop"]["bin_id"] == b2.id


# ============================================================================
# 5. SENSOR & NETWORK HEALTH
# ============================================================================
@pytest.mark.asyncio
async def test_07_sensor_and_network_health(client: AsyncClient, db_session: AsyncSession):
    """7. Test sensor and network health endpoints."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    b = await create_test_bin(db_session)
    sensor = Sensor(
        uuid=uuid.uuid4(),
        sensor_id=f"SNS-{uuid.uuid4().hex[:4]}",
        bin_id=b.id,
        connectivity_status=ConnectivityStatus.ONLINE,
        battery_percentage=85.0,
        last_reading_at=datetime.now(timezone.utc),
    )
    db_session.add(sensor)
    await db_session.commit()

    # Sensor health
    res_s = await client.get("/api/v1/admin/monitoring/sensors/health", headers=auth_header(admin))
    assert res_s.status_code == 200
    s_data = res_s.json()
    assert s_data["total_sensors"] >= 1
    assert s_data["connectivity_percentage"] > 0

    # Network health
    res_n = await client.get("/api/v1/admin/monitoring/network-health", headers=auth_header(admin))
    assert res_n.status_code == 200
    n_data = res_n.json()
    assert "connectivity_percentage" in n_data
    assert "telemetry_freshness" in n_data


@pytest.mark.asyncio
async def test_08_offline_and_stale_sensor_detection(client: AsyncClient, db_session: AsyncSession):
    """8. Test stale telemetry threshold detection."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    # Bin with telemetry from 2 hours ago (stale/offline)
    two_hours_ago = datetime.now(timezone.utc) - timedelta(hours=2)
    b = await create_test_bin(db_session, last_telemetry_at=two_hours_ago, status=BinStatus.OFFLINE)
    b.connectivity_status = ConnectivityStatus.OFFLINE
    await db_session.commit()

    res = await client.get("/api/v1/admin/monitoring/network-health", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert data["offline"] >= 1


# ============================================================================
# 6. ZONE LIVE STATUS
# ============================================================================
@pytest.mark.asyncio
async def test_09_zone_live_status(client: AsyncClient, db_session: AsyncSession):
    """9. Test zone status aggregation."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    await create_test_bin(db_session, zone="Industrial Zone", fill_level=88.0, status=BinStatus.WARNING)

    res = await client.get("/api/v1/admin/monitoring/zones", headers=auth_header(admin))
    assert res.status_code == 200
    zones = res.json()
    assert isinstance(zones, list)
    ind_zone = next((z for z in zones if z["zone"] == "Industrial Zone"), None)
    assert ind_zone is not None
    assert ind_zone["total_bins"] >= 1
    assert ind_zone["warning_bins"] >= 1
    assert ind_zone["status"] in ["Healthy", "Attention", "Critical"]


# ============================================================================
# 7. ACTIVE ALERTS STRIP
# ============================================================================
@pytest.mark.asyncio
async def test_10_live_alerts_derivation(client: AsyncClient, db_session: AsyncSession):
    """10. Test derived operational alerts for critical conditions."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    # Create critical bin
    crit_bin = await create_test_bin(db_session, fill_level=96.0, status=BinStatus.CRITICAL)

    res = await client.get("/api/v1/admin/monitoring/alerts", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert any(a["entity_id"] == str(crit_bin.id) for a in data["items"])


# ============================================================================
# 8. CURRENT COLLECTION OPERATIONS
# ============================================================================
@pytest.mark.asyncio
async def test_11_collections_endpoint(client: AsyncClient, db_session: AsyncSession):
    """11. Test collection operations endpoint."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    v = await create_test_vehicle(db_session)
    r = await create_test_route(db_session, vehicle_id=v.id, driver_id=driver.id)
    b = await create_test_bin(db_session)

    stop = RouteStop(route_id=r.id, bin_id=b.id, sequence_number=1, status=StopStatus.IN_PROGRESS)
    db_session.add(stop)
    await db_session.commit()

    res = await client.get("/api/v1/admin/monitoring/collections", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    assert any(c["route_stop_id"] == stop.id for c in data["items"])


# ============================================================================
# 9. LIVE ACTIVITY FEED
# ============================================================================
@pytest.mark.asyncio
async def test_12_live_activity_feed(client: AsyncClient, db_session: AsyncSession):
    """12. Test chronological activity stream."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    b = await create_test_bin(db_session)

    act = BinActivity(
        bin_id=b.id,
        activity_type="TELEMETRY_RECORDED",
        description=f"Bin {b.bin_code} transmitted live telemetry.",
    )
    db_session.add(act)
    await db_session.commit()

    res = await client.get("/api/v1/admin/monitoring/activity", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    assert any(a["id"] == f"ACT-BIN-{act.id}" for a in data["items"])


# ============================================================================
# 10. LIVE SNAPSHOT (Composite Polling)
# ============================================================================
@pytest.mark.asyncio
async def test_13_live_snapshot_endpoint(client: AsyncClient, db_session: AsyncSession):
    """13. Test composite live snapshot endpoint for 5-second polling."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    res = await client.get("/api/v1/admin/monitoring/live-snapshot", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert "timestamp" in data
    assert "summary" in data
    assert "map" in data
    assert "sensor_health" in data
    assert "network_health" in data
    assert "zones" in data
    assert "routes" in data
    assert "vehicles" in data
    assert "collections" in data
    assert "activity" in data
    assert "alerts" in data


# ============================================================================
# 11. MONITORED BINS & VEHICLES LISTS WITH FILTERS
# ============================================================================
@pytest.mark.asyncio
async def test_14_monitored_bins_filters_and_pagination(client: AsyncClient, db_session: AsyncSession):
    """14. Test pagination and filtering on /monitoring/bins."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    await create_test_bin(db_session, zone="East Zone", status=BinStatus.NORMAL)

    res = await client.get("/api/v1/admin/monitoring/bins?zone=East Zone&page=1&page_size=5", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert "total_pages" in data
    assert all(b["zone"] == "East Zone" for b in data["items"])


@pytest.mark.asyncio
async def test_15_monitored_vehicles_filters_and_pagination(client: AsyncClient, db_session: AsyncSession):
    """15. Test pagination and filtering on /monitoring/vehicles."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    await create_test_vehicle(db_session, zone="West Zone", status=VehicleStatus.AVAILABLE)

    res = await client.get("/api/v1/admin/monitoring/vehicles?zone=West Zone&page=1&page_size=5", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert all(v["zone"] == "West Zone" for v in data["items"])


# ============================================================================
# 12. ROUTE NOT FOUND & WRITE RESTRICTIONS
# ============================================================================
@pytest.mark.asyncio
async def test_16_route_not_found_returns_404(client: AsyncClient, db_session: AsyncSession):
    """16. Test that querying non-existent route returns 404."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    res = await client.get("/api/v1/admin/monitoring/routes/999999", headers=auth_header(admin))
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_17_no_unauthorized_write_endpoints(client: AsyncClient, db_session: AsyncSession):
    """17. Test that Monitoring does not allow POST/write endpoints."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    # Attempting to POST to monitoring/bins
    res1 = await client.post("/api/v1/admin/monitoring/bins", json={"name": "Fake Bin"}, headers=auth_header(admin))
    assert res1.status_code in [404, 405]

    # Attempting to POST to monitoring/vehicles
    res2 = await client.post("/api/v1/admin/monitoring/vehicles", json={"name": "Fake Veh"}, headers=auth_header(admin))
    assert res2.status_code in [404, 405]


# ============================================================================
# 13. EMPTY STATE TESTS
# ============================================================================
@pytest.mark.asyncio
async def test_18_empty_filter_returns_empty_arrays(client: AsyncClient, db_session: AsyncSession):
    """18. Test that nonexistent filters return empty lists, not null."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    res_bins = await client.get("/api/v1/admin/monitoring/bins?zone=NonExistentZone123", headers=auth_header(admin))
    assert res_bins.status_code == 200
    assert res_bins.json()["items"] == []

    res_routes = await client.get("/api/v1/admin/monitoring/routes?zone=NonExistentZone123", headers=auth_header(admin))
    assert res_routes.status_code == 200
    assert res_routes.json()["items"] == []
