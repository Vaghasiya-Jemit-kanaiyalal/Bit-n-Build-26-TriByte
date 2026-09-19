from typing import Optional, Any
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.db.database import get_db
from app.schemas.vehicle import (
    VehicleCreate,
    VehicleUpdate,
    VehicleResponse,
    VehicleDetailResponse,
    VehicleListResponse,
    VehicleSummaryResponse,
    VehicleUtilizationResponse,
    VehicleAttentionResponse,
    VehicleDashboardResponse,
    VehicleActivityResponse,
    VehicleLocationResponse,
    AssignDriverRequest,
    UpdateVehicleStatusRequest,
    UpdateVehicleLoadRequest,
    UpdateVehicleLocationRequest,
)
from app.schemas.vehicle_maintenance import (
    MaintenanceCreate,
    MaintenanceUpdate,
    MaintenanceResponse,
)
from app.services.vehicle_service import VehicleService

router = APIRouter(
    prefix="/admin/vehicles",
    tags=["Admin - Vehicle Fleet Management"],
    dependencies=[Depends(require_admin)],
)


# ============================================================================
# 1. FLEET AGGREGATES & DASHBOARD (Must precede /{vehicle_id} path routes)
# ============================================================================

@router.get(
    "/summary",
    response_model=VehicleSummaryResponse,
    summary="Get fleet summary KPI counts",
    description="Returns aggregate counts of fleet vehicles by status (total, active, on_route, available, idle, maintenance, offline, inactive).",
)
async def get_fleet_summary(
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.get_fleet_summary(db)


@router.get(
    "/utilization",
    response_model=VehicleUtilizationResponse,
    summary="Get fleet payload capacity and utilization analytics",
    description="Calculates overall fleet capacity, current load, utilization percentage, and distribution brackets (<50%, 50-75%, 75-90%, >90%).",
)
async def get_fleet_utilization(
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.get_fleet_utilization(db)


@router.get(
    "/attention",
    response_model=VehicleAttentionResponse,
    summary="Get vehicles requiring operational attention",
    description="Identifies fleet units requiring attention: high capacity load (>=90%), overdue maintenance, offline status, or route issues.",
)
async def get_vehicles_attention(
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.get_vehicles_attention(db)


@router.get(
    "/dashboard",
    response_model=VehicleDashboardResponse,
    summary="Get consolidated vehicle dashboard payload",
    description="Composite endpoint returning fleet summary, utilization metrics, attention items, recent vehicle activity, recently registered vehicles, and maintenance overview.",
)
async def get_vehicle_dashboard(
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.get_vehicle_dashboard(db)


# ============================================================================
# 2. VEHICLE CRUD & LISTING
# ============================================================================

@router.get(
    "",
    response_model=VehicleListResponse,
    summary="List fleet vehicles with pagination, search, and filters",
    description="Retrieve a paginated list of collection vehicles filtered by status, vehicle type, energy type, zone, driver, capacity limits, or search keywords.",
)
async def list_vehicles(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by operational status (e.g. AVAILABLE, ON_ROUTE, IDLE, MAINTENANCE, OFFLINE)"),
    vehicle_type: Optional[str] = Query(None, description="Filter by vehicle type (e.g. COMPACTOR, TIPPER, RECYCLING_TRUCK)"),
    energy_type: Optional[str] = Query(None, description="Filter by energy type (e.g. DIESEL, CNG, ELECTRIC, HYBRID)"),
    zone: Optional[str] = Query(None, description="Filter by operational zone"),
    driver_id: Optional[int] = Query(None, description="Filter by assigned driver ID"),
    min_capacity: Optional[float] = Query(None, ge=0, description="Minimum payload capacity in kg"),
    max_capacity: Optional[float] = Query(None, ge=0, description="Maximum payload capacity in kg"),
    search: Optional[str] = Query(None, description="Search across vehicle code, name, registration number, or driver name"),
    sort_by: str = Query("created_at", description="Field to sort by (created_at, vehicle_code, capacity_kg, current_load_kg, status)"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order ('asc' or 'desc')"),
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.get_vehicles(
        db=db,
        page=page,
        page_size=page_size,
        status_filter=status,
        vehicle_type=vehicle_type,
        energy_type=energy_type,
        zone=zone,
        driver_id=driver_id,
        min_capacity=min_capacity,
        max_capacity=max_capacity,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.post(
    "",
    response_model=VehicleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new fleet vehicle",
    description="Registers a new vehicle into the fleet, automatically assigns a unique vehicle code (e.g. VEH-001), validates registration number, and initializes operational status.",
)
async def create_vehicle(
    vehicle_in: VehicleCreate,
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.create_vehicle(db, vehicle_in)


@router.get(
    "/{vehicle_id}",
    response_model=VehicleDetailResponse,
    summary="Get full vehicle details",
    description="Returns detailed information about a vehicle including driver, active route assignment, capacity utilization, recent maintenance, and activity history. Accepts ID or vehicle code.",
)
async def get_vehicle(
    vehicle_id: str = Path(..., description="Vehicle ID or vehicle_code (e.g. 1 or VEH-001)"),
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.get_vehicle_detail(db, vehicle_id)


@router.put(
    "/{vehicle_id}",
    response_model=VehicleDetailResponse,
    summary="Update vehicle administrative details",
    description="Updates vehicle specifications such as name, vehicle type, registration number, capacity (must be >= current load), energy type, and zone.",
)
async def update_vehicle(
    vehicle_in: VehicleUpdate,
    vehicle_id: str = Path(..., description="Vehicle ID or vehicle_code"),
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.update_vehicle(db, vehicle_id, vehicle_in)


@router.patch(
    "/{vehicle_id}/deactivate",
    summary="Deactivate a fleet vehicle",
    description="Marks vehicle as inactive and unavailable. Prevented if vehicle has an active route in progress.",
)
async def deactivate_vehicle(
    vehicle_id: str = Path(..., description="Vehicle ID or vehicle_code"),
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.deactivate_vehicle(db, vehicle_id)


@router.patch(
    "/{vehicle_id}/activate",
    summary="Reactivate an inactive fleet vehicle",
    description="Restores an inactive vehicle to active AVAILABLE status.",
)
async def reactivate_vehicle(
    vehicle_id: str = Path(..., description="Vehicle ID or vehicle_code"),
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.reactivate_vehicle(db, vehicle_id)


# ============================================================================
# 3. DRIVER ASSIGNMENT
# ============================================================================

@router.post(
    "/{vehicle_id}/assign-driver",
    response_model=VehicleDetailResponse,
    summary="Assign a driver to a vehicle",
    description="Assigns a driver to the vehicle. Validates that user exists, has DRIVER role, is active, and is not already assigned to another active vehicle.",
)
async def assign_driver(
    req: AssignDriverRequest,
    vehicle_id: str = Path(..., description="Vehicle ID or vehicle_code"),
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.assign_driver(db, vehicle_id, req)


@router.delete(
    "/{vehicle_id}/driver",
    summary="Remove driver assignment from vehicle",
    description="Unassigns the current driver from the vehicle. Guarded against vehicles currently executing an active route.",
)
async def remove_driver(
    vehicle_id: str = Path(..., description="Vehicle ID or vehicle_code"),
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.remove_driver(db, vehicle_id)


# ============================================================================
# 4. OPERATIONAL STATUS, PAYLOAD & LOCATION TELEMETRY
# ============================================================================

@router.patch(
    "/{vehicle_id}/status",
    response_model=VehicleDetailResponse,
    summary="Update vehicle operational status",
    description="Transitions vehicle status (AVAILABLE, ON_ROUTE, IDLE, MAINTENANCE, OFFLINE) with strict operational state validation.",
)
async def update_vehicle_status(
    req: UpdateVehicleStatusRequest,
    vehicle_id: str = Path(..., description="Vehicle ID or vehicle_code"),
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.update_vehicle_status(db, vehicle_id, req)


@router.patch(
    "/{vehicle_id}/load",
    summary="Update vehicle payload load",
    description="Updates vehicle current load in kg. Validates non-negative weight and prevents exceeding vehicle capacity. Returns calculated utilization percentage.",
)
async def update_vehicle_load(
    req: UpdateVehicleLoadRequest,
    vehicle_id: str = Path(..., description="Vehicle ID or vehicle_code"),
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.update_vehicle_load(db, vehicle_id, req)


@router.patch(
    "/{vehicle_id}/location",
    response_model=VehicleLocationResponse,
    summary="Update vehicle GPS coordinates",
    description="Updates latest latitude and longitude coordinates and location timestamp.",
)
async def update_vehicle_location(
    req: UpdateVehicleLocationRequest,
    vehicle_id: str = Path(..., description="Vehicle ID or vehicle_code"),
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.update_vehicle_location(db, vehicle_id, req)


@router.get(
    "/{vehicle_id}/location",
    response_model=VehicleLocationResponse,
    summary="Get latest vehicle GPS coordinates",
    description="Returns current vehicle GPS coordinates and last location update timestamp.",
)
async def get_vehicle_location(
    vehicle_id: str = Path(..., description="Vehicle ID or vehicle_code"),
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.get_vehicle_location(db, vehicle_id)


# ============================================================================
# 5. MAINTENANCE MANAGEMENT
# ============================================================================

@router.post(
    "/{vehicle_id}/maintenance",
    response_model=MaintenanceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a maintenance record",
    description="Logs a scheduled, in-progress, or completed maintenance record for the vehicle.",
)
async def add_maintenance_record(
    req: MaintenanceCreate,
    vehicle_id: str = Path(..., description="Vehicle ID or vehicle_code"),
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.add_maintenance_record(db, vehicle_id, req)


@router.get(
    "/{vehicle_id}/maintenance",
    summary="Get vehicle maintenance history",
    description="Returns paginated maintenance records for a vehicle ordered newest first.",
)
async def get_maintenance_history(
    vehicle_id: str = Path(..., description="Vehicle ID or vehicle_code"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by maintenance status"),
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.get_maintenance_history(
        db=db,
        identifier=vehicle_id,
        page=page,
        page_size=page_size,
        status_filter=status,
    )


@router.patch(
    "/{vehicle_id}/maintenance/{maintenance_id}",
    response_model=MaintenanceResponse,
    summary="Update a maintenance record",
    description="Updates status, service dates, odometer reading, or notes of an existing maintenance record.",
)
async def update_maintenance_record(
    req: MaintenanceUpdate,
    vehicle_id: str = Path(..., description="Vehicle ID or vehicle_code"),
    maintenance_id: int = Path(..., description="Maintenance Record ID"),
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.update_maintenance_record(db, vehicle_id, maintenance_id, req)


# ============================================================================
# 6. VEHICLE AUDIT & ACTIVITY HISTORY
# ============================================================================

@router.get(
    "/{vehicle_id}/history",
    response_model=list[VehicleActivityResponse],
    summary="Get vehicle operational activity history",
    description="Returns chronological audit trail of vehicle events (driver assignments, status changes, maintenance, route executions).",
)
async def get_vehicle_history(
    vehicle_id: str = Path(..., description="Vehicle ID or vehicle_code"),
    limit: int = Query(50, ge=1, le=100, description="Maximum activities to return"),
    db: AsyncSession = Depends(get_db),
):
    return await VehicleService.get_vehicle_history(db, vehicle_id, limit=limit)
