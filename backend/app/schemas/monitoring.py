from uuid import UUID
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.bin import BinType, WasteType, BinStatus, CollectionStatus, CollectionPriority, ConnectivityStatus
from app.models.vehicle import VehicleType, EnergyType, VehicleStatus
from app.models.route import RouteStatus, RoutePriority
from app.models.route_stop import StopStatus, StopPriority


# ============================================================================
# 1. SUMMARY
# ============================================================================
class MonitoringSummaryResponse(BaseModel):
    bins_monitored: int = Field(..., description="Total active monitored bins")
    bins_online: int = Field(..., description="Bins reporting online sensor status")
    bins_offline: int = Field(..., description="Bins with offline or stale sensor status")
    critical_bins: int = Field(..., description="Bins in CRITICAL operational fill status (>=90%)")
    warning_bins: int = Field(..., description="Bins in WARNING operational fill status (75-89%)")
    active_vehicles: int = Field(..., description="Fleet vehicles currently ON_ROUTE")
    total_vehicles: int = Field(..., description="Total active fleet vehicles")
    active_routes: int = Field(..., description="Routes currently IN_PROGRESS or AT_RISK")
    active_collections: int = Field(..., description="Collection stops currently scheduled or in progress")
    sensor_health_percentage: float = Field(..., description="Percentage of healthy/online sensors")
    network_health_percentage: float = Field(..., description="Overall device network connectivity score")
    unacknowledged_alerts: int = Field(..., description="Count of active unacknowledged alerts")
    critical_alerts: int = Field(..., description="Count of active critical-severity alerts")
    last_updated: datetime = Field(..., description="Timestamp of this operational summary calculation")

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 2. MAP DATA
# ============================================================================
class MonitoringMapBin(BaseModel):
    id: int
    uuid: UUID
    bin_code: str
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: BinStatus
    fill_percentage: float
    capacity_kg: float
    current_fill_kg: float
    waste_type: WasteType
    zone: Optional[str] = None
    collection_status: CollectionStatus
    priority: CollectionPriority
    last_telemetry_at: Optional[datetime] = None
    predicted_fill_percentage: Optional[float] = None
    predicted_overflow_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MonitoringMapVehicle(BaseModel):
    id: int
    uuid: UUID
    vehicle_code: str
    name: str
    vehicle_type: VehicleType
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: VehicleStatus
    current_load_kg: float
    capacity_kg: float
    utilization_percentage: float
    route_id: Optional[int] = None
    route_code: Optional[str] = None
    driver_id: Optional[int] = None
    driver_name: Optional[str] = None
    zone: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MonitoringMapRouteStop(BaseModel):
    stop_id: int
    bin_id: int
    bin_code: str
    sequence_number: int
    status: StopStatus
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class MonitoringMapRoute(BaseModel):
    id: int
    uuid: UUID
    route_code: str
    name: str
    status: RouteStatus
    zone: Optional[str] = None
    vehicle_id: int
    vehicle_code: Optional[str] = None
    driver_id: int
    driver_name: Optional[str] = None
    total_stops: int
    completed_stops: int
    progress_percentage: float
    polyline: Optional[str] = None
    stops: List[MonitoringMapRouteStop] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class MonitoringMapResponse(BaseModel):
    bins: List[MonitoringMapBin] = Field(default_factory=list)
    vehicles: List[MonitoringMapVehicle] = Field(default_factory=list)
    routes: List[MonitoringMapRoute] = Field(default_factory=list)
    zones: List[str] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 3. BIN MONITORING
