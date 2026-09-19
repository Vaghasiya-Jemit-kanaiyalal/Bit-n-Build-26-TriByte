import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.models.user import User, UserRole, UserStatus
from app.models.organization import Organization


async def create_test_user(
    db: AsyncSession,
    role: UserRole = UserRole.ADMIN,
    status: UserStatus = UserStatus.ACTIVE,
    first_name: str = "Test",
    last_name: str = "Admin",
    email: str | None = None,
) -> User:
    unique_str = uuid.uuid4().hex[:6]
    user = User(
        uuid=uuid.uuid4(),
        first_name=first_name,
        last_name=last_name,
        email=email or f"user_{unique_str}@wastewise.ai",
        password_hash=hash_password("Password123!"),
        role=role,
        status=status,
        phone="+91 98765 00000",
        department="Municipal Operations",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


def auth_header(user: User) -> dict[str, str]:
    token = create_access_token(str(user.uuid), user.role.value)
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_get_organization_admin_success(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    headers = auth_header(admin)

    resp = await client.get("/api/v1/admin/settings/organization", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == "WW-ORG-001"
    assert "name" in data
    assert "department" in data
    assert "operatingRegion" in data
    assert isinstance(data["operatingZones"], list)
    assert "defaultTimezone" in data
    assert "defaultCurrency" in data
    assert "contactEmail" in data
    assert "contactPhone" in data
    assert "address" in data
    assert data["status"] in ["Operational", "Degraded", "Maintenance"]
    assert "activeSince" in data
    assert "lastUpdated" in data


@pytest.mark.asyncio
async def test_patch_organization_admin_success(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    headers = auth_header(admin)

    update_payload = {
        "name": "Vadodara Clean City Corp",
        "department": "Smart Waste Solutions",
        "operatingRegion": "Gujarat Central Division",
        "contactEmail": "central@cleancity.gov.in",
        "contactPhone": "+91 265 1234567",
        "address": "Civic Centre, Alkapuri, Vadodara",
    }
    resp = await client.patch("/api/v1/admin/settings/organization", json=update_payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Vadodara Clean City Corp"
    assert data["department"] == "Smart Waste Solutions"
    assert data["operatingRegion"] == "Gujarat Central Division"
    assert data["contactEmail"] == "central@cleancity.gov.in"
    assert data["contactPhone"] == "+91 265 1234567"
    assert data["address"] == "Civic Centre, Alkapuri, Vadodara"

    # Verify GET returns updated values
    get_resp = await client.get("/api/v1/admin/settings/organization", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "Vadodara Clean City Corp"


@pytest.mark.asyncio
async def test_patch_organization_validation_error(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    headers = auth_header(admin)

    # Invalid email format
    resp = await client.patch(
        "/api/v1/admin/settings/organization",
        json={"contactEmail": "not-an-email"},
        headers=headers,
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_organization_rbac_restrictions(client: AsyncClient, db_session: AsyncSession):
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    analyst = await create_test_user(db_session, role=UserRole.ANALYST)

    # Driver should be forbidden
    resp_driver = await client.get("/api/v1/admin/settings/organization", headers=auth_header(driver))
    assert resp_driver.status_code == 403

    # Analyst should be forbidden
    resp_analyst = await client.get("/api/v1/admin/settings/organization", headers=auth_header(analyst))
    assert resp_analyst.status_code == 403

    # Unauthenticated should be 401
    resp_anon = await client.get("/api/v1/admin/settings/organization")
    assert resp_anon.status_code == 401


@pytest.mark.asyncio
async def test_get_profile_admin_success(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(
        db_session,
        role=UserRole.ADMIN,
        first_name="Yug",
        last_name="Patel",
        email="yug_admin_test@wastewise.ai",
    )
    headers = auth_header(admin)

    resp = await client.get("/api/v1/admin/settings/profile", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["firstName"] == "Yug"
    assert data["lastName"] == "Patel"
    assert data["email"] == "yug_admin_test@wastewise.ai"
    assert data["role"] == "ADMIN"
    assert "roleTitle" in data
    assert "department" in data
    assert "zone" in data
    assert "lastLogin" in data
    assert "lastActive" in data
    assert "accountCreated" in data
    assert "currentSession" in data

    # Never expose sensitive fields
    assert "password" not in data
    assert "password_hash" not in data
    assert "passwordHash" not in data
    assert "token" not in data


@pytest.mark.asyncio
async def test_patch_profile_admin_success(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    headers = auth_header(admin)

    new_email = f"updated_{uuid.uuid4().hex[:6]}@wastewise.ai"
    update_payload = {
        "firstName": "Super",
        "lastName": "AdminUpdated",
        "email": new_email,
        "phone": "+91 91234 56789",
    }
    resp = await client.patch("/api/v1/admin/settings/profile", json=update_payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["firstName"] == "Super"
    assert data["lastName"] == "AdminUpdated"
    assert data["email"] == new_email
    assert data["phone"] == "+91 91234 56789"
    assert data["role"] == "ADMIN"  # Role cannot be modified

    # Sensitive fields protected
    assert "password_hash" not in data
    assert "passwordHash" not in data


@pytest.mark.asyncio
async def test_patch_profile_duplicate_email_conflict(client: AsyncClient, db_session: AsyncSession):
    user1 = await create_test_user(db_session, role=UserRole.ADMIN, email="user1_admin@wastewise.ai")
    user2 = await create_test_user(db_session, role=UserRole.ADMIN, email="user2_admin@wastewise.ai")

    # user2 tries to change their email to user1's email
    resp = await client.patch(
        "/api/v1/admin/settings/profile",
        json={"email": "user1_admin@wastewise.ai"},
        headers=auth_header(user2),
    )
    assert resp.status_code == 400
    assert "already in use" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_profile_rbac_restrictions(client: AsyncClient, db_session: AsyncSession):
    driver = await create_test_user(db_session, role=UserRole.DRIVER)
    analyst = await create_test_user(db_session, role=UserRole.ANALYST)

    resp_driver = await client.get("/api/v1/admin/settings/profile", headers=auth_header(driver))
    assert resp_driver.status_code == 403

    resp_analyst = await client.get("/api/v1/admin/settings/profile", headers=auth_header(analyst))
    assert resp_analyst.status_code == 403

    resp_anon = await client.get("/api/v1/admin/settings/profile")
    assert resp_anon.status_code == 401


@pytest.mark.asyncio
async def test_get_profile_activity_admin_success(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    headers = auth_header(admin)

    resp = await client.get("/api/v1/admin/settings/profile/activity", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "activities" in data
    assert "total" in data
    assert isinstance(data["activities"], list)
    assert data["total"] >= 1
    item = data["activities"][0]
    assert "id" in item
    assert "action" in item
    assert "description" in item
    assert "timestamp" in item
