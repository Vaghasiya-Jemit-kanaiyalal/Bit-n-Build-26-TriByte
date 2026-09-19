import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.bin import (
    BinType,
    WasteType,
    BinStatus,
    CollectionStatus,
    CollectionPriority,
    ConnectivityStatus,
)


# ============================================================================
# 1. SENSOR SCHEMAS
# ============================================================================

class SensorBase(BaseModel):
    sensor_id: str = Field(..., min_length=2, max_length=50, description="Unique sensor code (e.g. SNS-1087)")
    sensor_type: str = Field("ULTRASONIC", max_length=50)
    status: str = Field("ACTIVE", max_length=50)
    battery_percentage: float = Field(100.0, ge=0.0, le=100.0)
    temperature_celsius: Optional[float] = None
    connectivity_status: ConnectivityStatus = ConnectivityStatus.ONLINE
    firmware_version: Optional[str] = Field(None, max_length=50)


class SensorCreate(SensorBase):
    pass


class SensorUpdate(BaseModel):
    sensor_id: Optional[str] = Field(None, min_length=2, max_length=50)
    sensor_type: Optional[str] = None
    status: Optional[str] = None
    battery_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    temperature_celsius: Optional[float] = None
    connectivity_status: Optional[ConnectivityStatus] = None
    firmware_version: Optional[str] = None


class SensorResponse(SensorBase):
    id: int
    uuid: uuid.UUID
    bin_id: Optional[int] = None
    last_reading_at: Optional[datetime] = None
    last_fill_reading: Optional[float] = None
    installed_at: datetime
    last_maintenance_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 2. TELEMETRY SCHEMAS
# ============================================================================

class BinTelemetryCreate(BaseModel):
    fill_percentage: float = Field(..., ge=0.0, le=100.0, description="Fill percentage (0-100)")
    fill_kg: Optional[float] = Field(None, ge=0.0, description="Estimated fill weight in kg")
    battery_percentage: float = Field(100.0, ge=0.0, le=100.0, description="Battery level (0-100)")
    temperature_celsius: Optional[float] = None
    connectivity_status: ConnectivityStatus = ConnectivityStatus.ONLINE
    recorded_at: Optional[datetime] = None
    source: str = Field("IOT", description="Telemetry source: IOT, SIMULATED, MANUAL")


class BinTelemetryResponse(BaseModel):
    id: int
    bin_id: int
    sensor_id: Optional[str] = None
    fill_percentage: float
    fill_kg: float
    battery_percentage: float
    temperature_celsius: Optional[float] = None
    connectivity_status: ConnectivityStatus
    recorded_at: datetime
    source: str

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 3. COLLECTION & ACTIVITY SCHEMAS
# ============================================================================

class BinCollectionResponse(BaseModel):
    id: int
    bin_id: int
    route_id: Optional[int] = None
    collected_by: Optional[int] = None
    vehicle_id: Optional[int] = None
    collection_status: str
    collected_fill_percentage: float
    collected_weight_kg: float
    waste_type: str
    collected_at: datetime
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BinActivityResponse(BaseModel):
    id: int
    bin_id: int
    activity_type: str
    description: str
    performed_by: Optional[int] = None
    activity_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BinRouteBrief(BaseModel):
    id: int
    route_code: str
    name: str
    status: str
    scheduled_date: Any
    zone: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 4. BIN CRUD SCHEMAS
# ============================================================================

class BinCreate(BaseModel):
    bin_code: Optional[str] = Field(None, max_length=50, description="Optional unique bin code (e.g. BIN-1087); auto-generated if omitted")
    name: Optional[str] = Field(None, max_length=100, description="Human-readable bin name")
    bin_type: BinType = Field(BinType.STANDARD, description="Bin type category")
    capacity_kg: float = Field(..., gt=0.0, description="Max bin weight capacity in kg")
    waste_type: WasteType = Field(WasteType.ORGANIC, description="Primary waste type")
    zone: str = Field(..., min_length=1, max_length=100, description="Operational zone (e.g. Central Zone)")
    address: Optional[str] = Field(None, max_length=255, description="Physical location address")
    location_name: Optional[str] = Field(None, max_length=150, description="Location name")
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, description="GPS Latitude (-90 to 90)")
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, description="GPS Longitude (-180 to 180)")
    sensor_id: Optional[str] = Field(None, max_length=50, description="Linked sensor code")
    battery_percentage: float = Field(100.0, ge=0.0, le=100.0, description="Initial battery percentage")
    status: BinStatus = Field(BinStatus.NORMAL, description="Initial operational status")
    collection_status: CollectionStatus = Field(CollectionStatus.NOT_REQUIRED, description="Collection state")
    priority: CollectionPriority = Field(CollectionPriority.LOW, description="Collection priority")


class BinUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    bin_type: Optional[BinType] = None
    capacity_kg: Optional[float] = Field(None, gt=0.0)
    waste_type: Optional[WasteType] = None
    zone: Optional[str] = Field(None, min_length=1, max_length=100)
    address: Optional[str] = Field(None, max_length=255)
    location_name: Optional[str] = Field(None, max_length=150)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    sensor_id: Optional[str] = Field(None, max_length=50)
    status: Optional[BinStatus] = None
    collection_status: Optional[CollectionStatus] = None
    priority: Optional[CollectionPriority] = None
    next_collection_at: Optional[datetime] = None


