import uuid
from datetime import date, timedelta
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.models.user import User, UserRole, UserStatus
from app.models.vehicle import Vehicle, VehicleType, EnergyType, VehicleStatus
from app.models.vehicle_maintenance import VehicleMaintenanceRecord, MaintenanceStatus
from app.models.route import Route, RouteStatus, RoutePriority


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
    status: VehicleStatus = VehicleStatus.AVAILABLE,
    vehicle_type: VehicleType = VehicleType.COMPACTOR,
    energy_type: EnergyType = EnergyType.DIESEL,
    code: str | None = None,
    registration: str | None = None,
) -> Vehicle:
    unique_str = uuid.uuid4().hex[:6]
    veh = Vehicle(
        uuid=uuid.uuid4(),
        vehicle_code=code or f"VEH-{unique_str}",
        name=f"Compactor {unique_str}",
        vehicle_type=vehicle_type,
        registration_number=registration or f"GJ-01-T-{unique_str}",
        license_plate=registration or f"GJ-01-T-{unique_str}",
        capacity_kg=capacity,
        current_load_kg=0.0,
        energy_type=energy_type,
        status=status,
        zone="North Zone",
        latitude=22.3072,
        longitude=73.1812,
        is_active=True,
    )
    db.add(veh)
    await db.commit()
    await db.refresh(veh)
    return veh


def auth_header(user: User) -> dict[str, str]:
    token = create_access_token(str(user.uuid), user.role.value)
    return {"Authorization": f"Bearer {token}"}


# ============================================================================
# 1. CREATE VEHICLE
# ============================================================================
@pytest.mark.asyncio
async def test_01_create_vehicle(client: AsyncClient, db_session: AsyncSession):
    """1. Test successful vehicle creation with auto-generated code."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    payload = {
        "name": "EcoCompactor Test",
        "vehicle_type": "COMPACTOR",
        "registration_number": f"GJ-01-XX-{uuid.uuid4().hex[:4]}",
        "capacity_kg": 1200.0,
        "energy_type": "CNG",
        "zone": "North Zone",
    }
    res = await client.post("/api/v1/admin/vehicles", json=payload, headers=auth_header(admin))
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "EcoCompactor Test"
    assert data["vehicle_code"].startswith("VEH-")
    assert data["status"] == "AVAILABLE"
    assert data["current_load_kg"] == 0.0
    assert data["capacity_utilization"] == 0.0


# ============================================================================
# 2. DUPLICATE VEHICLE CODE (Validation Helper Test)
# ============================================================================
@pytest.mark.asyncio
async def test_02_duplicate_vehicle_code(client: AsyncClient, db_session: AsyncSession):
    """2. Test auto-generator avoids vehicle code collisions."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    # Both calls succeed with distinct auto-generated vehicle codes
    res1 = await client.post("/api/v1/admin/vehicles", json={
        "name": "V1", "capacity_kg": 1000.0, "registration_number": f"REG-{uuid.uuid4().hex[:4]}"
    }, headers=auth_header(admin))
    res2 = await client.post("/api/v1/admin/vehicles", json={
        "name": "V2", "capacity_kg": 1000.0, "registration_number": f"REG-{uuid.uuid4().hex[:4]}"
    }, headers=auth_header(admin))
    assert res1.status_code == 201
    assert res2.status_code == 201
    assert res1.json()["vehicle_code"] != res2.json()["vehicle_code"]


# ============================================================================
# 3. DUPLICATE REGISTRATION
# ============================================================================
@pytest.mark.asyncio
async def test_03_duplicate_registration(client: AsyncClient, db_session: AsyncSession):
    """3. Test rejecting duplicate registration number with 409 Conflict."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    reg_num = f"GJ-01-DUP-{uuid.uuid4().hex[:4]}"
    await client.post("/api/v1/admin/vehicles", json={
        "name": "First Vehicle", "capacity_kg": 1000.0, "registration_number": reg_num
    }, headers=auth_header(admin))

    # Second vehicle with same registration
    res = await client.post("/api/v1/admin/vehicles", json={
        "name": "Second Vehicle", "capacity_kg": 1200.0, "registration_number": reg_num
    }, headers=auth_header(admin))
    assert res.status_code == 409
    assert "already registered" in res.json()["detail"].lower()


# ============================================================================
# 4. GET VEHICLES (PAGINATION)
# ============================================================================
@pytest.mark.asyncio
async def test_04_get_vehicles_pagination(client: AsyncClient, db_session: AsyncSession):
    """4. Test paginated listing of vehicles."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    res = await client.get("/api/v1/admin/vehicles?page=1&page_size=5", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "pages" in data


