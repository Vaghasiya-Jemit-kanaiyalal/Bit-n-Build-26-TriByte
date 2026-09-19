import uuid
from datetime import date, timedelta
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.models.user import User, UserRole, UserStatus
from app.models.vehicle import Vehicle
from app.models.bin import Bin
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


async def create_test_vehicle(
    db: AsyncSession,
    capacity: float = 1200.0,
    status: str = "AVAILABLE",
    code: str | None = None,
) -> Vehicle:
    unique_str = uuid.uuid4().hex[:6]
    veh = Vehicle(
        uuid=uuid.uuid4(),
        vehicle_code=code or f"VEH-{unique_str}",
        name=f"Compactor {unique_str}",
        vehicle_type="COMPACTOR",
        registration_number=f"GJ-01-{unique_str.upper()}",
        energy_type="DIESEL",
        capacity_kg=capacity,
        current_load_kg=0.0,
        status=status,
        latitude=23.0225,
        longitude=72.5714,
        is_active=True,
    )
    db.add(veh)
    await db.commit()
    await db.refresh(veh)
    return veh


async def create_test_bin(
    db: AsyncSession,
    fill_level: float = 85.0,
    priority: str = "HIGH",
    zone: str = "NORTH",
    code: str | None = None,
) -> Bin:
    unique_str = uuid.uuid4().hex[:6]
    bin_obj = Bin(
        uuid=uuid.uuid4(),
        bin_code=code or f"BIN-{unique_str}",
        name=f"Bin {unique_str}",
        location_name="Station A",
        zone=zone,
        waste_type="ORGANIC",
        bin_type="STANDARD",
        capacity_kg=100.0,
        current_fill_kg=round(fill_level / 100.0 * 100.0, 2),
        current_fill_percentage=fill_level,
        capacity_liters=240.0,
        fill_level=fill_level,
        priority=priority,
        status="ACTIVE",
        latitude=23.0231,
        longitude=72.5718,
        is_active=True,
    )
    db.add(bin_obj)
    await db.commit()
    await db.refresh(bin_obj)
    return bin_obj


def auth_header(user: User) -> dict[str, str]:
    token = create_access_token(str(user.uuid), user.role.value)
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_01_create_route(client: AsyncClient, db_session: AsyncSession):
    """1. Test successful route creation."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session)

    payload = {
        "name": "North Zone Morning Route",
        "zone": "NORTH",
        "vehicle_id": vehicle.id,
        "driver_id": driver.id,
        "scheduled_date": str(date.today() + timedelta(days=1)),
        "start_time": "08:30:00",
        "priority": "HIGH",
    }

    res = await client.post("/api/v1/admin/routes", json=payload, headers=auth_header(admin))
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "North Zone Morning Route"
    assert data["zone"] == "NORTH"
    assert data["status"] == "PLANNED"
    assert data["route_code"].startswith("RT-")
    assert data["vehicle"]["id"] == vehicle.id
    assert data["driver"]["id"] == driver.id


@pytest.mark.asyncio
async def test_02_get_routes(client: AsyncClient, db_session: AsyncSession):
    """2. Test paginated listing of routes."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    res = await client.get("/api/v1/admin/routes?page=1&page_size=10", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "pages" in data


@pytest.mark.asyncio
async def test_03_filter_routes(client: AsyncClient, db_session: AsyncSession):
    """3. Test filtering routes by status, zone, and priority."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session)

    await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Filter Test Route",
            "zone": "SOUTH",
            "vehicle_id": vehicle.id,
            "driver_id": driver.id,
            "scheduled_date": str(date.today() + timedelta(days=2)),
            "priority": "LOW",
        },
        headers=auth_header(admin),
    )

    res = await client.get("/api/v1/admin/routes?zone=SOUTH&priority=LOW", headers=auth_header(admin))
    assert res.status_code == 200
    items = res.json()["items"]
    assert len(items) >= 1
    assert all(r["zone"] == "SOUTH" and r["priority"] == "LOW" for r in items)


@pytest.mark.asyncio
async def test_04_search_routes(client: AsyncClient, db_session: AsyncSession):
    """4. Test searching routes by name or route_code."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session)

    c_res = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Unique Searchable Express",
            "zone": "EAST",
            "vehicle_id": vehicle.id,
            "driver_id": driver.id,
            "scheduled_date": str(date.today() + timedelta(days=3)),
            "priority": "MEDIUM",
        },
        headers=auth_header(admin),
    )
    code = c_res.json()["route_code"]

    # Search by unique keyword
    res = await client.get("/api/v1/admin/routes?search=Unique Searchable", headers=auth_header(admin))
    assert res.status_code == 200
    assert any(r["name"] == "Unique Searchable Express" for r in res.json()["items"])

    # Search by code
    res_code = await client.get(f"/api/v1/admin/routes?search={code}", headers=auth_header(admin))
    assert res_code.status_code == 200
    assert any(r["route_code"] == code for r in res_code.json()["items"])


