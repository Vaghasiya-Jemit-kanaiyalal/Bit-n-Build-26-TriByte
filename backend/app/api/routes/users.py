import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import (
    get_current_user,
    require_admin,
    require_collector,
    require_viewer,
)
from app.core.security import hash_password
from app.db.database import get_db
from app.models.user import User, UserRole, UserStatus
from app.schemas.auth import MessageResponse
from app.schemas.user import (
    AdminCreateUserRequest,
    AdminResetPasswordRequest,
    AdminUpdateUserRequest,
    ChangeRoleRequest,
    ChangeStatusRequest,
    UserResponse,
)

router = APIRouter(prefix="/users", tags=["Users"])


async def find_user_by_id_or_uuid(db: AsyncSession, identifier: str) -> Optional[User]:
    """Helper to query user by either integer ID or UUID."""
    # Try parsing as UUID
    try:
        user_uuid = uuid.UUID(identifier)
        res = await db.execute(select(User).where(User.uuid == user_uuid))
        user = res.scalar_one_or_none()
        if user:
            return user
    except ValueError:
        pass

    # Try parsing as integer ID
    try:
        int_id = int(identifier)
        res = await db.execute(select(User).where(User.id == int_id))
        return res.scalar_one_or_none()
    except ValueError:
        pass

    return None


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current logged in user profile",
)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    return UserResponse.from_orm_user(current_user)


@router.get(
    "",
    response_model=List[UserResponse],
    status_code=status.HTTP_200_OK,
    summary="Admin: List all platform users",
    description="Retrieve all users with optional filtering by search query, role, or status.",
)
async def list_users(
    search: Optional[str] = Query(None, description="Search by name or email"),
    role: Optional[UserRole] = Query(None, description="Filter by UserRole"),
    user_status: Optional[UserStatus] = Query(None, alias="status", description="Filter by UserStatus"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> List[UserResponse]:
    query = select(User)

    if role:
        query = query.where(User.role == role)
    if user_status:
        query = query.where(User.status == user_status)
    if search:
        search_term = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                User.first_name.ilike(search_term),
                User.last_name.ilike(search_term),
                User.email.ilike(search_term),
            )
        )

    query = query.order_by(User.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()
    return [UserResponse.from_orm_user(u) for u in users]


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Admin: Create new platform user",
    description="Admin creates a user with an assigned role, status, and temporary password.",
)
async def admin_create_user(
    data: AdminCreateUserRequest,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> UserResponse:
    # Check duplicate email
    normalized_email = data.email.lower().strip()
    res = await db.execute(select(User).where(User.email == normalized_email))
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with email '{normalized_email}' already exists.",
        )

    # Hash temporary password
    hashed_pwd = hash_password(data.temporary_password)

    new_user = User(
        uuid=uuid.uuid4(),
        first_name=data.first_name.strip(),
        last_name=data.last_name.strip(),
        email=normalized_email,
        phone=data.phone.strip() if data.phone else None,
        password_hash=hashed_pwd,
        role=data.role,
        status=data.status,
        organization=data.organization.strip() if data.organization else "EcoTrack AI",
        department=data.department.strip() if data.department else "Operations",
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return UserResponse.from_orm_user(new_user)


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Admin: Get user by ID",
)
async def get_user_by_id(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> UserResponse:
    user = await find_user_by_id_or_uuid(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return UserResponse.from_orm_user(user)


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Admin: Edit user details",
)
async def admin_update_user(
    user_id: str,
    data: AdminUpdateUserRequest,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> UserResponse:
    user = await find_user_by_id_or_uuid(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if data.first_name is not None:
        user.first_name = data.first_name.strip()
    if data.last_name is not None:
        user.last_name = data.last_name.strip()
    if data.email is not None:
        user.email = data.email.lower().strip()
    if data.phone is not None:
        user.phone = data.phone.strip()
    if data.organization is not None:
        user.organization = data.organization.strip()
    if data.department is not None:
        user.department = data.department.strip()

    await db.commit()
    await db.refresh(user)
    return UserResponse.from_orm_user(user)


@router.patch(
    "/{user_id}/role",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Admin: Change user role",
    description="Updates user role. Immediately takes effect on the next login/session check.",
)
async def admin_change_role(
    user_id: str,
    data: ChangeRoleRequest,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> UserResponse:
    user = await find_user_by_id_or_uuid(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    user.role = data.role
    await db.commit()
    await db.refresh(user)
    return UserResponse.from_orm_user(user)


@router.patch(
    "/{user_id}/status",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Admin: Change user status (Activate / Suspend)",
)
async def admin_change_status(
    user_id: str,
    data: ChangeStatusRequest,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> UserResponse:
    user = await find_user_by_id_or_uuid(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    user.status = data.status
    await db.commit()
    await db.refresh(user)
    return UserResponse.from_orm_user(user)


@router.post(
    "/{user_id}/change-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Admin: Reset/change user password",
)
async def admin_change_password(
    user_id: str,
    data: AdminResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> MessageResponse:
    user = await find_user_by_id_or_uuid(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    user.password_hash = hash_password(data.new_password)
    await db.commit()
    return MessageResponse(message=f"Password for {user.email} updated successfully.")


@router.delete(
    "/{user_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Admin: Delete user",
)
async def admin_delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> MessageResponse:
    user = await find_user_by_id_or_uuid(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    # Prevent admin from deleting themselves
    if user.id == admin_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete your own admin account.")

    await db.delete(user)
    await db.commit()
    return MessageResponse(message=f"User {user.email} deleted successfully.")


# Zone endpoints for quick role checks
@router.get("/admin-zone", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def admin_zone(admin_user: User = Depends(require_admin)) -> MessageResponse:
    return MessageResponse(message=f"Welcome Admin {admin_user.full_name}. Access granted.")


@router.get("/collector-zone", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def collector_zone(collector_user: User = Depends(require_collector)) -> MessageResponse:
    return MessageResponse(message=f"Welcome Collector {collector_user.full_name}. Access granted.")


@router.get("/viewer-zone", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def viewer_zone(viewer_user: User = Depends(require_viewer)) -> MessageResponse:
    return MessageResponse(message=f"Welcome Viewer {viewer_user.full_name}. Access granted.")