class BinResponse(BaseModel):
    id: int
    uuid: uuid.UUID
    bin_code: str
    name: Optional[str] = None
    bin_type: BinType
    capacity_kg: float
    current_fill_kg: float
    current_fill_percentage: float
    waste_type: WasteType
    status: BinStatus
    zone: str
    address: Optional[str] = None
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    sensor_id: Optional[str] = None
    battery_percentage: float
    connectivity_status: ConnectivityStatus
    collection_status: CollectionStatus
    priority: CollectionPriority
    last_collection_at: Optional[datetime] = None
    next_collection_at: Optional[datetime] = None
    last_telemetry_at: Optional[datetime] = None
    predicted_fill_percentage: Optional[float] = None
    predicted_overflow_at: Optional[datetime] = None
    prediction_confidence: Optional[float] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BinListItem(BaseModel):
    id: int
    bin_code: str
    name: Optional[str] = None
    bin_type: BinType
    capacity_kg: float
    current_fill_kg: float
    current_fill_percentage: float
    waste_type: WasteType
    status: BinStatus
    zone: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    sensor_id: Optional[str] = None
    battery_percentage: float
    connectivity_status: ConnectivityStatus
    collection_status: CollectionStatus
    priority: CollectionPriority
    assigned_route: Optional[BinRouteBrief] = None
    last_collection_at: Optional[datetime] = None
    predicted_overflow_at: Optional[datetime] = None
    predicted_fill_percentage: Optional[float] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class BinListResponse(BaseModel):
    items: List[BinListItem]
    total: int
    page: int
    page_size: int
    pages: int


class BinDetailResponse(BinResponse):
    sensor: Optional[SensorResponse] = None
    current_route: Optional[BinRouteBrief] = None
    recent_telemetry: List[BinTelemetryResponse] = Field(default_factory=list)
    recent_collections: List[BinCollectionResponse] = Field(default_factory=list)
    recent_activities: List[BinActivityResponse] = Field(default_factory=list)
    health_summary: Dict[str, Any] = Field(default_factory=dict)


# ============================================================================
# 5. OPERATIONAL & ACTION SCHEMAS
# ============================================================================

class BinStatusUpdate(BaseModel):
    status: BinStatus = Field(..., description="Target operational status")


class BinPriorityUpdate(BaseModel):
    priority: CollectionPriority = Field(..., description="Target collection priority")
    reason: Optional[str] = Field(None, max_length=255, description="Reason for priority change")
    source: str = Field("MANUAL", description="Source: MANUAL, SYSTEM, PREDICTION")


class BinPrioritizeRequest(BaseModel):
    reason: Optional[str] = Field("Manual collection requested", max_length=255)
    requested_by: Optional[str] = Field("Admin", max_length=100)


class BulkBinActionRequest(BaseModel):
    bin_ids: List[int] = Field(..., min_length=1, description="List of bin IDs to operate on")
    action: str = Field(..., description="Action: ACTIVATE, DEACTIVATE, SET_PRIORITY, SET_STATUS, SET_COLLECTION_STATUS")
    value: Optional[str] = Field(None, description="Target value for status/priority/collection_status")
    reason: Optional[str] = Field(None, description="Operational explanation")


class BulkBinActionResponse(BaseModel):
    successful_ids: List[int] = Field(default_factory=list)
    failed_ids: List[int] = Field(default_factory=list)
    errors: List[Dict[str, Any]] = Field(default_factory=list)


# ============================================================================
# 6. ANALYTICS, MAP & SUMMARY SCHEMAS
# ============================================================================

class BinMapItem(BaseModel):
    id: int
    bin_code: str
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: BinStatus
    fill_percentage: float
    priority: CollectionPriority
    zone: str
    waste_type: WasteType
    predicted_fill_percentage: Optional[float] = None
    predicted_overflow_at: Optional[datetime] = None
    collection_status: CollectionStatus

    model_config = ConfigDict(from_attributes=True)


class BinSummaryResponse(BaseModel):
    total_bins: int
    active_bins: int
    inactive_bins: int
    normal_bins: int
    warning_bins: int
    critical_bins: int
    offline_bins: int
    maintenance_bins: int
    bins_needing_collection: int
    priority_bins: int
    average_fill_percentage: float
    average_battery_percentage: float
    online_sensor_percentage: float
    predicted_overflow_count: int


class BinNetworkHealthResponse(BaseModel):
    total: int
    online: int
    offline: int
    degraded: int
    sensor_health_percentage: float
    average_battery: float
    telemetry_freshness: str
    stale_bins: int
    critical_bins: int


class BinAnalyticsResponse(BaseModel):
    average_fill: float
    maximum_fill: float
    minimum_fill: float
    collection_count: int
    average_collection_interval_hours: Optional[float] = None
    overflow_events: int
    critical_events: int
    waste_type_distribution: Dict[str, int]
    zone_distribution: Dict[str, int]


class BinCollectionSummaryResponse(BaseModel):
    not_required: int
    scheduled: int
    priority: int
    overdue: int
    in_progress: int
    collected: int
    overdue_bins: List[BinListItem] = Field(default_factory=list)
    priority_bins: List[BinListItem] = Field(default_factory=list)
    bins_due_today: int