@pytest.mark.asyncio
async def test_05_get_route_details(client: AsyncClient, db_session: AsyncSession):
    """5. Test fetching route details by ID and by route code."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session)

    c_res = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Detail Route Test",
            "zone": "WEST",
            "vehicle_id": vehicle.id,
            "driver_id": driver.id,
            "scheduled_date": str(date.today() + timedelta(days=4)),
            "priority": "HIGH",
        },
        headers=auth_header(admin),
    )
    r_id = c_res.json()["id"]
    code = c_res.json()["route_code"]

    # By ID
    res1 = await client.get(f"/api/v1/admin/routes/{r_id}", headers=auth_header(admin))
    assert res1.status_code == 200
    assert res1.json()["name"] == "Detail Route Test"
    assert "metrics" in res1.json()

    # By code
    res2 = await client.get(f"/api/v1/admin/routes/{code}", headers=auth_header(admin))
    assert res2.status_code == 200
    assert res2.json()["id"] == r_id


@pytest.mark.asyncio
async def test_06_update_route(client: AsyncClient, db_session: AsyncSession):
    """6. Test updating route fields."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session)

    c_res = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Before Update Name",
            "zone": "NORTH",
            "vehicle_id": vehicle.id,
            "driver_id": driver.id,
            "scheduled_date": str(date.today() + timedelta(days=5)),
            "priority": "LOW",
        },
        headers=auth_header(admin),
    )
    r_id = c_res.json()["id"]

    res = await client.put(
        f"/api/v1/admin/routes/{r_id}",
        json={"name": "After Update Name", "priority": "CRITICAL"},
        headers=auth_header(admin),
    )
    assert res.status_code == 200
    assert res.json()["name"] == "After Update Name"
    assert res.json()["priority"] == "CRITICAL"


@pytest.mark.asyncio
async def test_07_cancel_route(client: AsyncClient, db_session: AsyncSession):
    """7. Test cancelling a planned route."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session)

    c_res = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Cancel Test Route",
            "zone": "NORTH",
            "vehicle_id": vehicle.id,
            "driver_id": driver.id,
            "scheduled_date": str(date.today() + timedelta(days=6)),
            "priority": "LOW",
        },
        headers=auth_header(admin),
    )
    r_id = c_res.json()["id"]

    res = await client.patch(f"/api/v1/admin/routes/{r_id}/cancel", headers=auth_header(admin))
    assert res.status_code == 200
    assert res.json()["message"] == "Route cancelled successfully"

    # Verify status changed
    detail = await client.get(f"/api/v1/admin/routes/{r_id}", headers=auth_header(admin))
    assert detail.json()["status"] == "CANCELLED"


@pytest.mark.asyncio
async def test_08_add_route_stop(client: AsyncClient, db_session: AsyncSession):
    """8. Test adding a bin stop to a route."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session)
    test_bin = await create_test_bin(db_session)

    c_res = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Route With Stops",
            "zone": "NORTH",
            "vehicle_id": vehicle.id,
            "driver_id": driver.id,
            "scheduled_date": str(date.today() + timedelta(days=7)),
            "priority": "HIGH",
        },
        headers=auth_header(admin),
    )
    r_id = c_res.json()["id"]

    stop_res = await client.post(
        f"/api/v1/admin/routes/{r_id}/stops",
        json={"bin_id": test_bin.id, "sequence_number": 1, "priority": "CRITICAL"},
        headers=auth_header(admin),
    )
    assert stop_res.status_code == 201
    assert stop_res.json()["sequence_number"] == 1
    assert stop_res.json()["bin_id"] == test_bin.id


