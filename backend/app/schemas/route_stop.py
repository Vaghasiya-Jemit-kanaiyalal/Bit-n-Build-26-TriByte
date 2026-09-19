from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.route_stop import StopStatus, StopPriority


class RouteStopBase(BaseModel):
    bin_id: int
    sequence_number: int = Field(..., ge=1, description="Sequence order of stop within the route")
    priority: StopPriority = StopPriority.MEDIUM
    notes: Optional[str] = None


class RouteStopCreate(RouteStopBase):
    pass


class RouteStopUpdate(BaseModel):
    sequence_number: Optional[int] = Field(None, ge=1)
    priority: Optional[StopPriority] = None
    notes: Optional[str] = None


class RouteStopReorderRequest(BaseModel):
    stop_ids: list[int] = Field(..., min_length=1, description="Ordered list of stop IDs for the route")


class CompleteStopRequest(BaseModel):
    actual_collected_weight_kg: Optional[float] = Field(None, ge=0, description="Collected weight in kilograms")
    notes: Optional[str] = None


class SkipStopRequest(BaseModel):
    reason: str = Field(..., min_length=1, description="Reason for skipping the stop")


class BinBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    bin_code: str
    location_name: str
    zone: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    waste_type: str
    capacity_liters: float
    fill_level: float
    priority: str
    status: str


class RouteStopResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    route_id: int
    bin_id: int
    sequence_number: int
    priority: StopPriority
    status: StopStatus
    eta: Optional[str] = None
    arrived_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    estimated_fill_level: Optional[float] = None
    actual_collected_weight_kg: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # Nested bin details for frontend route visualization
    bin: Optional[BinBrief] = None
