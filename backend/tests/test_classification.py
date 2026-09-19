import uuid
from datetime import datetime, timezone
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.models.user import User, UserRole, UserStatus
from app.models.bin import Bin, BinType, WasteType, BinStatus
from app.models.waste_classification import WasteClassification, ClassificationSource


async def create_test_user(
    db: AsyncSession,
    role: UserRole = UserRole.ADMIN,
    status: UserStatus = UserStatus.ACTIVE,
) -> User:
    unique_str = uuid.uuid4().hex[:6]
    user = User(
        uuid=uuid.uuid4(),
        first_name="Test",
        last_name=role.value,
        email=f"user_{unique_str}@wastewise.ai",
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
    waste_type: WasteType = WasteType.PLASTIC,
    code: str | None = None,
) -> Bin:
    unique_str = uuid.uuid4().hex[:6]
    bin_obj = Bin(
        uuid=uuid.uuid4(),
        bin_code=code or f"BIN-{unique_str}",
        name=f"Bin {unique_str}",
        bin_type=BinType.STANDARD,
        capacity_kg=100.0,
        current_fill_kg=50.0,
        current_fill_percentage=50.0,
        waste_type=waste_type,
        status=BinStatus.NORMAL,
        zone="Central Zone",
        location_name="Downtown Square",
        address="Test Address 123",
        latitude=22.3072,
        longitude=73.1812,
        is_active=True,
    )
    db.add(bin_obj)
    await db.commit()
    await db.refresh(bin_obj)
    return bin_obj


# ============================================================================
# 1. CORE CLASSIFICATION CREATION & ENGINE
# ============================================================================

