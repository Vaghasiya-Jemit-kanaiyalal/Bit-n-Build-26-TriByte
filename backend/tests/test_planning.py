from datetime import date, timedelta
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User, UserRole, UserStatus
from app.models.vehicle import Vehicle, VehicleStatus, VehicleType, EnergyType
from app.models.bin import Bin, BinStatus, BinType, WasteType, CollectionPriority
from app.models.collection_plan import CollectionPlan, PlanStatus, PlanHorizon, PlanStrategy
from app.models.planning_constraints import PlanningConstraint, CollectionWindow
from app.core.security import hash_password, create_access_token


import uuid

@pytest_asyncio.fixture
async def planning_seed_data(db_session: AsyncSession):
    """Seeds test database with admin, driver, analyst, vehicle, and bins for planning tests."""
    uid = uuid.uuid4().hex[:6]
    # 1. Admin
    admin = User(
        email=f"admin_plan_{uid}@wastewise.ai",
        password_hash=hash_password("Admin@123"),
        first_name="Admin",
        last_name="Planner",
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
    )
    # 2. Driver
    driver = User(
        email=f"driver_plan_{uid}@wastewise.ai",
        password_hash=hash_password("Driver@123"),
        first_name="Driver",
        last_name="Field",
        role=UserRole.DRIVER,
        status=UserStatus.ACTIVE,
    )
    # 3. Analyst
    analyst = User(
        email=f"analyst_plan_{uid}@wastewise.ai",
        password_hash=hash_password("Analyst@123"),
        first_name="Analyst",
        last_name="Reviewer",
        role=UserRole.ANALYST,
        status=UserStatus.ACTIVE,
    )
    db_session.add_all([admin, driver, analyst])
    await db_session.flush()

    # 4. Vehicle
    veh = Vehicle(
        vehicle_code=f"VPLAN-{uid}",
        name="Test Compactor 01",
        vehicle_type=VehicleType.COMPACTOR,
        registration_number=f"GJ-01-PL-{uid}",
        capacity_kg=1200.0,
        energy_type=EnergyType.DIESEL,
        status=VehicleStatus.AVAILABLE,
        zone="Central Zone",
        driver_id=driver.id,
        latitude=22.3072,
        longitude=73.1812,
    )
    db_session.add(veh)
    await db_session.flush()

    # 5. Bins
    bin1 = Bin(
        bin_code=f"BPLAN-101-{uid}",
        name="Central Bin 101",
        bin_type=BinType.COMMERCIAL,
        waste_type=WasteType.OTHER,
        capacity_liters=1100.0,
        capacity_kg=240.0,
        fill_level=85.0,
        status=BinStatus.CRITICAL,
        priority=CollectionPriority.CRITICAL,
        zone="Central Zone",
        latitude=22.3080,
        longitude=73.1820,
    )
    bin2 = Bin(
        bin_code=f"BPLAN-102-{uid}",
        name="Central Bin 102",
        bin_type=BinType.SMART,
        waste_type=WasteType.PLASTIC,
        capacity_liters=1100.0,
        capacity_kg=240.0,
        fill_level=75.0,
        status=BinStatus.NORMAL,
        priority=CollectionPriority.HIGH,
        zone="Central Zone",
        latitude=22.3090,
        longitude=73.1830,
    )
    db_session.add_all([bin1, bin2])
    await db_session.commit()

    return {
        "admin": admin,
        "driver": driver,
        "analyst": analyst,
        "vehicle": veh,
        "bin1": bin1,
        "bin2": bin2,
    }


def auth_header(user: User) -> dict:
    token = create_access_token(subject=str(user.uuid), role=user.role.value)
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_get_planning_summary(client: AsyncClient, planning_seed_data):
    admin = planning_seed_data["admin"]
    resp = await client.get("/api/v1/planning/summary", headers=auth_header(admin))
    assert resp.status_code == 200
    data = resp.json()
    assert "bins_requiring_collection" in data
    assert "available_vehicles" in data
    assert "available_drivers" in data
    assert data["available_vehicles"] >= 1
    assert data["available_drivers"] >= 1


