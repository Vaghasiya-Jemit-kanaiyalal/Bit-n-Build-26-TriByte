from datetime import date
from typing import Optional, Any
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.db.database import get_db
from app.schemas.route import (
    RouteCreate,
    RouteUpdate,
    RouteResponse,
    RouteDetailResponse,
    RouteListResponse,
    RouteProgressResponse,
    RouteMetricsResponse,
    RouteSummaryResponse,
    RouteDashboardResponse,
    RouteMapDataResponse,
    RouteOptimizationPreviewResponse,
)
from app.schemas.route_stop import (
    RouteStopCreate,
    RouteStopUpdate,
    RouteStopResponse,
    RouteStopReorderRequest,
    CompleteStopRequest,
    SkipStopRequest,
)
from app.services.route_service import RouteService

router = APIRouter(
    prefix="/admin/routes",
    tags=["Admin - Route Management"],
    dependencies=[Depends(require_admin)],
)


# ============================================================================
# 1. ROUTE AGGREGATES & DASHBOARD (Must precede /{route_id} path routes)
# ============================================================================

@router.get(
    "/summary",
    response_model=RouteSummaryResponse,
    summary="Get route summary KPI counts",
    description="Returns aggregate counts of routes by status (planned, in-progress, completed, at-risk, paused, cancelled) for dashboard KPI cards.",
)
async def get_routes_summary(
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.get_routes_summary(db)


@router.get(
    "/dashboard",
    response_model=RouteDashboardResponse,
    summary="Get route dashboard composite data",
    description="Returns consolidated route data for the Route page dashboard: summary KPIs, active routes, routes at risk, today's routes, and recent activity.",
)
async def get_routes_dashboard(
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.get_routes_dashboard(db)


# ============================================================================
# 2. ROUTE CRUD & LISTING
# ============================================================================

@router.get(
    "",
    response_model=RouteListResponse,
    summary="List collection routes with pagination, search, and filters",
    description="Retrieve a paginated list of collection routes filtered by status, zone, vehicle, driver, date, or priority.",
)
async def list_routes(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by route status (e.g. PLANNED, IN_PROGRESS, COMPLETED, AT_RISK)"),
    zone: Optional[str] = Query(None, description="Filter by collection zone"),
    vehicle_id: Optional[int] = Query(None, description="Filter by assigned vehicle ID"),
    driver_id: Optional[int] = Query(None, description="Filter by assigned driver ID"),
    scheduled_date: Optional[date] = Query(None, description="Filter by scheduled collection date"),
    priority: Optional[str] = Query(None, description="Filter by route priority (LOW, MEDIUM, HIGH, CRITICAL)"),
    search: Optional[str] = Query(None, description="Search by route code or name"),
    sort_by: str = Query("created_at", description="Sort field (created_at, scheduled_date, priority, status)"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order (asc or desc)"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.get_routes(
        db=db,
        page=page,
        page_size=page_size,
        status_filter=status,
        zone=zone,
        vehicle_id=vehicle_id,
        driver_id=driver_id,
        scheduled_date=scheduled_date,
        priority=priority,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.post(
    "",
    response_model=RouteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new collection route",
    description="Creates a new route, assigns an available vehicle and driver, performs conflict validation for the scheduled date, and generates a unique route code.",
)
async def create_route(
    route_in: RouteCreate,
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.create_route(db, route_in)


@router.get(
    "/{route_id}",
    response_model=RouteDetailResponse,
    summary="Get route details by ID or code",
    description="Returns detailed information about a route including assigned vehicle, driver, live metrics, and sequenced stops.",
)
async def get_route(
    route_id: str = Path(..., description="Route ID or route_code (e.g. 1 or RT-024)"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.get_route_detail(db, route_id)


@router.put(
    "/{route_id}",
    response_model=RouteDetailResponse,
    summary="Update route details",
    description="Updates administrative route properties. Re-validates vehicle and driver availability if re-assigned.",
)
async def update_route(
    route_in: RouteUpdate,
    route_id: str = Path(..., description="Route ID or route_code"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.update_route(db, route_id, route_in)


@router.patch(
    "/{route_id}/cancel",
    summary="Cancel a collection route",
    description="Sets route status to CANCELLED. Completed routes cannot be cancelled.",
)
async def cancel_route(
    route_id: str = Path(..., description="Route ID or route_code"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.cancel_route(db, route_id)


# ============================================================================
# 3. ROUTE OPERATIONAL STATUS TRANSITIONS
# ============================================================================

@router.post(
    "/{route_id}/start",
    response_model=RouteDetailResponse,
    summary="Start route execution",
    description="Transitions route status to IN_PROGRESS. Allowed from PLANNED or PAUSED states.",
)
async def start_route(
    route_id: str = Path(..., description="Route ID or route_code"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.start_route(db, route_id)


@router.post(
    "/{route_id}/pause",
    response_model=RouteDetailResponse,
    summary="Pause an in-progress route",
    description="Transitions an IN_PROGRESS route to PAUSED state.",
)
async def pause_route(
    route_id: str = Path(..., description="Route ID or route_code"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.pause_route(db, route_id)


@router.post(
    "/{route_id}/resume",
    response_model=RouteDetailResponse,
    summary="Resume a paused route",
    description="Transitions a PAUSED route back to IN_PROGRESS state.",
)
async def resume_route(
    route_id: str = Path(..., description="Route ID or route_code"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.resume_route(db, route_id)


@router.post(
    "/{route_id}/complete",
    response_model=RouteDetailResponse,
    summary="Complete a collection route",
    description="Marks a route as COMPLETED. Validates that all stops are completed or skipped; provides force override flag if incomplete stops remain.",
)
async def complete_route(
    route_id: str = Path(..., description="Route ID or route_code"),
    force: bool = Query(False, description="Force completion even if incomplete stops remain"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.complete_route(db, route_id, force=force)


# ============================================================================
# 4. ROUTE STOPS MANAGEMENT & SEQUENCING
# ============================================================================

@router.get(
    "/{route_id}/stops",
    response_model=list[RouteStopResponse],
    summary="List sequenced stops for a route",
    description="Returns all stops for a route ordered by sequence_number ascending.",
)
async def get_route_stops(
    route_id: str = Path(..., description="Route ID or route_code"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.get_route_stops(db, route_id)


@router.post(
    "/{route_id}/stops",
    response_model=RouteStopResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a bin stop to a route",
    description="Adds a waste bin as a stop to the route with specified sequence number and priority.",
)
async def add_route_stop(
    stop_in: RouteStopCreate,
    route_id: str = Path(..., description="Route ID or route_code"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.add_route_stop(db, route_id, stop_in)


@router.post(
    "/{route_id}/stops/from-priority-bins",
    response_model=list[RouteStopResponse],
    summary="Auto-add high priority bins to route",
    description="Selects eligible high fill-level or critical bins in the route zone and adds them to the route sequence.",
)
async def add_priority_bins_to_route(
    route_id: str = Path(..., description="Route ID or route_code"),
    min_fill_level: float = Query(75.0, ge=0.0, le=100.0, description="Minimum bin fill level percentage"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of bins to add"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.add_priority_bins_to_route(
        db=db,
        identifier=route_id,
        min_fill_level=min_fill_level,
        limit=limit,
    )


@router.patch(
    "/{route_id}/stops/reorder",
    response_model=list[RouteStopResponse],
    summary="Reorder stops in a route atomically",
    description="Reorders all stops in the route by assigning new consecutive sequence numbers based on the ordered list of stop IDs.",
)
async def reorder_route_stops(
    req: RouteStopReorderRequest,
    route_id: str = Path(..., description="Route ID or route_code"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.reorder_route_stops(db, route_id, req)


@router.patch(
    "/{route_id}/stops/{stop_id}",
    response_model=RouteStopResponse,
    summary="Update route stop properties",
    description="Updates administrative stop fields such as priority, sequence number, and notes.",
)
async def update_route_stop(
    stop_in: RouteStopUpdate,
    route_id: str = Path(..., description="Route ID or route_code"),
    stop_id: int = Path(..., description="Route Stop ID"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.update_route_stop(db, route_id, stop_id, stop_in)


@router.delete(
    "/{route_id}/stops/{stop_id}",
    summary="Remove a stop from a route",
    description="Removes a stop from the route and recalculates sequence numbers and distance metrics.",
)
async def remove_route_stop(
    route_id: str = Path(..., description="Route ID or route_code"),
    stop_id: int = Path(..., description="Route Stop ID"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.remove_route_stop(db, route_id, stop_id)


# ============================================================================
# 5. STOP OPERATIONAL ACTIONS
# ============================================================================

@router.post(
    "/{route_id}/stops/{stop_id}/complete",
    response_model=RouteStopResponse,
    summary="Mark a route stop as completed",
    description="Sets stop status to COMPLETED, records actual collected weight, and updates route load.",
)
async def complete_stop(
    req: CompleteStopRequest,
    route_id: str = Path(..., description="Route ID or route_code"),
    stop_id: int = Path(..., description="Route Stop ID"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.complete_stop(db, route_id, stop_id, req)


@router.post(
    "/{route_id}/stops/{stop_id}/skip",
    response_model=RouteStopResponse,
    summary="Skip a route stop with documented reason",
    description="Sets stop status to SKIPPED without removing operational history.",
)
async def skip_stop(
    req: SkipStopRequest,
    route_id: str = Path(..., description="Route ID or route_code"),
    stop_id: int = Path(..., description="Route Stop ID"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.skip_stop(db, route_id, stop_id, req)


# ============================================================================
# 6. ROUTE PROGRESS, METRICS, MAP & ALERTS
# ============================================================================

@router.get(
    "/{route_id}/progress",
    response_model=RouteProgressResponse,
    summary="Get route progress breakdown",
    description="Returns stop counts by status and backend-calculated completion percentage.",
)
async def get_route_progress(
    route_id: str = Path(..., description="Route ID or route_code"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.get_route_progress(db, route_id)


@router.get(
    "/{route_id}/metrics",
    response_model=RouteMetricsResponse,
    summary="Get route metrics and capacity utilization",
    description="Returns live metrics including stops, distance, duration, current load, and capacity utilization percentage.",
)
async def get_route_metrics(
    route_id: str = Path(..., description="Route ID or route_code"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.get_route_metrics_response(db, route_id)


@router.get(
    "/{route_id}/map-data",
    response_model=RouteMapDataResponse,
    summary="Get GPS and location data for map rendering",
    description="Returns vehicle location and sequenced bin coordinates formatted for the frontend map component.",
)
async def get_route_map_data(
    route_id: str = Path(..., description="Route ID or route_code"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.get_route_map_data(db, route_id)


@router.get(
    "/{route_id}/alerts",
    response_model=list[dict[str, Any]],
    summary="Get active route alerts",
    description="Derives operational alerts such as vehicle capacity overload, critical bin pending, or route delay.",
)
async def get_route_alerts(
    route_id: str = Path(..., description="Route ID or route_code"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.get_route_alerts(db, route_id)


@router.post(
    "/{route_id}/optimization-preview",
    response_model=RouteOptimizationPreviewResponse,
    summary="Get simulated route optimization preview",
    description="Prepares the API architecture for future OR-Tools integration. Returns simulated baseline vs optimized metrics.",
)
async def get_optimization_preview(
    route_id: str = Path(..., description="Route ID or route_code"),
    db: AsyncSession = Depends(get_db),
):
    return await RouteService.get_optimization_preview(db, route_id)