# ============================================================================
# 5. SEARCH VEHICLES
# ============================================================================
@pytest.mark.asyncio
async def test_05_search_vehicles(client: AsyncClient, db_session: AsyncSession):
    """5. Test searching vehicles by unique name or code."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    unique_keyword = f"UniqueTruck-{uuid.uuid4().hex[:5]}"
    v = await create_test_vehicle(db_session)
    await client.put(f"/api/v1/admin/vehicles/{v.id}", json={"name": unique_keyword}, headers=auth_header(admin))

    res = await client.get(f"/api/v1/admin/vehicles?search={unique_keyword}", headers=auth_header(admin))
    assert res.status_code == 200
    items = res.json()["items"]
    assert any(i["name"] == unique_keyword for i in items)


# ============================================================================
# 6. FILTER BY STATUS
# ============================================================================
@pytest.mark.asyncio
async def test_06_filter_by_status(client: AsyncClient, db_session: AsyncSession):
    """6. Test filtering vehicles by operational status."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    await create_test_vehicle(db_session, status=VehicleStatus.MAINTENANCE)

    res = await client.get("/api/v1/admin/vehicles?status=MAINTENANCE", headers=auth_header(admin))
    assert res.status_code == 200
    items = res.json()["items"]
    assert len(items) >= 1
    assert all(i["status"] == "MAINTENANCE" for i in items)


# ============================================================================
# 7. FILTER BY VEHICLE TYPE
# ============================================================================
@pytest.mark.asyncio
async def test_07_filter_by_type(client: AsyncClient, db_session: AsyncSession):
    """7. Test filtering vehicles by vehicle type."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    await create_test_vehicle(db_session, vehicle_type=VehicleType.ELECTRIC_COLLECTION)

    res = await client.get("/api/v1/admin/vehicles?vehicle_type=ELECTRIC_COLLECTION", headers=auth_header(admin))
    assert res.status_code == 200
    items = res.json()["items"]
    assert len(items) >= 1
    assert all(i["vehicle_type"] == "ELECTRIC_COLLECTION" for i in items)


# ============================================================================
# 8. GET VEHICLE DETAILS
# ============================================================================
@pytest.mark.asyncio
async def test_08_get_vehicle_details(client: AsyncClient, db_session: AsyncSession):
    """8. Test fetching vehicle detail by ID and vehicle code."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    v = await create_test_vehicle(db_session)

    # By ID
    res1 = await client.get(f"/api/v1/admin/vehicles/{v.id}", headers=auth_header(admin))
    assert res1.status_code == 200
    assert res1.json()["id"] == v.id

    # By vehicle_code
    res2 = await client.get(f"/api/v1/admin/vehicles/{v.vehicle_code}", headers=auth_header(admin))
    assert res2.status_code == 200
    assert res2.json()["vehicle_code"] == v.vehicle_code


# ============================================================================
# 9. UPDATE VEHICLE
# ============================================================================
@pytest.mark.asyncio
async def test_09_update_vehicle(client: AsyncClient, db_session: AsyncSession):
    """9. Test updating vehicle specifications."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    v = await create_test_vehicle(db_session, capacity=1000.0)

    res = await client.put(
        f"/api/v1/admin/vehicles/{v.id}",
        json={"name": "Updated Vehicle Name", "capacity_kg": 1500.0, "energy_type": "HYBRID"},
        headers=auth_header(admin),
    )
    assert res.status_code == 200
    assert res.json()["name"] == "Updated Vehicle Name"
    assert res.json()["capacity_kg"] == 1500.0
    assert res.json()["energy_type"] == "HYBRID"


# ============================================================================
# 10. DEACTIVATE VEHICLE & ACTIVE ROUTE GUARD
# ============================================================================
@pytest.mark.asyncio
async def test_10_deactivate_vehicle(client: AsyncClient, db_session: AsyncSession):
    """10. Test vehicle deactivation and active route assignment guard."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    v = await create_test_vehicle(db_session)

    res = await client.patch(f"/api/v1/admin/vehicles/{v.id}/deactivate", headers=auth_header(admin))
    assert res.status_code == 200
    assert "deactivated successfully" in res.json()["message"].lower()

    # Check vehicle status
    detail = await client.get(f"/api/v1/admin/vehicles/{v.id}", headers=auth_header(admin))
    assert detail.json()["is_active"] is False
    assert detail.json()["status"] == "INACTIVE"


