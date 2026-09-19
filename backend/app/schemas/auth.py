from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core.security import validate_password_strength
from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name of user")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, description="Secure password")
    organization: Optional[str] = Field(None, max_length=150, description="Organization name")

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long.")
        return v


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., description="Password")

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v


class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token (short-lived)")
    refresh_token: str = Field(..., description="JWT refresh token (long-lived)")
    token_type: str = Field(default="bearer", description="Token type, standard 'bearer'")
    user: UserResponse = Field(..., description="Authenticated user profile details")


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Valid refresh token")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Email address associated with account")

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., description="Password reset token received")
    new_password: str = Field(..., min_length=6, description="New secure password")

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long.")
        return v


class MessageResponse(BaseModel):
    message: str = Field(..., description="Human-readable response message")


class RegisterResponse(BaseModel):
    message: str = Field(..., description="Status message")
    user: UserResponse = Field(..., description="Created user information")
