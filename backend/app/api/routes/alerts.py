from typing import Any, Dict, List, Optional, Union
from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_admin, require_roles
from app.db.database import get_db
from app.models.user import User, UserRole
from app.schemas.alert import (
    AcknowledgeAlertRequest,
    AlertCategoriesResponse,
    AlertCreate,
    AlertItemResponse,
    AlertListResponse,
    AlertSummaryResponse,
    AlertTrendsResponse,
    AlertUpdate,
    BulkAlertActionRequest,
    ResolveAlertRequest,
    SnoozeAlertRequest,
)
from app.services.alert_service import AlertService

router = APIRouter(
    prefix="/admin/alerts",
    tags=["Admin Alerts"],
)


# ============================================================================
# 1. SUMMARY, TRENDS & CATEGORIES (ADMIN & ANALYST)
# ============================================================================

@router.get(
    "/summary",
    response_model=AlertSummaryResponse,
    summary="Get operational alert KPI summary",
    description="Returns aggregate counts: active, critical, unacknowledged, resolved today, AI alerts, unread, and total.",
)
async def get_alert_summary(
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST)),
    db: AsyncSession = Depends(get_db),
) -> AlertSummaryResponse:
    return await AlertService.get_summary(db)


@router.get(
    "/trends",
    response_model=AlertTrendsResponse,
    summary="Get alert severity trends over the last 7 days",
    description="Returns daily breakdowns across critical, high, medium, and low severity alerts.",
)
async def get_alert_trends(
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST)),
    db: AsyncSession = Depends(get_db),
) -> AlertTrendsResponse:
    return await AlertService.get_trends(db)


@router.get(
    "/categories",
    response_model=AlertCategoriesResponse,
    summary="Get alert distribution by category",
    description="Returns counts and percentages across operational categories: Bin, Route, Vehicle, Sensor, System.",
)
async def get_alert_categories(
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST)),
    db: AsyncSession = Depends(get_db),
) -> AlertCategoriesResponse:
    return await AlertService.get_categories(db)


# ============================================================================
# 2. LIST ALERTS WITH SEARCH & FILTERS (ADMIN & ANALYST)
# ============================================================================

@router.get(
    "",
    response_model=AlertListResponse,
    summary="List operational alerts",
    description="Retrieve paginated alerts with filtering by status, severity, category, source, zone, entity type, read flag, and free-text search.",
)
async def list_alerts(
    status: Optional[str] = Query(None, description="Filter by status: ACTIVE, ACKNOWLEDGED, SNOOZED, RESOLVED, UNREAD, or ALL"),
    severity: Optional[str] = Query(None, description="Filter by severity: CRITICAL, HIGH, MEDIUM, LOW, INFO, or All"),
    category: Optional[str] = Query(None, description="Filter by category: BIN, VEHICLE, ROUTE, SENSOR, PREDICTION, etc."),
    source: Optional[str] = Query(None, description="Filter by source: AI Prediction, Sensor, Route Engine, etc."),
    zone: Optional[str] = Query(None, description="Filter by operational zone"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type: BIN, VEHICLE, ROUTE, ZONE, SENSOR, SYSTEM"),
    is_read: Optional[bool] = Query(None, description="Filter by read state"),
    search: Optional[str] = Query(None, description="Search across alert code, title, description, entity ID, location, or zone"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_desc: bool = Query(True, description="Sort descending if true"),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST)),
    db: AsyncSession = Depends(get_db),
) -> AlertListResponse:
    return await AlertService.list_alerts(
        db=db,
        status_filter=status,
        severity_filter=severity,
        category_filter=category,
        source_filter=source,
        zone_filter=zone,
        entity_type_filter=entity_type,
        is_read_filter=is_read,
        search_query=search,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_desc=sort_desc,
    )


# ============================================================================
# 3. SINGLE ALERT DETAILS (ADMIN & ANALYST)
# ============================================================================

@router.get(
    "/{alert_id}",
    response_model=AlertItemResponse,
    summary="Get alert details by ID or code",
    description="Retrieve complete alert record including lifecycle timestamps, metadata, and chronological activity log.",
)
async def get_alert_by_id(
    alert_id: str = Path(..., description="Alert integer ID or alert_code string (e.g. ALT-2026-01087)"),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST)),
    db: AsyncSession = Depends(get_db),
) -> AlertItemResponse:
    return await AlertService.get_alert_by_id(db=db, identifier=alert_id)


