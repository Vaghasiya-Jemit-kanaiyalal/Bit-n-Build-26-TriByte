from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.db.database import get_db
from app.models.user import User
from app.schemas.settings import (
    AdminActivityResponse,
    AdminProfileResponse,
    AdminProfileUpdate,
    OrganizationResponse,
    OrganizationUpdate,
)
from app.services.settings_service import SettingsService

router = APIRouter(prefix="/admin/settings", tags=["Admin Settings"])


@router.get(
    "/organization",
    response_model=OrganizationResponse,
    summary="Get organization details",
    description="Retrieve operational parameters and metadata for the current organization. Requires ADMIN role.",
)
async def get_organization(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> OrganizationResponse:
    return await SettingsService.get_or_create_organization(db)


@router.patch(
    "/organization",
    response_model=OrganizationResponse,
    summary="Update organization details",
    description="Update operational parameters and metadata for the current organization. Requires ADMIN role.",
)
async def update_organization(
    data: OrganizationUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> OrganizationResponse:
    return await SettingsService.update_organization(db, data)


@router.get(
    "/profile",
    response_model=AdminProfileResponse,
    summary="Get current admin profile",
    description="Retrieve profile and session details for the authenticated administrator. Requires ADMIN role.",
)
async def get_admin_profile(
    current_user: User = Depends(require_admin),
) -> AdminProfileResponse:
    return SettingsService.get_profile(current_user)


@router.patch(
    "/profile",
    response_model=AdminProfileResponse,
    summary="Update current admin profile",
    description="Update editable profile fields for the authenticated administrator. Sensitive fields like role, password, and tokens cannot be modified here. Requires ADMIN role.",
)
async def update_admin_profile(
    data: AdminProfileUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminProfileResponse:
    return await SettingsService.update_profile(db, current_user, data)


@router.get(
    "/profile/activity",
    response_model=AdminActivityResponse,
    summary="Get admin activity log",
    description="Retrieve recent session and administrative activity for the authenticated administrator. Requires ADMIN role.",
)
async def get_admin_activity(
    current_user: User = Depends(require_admin),
) -> AdminActivityResponse:
    return SettingsService.get_profile_activity(current_user)