@pytest.mark.asyncio
async def test_09_remove_route_stop(client: AsyncClient, db_session: AsyncSession):
    """9. Test removing a stop and automatic re-sequencing."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session)
    bin1 = await create_test_bin(db_session)
    bin2 = await create_test_bin(db_session)

    c_res = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Route Remove Stop",
            "zone": "NORTH",
            "vehicle_id": vehicle.id,
            "driver_id": driver.id,
            "scheduled_date": str(date.today() + timedelta(days=8)),
            "priority": "HIGH",
        },
        headers=auth_header(admin),
    )
    r_id = c_res.json()["id"]

    s1 = await client.post(
        f"/api/v1/admin/routes/{r_id}/stops",
        json={"bin_id": bin1.id, "sequence_number": 1},
        headers=auth_header(admin),
    )
    s2 = await client.post(
        f"/api/v1/admin/routes/{r_id}/stops",
        json={"bin_id": bin2.id, "sequence_number": 2},
        headers=auth_header(admin),
    )

    del_res = await client.delete(
        f"/api/v1/admin/routes/{r_id}/stops/{s1.json()['id']}",
        headers=auth_header(admin),
    )
    assert del_res.status_code == 200

    # Remaining stop should now be sequence 1
    stops_res = await client.get(f"/api/v1/admin/routes/{r_id}/stops", headers=auth_header(admin))
    stops = stops_res.json()
    assert len(stops) == 1
    assert stops[0]["id"] == s2.json()["id"]
    assert stops[0]["sequence_number"] == 1


@pytest.mark.asyncio
async def test_10_reorder_route_stops(client: AsyncClient, db_session: AsyncSession):
    """10. Test reordering route stops atomically."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session)
    bin1 = await create_test_bin(db_session)
    bin2 = await create_test_bin(db_session)

    c_res = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Route Reorder",
            "zone": "NORTH",
            "vehicle_id": vehicle.id,
            "driver_id": driver.id,
            "scheduled_date": str(date.today() + timedelta(days=9)),
            "priority": "HIGH",
        },
        headers=auth_header(admin),
    )
    r_id = c_res.json()["id"]

    s1 = (await client.post(
        f"/api/v1/admin/routes/{r_id}/stops",
        json={"bin_id": bin1.id, "sequence_number": 1},
        headers=auth_header(admin),
    )).json()
    s2 = (await client.post(
        f"/api/v1/admin/routes/{r_id}/stops",
        json={"bin_id": bin2.id, "sequence_number": 2},
        headers=auth_header(admin),
    )).json()

    # Reorder reverse: [s2.id, s1.id]
    reorder_res = await client.patch(
        f"/api/v1/admin/routes/{r_id}/stops/reorder",
        json={"stop_ids": [s2["id"], s1["id"]]},
        headers=auth_header(admin),
    )
    assert reorder_res.status_code == 200
    reordered = reorder_res.json()
    assert reordered[0]["id"] == s2["id"]
    assert reordered[0]["sequence_number"] == 1
    assert reordered[1]["id"] == s1["id"]
    assert reordered[1]["sequence_number"] == 2


@pytest.mark.asyncio
async def test_11_start_route(client: AsyncClient, db_session: AsyncSession):
    """11. Test starting a planned route."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session)

    c_res = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Start Test Route",
            "zone": "NORTH",
            "vehicle_id": vehicle.id,
            "driver_id": driver.id,
            "scheduled_date": str(date.today() + timedelta(days=10)),
        },
        headers=auth_header(admin),
    )
    r_id = c_res.json()["id"]

    res = await client.post(f"/api/v1/admin/routes/{r_id}/start", headers=auth_header(admin))
    assert res.status_code == 200
    assert res.json()["status"] == "IN_PROGRESS"


@pytest.mark.asyncio
async def test_12_pause_route(client: AsyncClient, db_session: AsyncSession):
    """12. Test pausing an in-progress route."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session)

    c_res = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Pause Test Route",
            "zone": "NORTH",
            "vehicle_id": vehicle.id,
            "driver_id": driver.id,
            "scheduled_date": str(date.today() + timedelta(days=11)),
        },
        headers=auth_header(admin),
    )
    r_id = c_res.json()["id"]

    await client.post(f"/api/v1/admin/routes/{r_id}/start", headers=auth_header(admin))
    res = await client.post(f"/api/v1/admin/routes/{r_id}/pause", headers=auth_header(admin))
    assert res.status_code == 200
    assert res.json()["status"] == "PAUSED"


