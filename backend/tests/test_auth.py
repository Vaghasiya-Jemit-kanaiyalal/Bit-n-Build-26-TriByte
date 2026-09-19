import uuid
from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    generate_password_reset_raw_token,
    hash_password,
    hash_reset_token,
)
from app.models.password_reset import PasswordResetToken
from app.models.user import User, UserRole, UserStatus


@pytest.mark.asyncio
async def test_01_register_user_default_viewer(client: AsyncClient):
    """1. Test public registration automatically assigns VIEWER role without role selection."""
    payload = {
        "full_name": "Public Viewer",
        "email": "public_viewer@wastewise.ai",
        "password": "SecurePassword123!",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "Account created successfully."
    assert data["user"]["email"] == "public_viewer@wastewise.ai"
    assert data["user"]["role"] == "VIEWER"
    assert data["user"]["status"] == "ACTIVE"
    assert data["user"]["first_name"] == "Public"
    assert data["user"]["last_name"] == "Viewer"
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]


@pytest.mark.asyncio
async def test_02_register_duplicate_email(client: AsyncClient):
    """2. Test duplicate email registration rejection."""
    payload = {
        "full_name": "Another Viewer",
        "email": "public_viewer@wastewise.ai",
        "password": "SecurePassword123!",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_03_invalid_registration(client: AsyncClient):
    """3. Test registration with invalid data (weak password & invalid email)."""
    weak_pwd_payload = {
        "full_name": "Weak User",
        "email": "weak@wastewise.ai",
        "password": "123",  # Too short
    }
    res1 = await client.post("/api/v1/auth/register", json=weak_pwd_payload)
    assert res1.status_code == 422

    invalid_email_payload = {
        "full_name": "Invalid Email",
        "email": "not-an-email",
        "password": "SecurePassword123!",
    }
    res2 = await client.post("/api/v1/auth/register", json=invalid_email_payload)
    assert res2.status_code == 422


@pytest.mark.asyncio
async def test_04_login_success(client: AsyncClient):
    """4. Test successful login returning JWT token pair and resolving role from DB."""
    login_payload = {
        "email": "public_viewer@wastewise.ai",
        "password": "SecurePassword123!",
    }
    response = await client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "public_viewer@wastewise.ai"
    assert data["user"]["role"] == "VIEWER"
    assert data["user"]["status"] == "ACTIVE"


@pytest.mark.asyncio
async def test_05_login_failure(client: AsyncClient):
    """5. Test login failure with incorrect credentials."""
    login_payload = {
        "email": "public_viewer@wastewise.ai",
        "password": "WrongPassword!",
    }
    response = await client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "invalid email or password" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_06_jwt_validation_and_tampering(client: AsyncClient):
    """6. Test rejection of invalid, forged, or tampered JWT access tokens."""
    res_no_auth = await client.get("/api/v1/auth/me")
    assert res_no_auth.status_code == 401

    res_tampered = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.fake.token"}
    )
    assert res_tampered.status_code == 401