# ============================================================================
# 4. MUTATION & ACTION ENDPOINTS (ADMIN ONLY)
# ============================================================================

@router.post(
    "",
    response_model=AlertItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create alert manually / via system",
    description="Generates an operational alert with automatic deduplication, standardized alert code, and initial activity log.",
)
async def create_alert(
    request: AlertCreate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AlertItemResponse:
    return await AlertService.create_alert(db=db, alert_in=request)


@router.post(
    "/{alert_id}/acknowledge",
    response_model=AlertItemResponse,
    summary="Acknowledge alert",
    description="Transitions alert state to ACKNOWLEDGED, sets acknowledged_at timestamp, marks as read, and records operator activity.",
)
async def acknowledge_alert(
    alert_id: str = Path(..., description="Alert ID or code"),
    request: Optional[AcknowledgeAlertRequest] = None,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AlertItemResponse:
    actor = request.acknowledged_by if (request and request.acknowledged_by) else (current_user.email or f"{current_user.first_name} {current_user.last_name}")
    note = request.note if request and request.note else "Alert acknowledged by operator"
    return await AlertService.acknowledge_alert(db=db, identifier=alert_id, actor=actor, note=note)


@router.post(
    "/{alert_id}/resolve",
    response_model=AlertItemResponse,
    summary="Resolve alert",
    description="Transitions alert state to RESOLVED, saves resolution note, sets resolved_at timestamp, and records operator activity.",
)
async def resolve_alert(
    alert_id: str = Path(..., description="Alert ID or code"),
    request: Optional[ResolveAlertRequest] = None,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AlertItemResponse:
    note = (request.resolution_note or request.note) if request else "Resolved by operational dispatch"
    actor = request.resolved_by if (request and request.resolved_by) else (current_user.email or f"{current_user.first_name} {current_user.last_name}")
    return await AlertService.resolve_alert(db=db, identifier=alert_id, note=note, actor=actor)


@router.post(
    "/{alert_id}/snooze",
    response_model=AlertItemResponse,
    summary="Snooze alert",
    description="Transitions alert state to SNOOZED until a target duration or timestamp.",
)
async def snooze_alert(
    alert_id: str = Path(..., description="Alert ID or code"),
    request: Optional[SnoozeAlertRequest] = None,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AlertItemResponse:
    duration = request.snooze_until if request and request.snooze_until else "1 hour"
    actor = current_user.email or f"{current_user.first_name} {current_user.last_name}"
    return await AlertService.snooze_alert(db=db, identifier=alert_id, duration_str=duration, actor=actor)


@router.post(
    "/{alert_id}/unsnooze",
    response_model=AlertItemResponse,
    summary="Un-snooze alert",
    description="Restores a SNOOZED alert back to ACTIVE state immediately.",
)
async def unsnooze_alert(
    alert_id: str = Path(..., description="Alert ID or code"),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AlertItemResponse:
    actor = current_user.email or f"{current_user.first_name} {current_user.last_name}"
    return await AlertService.unsnooze_alert(db=db, identifier=alert_id, actor=actor)


@router.post(
    "/{alert_id}/read",
    response_model=AlertItemResponse,
    summary="Mark alert as read",
    description="Marks a specific alert as read.",
)
async def mark_alert_read(
    alert_id: str = Path(..., description="Alert ID or code"),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AlertItemResponse:
    return await AlertService.mark_as_read(db=db, identifier=alert_id)


@router.post(
    "/mark-all-read",
    summary="Mark all alerts as read",
    description="Marks all unread alerts across the platform as read.",
)
async def mark_all_alerts_read(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    return await AlertService.mark_all_read(db=db)


@router.post(
    "/bulk",
    summary="Perform bulk action on alerts",
    description="Execute bulk operations (read, acknowledge, resolve, snooze) on an array of alert IDs.",
)
async def bulk_alert_action(
    request: BulkAlertActionRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    actor = f"{current_user.first_name} {current_user.last_name} ({current_user.role.value})"
    return await AlertService.bulk_action(db=db, request=request, actor=actor)
