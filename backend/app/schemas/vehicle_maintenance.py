from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.vehicle_maintenance import MaintenanceStatus


class MaintenanceBase(BaseModel):
    service_type: str = Field(..., min_length=2, max_length=100, json_schema_extra={"example": "Routine Service"})
    service_date: date = Field(..., json_schema_extra={"example": "2026-09-20"})
    next_service_date: Optional[date] = Field(None, json_schema_extra={"example": "2026-10-20"})
    odometer_km: Optional[int] = Field(None, ge=0, json_schema_extra={"example": 18420})
    status: MaintenanceStatus = MaintenanceStatus.SCHEDULED
    notes: Optional[str] = Field(None, json_schema_extra={"example": "Oil and filter inspection"})


class MaintenanceCreate(MaintenanceBase):
    pass


class MaintenanceUpdate(BaseModel):
    service_type: Optional[str] = Field(None, min_length=2, max_length=100)
    service_date: Optional[date] = None
    next_service_date: Optional[date] = None
    odometer_km: Optional[int] = Field(None, ge=0)
    status: Optional[MaintenanceStatus] = None
    notes: Optional[str] = None


class MaintenanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_id: int
    service_type: str
    service_date: date
    next_service_date: Optional[date] = None
    odometer_km: Optional[int] = None
    status: MaintenanceStatus
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
