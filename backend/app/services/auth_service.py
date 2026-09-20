import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_password_reset_raw_token,
    hash_password,
    hash_reset_token,
    verify_password,
)
from app.models.password_reset import PasswordResetToken
from app.models.user import User, UserRole, UserStatus
from app.schemas.auth import RegisterRequest, TokenResponse
from app.schemas.user import UserResponse

logger = logging.getLogger(__name__)


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Retrieve user by normalized email."""
    result = await db.execute(select(User).where(User.email == email.lower().strip()))
    return result.scalar_one_or_none()


async def get_user_by_uuid(db: AsyncSession, user_uuid: uuid.UUID) -> Optional[User]:
    """Retrieve user by UUID."""
    result = await db.execute(select(User).where(User.uuid == user_uuid))
    return result.scalar_one_or_none()


async def register_user(db: AsyncSession, data: RegisterRequest) -> User:
    """
    Public registration endpoint.
    Users cannot choose their role - assigned ANALYST by default with ACTIVE status.
    """
    normalized_email = data.email.lower().strip()

    # Check for duplicate email
    existing_user = await get_user_by_email(db, normalized_email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists.",
        )

    # Parse first_name and last_name from full_name
    parts = data.full_name.strip().split(" ", 1)
    first_name = parts[0]
    last_name = parts[1] if len(parts) > 1 else ""

    # Hash password using Argon2id
    hashed_pwd = hash_password(data.password)

    new_user = User(
        uuid=uuid.uuid4(),
        first_name=first_name,
        last_name=last_name,
        email=normalized_email,
        password_hash=hashed_pwd,
        organization=data.organization.strip() if data.organization else "EcoTrack AI",
        role=UserRole.VIEWER,
        status=UserStatus.ACTIVE,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
    """
    Authenticate user strictly by Email + Password.
    Role and Status are resolved strictly from the database.
    """
    normalized_email = email.lower().strip()
    user = await get_user_by_email(db, normalized_email)

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Status check
    if user.status == UserStatus.SUSPENDED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended. Please contact your system administrator.",
        )
    if user.status == UserStatus.INACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is inactive. Please contact support.",
        )

    # Update last login timestamp
    user.last_login = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)

    return user


def generate_token_pair(user: User) -> TokenResponse:
    """Generate access and refresh tokens containing the user's database role."""
    access_token = create_access_token(
        subject=str(user.uuid),
        role=user.role.value,
    )
    refresh_token = create_refresh_token(
        subject=str(user.uuid),
        role=user.role.value,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.from_orm_user(user),
    )


async def refresh_access_token(db: AsyncSession, refresh_token: str) -> TokenResponse:
    """Validate refresh token and issue fresh token pair."""
    try:
        payload = decode_token(refresh_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid refresh token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_type = payload.get("type")
    if token_type != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token provided is not a refresh token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_sub = payload.get("sub")
    if not user_sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing subject identifier.",
        )

    try:
        user_uuid = uuid.UUID(user_sub)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identifier in token.",
        )

    user = await get_user_by_uuid(db, user_uuid)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists.",
        )

    if user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is {user.status.value.lower()}.",
        )

    return generate_token_pair(user)


async def create_password_reset_token(db: AsyncSession, email: str) -> Optional[str]:
    """Create a secure single-use password reset token."""
    normalized_email = email.lower().strip()
    user = await get_user_by_email(db, normalized_email)
    if not user or user.status != UserStatus.ACTIVE:
        return None

    raw_token = generate_password_reset_raw_token()
    token_hash = hash_reset_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)

    reset_record = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        used_at=None,
    )
    db.add(reset_record)
    await db.commit()

    if settings.ENVIRONMENT in ["development", "test"]:
        logger.info(f"[DEV] Password reset requested for {email}. Raw token: {raw_token}")

    return raw_token


async def execute_password_reset(db: AsyncSession, raw_token: str, new_password: str) -> None:
    """Validate token, hash new password, invalidate reset token."""
    token_hash = hash_reset_token(raw_token)
    result = await db.execute(
        select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
    )
    token_record = result.scalar_one_or_none()

    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    if token_record.used_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset token has already been used.",
        )

    if token_record.is_expired:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset token has expired.",
        )

    result_user = await db.execute(select(User).where(User.id == token_record.user_id))
    user = result_user.scalar_one_or_none()
    if not user or user.status != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account not found or disabled.",
        )

    user.password_hash = hash_password(new_password)
    token_record.used_at = datetime.now(timezone.utc)
    await db.commit()
