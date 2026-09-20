import enum
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.core.security import validate_password_strength
from app.models.user import UserRole, UserStatus


class UserBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(default="", max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    organization: Optional[str] = Field(None, max_length=150)
    department: Optional[str] = Field(None, max_length=150)
class UserBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(default="", max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    organization: Optional[str] = Field(None, max_length=150)
    department: Optional[str] = Field(None, max_length=150)
    role: UserRole = Field(default=UserRole.VIEWER)
    status: UserStatus = Field(default=UserStatus.ACTIVE)


class UserResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    full_name: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    organization: Optional[str] = None
    department: Optional[str] = None
    role: UserRole
    status: UserStatus
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_user(cls, user) -> "UserResponse":
        return cls(
            id=str(user.uuid),
            first_name=user.first_name,
            last_name=user.last_name or "",
            full_name=user.full_name,
            name=user.full_name,
            email=user.email,
            phone=user.phone,
            organization=user.organization,
            department=user.department,
            role=user.role,
            status=user.status,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at,
            last_login=user.last_login,
        )


class AdminCreateUserRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100, description="First Name")
    last_name: str = Field(default="", max_length=100, description="Last Name")
    email: EmailStr = Field(..., description="User Email")
    phone: Optional[str] = Field(None, max_length=50, description="Phone Number")
    role: UserRole = Field(default=UserRole.VIEWER, description="Platform Role (ADMIN, DRIVER, ANALYST, VIEWER)")
    status: UserStatus = Field(default=UserStatus.ACTIVE, description="Account Status (ACTIVE, INACTIVE, SUSPENDED)")
    organization: Optional[str] = Field(None, max_length=150, description="Organization")
    department: Optional[str] = Field(None, max_length=150, description="Department")
    temporary_password: str = Field(..., min_length=6, description="Temporary or initial password")

    @model_validator(mode="before")
    @classmethod
    def handle_field_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Support 'password' as an alias for 'temporary_password'
            if "temporary_password" not in data and "password" in data:
                data["temporary_password"] = data["password"]
            # Support 'name' or 'full_name' as alias for first_name / last_name
            if "first_name" not in data and "name" in data:
                parts = str(data["name"]).strip().split(" ", 1)
                data["first_name"] = parts[0]
                data["last_name"] = parts[1] if len(parts) > 1 else ""
        return data

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v

    @field_validator("temporary_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters.")
        return v


class AdminUpdateUserRequest(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    organization: Optional[str] = Field(None, max_length=150)
    department: Optional[str] = Field(None, max_length=150)


class ChangeRoleRequest(BaseModel):
    role: UserRole = Field(..., description="New role: ADMIN, DRIVER, ANALYST, or VIEWER")


class ChangeStatusRequest(BaseModel):
    status: UserStatus = Field(..., description="New status: ACTIVE, INACTIVE, or SUSPENDED")


class AdminResetPasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=6, description="New user password")