# ============================================================================
class MonitoringRouteBrief(BaseModel):
    route_id: int
    route_code: str
    name: str
    status: str
    driver_name: Optional[str] = None
    vehicle_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MonitoringBinItem(BaseModel):
    id: int
    uuid: UUID
    bin_code: str
    name: str
    zone: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity_kg: float
    current_fill_kg: float
    current_fill_percentage: float
    waste_type: WasteType
    status: BinStatus
    collection_status: CollectionStatus
    priority: CollectionPriority
    sensor_id: Optional[str] = None
    sensor_connectivity: ConnectivityStatus
    battery_percentage: float
    last_telemetry_at: Optional[datetime] = None
    predicted_fill_percentage: Optional[float] = None
    predicted_overflow_at: Optional[datetime] = None
    assigned_route: Optional[MonitoringRouteBrief] = None

    model_config = ConfigDict(from_attributes=True)


class MonitoringBinListResponse(BaseModel):
    items: List[MonitoringBinItem] = Field(default_factory=list)
    total: int
    page: int
    page_size: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 4. VEHICLE MONITORING
# ============================================================================
class MonitoringVehicleItem(BaseModel):
    vehicle_id: int
    uuid: UUID
    vehicle_code: str
    name: str
    vehicle_type: VehicleType
    registration_number: str
    status: VehicleStatus
    capacity_kg: float
    current_load_kg: float
    utilization_percentage: float
    energy_type: EnergyType
    driver_id: Optional[int] = None
    driver_name: Optional[str] = None
    zone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    last_location_update: Optional[datetime] = None
    current_route_id: Optional[int] = None
    current_route_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MonitoringVehicleListResponse(BaseModel):
    items: List[MonitoringVehicleItem] = Field(default_factory=list)
    total: int
    page: int
    page_size: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 5. ROUTE MONITORING
# ============================================================================
class MonitoringRouteItem(BaseModel):
    route_id: int
    uuid: UUID
    route_code: str
    name: str
    status: RouteStatus
    priority: RoutePriority
    zone: Optional[str] = None
    vehicle_id: int
    vehicle_code: Optional[str] = None
    driver_id: int
    driver_name: Optional[str] = None
    total_stops: int
    completed_stops: int
    remaining_stops: int
    skipped_stops: int
    progress_percentage: float
    distance_km: float
    estimated_duration_minutes: int
    elapsed_minutes: Optional[int] = None
    start_time: str
    estimated_end_time: Optional[str] = None
    last_activity_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MonitoringRouteListResponse(BaseModel):
    items: List[MonitoringRouteItem] = Field(default_factory=list)
    total: int
    page: int
    page_size: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


class MonitoringStopDetail(BaseModel):
    stop_id: int
    uuid: Optional[UUID] = None
    sequence_number: int
    status: StopStatus
    priority: StopPriority
    bin_id: int
    bin_code: str
    bin_name: str
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    fill_level: float
    capacity_kg: float
    waste_type: str
    scheduled_arrival_time: Optional[str] = None
    actual_arrival_time: Optional[datetime] = None
    actual_departure_time: Optional[datetime] = None
    actual_collected_weight_kg: Optional[float] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MonitoringRouteDetailResponse(BaseModel):
    route_id: int
    uuid: UUID
    route_code: str
    name: str
    status: RouteStatus
    priority: RoutePriority
    zone: Optional[str] = None
    scheduled_date: str
    start_time: str
    estimated_completion_time: Optional[str] = None
    vehicle_id: int
    vehicle_code: Optional[str] = None
    vehicle_name: Optional[str] = None
    driver_id: int
    driver_name: Optional[str] = None
    total_stops: int
    completed_stops: int
    remaining_stops: int
    skipped_stops: int
    progress_percentage: float
    distance_km: float
    estimated_duration_minutes: int
    elapsed_minutes: Optional[int] = None
    current_stop: Optional[MonitoringStopDetail] = None
    stops: List[MonitoringStopDetail] = Field(default_factory=list)
    last_activity_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 6. SENSOR & NETWORK HEALTH
# ============================================================================
class MonitoringSensorHealthResponse(BaseModel):
    total_sensors: int
    online: int
    offline: int
    degraded: int
    low_battery: int
    average_battery_percentage: float
    connectivity_percentage: float
    telemetry_freshness_percentage: float
    last_updated: datetime

    model_config = ConfigDict(from_attributes=True)