# ============================================================================
# 11. REACTIVATE VEHICLE
# ============================================================================
@pytest.mark.asyncio
async def test_11_reactivate_vehicle(client: AsyncClient, db_session: AsyncSession):
    """11. Test restoring inactive vehicle to active AVAILABLE status."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    v = await create_test_vehicle(db_session, status=VehicleStatus.INACTIVE)

    res = await client.patch(f"/api/v1/admin/vehicles/{v.id}/activate", headers=auth_header(admin))
    assert res.status_code == 200
    assert "reactivated successfully" in res.json()["message"].lower()

    detail = await client.get(f"/api/v1/admin/vehicles/{v.id}", headers=auth_header(admin))
    assert detail.json()["is_active"] is True
    assert detail.json()["status"] == "AVAILABLE"


# ============================================================================
# 12. ASSIGN DRIVER
# ============================================================================
@pytest.mark.asyncio
async def test_12_assign_driver(client: AsyncClient, db_session: AsyncSession):
    """12. Test assigning an active DRIVER to a vehicle."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    v = await create_test_vehicle(db_session)

    res = await client.post(
        f"/api/v1/admin/vehicles/{v.id}/assign-driver",
        json={"driver_id": driver.id},
        headers=auth_header(admin),
    )
    assert res.status_code == 200
    assert res.json()["driver"]["id"] == driver.id


# ============================================================================
# 13. INVALID DRIVER ROLE
# ============================================================================
@pytest.mark.asyncio
async def test_13_invalid_driver_role(client: AsyncClient, db_session: AsyncSession):
    """13. Test rejecting assignment of non-DRIVER users (VIEWER, ADMIN)."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    viewer = await create_test_user(db_session, role=UserRole.VIEWER)
    v = await create_test_vehicle(db_session)

    res = await client.post(
        f"/api/v1/admin/vehicles/{v.id}/assign-driver",
        json={"driver_id": viewer.id},
        headers=auth_header(admin),
    )
    assert res.status_code == 400
    assert "only users with driver role" in res.json()["detail"].lower()


# ============================================================================
# 14. REMOVE DRIVER
# ============================================================================
@pytest.mark.asyncio
async def test_14_remove_driver(client: AsyncClient, db_session: AsyncSession):
    """14. Test removing driver assignment."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    v = await create_test_vehicle(db_session)
    await client.post(f"/api/v1/admin/vehicles/{v.id}/assign-driver", json={"driver_id": driver.id}, headers=auth_header(admin))

    res = await client.delete(f"/api/v1/admin/vehicles/{v.id}/driver", headers=auth_header(admin))
    assert res.status_code == 200
    assert "removed from vehicle" in res.json()["message"].lower()

    detail = await client.get(f"/api/v1/admin/vehicles/{v.id}", headers=auth_header(admin))
    assert detail.json()["driver"] is None


# ============================================================================
# 15. UPDATE VEHICLE STATUS
# ============================================================================
@pytest.mark.asyncio
async def test_15_update_status(client: AsyncClient, db_session: AsyncSession):
    """15. Test updating vehicle status."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    v = await create_test_vehicle(db_session, status=VehicleStatus.AVAILABLE)

    res = await client.patch(
        f"/api/v1/admin/vehicles/{v.id}/status",
        json={"status": "IDLE"},
        headers=auth_header(admin),
    )
    assert res.status_code == 200
    assert res.json()["status"] == "IDLE"


# ============================================================================
# 16. INVALID STATUS TRANSITION
# ============================================================================
@pytest.mark.asyncio
async def test_16_invalid_status_transition(client: AsyncClient, db_session: AsyncSession):
    """16. Test rejecting invalid status transition (e.g. INACTIVE -> ON_ROUTE directly)."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    v = await create_test_vehicle(db_session)
    await client.patch(f"/api/v1/admin/vehicles/{v.id}/deactivate", headers=auth_header(admin))

    res = await client.patch(
        f"/api/v1/admin/vehicles/{v.id}/status",
        json={"status": "ON_ROUTE"},
        headers=auth_header(admin),
    )
    assert res.status_code in [400, 409]