@pytest.mark.asyncio
async def test_07_auth_me_endpoint(client: AsyncClient):
    """7. Test /api/v1/auth/me returns current authenticated user."""
    login_payload = {
        "email": "public_viewer@wastewise.ai",
        "password": "SecurePassword123!",
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    access_token = login_res.json()["access_token"]

    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "public_viewer@wastewise.ai"
    assert data["role"] == "VIEWER"


@pytest.mark.asyncio
async def test_08_admin_user_management_crud(client: AsyncClient, db_session: AsyncSession):
    """8. Test Admin User Management: Create User, Change Role, Suspend, Activate, Delete."""
    # 1. Create an admin
    admin_user = User(
        uuid=uuid.uuid4(),
        first_name="Super",
        last_name="Admin",
        email="super_admin@wastewise.ai",
        password_hash=hash_password("AdminPass123!"),
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
    )
    db_session.add(admin_user)
    await db_session.commit()

    admin_token = create_access_token(subject=str(admin_user.uuid), role="ADMIN")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Admin creates a new Collector user with temporary password
    create_payload = {
        "first_name": "Test",
        "last_name": "Collector",
        "email": "test_collector@driver.gmail.com",
        "phone": "+91 99999 11111",
        "role": "DRIVER",
        "status": "ACTIVE",
        "organization": "Fleet Ops",
        "department": "North Zone Logistics",
        "temporary_password": "TempPassword123!",
    }
    res_create = await client.post("/api/v1/users", json=create_payload, headers=admin_headers)
    assert res_create.status_code == 201
    created_user = res_create.json()
    user_id = created_user["id"]
    assert created_user["role"] == "DRIVER"
    assert created_user["email"] == "test_collector@driver.gmail.com"

    # 3. Verify newly created user can log in with temporary password
    res_login = await client.post("/api/v1/auth/login", json={
        "email": "test_collector@driver.gmail.com",
        "password": "TempPassword123!",
    })
    assert res_login.status_code == 200
    assert res_login.json()["user"]["role"] == "DRIVER"

    # 4. Admin changes role to ANALYST
    res_role = await client.patch(
        f"/api/v1/users/{user_id}/role",
        json={"role": "ANALYST"},
        headers=admin_headers,
    )
    assert res_role.status_code == 200
    assert res_role.json()["role"] == "ANALYST"

    # Next login returns new role ANALYST
    res_relogin = await client.post("/api/v1/auth/login", json={
        "email": "test_collector@driver.gmail.com",
        "password": "TempPassword123!",
    })
    assert res_relogin.status_code == 200
    assert res_relogin.json()["user"]["role"] == "ANALYST"

    # 5. Admin suspends the user
    res_suspend = await client.patch(
        f"/api/v1/users/{user_id}/status",
        json={"status": "SUSPENDED"},
        headers=admin_headers,
    )
    assert res_suspend.status_code == 200
    assert res_suspend.json()["status"] == "SUSPENDED"

    # Suspended user login MUST be blocked (403 Forbidden)
    res_blocked = await client.post("/api/v1/auth/login", json={
        "email": "test_collector@wastewise.ai",
        "password": "TempPassword123!",
    })
    assert res_blocked.status_code == 403
    assert "suspended" in res_blocked.json()["detail"].lower()

    # 6. Admin reactivates the user
    res_activate = await client.patch(
        f"/api/v1/users/{user_id}/status",
        json={"status": "ACTIVE"},
        headers=admin_headers,
    )
    assert res_activate.status_code == 200
    assert res_activate.json()["status"] == "ACTIVE"

    # 7. Admin resets user password
    res_new_pwd = await client.post(
        f"/api/v1/users/{user_id}/change-password",
        json={"new_password": "NewSecretPassword2026!"},
        headers=admin_headers,
    )
    assert res_new_pwd.status_code == 200

    # User logs in with new password
    res_pwd_login = await client.post("/api/v1/auth/login", json={
        "email": "test_collector@wastewise.ai",
        "password": "NewSecretPassword2026!",
    })
    assert res_pwd_login.status_code == 200

    # 8. Admin deletes user
    res_del = await client.delete(f"/api/v1/users/{user_id}", headers=admin_headers)
    assert res_del.status_code == 200


@pytest.mark.asyncio
async def test_09_refresh_token_flow(client: AsyncClient):
    """9. Test refreshing access token using refresh token."""
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "public_viewer@wastewise.ai",
        "password": "SecurePassword123!",
    })
    tokens = login_res.json()
    refresh_token = tokens["refresh_token"]

    ref_res = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert ref_res.status_code == 200
    ref_data = ref_res.json()
    assert "access_token" in ref_data
    assert "refresh_token" in ref_data


@pytest.mark.asyncio
async def test_10_forgot_password_generic_response(client: AsyncClient):
    """10. Test forgot password generic response."""
    res1 = await client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "public_viewer@wastewise.ai"}
    )
    assert res1.status_code == 200
    assert "password reset instructions have been sent" in res1.json()["message"].lower()


@pytest.mark.asyncio
async def test_11_reset_password_success(client: AsyncClient, db_session: AsyncSession):
    """11. Test password reset success."""
    reset_user = User(
        uuid=uuid.uuid4(),
        first_name="Reset",
        last_name="User",
        email="reset_test@wastewise.ai",
        password_hash=hash_password("OldPassword123!"),
        role=UserRole.DRIVER,
        status=UserStatus.ACTIVE,
    )
    db_session.add(reset_user)
    await db_session.commit()

    raw_token = generate_password_reset_raw_token()
    token_record = PasswordResetToken(
        user_id=reset_user.id,
        token_hash=hash_reset_token(raw_token),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=30),
        used_at=None,
    )
    db_session.add(token_record)
    await db_session.commit()

    res = await client.post("/api/v1/auth/reset-password", json={
        "token": raw_token,
        "new_password": "BrandNewPassword2026!",
    })
    assert res.status_code == 200

    login_new = await client.post("/api/v1/auth/login", json={
        "email": "reset_test@wastewise.ai",
        "password": "BrandNewPassword2026!",
    })
    assert login_new.status_code == 200


@pytest.mark.asyncio
async def test_12_logout_endpoint(client: AsyncClient):
    """12. Test logout endpoint."""
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "public_viewer@wastewise.ai",
        "password": "SecurePassword123!",
    })
    token = login_res.json()["access_token"]
    res = await client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["message"] == "Successfully logged out."
