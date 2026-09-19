import uuid
from datetime import datetime, timezone, timedelta
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

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
from app.models.route import Route, RouteStatus, RoutePriority
from app.models.route_stop import RouteStop, StopStatus, StopPriority
from app.models.vehicle import Vehicle, VehicleType, EnergyType, VehicleStatus


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
    sensor_id: str | None = None,
) -> Bin:
    unique_str = uuid.uuid4().hex[:6]
    bin_code = code or f"BIN-{unique_str}"
    bin_obj = Bin(
        uuid=uuid.uuid4(),
        bin_code=bin_code,
        name=f"Bin {unique_str}",
        location_name="Station Beta",
        zone=zone,
        waste_type=waste_type,
        bin_type=BinType.STANDARD,
        capacity_kg=capacity,
        capacity_liters=capacity * 2.4,
        current_fill_kg=round(fill_level / 100.0 * capacity, 2),
        current_fill_percentage=fill_level,
        fill_level=fill_level,
        priority=priority,
        status=status,
        collection_status=collection_status,
        latitude=23.0231,
        longitude=72.5718,
        sensor_id=sensor_id,
        battery_percentage=100.0,
        connectivity_status=ConnectivityStatus.ONLINE,
        is_active=True,
    )
    db.add(bin_obj)
    await db.commit()
    await db.refresh(bin_obj)
    return bin_obj


# ============================================================================
# TEST SUITE: ADMIN BIN MANAGEMENT
# ============================================================================

@pytest.mark.asyncio
async def test_01_create_bin(client: AsyncClient, db_session: AsyncSession):
    """1. Test creating a new bin with automatic code generation and default values."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    res = await client.post(
        "/api/v1/admin/bins",
        json={
            "name": "Market Organic Bin",
            "bin_type": "ORGANIC",
            "capacity_kg": 200.0,
            "waste_type": "ORGANIC",
            "zone": "Central Zone",
            "address": "City Market Plaza",
            "latitude": 22.3072,
            "longitude": 73.1812,
        },
        headers=auth_header(admin),
    )
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Market Organic Bin"
    assert data["bin_code"].startswith("BIN-")
    assert data["capacity_kg"] == 200.0
    assert data["current_fill_percentage"] == 0.0
    assert data["status"] == "NORMAL"
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_02_duplicate_bin_code(client: AsyncClient, db_session: AsyncSession):
    """2. Test that creating a bin with an already existing bin_code returns 409 Conflict."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    existing = await create_test_bin(db_session, code="BIN-DUP-01")

    res = await client.post(
        "/api/v1/admin/bins",
        json={
            "bin_code": "BIN-DUP-01",
            "capacity_kg": 100.0,
            "zone": "North Zone",
        },
        headers=auth_header(admin),
    )
    assert res.status_code == 409
    assert "already registered" in res.json()["detail"]


@pytest.mark.asyncio
async def test_03_capacity_validation(client: AsyncClient, db_session: AsyncSession):
    """3. Test that negative or zero capacity is rejected with 422 Unprocessable Entity."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    res = await client.post(
        "/api/v1/admin/bins",
        json={
            "name": "Invalid Bin",
            "capacity_kg": -50.0,
            "zone": "Central Zone",
        },
        headers=auth_header(admin),
    )
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_04_get_bins_pagination(client: AsyncClient, db_session: AsyncSession):
    """4. Test paginated listing of bins."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    for _ in range(5):
        await create_test_bin(db_session)

    res = await client.get("/api/v1/admin/bins?page=1&page_size=3", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) == 3
    assert data["total"] >= 5
    assert data["page"] == 1
    assert data["page_size"] == 3


@pytest.mark.asyncio
async def test_05_search_bins(client: AsyncClient, db_session: AsyncSession):
    """5. Test searching bins across bin code, name, and address."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    b = await create_test_bin(db_session, code="BIN-SEARCH-X99")

    res = await client.get("/api/v1/admin/bins?search=SEARCH-X99", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    codes = [item["bin_code"] for item in data["items"]]
    assert "BIN-SEARCH-X99" in codes


@pytest.mark.asyncio
async def test_06_filter_by_status(client: AsyncClient, db_session: AsyncSession):
    """6. Test filtering bins by operational status."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    await create_test_bin(db_session, status=BinStatus.CRITICAL)

    res = await client.get("/api/v1/admin/bins?status=CRITICAL", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) >= 1
    for item in data["items"]:
        assert item["status"] == "CRITICAL"