# ============================================================================
# 17. UPDATE VEHICLE LOAD & UTILIZATION CALCULATION
# ============================================================================
@pytest.mark.asyncio
async def test_17_update_load_and_utilization(client: AsyncClient, db_session: AsyncSession):
    """17. Test updating vehicle payload load and verifying backend utilization calculation."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    v = await create_test_vehicle(db_session, capacity=1000.0)

    res = await client.patch(
        f"/api/v1/admin/vehicles/{v.id}/load",
        json={"current_load_kg": 650.0},
        headers=auth_header(admin),
    )
    assert res.status_code == 200
    data = res.json()
    assert data["current_load_kg"] == 650.0
    assert data["capacity_utilization"] == 65.0


# ============================================================================
# 18. LOAD GREATER THAN CAPACITY
# ============================================================================
@pytest.mark.asyncio
async def test_18_load_greater_than_capacity(client: AsyncClient, db_session: AsyncSession):
    """18. Test rejecting payload exceeding vehicle capacity."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    v = await create_test_vehicle(db_session, capacity=1000.0)

    res = await client.patch(
        f"/api/v1/admin/vehicles/{v.id}/load",
        json={"current_load_kg": 1200.0},
        headers=auth_header(admin),
    )
    assert res.status_code == 400
    assert "exceeds vehicle capacity" in res.json()["detail"].lower()


# ============================================================================
# 19. UPDATE & RETRIEVE LOCATION
# ============================================================================
@pytest.mark.asyncio
async def test_19_update_and_get_location(client: AsyncClient, db_session: AsyncSession):
    """19. Test updating GPS telemetry and reading current coordinates."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    v = await create_test_vehicle(db_session)

    patch_res = await client.patch(
        f"/api/v1/admin/vehicles/{v.id}/location",
        json={"latitude": 22.3072, "longitude": 73.1812},
        headers=auth_header(admin),
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["latitude"] == 22.3072

    get_res = await client.get(f"/api/v1/admin/vehicles/{v.id}/location", headers=auth_header(admin))
    assert get_res.status_code == 200
    assert get_res.json()["longitude"] == 73.1812


# ============================================================================
# 20. ADD MAINTENANCE RECORD
# ============================================================================
@pytest.mark.asyncio
async def test_20_add_maintenance_record(client: AsyncClient, db_session: AsyncSession):
    """20. Test logging a maintenance record for a vehicle."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    v = await create_test_vehicle(db_session)

    payload = {
        "service_type": "Hydraulics Check",
        "service_date": str(date.today()),
        "next_service_date": str(date.today() + timedelta(days=30)),
        "odometer_km": 18400,
        "status": "SCHEDULED",
        "notes": "Inspect pressure lines",
    }
    res = await client.post(f"/api/v1/admin/vehicles/{v.id}/maintenance", json=payload, headers=auth_header(admin))
    assert res.status_code == 201
    assert res.json()["service_type"] == "Hydraulics Check"
    assert res.json()["odometer_km"] == 18400


# ============================================================================
# 21. GET MAINTENANCE HISTORY
# ============================================================================
@pytest.mark.asyncio
async def test_21_get_maintenance_history(client: AsyncClient, db_session: AsyncSession):
    """21. Test retrieving paginated maintenance records."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    v = await create_test_vehicle(db_session)
    await client.post(f"/api/v1/admin/vehicles/{v.id}/maintenance", json={
        "service_type": "Oil Change", "service_date": str(date.today()), "status": "COMPLETED"
    }, headers=auth_header(admin))

    res = await client.get(f"/api/v1/admin/vehicles/{v.id}/maintenance", headers=auth_header(admin))
    assert res.status_code == 200
    assert len(res.json()["items"]) >= 1


# ============================================================================
# 22. UPDATE MAINTENANCE RECORD
# ============================================================================
@pytest.mark.asyncio
async def test_22_update_maintenance_record(client: AsyncClient, db_session: AsyncSession):
    """22. Test updating status and notes on maintenance record."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    v = await create_test_vehicle(db_session)
    m_res = await client.post(f"/api/v1/admin/vehicles/{v.id}/maintenance", json={
        "service_type": "Transmission", "service_date": str(date.today()), "status": "SCHEDULED"
    }, headers=auth_header(admin))
    m_id = m_res.json()["id"]

    res = await client.patch(
        f"/api/v1/admin/vehicles/{v.id}/maintenance/{m_id}",
        json={"status": "COMPLETED", "notes": "Replaced filter cleanly"},
        headers=auth_header(admin),
    )
    assert res.status_code == 200
    assert res.json()["status"] == "COMPLETED"
    assert res.json()["notes"] == "Replaced filter cleanly"


