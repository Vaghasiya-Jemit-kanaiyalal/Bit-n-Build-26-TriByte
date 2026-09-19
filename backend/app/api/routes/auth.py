from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RefreshTokenRequest,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordRequest,
    TokenResponse,
)
from app.schemas.user import UserResponse
from app.services.auth_service import (
    authenticate_user,
    create_password_reset_token,
    execute_password_reset,
    generate_token_pair,
    refresh_access_token,
    register_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    description="Registers a new user account with default VIEWER role and ACTIVE status.",
)
async def register(
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> RegisterResponse:
    user = await register_user(db, data)
    return RegisterResponse(
        message="Account created successfully.",
        user=UserResponse.from_orm_user(user),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and obtain JWT tokens",
    description="Validates user credentials, updates last login, and returns access + refresh tokens.",
)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    user = await authenticate_user(db, data.email, data.password)
    return generate_token_pair(user)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description="Exchanges a valid refresh token for a new access token and fresh refresh token.",
)
async def refresh_token_endpoint(
    data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    return await refresh_access_token(db, data.refresh_token)


@router.post(
    "/logout",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Logout user session",
    description="Stateless logout endpoint. Client discards tokens. Server can record revocation hook.",
)
async def logout(
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    # Hook for token blacklist / refresh token revocation table if added in future
    return MessageResponse(message="Successfully logged out.")


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user profile",
    description="Returns the profile of the user associated with the provided Bearer access token.",
)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    return UserResponse.from_orm_user(current_user)


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Request password reset token",
    description="Sends a password reset token. Always returns a generic success message to prevent user enumeration.",
)
async def forgot_password(
    data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    await create_password_reset_token(db, data.email)
    return MessageResponse(
        message="If an account with this email exists, password reset instructions have been sent."
    )


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Reset password with reset token",
    description="Validates single-use reset token and sets a new secure password.",
)
async def reset_password(
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    await execute_password_reset(db, data.token, data.new_password)
    return MessageResponse(
        message="Password has been reset successfully. You can now log in with your new password."
    )
