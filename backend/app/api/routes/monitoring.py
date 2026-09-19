from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_admin
from app.db.database import get_db
from app.models.user import User
from app.services.monitoring_service import MonitoringService
from app.schemas.monitoring import (
    MonitoringSummaryResponse,
    MonitoringMapResponse,
    MonitoringLiveSnapshotResponse,
    MonitoringBinListResponse,
    MonitoringVehicleListResponse,
    MonitoringRouteListResponse,
    MonitoringRouteDetailResponse,
    MonitoringSensorHealthResponse,
    MonitoringNetworkHealthResponse,
    MonitoringZoneResponse,
    MonitoringCollectionListResponse,
    MonitoringActivityListResponse,
    MonitoringAlertListResponse,
)

router = APIRouter(
    prefix="/admin/monitoring",
    tags=["Admin Monitoring"],
    dependencies=[Depends(require_admin)],
)


# ============================================================================
# 1. LIVE OPERATIONS SNAPSHOT & SUMMARY
# ============================================================================
@router.get(
    "/summary",
    response_model=MonitoringSummaryResponse,
    summary="Get operational monitoring summary",
    description="Calculates live operational counts: monitored bins, online/offline counts, critical bins, active vehicles, active routes, sensor health, and active alerts.",
)
async def get_monitoring_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await MonitoringService.get_summary(db)