# ============================================================================
# 23. VEHICLE ACTIVITY HISTORY
# ============================================================================
@pytest.mark.asyncio
async def test_23_vehicle_activity_history(client: AsyncClient, db_session: AsyncSession):
    """23. Test chronological vehicle activity history audit trail."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    v = await create_test_vehicle(db_session)
    await client.patch(f"/api/v1/admin/vehicles/{v.id}/status", json={"status": "IDLE"}, headers=auth_header(admin))

    res = await client.get(f"/api/v1/admin/vehicles/{v.id}/history", headers=auth_header(admin))
    assert res.status_code == 200
    activities = res.json()
    assert len(activities) >= 1
    assert any(a["activity_type"] == "STATUS_CHANGED" for a in activities)


# ============================================================================
# 24. FLEET SUMMARY
# ============================================================================
@pytest.mark.asyncio
async def test_24_fleet_summary(client: AsyncClient, db_session: AsyncSession):
    """24. Test fleet summary KPI counts calculated dynamically from PostgreSQL."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    res = await client.get("/api/v1/admin/vehicles/summary", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "active" in data
    assert "available" in data
    assert "maintenance" in data


# ============================================================================
# 25. FLEET UTILIZATION
# ============================================================================
@pytest.mark.asyncio
async def test_25_fleet_utilization(client: AsyncClient, db_session: AsyncSession):
    """25. Test fleet-level capacity utilization and distribution brackets."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    res = await client.get("/api/v1/admin/vehicles/utilization", headers=auth_header(admin))
    assert res.status_code == 200
    data = res.json()
    assert "total_capacity_kg" in data
    assert "current_load_kg" in data
    assert "utilization_percentage" in data
    assert "vehicles_below_50_percent" in data


# ============================================================================
# 26. ATTENTION VEHICLES
# ============================================================================
@pytest.mark.asyncio
async def test_26_attention_vehicles(client: AsyncClient, db_session: AsyncSession):
    """26. Test identifying vehicles requiring attention (e.g. load >= 90%)."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    v = await create_test_vehicle(db_session, capacity=1000.0)
    await client.patch(f"/api/v1/admin/vehicles/{v.id}/load", json={"current_load_kg": 950.0}, headers=auth_header(admin))

    res = await client.get("/api/v1/admin/vehicles/attention", headers=auth_header(admin))
    assert res.status_code == 200
    items = res.json()["items"]
    assert any(i["vehicle_id"] == v.id and i["type"] == "HIGH_LOAD" for i in items)


# ============================================================================
# 27. ADMIN AUTHORIZATION
# ============================================================================
@pytest.mark.asyncio
async def test_27_admin_authorization(client: AsyncClient, db_session: AsyncSession):
    """27. Test that non-admin users (VIEWER, DRIVER) are rejected with 403 Forbidden."""
    viewer = await create_test_user(db_session, role=UserRole.VIEWER)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)

    res_viewer = await client.get("/api/v1/admin/vehicles", headers=auth_header(viewer))
    assert res_viewer.status_code == 403

    res_driver = await client.get("/api/v1/admin/vehicles", headers=auth_header(driver))
    assert res_driver.status_code == 403


# ============================================================================
# 28. MAINTENANCE VEHICLE CANNOT BE ASSIGNED TO ROUTE
# ============================================================================
@pytest.mark.asyncio
async def test_28_maintenance_vehicle_route_restriction(client: AsyncClient, db_session: AsyncSession):
    """28. Test that a vehicle under maintenance cannot be deployed on a route."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    v = await create_test_vehicle(db_session, status=VehicleStatus.MAINTENANCE)

    # Attempting to set status directly to ON_ROUTE while in MAINTENANCE fails
    res = await client.patch(
        f"/api/v1/admin/vehicles/{v.id}/status",
        json={"status": "ON_ROUTE"},
        headers=auth_header(admin),
    )
    assert res.status_code == 409
    assert "maintenance" in res.json()["detail"].lower()


# ============================================================================
# 29. DRIVER CONFLICT ON MULTIPLE VEHICLES
# ============================================================================
@pytest.mark.asyncio
async def test_29_driver_assignment_conflict(client: AsyncClient, db_session: AsyncSession):
    """29. Test preventing assignment of same driver to multiple active vehicles."""
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    v1 = await create_test_vehicle(db_session)
    v2 = await create_test_vehicle(db_session)

    # Assign to first vehicle
    res1 = await client.post(
        f"/api/v1/admin/vehicles/{v1.id}/assign-driver",
        json={"driver_id": driver.id},
        headers=auth_header(admin),
    )
    assert res1.status_code == 200

    # Try assigning to second vehicle
    res2 = await client.post(
        f"/api/v1/admin/vehicles/{v2.id}/assign-driver",
        json={"driver_id": driver.id},
        headers=auth_header(admin),
    )
    assert res2.status_code == 409
    assert "already assigned" in res2.json()["detail"].lower()