@pytest.mark.asyncio
async def test_07_filter_by_zone(client: AsyncClient, db_session: AsyncSession):
    """7. Test filtering bins by operational zone."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    await create_test_bin(db_session, zone="Industrial Zone Beta")

    res = await client.get("/api/v1/admin/bins?zone=Industrial Zone Beta", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) >= 1
    for item in data["items"]:
        assert "Industrial Zone Beta" in item["zone"]


@pytest.mark.asyncio
async def test_08_filter_by_waste_type(client: AsyncClient, db_session: AsyncSession):
    """8. Test filtering bins by waste category."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    await create_test_bin(db_session, waste_type=WasteType.GLASS)

    res = await client.get("/api/v1/admin/bins?waste_type=GLASS", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) >= 1
    for item in data["items"]:
        assert item["waste_type"] == "GLASS"


@pytest.mark.asyncio
async def test_09_filter_by_priority(client: AsyncClient, db_session: AsyncSession):
    """9. Test filtering bins by priority."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    await create_test_bin(db_session, priority=CollectionPriority.CRITICAL)

    res = await client.get("/api/v1/admin/bins?priority=CRITICAL", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) >= 1
    for item in data["items"]:
        assert item["priority"] == "CRITICAL"


@pytest.mark.asyncio
async def test_10_filter_by_fill_range(client: AsyncClient, db_session: AsyncSession):
    """10. Test filtering bins by fill level percentage range."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    await create_test_bin(db_session, fill_level=87.5)

    res = await client.get("/api/v1/admin/bins?fill_min=80.0&fill_max=90.0", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) >= 1
    for item in data["items"]:
        assert 80.0 <= item["current_fill_percentage"] <= 90.0


@pytest.mark.asyncio
async def test_11_get_bin_details(client: AsyncClient, db_session: AsyncSession):
    """11. Test fetching complete bin details including health summary."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    b = await create_test_bin(db_session, fill_level=45.0)

    res = await client.get(f"/api/v1/admin/bins/{b.id}", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert data["bin_code"] == b.bin_code
    assert "health_summary" in data
    assert data["health_summary"]["is_online"] is True


@pytest.mark.asyncio
async def test_12_update_bin(client: AsyncClient, db_session: AsyncSession):
    """12. Test updating bin administrative specifications."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    b = await create_test_bin(db_session, capacity=100.0)

    res = await client.patch(
        f"/api/v1/admin/bins/{b.id}",
        json={"name": "Renamed Central Bin", "capacity_kg": 150.0, "zone": "South Zone"},
        headers=auth_header(admin),
    )
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Renamed Central Bin"
    assert data["capacity_kg"] == 150.0
    assert data["zone"] == "South Zone"


@pytest.mark.asyncio
async def test_13_deactivate_and_reactivate_bin(client: AsyncClient, db_session: AsyncSession):
    """13. Test soft deactivating and reactivating a bin."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    b = await create_test_bin(db_session)

    # Deactivate
    res_deact = await client.patch(f"/api/v1/admin/bins/{b.id}/deactivate", headers=auth_header(admin))
    assert res_deact.status_code == 200

    # Verify state
    res_get = await client.get(f"/api/v1/admin/bins/{b.id}", headers=auth_header(admin))
    assert res_get.json()["is_active"] is False
    assert res_get.json()["status"] == "INACTIVE"

    # Reactivate
    res_act = await client.patch(f"/api/v1/admin/bins/{b.id}/activate", headers=auth_header(admin))
    assert res_act.status_code == 200
    res_get2 = await client.get(f"/api/v1/admin/bins/{b.id}", headers=auth_header(admin))
    assert res_get2.json()["is_active"] is True
    assert res_get2.json()["status"] == "NORMAL"


@pytest.mark.asyncio
async def test_14_deactivate_active_route_conflict(client: AsyncClient, db_session: AsyncSession):
    """14. Test that deactivating a bin participating in an active route returns 409 Conflict."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    unique_str = uuid.uuid4().hex[:6]

    veh = Vehicle(
        uuid=uuid.uuid4(),
        vehicle_code=f"VEH-B-{unique_str}",
        name="Route Truck",
        vehicle_type=VehicleType.COMPACTOR,
        registration_number=f"GJ-01-B-{unique_str}",
        license_plate=f"GJ-01-B-{unique_str}",
        capacity_kg=1000.0,
        current_load_kg=0.0,
        energy_type=EnergyType.DIESEL,
        status=VehicleStatus.ON_ROUTE,
        is_active=True,
    )
    db_session.add(veh)
    await db_session.flush()

    route = Route(
        uuid=uuid.uuid4(),
        route_code=f"RT-B-{unique_str}",
        name="Active Bin Route",
        zone="Central",
        vehicle_id=veh.id,
        driver_id=driver.id,
        scheduled_date=datetime.now(timezone.utc).date(),
        status=RouteStatus.IN_PROGRESS,
        priority=RoutePriority.HIGH,
    )
    db_session.add(route)
    await db_session.flush()

    test_b = await create_test_bin(db_session)
    stop = RouteStop(
        route_id=route.id,
        bin_id=test_b.id,
        sequence_number=1,
        status=StopStatus.PENDING,
    )
    db_session.add(stop)
    await db_session.commit()

    # Attempt to deactivate bin
    res = await client.patch(f"/api/v1/admin/bins/{test_b.id}/deactivate", headers=auth_header(admin))
    assert res.status_code == 409
    assert "Cannot deactivate bin" in res.json()["detail"]


