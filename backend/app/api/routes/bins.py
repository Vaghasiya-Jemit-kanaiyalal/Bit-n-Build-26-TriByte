from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_admin
from app.db.database import get_db
from app.models.user import User
from app.schemas.bin import (
    BinCreate,
    BinUpdate,
    BinDetailResponse,
    BinListResponse,
    BinStatusUpdate,
    BinPriorityUpdate,
    BinPrioritizeRequest,
    BulkBinActionRequest,
    BulkBinActionResponse,
    SensorCreate,
    SensorUpdate,
    SensorResponse,
    BinTelemetryCreate,
    BinTelemetryResponse,
    BinCollectionResponse,
    BinActivityResponse,
    BinMapItem,
    BinSummaryResponse,
    BinNetworkHealthResponse,
    BinAnalyticsResponse,
    BinCollectionSummaryResponse,
)
from app.services.bin_service import BinService

router = APIRouter(
    prefix="/admin/bins",
    tags=["Admin → Bins"],
    dependencies=[Depends(require_admin)],
)


# ============================================================================
# 1. NETWORK ANALYTICS, MAP & SUMMARY ENDPOINTS (Static paths must be first)
# ============================================================================

@router.get(
    "/map",
    response_model=List[BinMapItem],
    summary="Retrieve lightweight bin coordinates for network map",
    description="Returns lightweight records for map visualization filtered by zone, status, priority, or waste type.",
)
async def get_map_data(
    zone: Optional[str] = Query(None, description="Filter by operational zone"),
    status: Optional[str] = Query(None, description="Filter by status: NORMAL, WARNING, CRITICAL, OFFLINE, MAINTENANCE"),
    priority: Optional[str] = Query(None, description="Filter by priority: LOW, MEDIUM, HIGH, CRITICAL"),
    waste_type: Optional[str] = Query(None, description="Filter by waste type"),
    is_active: Optional[bool] = Query(True, description="Filter by active status"),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.get_map_data(
        db,
        zone=zone,
        status_filter=status,
        priority=priority,
        waste_type=waste_type,
        is_active=is_active,
    )


@router.get(
    "/summary",
    response_model=BinSummaryResponse,
    summary="Retrieve overall bin network KPI summary cards",
    description="Returns aggregate counts for active/inactive bins, statuses, average fill/battery percentages, and predicted overflows.",
)
async def get_bin_summary(
    db: AsyncSession = Depends(get_db),
):
    return await BinService.get_summary(db)


@router.get(
    "/network-health",
    response_model=BinNetworkHealthResponse,
    summary="Retrieve IoT network connectivity and sensor health diagnostics",
    description="Calculates online/offline/degraded sensor ratios, battery health, telemetry freshness, and stale reporting bins.",
)
async def get_network_health(
    db: AsyncSession = Depends(get_db),
):
    return await BinService.get_network_health(db)


@router.get(
    "/analytics",
    response_model=BinAnalyticsResponse,
    summary="Retrieve bin fill and operational aggregate analytics",
    description="Provides fill level distributions, historical collection intervals, overflow frequencies, and zone/waste breakdowns.",
)
async def get_bin_analytics(
    from_date: Optional[datetime] = Query(None, description="Start date filter"),
    to_date: Optional[datetime] = Query(None, description="End date filter"),
    zone: Optional[str] = Query(None, description="Filter by zone"),
    waste_type: Optional[str] = Query(None, description="Filter by waste type"),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.get_analytics(
        db,
        from_date=from_date,
        to_date=to_date,
        zone=zone,
        waste_type=waste_type,
    )


@router.get(
    "/collection-summary",
    response_model=BinCollectionSummaryResponse,
    summary="Retrieve collection queue status breakdown and priority queues",
    description="Provides counts by collection status (SCHEDULED, PRIORITY, OVERDUE) and lists overdue/priority bins.",
)
async def get_collection_summary(
    db: AsyncSession = Depends(get_db),
):
    return await BinService.get_collection_summary(db)


@router.post(
    "/bulk-action",
    response_model=BulkBinActionResponse,
    summary="Execute bulk action across multiple bins",
    description="Applies actions such as ACTIVATE, DEACTIVATE, SET_PRIORITY, SET_STATUS, or SET_COLLECTION_STATUS atomically across a batch of bin IDs.",
)
async def bulk_bin_action(
    req: BulkBinActionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.bulk_action(db, req, user_id=current_user.id)


# ============================================================================
# 2. BIN CRUD & SEARCH
# ============================================================================

@router.get(
    "",
    response_model=BinListResponse,
    summary="List smart bins with pagination, search, and multidimensional filters",
    description="Supports search across code/name/address/sensor and filtering by status, zone, waste type, priority, and fill level thresholds.",
)
async def list_bins(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    search: Optional[str] = Query(None, description="Search query matching code, name, address, or sensor"),
    status: Optional[str] = Query(None, description="Status filter (NORMAL, WARNING, CRITICAL, OFFLINE, MAINTENANCE, INACTIVE)"),
    zone: Optional[str] = Query(None, description="Zone name filter"),
    waste_type: Optional[str] = Query(None, description="Waste type filter (PLASTIC, PAPER, METAL, GLASS, ORGANIC, OTHER)"),
    collection_status: Optional[str] = Query(None, description="Collection status filter"),
    priority: Optional[str] = Query(None, description="Collection priority filter"),
    bin_type: Optional[str] = Query(None, description="Bin type filter"),
    connectivity_status: Optional[str] = Query(None, description="Connectivity filter (ONLINE, OFFLINE, DEGRADED)"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    fill_min: Optional[float] = Query(None, ge=0.0, le=100.0, description="Minimum fill percentage"),
    fill_max: Optional[float] = Query(None, ge=0.0, le=100.0, description="Maximum fill percentage"),
    sort_by: str = Query("created_at", description="Sort column (created_at, current_fill_percentage, bin_code, priority)"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.get_bins(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        status_filter=status,
        zone=zone,
        waste_type=waste_type,
        collection_status=collection_status,
        priority=priority,
        bin_type=bin_type,
        connectivity_status=connectivity_status,
        is_active=is_active,
        fill_min=fill_min,
        fill_max=fill_max,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.post(
    "",
    response_model=BinDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new smart waste bin",
    description="Creates a new bin with automatic code generation (BIN-XXXX) if omitted, capacity validation, sensor assignment, and audit log.",
)
async def create_bin(
    bin_in: BinCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.create_bin(db, bin_in, user_id=current_user.id)


@router.get(
    "/{bin_id}",
    response_model=BinDetailResponse,
    summary="Get comprehensive bin details",
    description="Returns complete details including sensor telemetry, active route assignment, recent telemetry readings, collection history, and audit log.",
)
async def get_bin_details(
    bin_id: str = Path(..., description="Bin integer ID or string bin_code (e.g. BIN-1087)"),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.get_bin_detail(db, bin_id)


@router.patch(
    "/{bin_id}",
    response_model=BinDetailResponse,
    summary="Update bin specifications",
    description="Updates administrative specifications such as capacity, waste type, zone, address, sensor code, or next scheduled collection.",
)
async def update_bin(
    bin_in: BinUpdate,
    bin_id: str = Path(..., description="Bin ID or bin_code"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.update_bin(db, bin_id, bin_in, user_id=current_user.id)


@router.patch(
    "/{bin_id}/activate",
    summary="Reactivate an inactive bin",
    description="Restores an inactive bin to NORMAL operational status and sets is_active = true.",
)
async def activate_bin(
    bin_id: str = Path(..., description="Bin ID or bin_code"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.activate_bin(db, bin_id, user_id=current_user.id)


@router.patch(
    "/{bin_id}/deactivate",
    summary="Soft-deactivate a bin",
    description="Deactivates a bin. Guarded against bins currently participating in an active in-progress collection route.",
)
async def deactivate_bin(
    bin_id: str = Path(..., description="Bin ID or bin_code"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.deactivate_bin(db, bin_id, user_id=current_user.id)


@router.patch(
    "/{bin_id}/status",
    response_model=BinDetailResponse,
    summary="Update operational status",
    description="Transitions bin operational status (NORMAL, WARNING, CRITICAL, OFFLINE, MAINTENANCE, INACTIVE) with state validation.",
)
async def update_bin_status(
    req: BinStatusUpdate,
    bin_id: str = Path(..., description="Bin ID or bin_code"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.update_status(db, bin_id, req, user_id=current_user.id)


@router.patch(
    "/{bin_id}/priority",
    response_model=BinDetailResponse,
    summary="Update collection priority",
    description="Updates collection priority (LOW, MEDIUM, HIGH, CRITICAL) and records audit reasoning.",
)
async def update_bin_priority(
    req: BinPriorityUpdate,
    bin_id: str = Path(..., description="Bin ID or bin_code"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.update_priority(db, bin_id, req, user_id=current_user.id)


@router.post(
    "/{bin_id}/prioritize",
    response_model=BinDetailResponse,
    summary="Prioritize bin for collection planning",
    description="Flags bin as requiring priority collection (priority = CRITICAL, collection_status = PRIORITY) without creating a route.",
)
async def prioritize_bin(
    req: BinPrioritizeRequest,
    bin_id: str = Path(..., description="Bin ID or bin_code"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.prioritize_bin(db, bin_id, req, user_id=current_user.id)


# ============================================================================
# 3. SENSOR ATTACHMENT & MANAGEMENT
# ============================================================================

@router.get(
    "/{bin_id}/sensor",
    response_model=SensorResponse,
    summary="Retrieve attached sensor hardware record",
    description="Fetches the IoT sensor currently installed on this bin.",
)
async def get_sensor(
    bin_id: str = Path(..., description="Bin ID or bin_code"),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.get_sensor_for_bin(db, bin_id)


@router.post(
    "/{bin_id}/sensor",
    response_model=SensorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Attach an IoT sensor to a bin",
    description="Registers and links a new sensor device to the bin.",
)
async def create_sensor(
    req: SensorCreate,
    bin_id: str = Path(..., description="Bin ID or bin_code"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.create_sensor_for_bin(db, bin_id, req, user_id=current_user.id)


@router.patch(
    "/{bin_id}/sensor",
    response_model=SensorResponse,
    summary="Update attached sensor properties",
    description="Updates firmware, status, battery, or sensor code.",
)
async def update_sensor(
    req: SensorUpdate,
    bin_id: str = Path(..., description="Bin ID or bin_code"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.update_sensor_for_bin(db, bin_id, req, user_id=current_user.id)


@router.delete(
    "/{bin_id}/sensor",
    summary="Detach sensor hardware from a bin",
    description="Removes sensor hardware link from the bin.",
)
async def delete_sensor(
    bin_id: str = Path(..., description="Bin ID or bin_code"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.delete_sensor_from_bin(db, bin_id, user_id=current_user.id)


# ============================================================================
# 4. TELEMETRY, COLLECTION & ACTIVITY HISTORIES
# ============================================================================

@router.post(
    "/{bin_id}/telemetry",
    response_model=BinTelemetryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest sensor telemetry reading",
    description="Stores telemetry data point, updates bin fill and battery levels, and evaluates operational threshold triggers (CRITICAL if >=90%, WARNING if >=75%).",
)
async def ingest_telemetry(
    req: BinTelemetryCreate,
    bin_id: str = Path(..., description="Bin ID or bin_code"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.ingest_telemetry(db, bin_id, req, user_id=current_user.id)


@router.get(
    "/{bin_id}/telemetry",
    response_model=List[BinTelemetryResponse],
    summary="Retrieve telemetry reading history",
    description="Returns chronological sensor telemetry readings with optional from/to timestamp filters.",
)
async def get_telemetry_history(
    bin_id: str = Path(..., description="Bin ID or bin_code"),
    from_date: Optional[datetime] = Query(None, description="Start date filter"),
    to_date: Optional[datetime] = Query(None, description="End date filter"),
    limit: int = Query(50, ge=1, le=200, description="Max records to return"),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.get_telemetry_history(
        db,
        bin_id,
        from_date=from_date,
        to_date=to_date,
        limit=limit,
    )


@router.get(
    "/{bin_id}/collections",
    response_model=List[BinCollectionResponse],
    summary="Retrieve historical collection events for a bin",
    description="Returns past collection records including collected weight, route code, and vehicle details.",
)
async def get_collections(
    bin_id: str = Path(..., description="Bin ID or bin_code"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.get_collection_history(db, bin_id, page=page, page_size=page_size)


@router.get(
    "/{bin_id}/activity",
    response_model=List[BinActivityResponse],
    summary="Retrieve audit trail activity history for a bin",
    description="Returns chronological lifecycle activity events with operational metadata.",
)
async def get_activity(
    bin_id: str = Path(..., description="Bin ID or bin_code"),
    activity_type: Optional[str] = Query(None, description="Filter by activity type"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    db: AsyncSession = Depends(get_db),
):
    return await BinService.get_activity_history(
        db,
        bin_id,
        page=page,
        page_size=page_size,
        activity_type=activity_type,
    )