@pytest.mark.asyncio
async def test_13_resume_route(client: AsyncClient, db_session: AsyncSession):
    """13. Test resuming a paused route."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session)

    c_res = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Resume Test Route",
            "zone": "NORTH",
            "vehicle_id": vehicle.id,
            "driver_id": driver.id,
            "scheduled_date": str(date.today() + timedelta(days=12)),
        },
        headers=auth_header(admin),
    )
    r_id = c_res.json()["id"]

    await client.post(f"/api/v1/admin/routes/{r_id}/start", headers=auth_header(admin))
    await client.post(f"/api/v1/admin/routes/{r_id}/pause", headers=auth_header(admin))

    res = await client.post(f"/api/v1/admin/routes/{r_id}/resume", headers=auth_header(admin))
    assert res.status_code == 200
    assert res.json()["status"] == "IN_PROGRESS"


@pytest.mark.asyncio
async def test_14_complete_stop(client: AsyncClient, db_session: AsyncSession):
    """14. Test completing a stop with weight collected."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session)
    test_bin = await create_test_bin(db_session)

    c_res = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Complete Stop Route",
            "zone": "NORTH",
            "vehicle_id": vehicle.id,
            "driver_id": driver.id,
            "scheduled_date": str(date.today() + timedelta(days=13)),
        },
        headers=auth_header(admin),
    )
    r_id = c_res.json()["id"]

    stop = (await client.post(
        f"/api/v1/admin/routes/{r_id}/stops",
        json={"bin_id": test_bin.id, "sequence_number": 1},
        headers=auth_header(admin),
    )).json()

    # Complete stop
    res = await client.post(
        f"/api/v1/admin/routes/{r_id}/stops/{stop['id']}/complete",
        json={"actual_collected_weight_kg": 75.5, "notes": "All waste collected clean"},
        headers=auth_header(admin),
    )
    assert res.status_code == 200
    assert res.json()["status"] == "COMPLETED"
    assert res.json()["actual_collected_weight_kg"] == 75.5

    # Check updated route load
    route_detail = (await client.get(f"/api/v1/admin/routes/{r_id}", headers=auth_header(admin))).json()
    assert route_detail["completed_stops"] == 1
    assert route_detail["current_load_kg"] == 75.5


@pytest.mark.asyncio
async def test_15_skip_stop(client: AsyncClient, db_session: AsyncSession):
    """15. Test skipping a stop with documented reason."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session)
    test_bin = await create_test_bin(db_session)

    c_res = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Skip Stop Route",
            "zone": "NORTH",
            "vehicle_id": vehicle.id,
            "driver_id": driver.id,
            "scheduled_date": str(date.today() + timedelta(days=14)),
        },
        headers=auth_header(admin),
    )
    r_id = c_res.json()["id"]

    stop = (await client.post(
        f"/api/v1/admin/routes/{r_id}/stops",
        json={"bin_id": test_bin.id, "sequence_number": 1},
        headers=auth_header(admin),
    )).json()

    res = await client.post(
        f"/api/v1/admin/routes/{r_id}/stops/{stop['id']}/skip",
        json={"reason": "Construction blocked access road"},
        headers=auth_header(admin),
    )
    assert res.status_code == 200
    assert res.json()["status"] == "SKIPPED"
    assert "Construction blocked access road" in res.json()["notes"]


@pytest.mark.asyncio
async def test_16_complete_route_validation(client: AsyncClient, db_session: AsyncSession):
    """16. Test route completion prevents completing when incomplete stops exist unless forced."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session)
    test_bin = await create_test_bin(db_session)

    c_res = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Complete Route Validation",
            "zone": "NORTH",
            "vehicle_id": vehicle.id,
            "driver_id": driver.id,
            "scheduled_date": str(date.today() + timedelta(days=15)),
        },
        headers=auth_header(admin),
    )
    r_id = c_res.json()["id"]

    await client.post(
        f"/api/v1/admin/routes/{r_id}/stops",
        json={"bin_id": test_bin.id, "sequence_number": 1},
        headers=auth_header(admin),
    )
    await client.post(f"/api/v1/admin/routes/{r_id}/start", headers=auth_header(admin))

    # Try completing without completing stops
    res_fail = await client.post(f"/api/v1/admin/routes/{r_id}/complete", headers=auth_header(admin))
    assert res_fail.status_code == 400
    assert "incomplete stops" in res_fail.json()["detail"].lower()

    # Complete with force=true
    res_force = await client.post(f"/api/v1/admin/routes/{r_id}/complete?force=true", headers=auth_header(admin))
    assert res_force.status_code == 200
    assert res_force.json()["status"] == "COMPLETED"