@pytest.mark.asyncio
async def test_15_update_operational_status(client: AsyncClient, db_session: AsyncSession):
    """15. Test updating operational status with valid transition."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    b = await create_test_bin(db_session, status=BinStatus.NORMAL)

    res = await client.patch(
        f"/api/v1/admin/bins/{b.id}/status",
        json={"status": "MAINTENANCE"},
        headers=auth_header(admin),
    )
    assert res.status_code == 200
    assert res.json()["status"] == "MAINTENANCE"


@pytest.mark.asyncio
async def test_16_invalid_status_transition(client: AsyncClient, db_session: AsyncSession):
    """16. Test that inactive bins cannot transition directly to operational states."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    b = await create_test_bin(db_session, status=BinStatus.INACTIVE)
    b.is_active = False
    await db_session.commit()

    res = await client.patch(
        f"/api/v1/admin/bins/{b.id}/status",
        json={"status": "CRITICAL"},
        headers=auth_header(admin),
    )
    assert res.status_code == 400
    assert "Cannot transition INACTIVE bin" in res.json()["detail"]


@pytest.mark.asyncio
async def test_17_update_priority(client: AsyncClient, db_session: AsyncSession):
    """17. Test updating priority with reason and audit log."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    b = await create_test_bin(db_session, priority=CollectionPriority.LOW)

    res = await client.patch(
        f"/api/v1/admin/bins/{b.id}/priority",
        json={"priority": "HIGH", "reason": "Citizen overflow alert", "source": "MANUAL"},
        headers=auth_header(admin),
    )
    assert res.status_code == 200
    assert res.json()["priority"] == "HIGH"


@pytest.mark.asyncio
async def test_18_prioritize_bin_endpoint(client: AsyncClient, db_session: AsyncSession):
    """18. Test prioritize endpoint sets priority to CRITICAL and collection_status to PRIORITY."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    b = await create_test_bin(db_session)

    res = await client.post(
        f"/api/v1/admin/bins/{b.id}/prioritize",
        json={"reason": "Near hospital entry", "requested_by": "Ops Manager"},
        headers=auth_header(admin),
    )
    assert res.status_code == 200
    data = res.json()
    assert data["priority"] == "CRITICAL"
    assert data["collection_status"] == "PRIORITY"


