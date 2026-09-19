import uuid
from datetime import datetime, timezone, timedelta
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.models.user import User, UserRole, UserStatus
from app.models.bin import Bin, BinType, WasteType, BinStatus
from app.models.alert import Alert, AlertActivity


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
        waste_type=WasteType.ORGANIC,
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


@pytest.mark.asyncio
async def test_admin_create_alert_success(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    bin_obj = await create_test_bin(db_session)

    payload = {
        "title": "Severe Bin Overflow Warning",
        "description": "Bin is overflowing in Central Zone",
        "category": "BIN",
        "severity": "CRITICAL",
        "source": "Sensor",
        "entityType": "BIN",
        "entityId": bin_obj.bin_code,
        "location": "Downtown Square",
        "zone": "Central Zone",
        "aiGenerated": False,
        "recommendedAction": "Dispatch collection truck immediately",
    }

    response = await client.post(
        "/api/v1/admin/alerts",
        json=payload,
        headers=auth_header(admin),
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Severe Bin Overflow Warning"
    assert data["category"] == "BIN"
    assert data["severity"] == "CRITICAL"
    assert data["status"] == "ACTIVE"
    assert data["entityType"] == "BIN"
    assert data["entityId"] == bin_obj.bin_code
    assert data["alertCode"].startswith("ALT-")
    assert data["isRead"] is False
    assert len(data["activityLog"]) >= 1
    assert data["activityLog"][0]["action"] == "CREATED"


@pytest.mark.asyncio
async def test_alert_deduplication_prevents_spam(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)
    bin_obj = await create_test_bin(db_session)

    payload = {
        "title": "Fill Level Exceeded 90%",
        "description": "Critical fill level detected",
        "category": "BIN",
        "severity": "CRITICAL",
        "source": "Sensor",
        "entityType": "BIN",
        "entityId": bin_obj.bin_code,
    }

    # First creation
    res1 = await client.post("/api/v1/admin/alerts", json=payload, headers=auth_header(admin))
    assert res1.status_code == 201
    alert1 = res1.json()

    # Second creation immediately after for same entity & category
    res2 = await client.post("/api/v1/admin/alerts", json=payload, headers=auth_header(admin))
    assert res2.status_code == 200 or res2.status_code == 201
    alert2 = res2.json()

    # Must return the existing active alert, not duplicate ID
    assert alert2["id"] == alert1["id"]
    assert alert2["alertCode"] == alert1["alertCode"]


@pytest.mark.asyncio
async def test_list_alerts_with_filtering_and_pagination(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    # Create 3 alerts with distinct severities
    for sev in ["CRITICAL", "HIGH", "LOW"]:
        await client.post(
            "/api/v1/admin/alerts",
            json={
                "title": f"Test Alert {sev}",
                "description": f"Details for {sev}",
                "category": "SYSTEM",
                "severity": sev,
                "source": "System",
                "entityType": "SYSTEM",
                "entityId": f"SYS-{sev}",
            },
            headers=auth_header(admin),
        )

    # Query all
    res = await client.get("/api/v1/admin/alerts?page=1&pageSize=10", headers=auth_header(admin))
    assert res.status_code == 200
    body = res.json()
    assert "items" in body
    assert body["total"] >= 3
    assert body["page"] == 1

    # Filter by severity
    res_crit = await client.get("/api/v1/admin/alerts?severity=CRITICAL", headers=auth_header(admin))
    assert res_crit.status_code == 200
    crit_body = res_crit.json()
    assert all(item["severity"] == "CRITICAL" for item in crit_body["items"])

    # Search filter
    res_search = await client.get("/api/v1/admin/alerts?search=Test Alert HIGH", headers=auth_header(admin))
    assert res_search.status_code == 200
    search_body = res_search.json()
    assert len(search_body["items"]) >= 1
    assert "HIGH" in search_body["items"][0]["title"]


@pytest.mark.asyncio
async def test_alert_summary_kpis(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    # Ensure at least 1 critical and 1 AI alert exist
    await client.post(
        "/api/v1/admin/alerts",
        json={
            "title": "AI Predictive Overflow",
            "description": "Model predicts overflow in 30m",
            "category": "PREDICTION",
            "severity": "CRITICAL",
            "source": "AI",
            "entityType": "BIN",
            "entityId": "BIN-PRED-99",
            "aiGenerated": True,
        },
        headers=auth_header(admin),
    )

    res = await client.get("/api/v1/admin/alerts/summary", headers=auth_header(admin))
    assert res.status_code == 200
    summary = res.json()
    assert "active" in summary
    assert "critical" in summary
    assert "unacknowledged" in summary
    assert "resolvedToday" in summary
    assert "aiAlerts" in summary
    assert "unread" in summary
    assert "total" in summary
    assert summary["active"] >= 1
    assert summary["critical"] >= 1
    assert summary["aiAlerts"] >= 1


@pytest.mark.asyncio
async def test_alert_trends_and_categories(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    # Trends
    res_trends = await client.get("/api/v1/admin/alerts/trends", headers=auth_header(admin))
    assert res_trends.status_code == 200
    trends_body = res_trends.json()
    assert "trends" in trends_body
    assert len(trends_body["trends"]) == 7

    # Categories
    res_cats = await client.get("/api/v1/admin/alerts/categories", headers=auth_header(admin))
    assert res_cats.status_code == 200
    cats_body = res_cats.json()
    assert "categories" in cats_body
    assert len(cats_body["categories"]) >= 1
    assert "name" in cats_body["categories"][0]
    assert "count" in cats_body["categories"][0]
    assert "percentage" in cats_body["categories"][0]


@pytest.mark.asyncio
async def test_acknowledge_alert_lifecycle(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    create_res = await client.post(
        "/api/v1/admin/alerts",
        json={
            "title": "Alert to Acknowledge",
            "description": "Testing acknowledge transition",
            "category": "VEHICLE",
            "severity": "HIGH",
            "source": "Vehicle",
            "entityType": "VEHICLE",
            "entityId": "VH-999",
        },
        headers=auth_header(admin),
    )
    alert_id = create_res.json()["id"]

    # Acknowledge
    ack_res = await client.post(
        f"/api/v1/admin/alerts/{alert_id}/acknowledge",
        json={"note": "Assigned technician to review"},
        headers=auth_header(admin),
    )
    assert ack_res.status_code == 200
    ack_data = ack_res.json()
    assert ack_data["status"] == "ACKNOWLEDGED"
    assert ack_data["acknowledgedAt"] is not None
    assert ack_data["acknowledgedBy"] == admin.email

    # Check activity log in details
    detail_res = await client.get(f"/api/v1/admin/alerts/{alert_id}", headers=auth_header(admin))
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    actions = [act["action"] for act in detail_data["activityLog"]]
    assert "CREATED" in actions
    assert "ACKNOWLEDGED" in actions


@pytest.mark.asyncio
async def test_resolve_alert_lifecycle(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    create_res = await client.post(
        "/api/v1/admin/alerts",
        json={
            "title": "Alert to Resolve",
            "description": "Testing resolution transition",
            "category": "BIN",
            "severity": "CRITICAL",
            "source": "Sensor",
            "entityType": "BIN",
            "entityId": "BIN-RES-1",
        },
        headers=auth_header(admin),
    )
    alert_id = create_res.json()["id"]

    # Resolve
    res_res = await client.post(
        f"/api/v1/admin/alerts/{alert_id}/resolve",
        json={"resolutionNote": "Bin was collected and compacted. Normal level restored."},
        headers=auth_header(admin),
    )
    assert res_res.status_code == 200
    res_data = res_res.json()
    assert res_data["status"] == "RESOLVED"
    assert res_data["resolvedAt"] is not None
    assert res_data["resolvedBy"] == admin.email
    assert res_data["resolutionNote"] == "Bin was collected and compacted. Normal level restored."


@pytest.mark.asyncio
async def test_snooze_and_unsnooze_alert(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    create_res = await client.post(
        "/api/v1/admin/alerts",
        json={
            "title": "Alert to Snooze",
            "description": "Testing snooze transition",
            "category": "SENSOR",
            "severity": "MEDIUM",
            "source": "Sensor",
            "entityType": "SENSOR",
            "entityId": "SENS-SNZ-1",
        },
        headers=auth_header(admin),
    )
    alert_id = create_res.json()["id"]

    # Snooze for 4 hours
    snooze_target = (datetime.now(timezone.utc) + timedelta(hours=4)).isoformat()
    snz_res = await client.post(
        f"/api/v1/admin/alerts/{alert_id}/snooze",
        json={"snoozeUntil": snooze_target, "note": "Waiting on maintenance window"},
        headers=auth_header(admin),
    )
    assert snz_res.status_code == 200
    snz_data = snz_res.json()
    assert snz_data["status"] == "SNOOZED"
    assert snz_data["snoozedUntil"] is not None

    # Unsnooze
    unsnz_res = await client.post(
        f"/api/v1/admin/alerts/{alert_id}/unsnooze",
        headers=auth_header(admin),
    )
    assert unsnz_res.status_code == 200
    unsnz_data = unsnz_res.json()
    assert unsnz_data["status"] == "ACTIVE"
    assert unsnz_data["snoozedUntil"] is None


@pytest.mark.asyncio
async def test_mark_as_read_and_mark_all_read(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    create_res = await client.post(
        "/api/v1/admin/alerts",
        json={
            "title": "Unread Alert",
            "description": "Testing read state",
            "category": "ROUTE",
            "severity": "LOW",
            "source": "Route",
            "entityType": "ROUTE",
            "entityId": "RT-UNREAD",
        },
        headers=auth_header(admin),
    )
    alert_id = create_res.json()["id"]
    assert create_res.json()["isRead"] is False

    # Mark single as read
    read_res = await client.post(
        f"/api/v1/admin/alerts/{alert_id}/read",
        headers=auth_header(admin),
    )
    assert read_res.status_code == 200
    assert read_res.json()["isRead"] is True

    # Mark all read
    all_read_res = await client.post(
        "/api/v1/admin/alerts/mark-all-read",
        headers=auth_header(admin),
    )
    assert all_read_res.status_code == 200
    assert all_read_res.json()["success"] is True


@pytest.mark.asyncio
async def test_bulk_actions(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    res1 = await client.post(
        "/api/v1/admin/alerts",
        json={"title": "Bulk 1", "description": "D1", "category": "BIN", "severity": "HIGH", "source": "System", "entityType": "BIN", "entityId": "B-B1"},
        headers=auth_header(admin),
    )
    res2 = await client.post(
        "/api/v1/admin/alerts",
        json={"title": "Bulk 2", "description": "D2", "category": "BIN", "severity": "HIGH", "source": "System", "entityType": "BIN", "entityId": "B-B2"},
        headers=auth_header(admin),
    )
    id1 = res1.json()["id"]
    id2 = res2.json()["id"]

    # Bulk acknowledge
    bulk_ack = await client.post(
        "/api/v1/admin/alerts/bulk",
        json={"alertIds": [id1, id2], "action": "acknowledge", "note": "Batch triage"},
        headers=auth_header(admin),
    )
    assert bulk_ack.status_code == 200
    assert bulk_ack.json()["affected"] == 2

    # Bulk resolve
    bulk_res = await client.post(
        "/api/v1/admin/alerts/bulk",
        json={"alertIds": [id1, id2], "action": "resolve", "note": "Batch resolve"},
        headers=auth_header(admin),
    )
    assert bulk_res.status_code == 200
    assert bulk_res.json()["affected"] == 2


@pytest.mark.asyncio
async def test_rbac_analyst_can_read_but_cannot_mutate(client: AsyncClient, db_session: AsyncSession):
    analyst = await create_test_user(db_session, role=UserRole.ANALYST)

    # Analyst can read summary
    res_sum = await client.get("/api/v1/admin/alerts/summary", headers=auth_header(analyst))
    assert res_sum.status_code == 200

    # Analyst can read list
    res_list = await client.get("/api/v1/admin/alerts", headers=auth_header(analyst))
    assert res_list.status_code == 200

    # Analyst CANNOT create alert (403)
    res_create = await client.post(
        "/api/v1/admin/alerts",
        json={"title": "Unauthorized", "description": "X", "category": "BIN", "severity": "LOW", "source": "System", "entityType": "BIN", "entityId": "BX"},
        headers=auth_header(analyst),
    )
    assert res_create.status_code == 403


@pytest.mark.asyncio
async def test_rbac_driver_is_forbidden_from_admin_alerts(client: AsyncClient, db_session: AsyncSession):
    driver = await create_test_user(db_session, role=UserRole.DRIVER)

    res = await client.get("/api/v1/admin/alerts", headers=auth_header(driver))
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_unauthenticated_request_rejected(client: AsyncClient):
    res = await client.get("/api/v1/admin/alerts")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_unknown_alert_returns_404(client: AsyncClient, db_session: AsyncSession):
    admin = await create_test_user(db_session, role=UserRole.ADMIN)

    res = await client.get("/api/v1/admin/alerts/9999999", headers=auth_header(admin))
    assert res.status_code == 404