@router.get(
    "/live-snapshot",
    response_model=MonitoringLiveSnapshotResponse,
    summary="Get live operations snapshot",
    description="Unified real-time operations snapshot for efficient polling by the Admin Monitoring frontend.",
)
async def get_live_snapshot(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await MonitoringService.get_live_snapshot(db)


# ============================================================================
# 2. GIS MAP DATA
# ============================================================================
@router.get(
    "/map-data",
    response_model=MonitoringMapResponse,
    summary="Get live GIS map data",
    description="Provides real-time GPS coordinates, fill levels, vehicle locations, and active route stops for map rendering.",
)
async def get_map_data(
    zone: Optional[str] = Query(None, description="Filter by operational zone"),
    bin_status: Optional[str] = Query(None, description="Filter by bin operational status"),
    vehicle_status: Optional[str] = Query(None, description="Filter by vehicle status"),
    route_status: Optional[str] = Query(None, description="Filter by route status"),
    waste_type: Optional[str] = Query(None, description="Filter by waste category"),
    collection_status: Optional[str] = Query(None, description="Filter by collection state"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await MonitoringService.get_map_data(
        db=db,
        zone=zone,
        bin_status=bin_status,
        vehicle_status=vehicle_status,
        route_status=route_status,
        waste_type=waste_type,
        collection_status=collection_status,
    )


# ============================================================================
# 3. MONITORED BINS
# ============================================================================
@router.get(
    "/bins",
    response_model=MonitoringBinListResponse,
    summary="Get monitored smart bins",
    description="Paginated list of monitored smart bins with current fill level, telemetry timestamps, and assigned routes.",
)
async def get_monitored_bins(
    search: Optional[str] = Query(None, description="Search across bin code, name, address, sensor ID"),
    zone: Optional[str] = Query(None, description="Filter by zone"),
    status: Optional[str] = Query(None, description="Filter by status (NORMAL, WARNING, CRITICAL, OFFLINE)"),
    waste_type: Optional[str] = Query(None, description="Filter by waste type"),
    collection_status: Optional[str] = Query(None, description="Filter by collection status"),
    priority: Optional[str] = Query(None, description="Filter by collection priority"),
    is_active: Optional[bool] = Query(True, description="Filter by active state"),
    is_online: Optional[bool] = Query(None, description="Filter by sensor connectivity (true/false)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("current_fill_percentage", description="Sort field"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await MonitoringService.get_bins(
        db=db,
        search=search,
        zone=zone,
        status_filter=status,
        waste_type=waste_type,
        collection_status=collection_status,
        priority=priority,
        is_active=is_active,
        is_online=is_online,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )


# ============================================================================
# 4. MONITORED VEHICLES
# ============================================================================
@router.get(
    "/vehicles",
    response_model=MonitoringVehicleListResponse,
    summary="Get live fleet vehicle status",
    description="Paginated fleet vehicles with live load, capacity utilization %, driver details, and current GPS coordinates.",
)
async def get_monitored_vehicles(
    search: Optional[str] = Query(None, description="Search vehicle code, name, registration, zone"),
    status: Optional[str] = Query(None, description="Filter by status (AVAILABLE, ON_ROUTE, IDLE, MAINTENANCE, OFFLINE)"),
    zone: Optional[str] = Query(None, description="Filter by zone"),
    vehicle_type: Optional[str] = Query(None, description="Filter by vehicle type"),
    energy_type: Optional[str] = Query(None, description="Filter by energy type"),
    driver_id: Optional[int] = Query(None, description="Filter by assigned driver ID"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("current_load_kg", description="Sort field"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await MonitoringService.get_vehicles(
        db=db,
        search=search,
        status_filter=status,
        zone=zone,
        vehicle_type=vehicle_type,
        energy_type=energy_type,
        driver_id=driver_id,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )


# ============================================================================
# 5. MONITORED ROUTES
# ============================================================================
@router.get(
    "/routes",
    response_model=MonitoringRouteListResponse,
    summary="Get active collection routes",
    description="List of active routes with live stop progress metrics (completed/remaining stops, progress percentage).",
)
async def get_monitored_routes(
    status: Optional[str] = Query(None, description="Filter by route status (IN_PROGRESS, PLANNED, AT_RISK, PAUSED, COMPLETED)"),
    zone: Optional[str] = Query(None, description="Filter by operational zone"),
    vehicle_id: Optional[int] = Query(None, description="Filter by assigned vehicle"),
    driver_id: Optional[int] = Query(None, description="Filter by assigned driver"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await MonitoringService.get_routes(
        db=db,
        status_filter=status,
        zone=zone,
        vehicle_id=vehicle_id,
        driver_id=driver_id,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/routes/{route_id}",
    response_model=MonitoringRouteDetailResponse,
    summary="Get monitoring route snapshot",
    description="Detailed read-only operational snapshot of a specific route with ordered stops and current active stop.",
)
async def get_monitored_route_detail(
    route_id: str = Path(..., description="Route ID or route_code"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await MonitoringService.get_route_detail(db, route_id)


# ============================================================================
# 6. HARDWARE & NETWORK HEALTH
# ============================================================================
@router.get(
    "/sensors/health",
    response_model=MonitoringSensorHealthResponse,
    summary="Get sensor hardware health",
    description="Aggregated hardware health metrics: online/offline/degraded counts, battery averages, and telemetry freshness.",
)
async def get_sensor_health(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await MonitoringService.get_sensor_health(db)


@router.get(
    "/network-health",
    response_model=MonitoringNetworkHealthResponse,
    summary="Get network connectivity health",
    description="Overall device connectivity status and telemetry freshness summary.",
)
async def get_network_health(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await MonitoringService.get_network_health(db)


# ============================================================================
# 7. ZONE OPERATIONAL STATUS
# ============================================================================
@router.get(
    "/zones",
    response_model=List[MonitoringZoneResponse],
    summary="Get live zone operational status",
    description="Live status per operational zone: bin counts, fill levels, active vehicles, routes, collections, and health status.",
)
async def get_zone_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await MonitoringService.get_zones(db)


# ============================================================================
# 8. CURRENT COLLECTION OPERATIONS
# ============================================================================
@router.get(
    "/collections",
    response_model=MonitoringCollectionListResponse,
    summary="Get current collection operations",
    description="Active collection operations currently scheduled, in progress, or recently completed.",
)
async def get_collection_operations(
    zone: Optional[str] = Query(None, description="Filter by zone"),
    status: Optional[str] = Query(None, description="Filter by collection status (PENDING, IN_PROGRESS, COMPLETED)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await MonitoringService.get_collections(
        db=db,
        zone=zone,
        status_filter=status,
        page=page,
        page_size=page_size,
    )


# ============================================================================
# 9. LIVE ACTIVITY FEED
# ============================================================================
@router.get(
    "/activity",
    response_model=MonitoringActivityListResponse,
    summary="Get live operational activity feed",
    description="Chronological stream of live operational events across bins, vehicles, routes, and collections.",
)
async def get_live_activity(
    limit: int = Query(50, ge=1, le=200, description="Maximum items to return"),
    zone: Optional[str] = Query(None, description="Filter by zone"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    severity: Optional[str] = Query(None, description="Filter by severity (INFO, WARNING, CRITICAL, SUCCESS)"),
    since: Optional[datetime] = Query(None, description="Filter events after this timestamp"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await MonitoringService.get_activity(
        db=db,
        limit=limit,
        zone=zone,
        event_type=event_type,
        severity=severity,
        since=since,
    )


# ============================================================================
# 10. LIVE ALERT STRIP
# ============================================================================
@router.get(
    "/alerts",
    response_model=MonitoringAlertListResponse,
    summary="Get active operational alerts",
    description="Read-only view of active operational alerts (critical fills, offline sensors, vehicle overloads, route delays).",
)
async def get_active_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, WARNING, INFO)"),
    type: Optional[str] = Query(None, description="Filter by alert type"),
    zone: Optional[str] = Query(None, description="Filter by zone"),
    status: Optional[str] = Query(None, description="Filter by alert status"),
    limit: int = Query(50, ge=1, le=100, description="Maximum alerts to return"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await MonitoringService.get_alerts(
        db=db,
        severity=severity,
        alert_type=type,
        zone=zone,
        status_filter=status,
        limit=limit,
    )