@pytest.mark.asyncio
async def test_17_invalid_status_transitions(client: AsyncClient, db_session: AsyncSession):
    """17. Test rejecting invalid route status transitions."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session)

    c_res = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Invalid Transition Route",
            "zone": "NORTH",
            "vehicle_id": vehicle.id,
            "driver_id": driver.id,
            "scheduled_date": str(date.today() + timedelta(days=16)),
        },
        headers=auth_header(admin),
    )
    r_id = c_res.json()["id"]

    # Try pausing a PLANNED route (invalid)
    res_pause = await client.post(f"/api/v1/admin/routes/{r_id}/pause", headers=auth_header(admin))
    assert res_pause.status_code == 400

    # Cancel route
    await client.patch(f"/api/v1/admin/routes/{r_id}/cancel", headers=auth_header(admin))

    # Try starting a CANCELLED route (invalid)
    res_start = await client.post(f"/api/v1/admin/routes/{r_id}/start", headers=auth_header(admin))
    assert res_start.status_code == 400


@pytest.mark.asyncio
async def test_18_invalid_driver_role(client: AsyncClient, db_session: AsyncSession):
    """18. Test rejecting assignment of users with non-DRIVER roles (e.g. ADMIN or VIEWER)."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    viewer = await create_test_user(db_session, role=UserRole.VIEWER)
    vehicle = await create_test_vehicle(db_session)

    res = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Invalid Driver Route",
            "zone": "NORTH",
            "vehicle_id": vehicle.id,
            "driver_id": viewer.id,  # Invalid role
            "scheduled_date": str(date.today() + timedelta(days=17)),
        },
        headers=auth_header(admin),
    )
    assert res.status_code == 400
    assert "only users with driver role can be assigned" in res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_19_vehicle_assignment_conflict(client: AsyncClient, db_session: AsyncSession):
    """19. Test rejecting assignment of the same vehicle to overlapping active routes on the same date."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver1 = await create_test_user(db_session, role=UserRole.DRIVER)
    driver2 = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session)
    target_date = str(date.today() + timedelta(days=18))

    # First route assigns vehicle
    res1 = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Route 1",
            "zone": "NORTH",
            "vehicle_id": vehicle.id,
            "driver_id": driver1.id,
            "scheduled_date": target_date,
        },
        headers=auth_header(admin),
    )
    assert res1.status_code == 201

    # Second route tries to assign same vehicle on same date -> 409 Conflict
    res2 = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Route 2 Conflicting Vehicle",
            "zone": "NORTH",
            "vehicle_id": vehicle.id,
            "driver_id": driver2.id,
            "scheduled_date": target_date,
        },
        headers=auth_header(admin),
    )
    assert res2.status_code == 409
    assert "already assigned" in res2.json()["detail"].lower()


@pytest.mark.asyncio
async def test_20_driver_assignment_conflict(client: AsyncClient, db_session: AsyncSession):
    """20. Test rejecting assignment of the same driver to overlapping active routes on the same date."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    v1 = await create_test_vehicle(db_session)
    v2 = await create_test_vehicle(db_session)
    target_date = str(date.today() + timedelta(days=19))

    # First route assigns driver
    res1 = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Route 1",
            "zone": "NORTH",
            "vehicle_id": v1.id,
            "driver_id": driver.id,
            "scheduled_date": target_date,
        },
        headers=auth_header(admin),
    )
    assert res1.status_code == 201

    # Second route tries to assign same driver on same date -> 409 Conflict
    res2 = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Route 2 Conflicting Driver",
            "zone": "NORTH",
            "vehicle_id": v2.id,
            "driver_id": driver.id,
            "scheduled_date": target_date,
        },
        headers=auth_header(admin),
    )
    assert res2.status_code == 409
    assert "driver" in res2.json()["detail"].lower()
    assert "already assigned" in res2.json()["detail"].lower()


