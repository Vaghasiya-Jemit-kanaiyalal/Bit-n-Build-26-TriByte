from datetime import date, datetime
from typing import List, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

from app.models.collection_plan import PlanStatus, PlanHorizon, PlanStrategy
from app.models.collection_plan_item import PlanItemAssignmentStatus
from app.models.planning_conflict import ConflictType, ConflictSeverity


# --- Item Schemas ---
class CollectionPlanItemBase(BaseModel):
    bin_id: int
    zone: str
    priority: str = "MEDIUM"
    estimated_waste_kg: float = 0.0
    current_fill_percentage: float = 0.0
    predicted_fill_percentage: float = 0.0
    predicted_overflow: bool = False
    prediction_confidence: float = 0.90
    collection_window: str = "MORNING"


class CollectionPlanItemCreate(CollectionPlanItemBase):
    pass


class CollectionPlanItemResponse(CollectionPlanItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    plan_id: int
    assignment_status: PlanItemAssignmentStatus
    created_at: datetime
    bin_code: Optional[str] = None
    bin_latitude: Optional[float] = None
    bin_longitude: Optional[float] = None


# --- Vehicle Assignment Schemas ---
class CollectionPlanVehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    plan_id: int
    vehicle_id: int
    driver_id: Optional[int] = None
    planned_load_kg: float
    utilization_percentage: float
    planned_stops: int
    estimated_distance_km: float
    estimated_duration_minutes: int
    assignment_status: str
    vehicle_code: Optional[str] = None
    driver_name: Optional[str] = None


# --- Conflict Schemas ---
class PlanningConflictResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    plan_id: int
    type: ConflictType
    severity: ConflictSeverity
    message: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    blocking: bool
    resolved: bool
    resolution: Optional[str] = None
    created_at: datetime


# --- Route Proposal Schemas ---
class PlanningRouteProposalStopResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    proposal_id: int
    bin_id: int
    sequence: int
    estimated_arrival: Optional[str] = None
    estimated_collection_kg: float
    bin_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class PlanningRouteProposalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    plan_id: int
    vehicle_id: int
    driver_id: int
    estimated_distance_km: float
    estimated_duration_minutes: int
    estimated_load_kg: float
    utilization_percentage: float
    stop_count: int
    status: str
    vehicle_code: Optional[str] = None
    driver_name: Optional[str] = None
    stops: List[PlanningRouteProposalStopResponse] = []


RouteProposalResponse = PlanningRouteProposalResponse


# --- Collection Plan Schemas ---
class CollectionPlanBase(BaseModel):
    planning_date: date
    horizon: PlanHorizon = PlanHorizon.TODAY
    strategy: PlanStrategy = PlanStrategy.BALANCED
    start_time: str = "08:00:00"
    end_time: str = "17:00:00"


class CollectionPlanCreate(CollectionPlanBase):
    bin_ids: Optional[List[int]] = None
    target_zones: Optional[List[str]] = None


class CollectionPlanUpdate(BaseModel):
    status: Optional[PlanStatus] = None
    strategy: Optional[PlanStrategy] = None
    horizon: Optional[PlanHorizon] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None


class CollectionPlanResponse(CollectionPlanBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    uuid: UUID
    plan_code: str
    status: PlanStatus
    total_bins: int
    assigned_bins: int
    unassigned_bins: int
    estimated_waste_kg: float
    estimated_distance_km: float
    estimated_duration_minutes: int
    average_vehicle_utilization: float
    created_at: datetime
    updated_at: datetime
    created_by_id: Optional[int] = None
    items: List[CollectionPlanItemResponse] = []
    assigned_vehicles: List[CollectionPlanVehicleResponse] = []
    conflicts: List[PlanningConflictResponse] = []
    proposals: List[PlanningRouteProposalResponse] = []


class CollectionPlanListResponse(BaseModel):
    total: int
    plans: List[CollectionPlanResponse]


# --- Constraints & Window Schemas ---
class PlanningConstraintResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    max_vehicle_utilization: float
    max_route_duration_minutes: int
    max_stops: int
    respect_collection_windows: bool
    distance_weight: int
    capacity_weight: int
    priority_weight: int
    time_weight: int
    config_json: Dict[str, Any]
    updated_at: datetime


class PlanningConstraintUpdate(BaseModel):
    max_vehicle_utilization: Optional[float] = None
    max_route_duration_minutes: Optional[int] = None
    max_stops: Optional[int] = None
    respect_collection_windows: Optional[bool] = None
    distance_weight: Optional[int] = None
    capacity_weight: Optional[int] = None
    priority_weight: Optional[int] = None
    time_weight: Optional[int] = None
    config_json: Optional[Dict[str, Any]] = None


class CollectionWindowBase(BaseModel):
    name: str
    start_time: str
    end_time: str
    active: bool = True


class CollectionWindowCreate(CollectionWindowBase):
    pass


class CollectionWindowResponse(CollectionWindowBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


# --- Preview & Summary Schemas ---
class OptimizationPreviewRequest(BaseModel):
    bin_ids: List[int]
    vehicle_ids: Optional[List[int]] = None
    driver_ids: Optional[List[int]] = None
    strategy: PlanStrategy = PlanStrategy.BALANCED
    max_utilization: float = 90.0
    max_stops: int = 30


class OptimizationPreviewResponse(BaseModel):
    strategy: PlanStrategy
    proposed_routes: List[PlanningRouteProposalResponse]
    unassigned_bin_ids: List[int]
    total_bins_evaluated: int
    assigned_bins_count: int
    total_estimated_distance_km: float
    total_estimated_duration_minutes: int
    average_utilization_percentage: float
    conflicts: List[PlanningConflictResponse]


class PlanningSummaryResponse(BaseModel):
    bins_requiring_collection: int
    estimated_waste_kg: float
    available_vehicles: int
    available_drivers: int
    active_plans_count: int
    ready_plans_count: int
    unassigned_bins: int
    critical_conflicts_count: int