class MonitoringNetworkHealthResponse(BaseModel):
    total_devices: int
    connected: int
    stale: int
    offline: int
    connectivity_percentage: float
    telemetry_freshness: str
    low_battery_count: int
    sensor_failure_count: int
    last_updated: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 7. ZONE LIVE STATUS
# ============================================================================
class MonitoringZoneResponse(BaseModel):
    zone: str
    total_bins: int
    online_bins: int
    offline_bins: int
    critical_bins: int
    warning_bins: int
    average_fill_percentage: float
    active_vehicles: int
    active_routes: int
    active_collections: int
    active_alerts: int
    status: str = Field("Healthy", description="Healthy | Attention | Critical")
    last_activity: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 8. CURRENT COLLECTION OPERATIONS
# ============================================================================
class MonitoringCollectionItem(BaseModel):
    collection_id: int = Field(..., description="RouteStop ID representing this collection operation")
    route_stop_id: int
    bin_id: int
    bin_code: str
    bin_name: str
    fill_percentage: float
    waste_type: str
    route_id: int
    route_code: str
    vehicle_id: Optional[int] = None
    vehicle_code: Optional[str] = None
    driver_id: Optional[int] = None
    driver_name: Optional[str] = None
    status: StopStatus
    started_at: Optional[datetime] = None
    estimated_completion: Optional[str] = None
    zone: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MonitoringCollectionListResponse(BaseModel):
    items: List[MonitoringCollectionItem] = Field(default_factory=list)
    total: int
    page: int
    page_size: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 9. LIVE ACTIVITY FEED
# ============================================================================
class MonitoringActivityItem(BaseModel):
    id: str
    event_type: str
    title: str
    description: str
    severity: str = Field("INFO", description="INFO | WARNING | CRITICAL | SUCCESS")
    entity_type: str = Field(..., description="BIN | VEHICLE | ROUTE | SENSOR | SYSTEM")
    entity_id: str
    route_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    bin_id: Optional[int] = None
    zone: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MonitoringActivityListResponse(BaseModel):
    items: List[MonitoringActivityItem] = Field(default_factory=list)
    total: int

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 10. LIVE ALERT STRIP
# ============================================================================
class MonitoringAlertItem(BaseModel):
    alert_id: str
    type: str = Field(..., description="CRITICAL_FILL | SENSOR_OFFLINE | LOW_BATTERY | VEHICLE_OVERLOAD | ROUTE_AT_RISK")
    severity: str = Field(..., description="CRITICAL | WARNING | INFO")
    title: str
    message: str
    status: str = Field("ACTIVE", description="ACTIVE | ACKNOWLEDGED | RESOLVED")
    source: str = Field(..., description="BIN | VEHICLE | ROUTE | SENSOR | SYSTEM")
    entity_type: str
    entity_id: str
    zone: Optional[str] = None
    created_at: datetime
    acknowledged_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MonitoringAlertListResponse(BaseModel):
    items: List[MonitoringAlertItem] = Field(default_factory=list)
    total: int

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# 11. LIVE OPERATIONS SNAPSHOT (Composite Polling Payload)
# ============================================================================
class MonitoringLiveSnapshotResponse(BaseModel):
    timestamp: datetime
    summary: MonitoringSummaryResponse
    map: MonitoringMapResponse
    sensor_health: MonitoringSensorHealthResponse
    network_health: MonitoringNetworkHealthResponse
    zones: List[MonitoringZoneResponse] = Field(default_factory=list)
    routes: List[MonitoringRouteItem] = Field(default_factory=list)
    vehicles: List[MonitoringVehicleItem] = Field(default_factory=list)
    collections: List[MonitoringCollectionItem] = Field(default_factory=list)
    activity: List[MonitoringActivityItem] = Field(default_factory=list)
    alerts: List[MonitoringAlertItem] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