@pytest.mark.asyncio
async def test_get_available_resources(client: AsyncClient, planning_seed_data):
    admin = planning_seed_data["admin"]
    # Vehicles
    res_v = await client.get("/api/v1/planning/available-vehicles", headers=auth_header(admin))
    assert res_v.status_code == 200
    vehs = res_v.json()
    assert any(v["vehicle_code"] == planning_seed_data["vehicle"].vehicle_code for v in vehs)

    # Drivers
    res_d = await client.get("/api/v1/planning/available-drivers", headers=auth_header(admin))
    assert res_d.status_code == 200
    drvs = res_d.json()
    assert any(d["email"] == planning_seed_data["driver"].email for d in drvs)


@pytest.mark.asyncio
async def test_optimization_preview(client: AsyncClient, planning_seed_data):
    admin = planning_seed_data["admin"]
    bin1 = planning_seed_data["bin1"]
    bin2 = planning_seed_data["bin2"]
    veh = planning_seed_data["vehicle"]

    payload = {
        "bin_ids": [bin1.id, bin2.id],
        "vehicle_ids": [veh.id],
        "strategy": "BALANCED",
        "max_utilization": 90.0,
        "max_stops": 30,
    }
    resp = await client.post("/api/v1/planning/optimization-preview", json=payload, headers=auth_header(admin))
    assert resp.status_code == 200
    data = resp.json()
    assert data["strategy"] == "BALANCED"
    assert data["assigned_bins_count"] == 2
    assert len(data["proposed_routes"]) >= 1


@pytest.mark.asyncio
async def test_plan_lifecycle_and_handover(client: AsyncClient, planning_seed_data):
    admin = planning_seed_data["admin"]
    bin1 = planning_seed_data["bin1"]
    bin2 = planning_seed_data["bin2"]

    # 1. Create plan
    create_payload = {
        "planning_date": str(date.today()),
        "horizon": "TODAY",
        "strategy": "BALANCED",
        "bin_ids": [bin1.id, bin2.id],
    }
    res_c = await client.post("/api/v1/planning/plans", json=create_payload, headers=auth_header(admin))
    assert res_c.status_code == 201
    plan = res_c.json()
    plan_id = plan["id"]
    assert plan["status"] == "DRAFT"
    assert plan["total_bins"] == 2

    # 2. Calculate and optimize plan
    res_calc = await client.post(f"/api/v1/planning/plans/{plan_id}/calculate", headers=auth_header(admin))
    assert res_calc.status_code == 200
    calc_plan = res_calc.json()
    assert calc_plan["status"] in ["READY", "DRAFT"]
    assert len(calc_plan["proposals"]) >= 1

    # 3. Generate actual routes from proposal handover
    res_gen = await client.post(f"/api/v1/planning/plans/{plan_id}/generate", headers=auth_header(admin))
    assert res_gen.status_code == 200
    gen_data = res_gen.json()
    assert len(gen_data["routes"]) >= 1
    assert "Successfully generated" in gen_data["message"]


@pytest.mark.asyncio
async def test_constraints_and_windows_api(client: AsyncClient, planning_seed_data):
    admin = planning_seed_data["admin"]
    # Get constraints
    res_c = await client.get("/api/v1/planning/constraints", headers=auth_header(admin))
    assert res_c.status_code == 200
    cdata = res_c.json()
    assert cdata["max_vehicle_utilization"] == 90.0

    # Update constraints weights (must sum to 100)
    upd_payload = {
        "max_vehicle_utilization": 85.0,
        "distance_weight": 25,
        "capacity_weight": 25,
        "priority_weight": 25,
        "time_weight": 25,
    }
    res_upd = await client.patch("/api/v1/planning/constraints", json=upd_payload, headers=auth_header(admin))
    assert res_upd.status_code == 200
    assert res_upd.json()["max_vehicle_utilization"] == 85.0

    # Get collection windows
    res_w = await client.get("/api/v1/planning/windows", headers=auth_header(admin))
    assert res_w.status_code == 200
    wins = res_w.json()
    assert len(wins) >= 3


@pytest.mark.asyncio
async def test_planning_rbac(client: AsyncClient, planning_seed_data):
    driver = planning_seed_data["driver"]
    # Driver attempting to create a plan (Should be forbidden 403)
    create_payload = {
        "planning_date": str(date.today()),
        "horizon": "TODAY",
        "strategy": "BALANCED",
    }
    resp = await client.post("/api/v1/planning/plans", json=create_payload, headers=auth_header(driver))
    assert resp.status_code == 403