@pytest.mark.asyncio
async def test_19_bulk_actions(client: AsyncClient, db_session: AsyncSession):
    """19. Test bulk actions endpoint (SET_PRIORITY, SET_STATUS)."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    b1 = await create_test_bin(db_session)
    b2 = await create_test_bin(db_session)

    res = await client.post(
        "/api/v1/admin/bins/bulk-action",
        json={"bin_ids": [b1.id, b2.id], "action": "SET_PRIORITY", "value": "HIGH"},
        headers=auth_header(admin),
    )
    assert res.status_code == 200
    data = res.json()
    assert b1.id in data["successful_ids"]
    assert b2.id in data["successful_ids"]
    assert len(data["failed_ids"]) == 0


@pytest.mark.asyncio
async def test_20_attach_sensor(client: AsyncClient, db_session: AsyncSession):
    """20. Test attaching an IoT sensor device to a bin."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    b = await create_test_bin(db_session)
    unique_str = uuid.uuid4().hex[:6]
    sensor_code = f"SNS-{unique_str}"

    res = await client.post(
        f"/api/v1/admin/bins/{b.id}/sensor",
        json={
            "sensor_id": sensor_code,
            "sensor_type": "ULTRASONIC",
            "battery_percentage": 95.0,
            "connectivity_status": "ONLINE",
        },
        headers=auth_header(admin),
    )
    assert res.status_code == 201
    assert res.json()["sensor_id"] == sensor_code

    # Verify GET sensor
    res_get = await client.get(f"/api/v1/admin/bins/{b.id}/sensor", headers=auth_header(admin))
    assert res_get.status_code == 200
    assert res_get.json()["sensor_id"] == sensor_code


@pytest.mark.asyncio
async def test_21_duplicate_sensor_rejection(client: AsyncClient, db_session: AsyncSession):
    """21. Test that attaching an already registered sensor code returns 409 Conflict."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    b1 = await create_test_bin(db_session)
    b2 = await create_test_bin(db_session)
    unique_str = uuid.uuid4().hex[:6]
    s_code = f"SNS-DUP-{unique_str}"

    # Attach to b1
    await client.post(
        f"/api/v1/admin/bins/{b1.id}/sensor",
        json={"sensor_id": s_code},
        headers=auth_header(admin),
    )

    # Attempt attach to b2
    res = await client.post(
        f"/api/v1/admin/bins/{b2.id}/sensor",
        json={"sensor_id": s_code},
        headers=auth_header(admin),
    )
    assert res.status_code == 409


@pytest.mark.asyncio
async def test_22_update_and_delete_sensor(client: AsyncClient, db_session: AsyncSession):
    """22. Test updating and deleting attached sensor."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    b = await create_test_bin(db_session)
    unique_str = uuid.uuid4().hex[:6]
    s_code = f"SNS-DEL-{unique_str}"

    await client.post(
        f"/api/v1/admin/bins/{b.id}/sensor",
        json={"sensor_id": s_code, "battery_percentage": 90.0},
        headers=auth_header(admin),
    )

    # Update
    res_up = await client.patch(
        f"/api/v1/admin/bins/{b.id}/sensor",
        json={"battery_percentage": 82.0, "firmware_version": "v3.0.1"},
        headers=auth_header(admin),
    )
    assert res_up.status_code == 200
    assert res_up.json()["battery_percentage"] == 82.0

    # Delete
    res_del = await client.delete(f"/api/v1/admin/bins/{b.id}/sensor", headers=auth_header(admin))
    assert res_del.status_code == 200