@pytest.mark.asyncio
async def test_21_route_progress(client: AsyncClient, db_session: AsyncSession):
    """21. Test backend progress calculation."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session)
    bin1 = await create_test_bin(db_session)
    bin2 = await create_test_bin(db_session)

    c_res = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Progress Route",
            "zone": "NORTH",
            "vehicle_id": vehicle.id,
            "driver_id": driver.id,
            "scheduled_date": str(date.today() + timedelta(days=20)),
        },
        headers=auth_header(admin),
    )
    r_id = c_res.json()["id"]

    s1 = (await client.post(
        f"/api/v1/admin/routes/{r_id}/stops",
        json={"bin_id": bin1.id, "sequence_number": 1},
        headers=auth_header(admin),
    )).json()
    await client.post(
        f"/api/v1/admin/routes/{r_id}/stops",
        json={"bin_id": bin2.id, "sequence_number": 2},
        headers=auth_header(admin),
    )

    # Complete 1 stop out of 2 -> 50%
    await client.post(
        f"/api/v1/admin/routes/{r_id}/stops/{s1['id']}/complete",
        json={"actual_collected_weight_kg": 50.0},
        headers=auth_header(admin),
    )

    prog_res = await client.get(f"/api/v1/admin/routes/{r_id}/progress", headers=auth_header(admin))
    assert prog_res.status_code == 200
    prog = prog_res.json()
    assert prog["total_stops"] == 2
    assert prog["completed"] == 1
    assert prog["pending"] == 1
    assert prog["completion_percentage"] == 50.0


@pytest.mark.asyncio
async def test_22_route_metrics(client: AsyncClient, db_session: AsyncSession):
    """22. Test metrics and capacity utilization calculation."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    vehicle = await create_test_vehicle(db_session, capacity=1000.0)
    bin1 = await create_test_bin(db_session)

    c_res = await client.post(
        "/api/v1/admin/routes",
        json={
            "name": "Metrics Route",
            "zone": "NORTH",
            "vehicle_id": vehicle.id,
            "driver_id": driver.id,
            "scheduled_date": str(date.today() + timedelta(days=21)),
        },
        headers=auth_header(admin),
    )
    r_id = c_res.json()["id"]

    s1 = (await client.post(
        f"/api/v1/admin/routes/{r_id}/stops",
        json={"bin_id": bin1.id, "sequence_number": 1},
        headers=auth_header(admin),
    )).json()

    # Collect 600kg on a 1000kg capacity vehicle -> 60% utilization
    await client.post(
        f"/api/v1/admin/routes/{r_id}/stops/{s1['id']}/complete",
        json={"actual_collected_weight_kg": 600.0},
        headers=auth_header(admin),
    )

    m_res = await client.get(f"/api/v1/admin/routes/{r_id}/metrics", headers=auth_header(admin))
    assert m_res.status_code == 200
    m = m_res.json()
    assert m["current_load_kg"] == 600.0
    assert m["vehicle_capacity_kg"] == 1000.0
    assert m["capacity_utilization"] == 60.0


@pytest.mark.asyncio
async def test_23_admin_authorization(client: AsyncClient, db_session: AsyncSession):
    """23. Test that non-admin users (VIEWER, DRIVER) are rejected with 403 Forbidden."""
    viewer = await create_test_user(db_session, role=UserRole.VIEWER)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)

    # Viewer forbidden
    res_viewer = await client.get("/api/v1/admin/routes", headers=auth_header(viewer))
    assert res_viewer.status_code == 403

    # Driver forbidden
    res_driver = await client.get("/api/v1/admin/routes", headers=auth_header(driver))
    assert res_driver.status_code == 403

    # Unauthenticated forbidden (401 or 403)
    res_anon = await client.get("/api/v1/admin/routes")
    assert res_anon.status_code in [401, 403]
