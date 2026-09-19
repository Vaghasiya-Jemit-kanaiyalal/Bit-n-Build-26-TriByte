from datetime import date, datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict, Field
from app.models.vehicle import VehicleType, EnergyType, VehicleStatus
from app.schemas.vehicle_maintenance import MaintenanceResponse


class DriverBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str = ""
    email: str
    phone: Optional[str] = None


class CurrentRouteBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    route_code: str
    name: Optional[str] = None
    status: str
    scheduled_date: Optional[date] = None
    zone: Optional[str] = None


class VehicleBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, json_schema_extra={"example": "EcoCompactor 01"})
    vehicle_type: VehicleType = Field(default=VehicleType.COMPACTOR, json_schema_extra={"example": "COMPACTOR"})
    registration_number: Optional[str] = Field(None, min_length=3, max_length=50, json_schema_extra={"example": "GJ-01-AB-1234"})
    capacity_kg: float = Field(..., gt=0, json_schema_extra={"example": 1200.0})
    energy_type: EnergyType = Field(default=EnergyType.DIESEL, json_schema_extra={"example": "CNG"})
    zone: Optional[str] = Field(None, max_length=100, json_schema_extra={"example": "North Zone"})


class VehicleCreate(VehicleBase):
    driver_id: Optional[int] = Field(None, json_schema_extra={"example": 1})


class VehicleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    vehicle_type: Optional[VehicleType] = None
    registration_number: Optional[str] = Field(None, min_length=3, max_length=50)
    capacity_kg: Optional[float] = Field(None, gt=0)
    energy_type: Optional[EnergyType] = None
    zone: Optional[str] = Field(None, max_length=100)


class AssignDriverRequest(BaseModel):
    driver_id: int = Field(..., json_schema_extra={"example": 1})


class UpdateVehicleStatusRequest(BaseModel):
    status: VehicleStatus = Field(..., json_schema_extra={"example": "AVAILABLE"})


class UpdateVehicleLoadRequest(BaseModel):
    current_load_kg: float = Field(..., ge=0, json_schema_extra={"example": 780.0})


class UpdateVehicleLocationRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, json_schema_extra={"example": 22.3072})
    longitude: float = Field(..., ge=-180.0, le=180.0, json_schema_extra={"example": 73.1812})


class VehicleLocationResponse(BaseModel):
    vehicle_id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    last_updated: Optional[datetime] = None


class VehicleActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_id: int
    activity_type: str
    description: str
    route_id: Optional[int] = None
    created_at: datetime


class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_code: str
    name: str
    vehicle_type: VehicleType
    registration_number: Optional[str] = None
    capacity_kg: float
    current_load_kg: float
    capacity_utilization: float
    energy_type: EnergyType
    status: VehicleStatus
    zone: Optional[str] = None
    driver_id: Optional[int] = None
    is_active: bool
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    last_location_update: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    driver: Optional[DriverBrief] = None
    current_route: Optional[CurrentRouteBrief] = None


class VehicleDetailResponse(VehicleResponse):
    recent_maintenance: list[MaintenanceResponse] = []
    recent_activities: list[VehicleActivityResponse] = []


class VehicleListResponse(BaseModel):
    items: list[VehicleResponse]
    page: int
    page_size: int
    total: int
    pages: int


class VehicleSummaryResponse(BaseModel):
    total: int
    active: int
    on_route: int
    available: int
    idle: int
    maintenance: int
    offline: int
    inactive: int


class VehicleUtilizationResponse(BaseModel):
    total_capacity_kg: float
    current_load_kg: float
    utilization_percentage: float
    vehicles_below_50_percent: int
    vehicles_50_to_75_percent: int
    vehicles_75_to_90_percent: int
    vehicles_above_90_percent: int


class VehicleAttentionItem(BaseModel):
    vehicle_id: int
    vehicle_code: str
    type: str  # HIGH_LOAD, MAINTENANCE_OVERDUE, OFFLINE, ROUTE_ISSUE
    severity: str  # critical, warning, info
    message: str
    action_type: str = "view_vehicle"
    target_id: Optional[str] = None


class VehicleAttentionResponse(BaseModel):
    items: list[VehicleAttentionItem]
    total: int


class VehicleDashboardResponse(BaseModel):
    summary: VehicleSummaryResponse
    utilization: VehicleUtilizationResponse
    attention_items: list[VehicleAttentionItem]
    recent_activity: list[VehicleActivityResponse]
    recent_vehicles: list[VehicleResponse]
    maintenance_overview: dict[str, Any]