@pytest.mark.asyncio
async def test_23_telemetry_ingestion_and_threshold(client: AsyncClient, db_session: AsyncSession):
    """23. Test telemetry ingestion updates current fill and triggers CRITICAL status if fill >= 90%."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    b = await create_test_bin(db_session, capacity=200.0, fill_level=10.0, status=BinStatus.NORMAL)

    res = await client.post(
        f"/api/v1/admin/bins/{b.id}/telemetry",
        json={
            "fill_percentage": 94.0,
            "battery_percentage": 88.0,
            "temperature_celsius": 28.0,
            "connectivity_status": "ONLINE",
            "source": "IOT",
        },
        headers=auth_header(admin),
    )
    assert res.status_code == 201
    assert res.json()["fill_percentage"] == 94.0

    # Verify bin status updated to CRITICAL
    res_get = await client.get(f"/api/v1/admin/bins/{b.id}", headers=auth_header(admin))
    data = res_get.json()
    assert data["status"] == "CRITICAL"
    assert data["priority"] == "CRITICAL"
    assert data["collection_status"] == "PRIORITY"
    assert data["current_fill_kg"] == 188.0  # 94% of 200kg


@pytest.mark.asyncio
async def test_24_invalid_telemetry_rejection(client: AsyncClient, db_session: AsyncSession):
    """24. Test that fill_percentage > 100% is rejected."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    b = await create_test_bin(db_session)

    res = await client.post(
        f"/api/v1/admin/bins/{b.id}/telemetry",
        json={"fill_percentage": 115.0, "battery_percentage": 90.0},
        headers=auth_header(admin),
    )
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_25_telemetry_history(client: AsyncClient, db_session: AsyncSession):
    """25. Test fetching historical telemetry readings for a bin."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    b = await create_test_bin(db_session)

    # Ingest two readings
    await client.post(
        f"/api/v1/admin/bins/{b.id}/telemetry",
        json={"fill_percentage": 30.0, "battery_percentage": 95.0},
        headers=auth_header(admin),
    )
    await client.post(
        f"/api/v1/admin/bins/{b.id}/telemetry",
        json={"fill_percentage": 45.0, "battery_percentage": 94.0},
        headers=auth_header(admin),
    )

    res = await client.get(f"/api/v1/admin/bins/{b.id}/telemetry", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 2


@pytest.mark.asyncio
async def test_26_bin_activity_history(client: AsyncClient, db_session: AsyncSession):
    """26. Test fetching audit activity log for a bin."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    b = await create_test_bin(db_session)

    # Trigger some activities
    await client.patch(f"/api/v1/admin/bins/{b.id}", json={"name": "Renamed Activity Test"}, headers=auth_header(admin))
    await client.patch(f"/api/v1/admin/bins/{b.id}/priority", json={"priority": "CRITICAL"}, headers=auth_header(admin))

    res = await client.get(f"/api/v1/admin/bins/{b.id}/activity", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 2


@pytest.mark.asyncio
async def test_27_map_data_endpoint(client: AsyncClient, db_session: AsyncSession):
    """27. Test lightweight map endpoint."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    await create_test_bin(db_session, zone="South Zone")

    res = await client.get("/api/v1/admin/bins/map?zone=South Zone", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    for m in data:
        assert "latitude" in m
        assert "longitude" in m
        assert "fill_percentage" in m


@pytest.mark.asyncio
async def test_28_summary_and_network_health(client: AsyncClient, db_session: AsyncSession):
    """28. Test /summary and /network-health endpoints."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    await create_test_bin(db_session, status=BinStatus.NORMAL)

    # Summary
    res_sum = await client.get("/api/v1/admin/bins/summary", headers=auth_header(admin))
    assert res_sum.status_code == 200
    s_data = res_sum.json()
    assert s_data["total_bins"] >= 1
    assert "average_fill_percentage" in s_data

    # Network health
    res_nh = await client.get("/api/v1/admin/bins/network-health", headers=auth_header(admin))
    assert res_nh.status_code == 200
    nh_data = res_nh.json()
    assert nh_data["total"] >= 1
    assert "sensor_health_percentage" in nh_data


@pytest.mark.asyncio
async def test_29_analytics_and_collection_summary(client: AsyncClient, db_session: AsyncSession):
    """29. Test /analytics and /collection-summary endpoints."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    await create_test_bin(db_session, fill_level=92.0, collection_status=CollectionStatus.PRIORITY)

    # Analytics
    res_an = await client.get("/api/v1/admin/bins/analytics", headers=auth_header(admin))
    assert res_an.status_code == 200
    an_data = res_an.json()
    assert "average_fill" in an_data
    assert "waste_type_distribution" in an_data

    # Collection summary
    res_cs = await client.get("/api/v1/admin/bins/collection-summary", headers=auth_header(admin))
    assert res_cs.status_code == 200
    cs_data = res_cs.json()
    assert "priority" in cs_data
    assert "overdue" in cs_data


@pytest.mark.asyncio
async def test_30_admin_authorization(client: AsyncClient, db_session: AsyncSession):
    """30. Test that non-admin roles (DRIVER/VIEWER) receive 403 Forbidden on admin endpoints."""
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    viewer = await create_test_user(db_session, role=UserRole.VIEWER)

    # DRIVER blocked from creating bin
    res_d = await client.post("/api/v1/admin/bins", json={"capacity_kg": 100.0, "zone": "Zone A"}, headers=auth_header(driver))
    assert res_d.status_code == 403

    # VIEWER blocked from deleting sensor or updating status
    res_v = await client.get("/api/v1/admin/bins/summary", headers=auth_header(viewer))
    assert res_v.status_code == 403