@pytest.mark.asyncio
async def test_01_admin_can_create_single_classification(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    test_bin = await create_test_bin(db_session, waste_type=WasteType.PLASTIC)

    payload = {
        "bin_id": test_bin.id,
        "source": "IMAGE",
        "image_reference": "https://storage.wastewise.ai/samples/plastic_water_bottle.jpg",
        "metadata": {"camera_id": "CAM-01"},
    }

    response = await client.post(
        "/api/v1/admin/classification",
        json=payload,
        headers=auth_header(admin),
    )

    assert response.status_code == 201
    data = response.json()
    assert data["bin_id"] == test_bin.id
    assert data["bin_code"] == test_bin.bin_code
    assert data["waste_type"] == "PLASTIC"
    assert data["confidence"] > 0.8
    assert data["source"] == "IMAGE"
    assert data["model_name"] == "wastewise-vision-classifier"
    assert data["is_low_confidence"] is False
    assert data["review_required"] is False
    assert "id" in data
    assert "uuid" in data


@pytest.mark.asyncio
async def test_02_admin_can_create_manual_classification(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    test_bin = await create_test_bin(db_session)

    payload = {
        "bin_id": test_bin.id,
        "source": "MANUAL",
        "manual_waste_type": "GLASS",
        "manual_confidence": 0.95,
        "metadata": {"operator_badge": "OP-442"},
    }

    response = await client.post(
        "/api/v1/admin/classification",
        json=payload,
        headers=auth_header(admin),
    )

    assert response.status_code == 201
    data = response.json()
    assert data["waste_type"] == "GLASS"
    assert data["confidence"] == 0.95
    assert data["source"] == "MANUAL"
    assert data["model_name"] == "manual-operator"


@pytest.mark.asyncio
async def test_03_low_confidence_detection_sets_flags(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    test_bin = await create_test_bin(db_session)

    # image_reference contains "ambiguous" or "unknown" which mock engine marks with < 0.70
    payload = {
        "bin_id": test_bin.id,
        "source": "AI_MODEL",
        "image_reference": "https://storage.wastewise.ai/samples/ambiguous_mixed_rubble.jpg",
    }

    response = await client.post(
        "/api/v1/admin/classification",
        json=payload,
        headers=auth_header(admin),
    )

    assert response.status_code == 201
    data = response.json()
    assert data["is_low_confidence"] is True
    assert data["review_required"] is True
    assert data["confidence"] < 0.70


# ============================================================================
# 2. VALIDATION CHECKS
# ============================================================================

@pytest.mark.asyncio
async def test_04_invalid_waste_type_fails_validation(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    payload = {
        "source": "MANUAL",
        "manual_waste_type": "RADIOACTIVE_NUCLEAR",
    }

    response = await client.post(
        "/api/v1/admin/classification",
        json=payload,
        headers=auth_header(admin),
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_05_invalid_confidence_fails_validation(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    payload = {
        "source": "MANUAL",
        "manual_waste_type": "PLASTIC",
        "manual_confidence": 1.5,  # Must be between 0.0 and 1.0
    }

    response = await client.post(
        "/api/v1/admin/classification",
        json=payload,
        headers=auth_header(admin),
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_06_nonexistent_bin_id_returns_404(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    payload = {
        "bin_id": 999999,
        "source": "IMAGE",
    }

    response = await client.post(
        "/api/v1/admin/classification",
        json=payload,
        headers=auth_header(admin),
    )

    assert response.status_code == 404
    assert "Smart bin with ID 999999 does not exist" in response.json()["detail"]


# ============================================================================
# 3. BATCH CLASSIFICATION
# ============================================================================

@pytest.mark.asyncio
async def test_07_batch_classification(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    bin1 = await create_test_bin(db_session, waste_type=WasteType.PLASTIC)
    bin2 = await create_test_bin(db_session, waste_type=WasteType.PAPER)

    payload = {
        "items": [
            {"bin_id": bin1.id, "image_reference": "cardboard_box.jpg", "source": "IMAGE"},
            {"bin_id": bin2.id, "image_reference": "aluminum_can.png", "source": "IMAGE"},
        ]
    }

    response = await client.post(
        "/api/v1/admin/classification/batch",
        json=payload,
        headers=auth_header(admin),
    )

    assert response.status_code == 201
    results = response.json()
    assert isinstance(results, list)
    assert len(results) == 2
    assert results[0]["bin_id"] == bin1.id
    assert results[0]["waste_type"] == "PAPER"
    assert results[1]["bin_id"] == bin2.id
    assert results[1]["waste_type"] == "METAL"


# ============================================================================
# 4. SUMMARY & DISTRIBUTION
# ============================================================================

@pytest.mark.asyncio
async def test_08_classification_summary_and_distribution(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    # 1. Summary
    sum_res = await client.get("/api/v1/admin/classification/summary", headers=auth_header(admin))
    assert sum_res.status_code == 200
    sum_data = sum_res.json()
    assert "total_classifications" in sum_data
    assert "average_confidence" in sum_data
    assert "classifications_today" in sum_data
    assert "low_confidence_count" in sum_data

    # 2. Distribution
    dist_res = await client.get("/api/v1/admin/classification/distribution", headers=auth_header(admin))
    assert dist_res.status_code == 200
    dist_data = dist_res.json()
    assert "total" in dist_data
    assert "distribution" in dist_data
    types = [d["waste_type"] for d in dist_data["distribution"]]
    # Exactly all 6 types must be present
    for expected in ["PLASTIC", "PAPER", "METAL", "GLASS", "ORGANIC", "OTHER"]:
        assert expected in types


# ============================================================================
# 5. LIST, FILTERS & DETAILS
# ============================================================================

@pytest.mark.asyncio
async def test_09_list_classifications_with_filtering(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    # Filter by waste_type
    response = await client.get(
        "/api/v1/admin/classification?waste_type=PLASTIC&page=1&page_size=10",
        headers=auth_header(admin),
    )
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    for item in data["items"]:
        assert item["waste_type"] == "PLASTIC"


@pytest.mark.asyncio
async def test_10_bin_specific_classification_history(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    bin_obj = await create_test_bin(db_session)

    # Create classification for this bin
    await client.post(
        "/api/v1/admin/classification",
        json={"bin_id": bin_obj.id, "image_reference": "leaf_compost.jpg"},
        headers=auth_header(admin),
    )

    response = await client.get(
        f"/api/v1/admin/classification/bin/{bin_obj.id}",
        headers=auth_header(admin),
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert data["items"][0]["bin_id"] == bin_obj.id


@pytest.mark.asyncio
async def test_11_single_classification_by_id(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    created = (await client.post(
        "/api/v1/admin/classification",
        json={"image_reference": "beer_bottle_glass.jpg"},
        headers=auth_header(admin),
    )).json()

    rec_id = created["id"]
    response = await client.get(f"/api/v1/admin/classification/{rec_id}", headers=auth_header(admin))
    assert response.status_code == 200
    assert response.json()["id"] == rec_id


@pytest.mark.asyncio
async def test_12_nonexistent_classification_id_returns_404(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    response = await client.get("/api/v1/admin/classification/999999", headers=auth_header(admin))
    assert response.status_code == 404


# ============================================================================
# 6. RBAC PERMISSIONS
# ============================================================================

@pytest.mark.asyncio
async def test_13_analyst_has_read_access_but_cannot_create(client: AsyncClient, db_session: AsyncSession):
    analyst = await create_test_user(db_session, role=UserRole.ANALYST)

    # Analyst can read summary
    summary_res = await client.get("/api/v1/admin/classification/summary", headers=auth_header(analyst))
    assert summary_res.status_code == 200

    # Analyst can read distribution
    dist_res = await client.get("/api/v1/admin/classification/distribution", headers=auth_header(analyst))
    assert dist_res.status_code == 200

    # Analyst can read list
    list_res = await client.get("/api/v1/admin/classification", headers=auth_header(analyst))
    assert list_res.status_code == 200

    # Analyst CANNOT create new classification (requires ADMIN)
    post_res = await client.post(
        "/api/v1/admin/classification",
        json={"image_reference": "test.jpg"},
        headers=auth_header(analyst),
    )
    assert post_res.status_code == 403
    assert "ADMIN" in post_res.json()["detail"] or "Insufficient permissions" in post_res.json()["detail"]


@pytest.mark.asyncio
async def test_14_driver_cannot_access_admin_classification_management(client: AsyncClient, db_session: AsyncSession):
    driver = await create_test_user(db_session, role=UserRole.DRIVER)

    # Driver cannot read summary
    sum_res = await client.get("/api/v1/admin/classification/summary", headers=auth_header(driver))
    assert sum_res.status_code == 403

    # Driver cannot create
    post_res = await client.post(
        "/api/v1/admin/classification",
        json={"image_reference": "test.jpg"},
        headers=auth_header(driver),
    )
    assert post_res.status_code == 403


@pytest.mark.asyncio
async def test_15_unauthenticated_request_rejected(client: AsyncClient):
    response = await client.get("/api/v1/admin/classification/summary")
    assert response.status_code in [401, 403]
