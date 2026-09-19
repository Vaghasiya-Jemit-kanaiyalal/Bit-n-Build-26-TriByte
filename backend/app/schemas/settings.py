from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic.alias_generators import to_camel


class BaseSettingsSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class OrganizationResponse(BaseSettingsSchema):
    id: str = Field(..., description="Organization unique identifier / code, e.g. WW-ORG-001")
    name: str = Field(..., description="Organization name")
    department: str = Field(..., description="Department or division")
    operating_region: str = Field(..., description="Operating region/state/city")
    operating_zones: List[str] = Field(default_factory=list, description="List of operating zones")
    default_timezone: str = Field(..., description="Default timezone string")
    default_currency: str = Field(..., description="Default operational currency")
    contact_email: str = Field(..., description="Primary administrative contact email")
    contact_phone: str = Field(..., description="Primary contact phone number")
    address: str = Field(..., description="Headquarters or operational facility address")
    status: str = Field(default="Operational", description="Organization status: Operational, Degraded, Maintenance")
    active_since: str = Field(default="Jan 15, 2025", description="Active since formatted string")
    last_updated: str = Field(..., description="Last updated timestamp or human-readable string")


class OrganizationUpdate(BaseSettingsSchema):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    department: Optional[str] = Field(None, min_length=2, max_length=150)
    operating_region: Optional[str] = Field(None, min_length=2, max_length=150)
    operating_zones: Optional[List[str]] = Field(None)
    default_timezone: Optional[str] = Field(None, max_length=100)
    default_currency: Optional[str] = Field(None, max_length=50)
    contact_email: Optional[EmailStr] = Field(None)
    contact_phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = Field(None)


class AdminProfileResponse(BaseSettingsSchema):
    first_name: str
    last_name: str
    email: str
    phone: str
    role: str = "ADMIN"
    role_title: str = "Waste Manager / Chief Systems Admin"
    department: str = "Municipal Waste Operations"
    zone: str = "Vadodara Central Operations"
    avatar_url: Optional[str] = None
    last_login: str
    last_active: str
    account_created: str
    current_session: str


class AdminProfileUpdate(BaseSettingsSchema):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = Field(None)
    phone: Optional[str] = Field(None, max_length=50)
    zone: Optional[str] = Field(None, max_length=100)


class AdminActivityItem(BaseSettingsSchema):
    id: str
    action: str
    description: str
    timestamp: str
    ip_address: Optional[str] = "127.0.0.1"
    status: Optional[str] = "Success"


class AdminActivityResponse(BaseSettingsSchema):
    activities: List[AdminActivityItem]
    total: int
