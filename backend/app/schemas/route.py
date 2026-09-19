from datetime import date, time, datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict, Field
from app.models.route import RouteStatus, RoutePriority
from app.schemas.route_stop import RouteStopResponse


class VehicleBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    vehicle_code: str
    vehicle_type: str
    capacity_kg: float
    current_load_kg: float
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class DriverBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str = ""
    email: str
    role: str
    phone_number: Optional[str] = None


class RouteMetrics(BaseModel):
    total_stops: int = 0
    completed_stops: int = 0
    remaining_stops: int = 0
    distance_km: float = 0.0
    estimated_duration_minutes: int = 0
    current_load_kg: float = 0.0
    vehicle_capacity_kg: float = 0.0
    capacity_utilization: float = 0.0  # (current_load_kg / vehicle_capacity_kg) * 100
    completion_percentage: float = 0.0  # (completed_stops / total_stops) * 100


class RouteBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, json_schema_extra={"example": "North Zone Morning Route"})
    zone: str = Field(..., min_length=1, max_length=50, json_schema_extra={"example": "NORTH"})
    vehicle_id: int
    driver_id: int
    scheduled_date: date = Field(..., json_schema_extra={"example": "2026-09-20"})
    start_time: Optional[str] = Field("08:00:00", json_schema_extra={"example": "08:30:00"})
    priority: RoutePriority = RoutePriority.HIGH


class RouteCreate(RouteBase):
    pass


class RouteUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    zone: Optional[str] = Field(None, min_length=1, max_length=50)
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    scheduled_date: Optional[date] = None
    start_time: Optional[str] = None
    priority: Optional[RoutePriority] = None


class RouteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    route_code: str
    name: str
    zone: str
    status: RouteStatus
    priority: RoutePriority
    scheduled_date: date
    start_time: Optional[str] = None
    estimated_completion_time: Optional[str] = None
    total_stops: int
    completed_stops: int
    total_distance_km: float
    estimated_duration_minutes: int
    current_load_kg: float
    vehicle_capacity_kg: float
    created_at: datetime
    updated_at: datetime

    vehicle: Optional[VehicleBrief] = None
    driver: Optional[DriverBrief] = None
    metrics: Optional[RouteMetrics] = None


class RouteDetailResponse(RouteResponse):
    stops: list[RouteStopResponse] = []


class RouteListResponse(BaseModel):
    items: list[RouteResponse]
    page: int
    page_size: int
    total: int
    pages: int


class RouteProgressResponse(BaseModel):
    route_id: int
    route_code: str
    total_stops: int
    completed: int
    pending: int
    in_progress: int
    skipped: int
    issues: int
    completion_percentage: float


class RouteMetricsResponse(RouteMetrics):
    route_id: int
    route_code: str


class RouteSummaryResponse(BaseModel):
    total_routes: int
    planned: int
    in_progress: int
    completed: int
    at_risk: int
    paused: int
    cancelled: int


class RouteDashboardResponse(BaseModel):
    summary: RouteSummaryResponse
    active_routes: list[RouteResponse]
    routes_at_risk: list[RouteResponse]
    todays_routes: list[RouteResponse]
    recent_activity: list[dict[str, Any]]


class MapVehicle(BaseModel):
    vehicle_id: int
    name: str
    vehicle_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class MapStop(BaseModel):
    stop_id: int
    sequence: int
    bin_id: int
    bin_code: str
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str
    priority: str
    fill_level: float


class RouteMapDataResponse(BaseModel):
    route_id: int
    route_code: str
    name: str
    zone: str
    status: str
    vehicle: Optional[MapVehicle] = None
    stops: list[MapStop] = []


class RouteOptimizationPreviewResponse(BaseModel):
    status: str = "SIMULATED_OPTIMIZATION_PREVIEW"
    message: str = "Simulated optimization preview. OR-Tools optimization engine will be integrated in a future module."
    route_id: int
    route_code: str
    baseline_metrics: RouteMetrics
    optimized_metrics: RouteMetrics
    stops_order: list[int]
