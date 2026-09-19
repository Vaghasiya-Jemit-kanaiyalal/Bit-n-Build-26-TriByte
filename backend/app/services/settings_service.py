from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization import Organization
from app.models.user import User
from app.schemas.settings import (
    AdminActivityItem,
    AdminActivityResponse,
    AdminProfileResponse,
    AdminProfileUpdate,
    OrganizationResponse,
    OrganizationUpdate,
)


class SettingsService:
    @staticmethod
    async def get_or_create_organization(db: AsyncSession) -> OrganizationResponse:
        stmt = select(Organization).order_by(Organization.id.asc()).limit(1)
        result = await db.execute(stmt)
        org = result.scalar_one_or_none()

        if not org:
            org = Organization(
                org_code="WW-ORG-001",
                name="WasteWise Municipal Operations",
                department="Municipal Waste Management",
                operating_region="Vadodara Operating Region",
                operating_zones=[
                    "Zone A - Alkapuri",
                    "Zone B - Sayajigunj",
                    "Zone C - Manjalpur",
                    "Zone D - Fatehgunj",
                ],
                default_timezone="Asia/Kolkata (IST +5:30)",
                default_currency="INR (₹)",
                contact_email="operations@wastewise.local",
                contact_phone="+91 98765 43210",
                address="Municipal Corporation Complex, Sector 4, Vadodara, Gujarat 390001",
                status="Operational",
                active_since="Jan 15, 2025",
            )
            db.add(org)
            await db.commit()
            await db.refresh(org)

        return SettingsService._serialize_organization(org)

    @staticmethod
    async def update_organization(
        db: AsyncSession, data: OrganizationUpdate
    ) -> OrganizationResponse:
        stmt = select(Organization).order_by(Organization.id.asc()).limit(1)
        result = await db.execute(stmt)
        org = result.scalar_one_or_none()

        if not org:
            org = Organization(
                org_code="WW-ORG-001",
                name="WasteWise Municipal Operations",
                department="Municipal Waste Management",
                operating_region="Vadodara Operating Region",
                operating_zones=[
                    "Zone A - Alkapuri",
                    "Zone B - Sayajigunj",
                    "Zone C - Manjalpur",
                    "Zone D - Fatehgunj",
                ],
                default_timezone="Asia/Kolkata (IST +5:30)",
                default_currency="INR (₹)",
                contact_email="operations@wastewise.local",
                contact_phone="+91 98765 43210",
                address="Municipal Corporation Complex, Sector 4, Vadodara, Gujarat 390001",
                status="Operational",
                active_since="Jan 15, 2025",
            )
            db.add(org)
            await db.flush()

        update_dict = data.model_dump(exclude_unset=True)
        for field, val in update_dict.items():
            if hasattr(org, field):
                setattr(org, field, val)

        org.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(org)

        return SettingsService._serialize_organization(org)

    @staticmethod
    def _serialize_organization(org: Organization) -> OrganizationResponse:
        last_updated_str = "Today, 14:32 IST"
        if org.updated_at:
            last_updated_str = org.updated_at.strftime("%b %d, %Y %H:%M IST")

        return OrganizationResponse(
            id=org.org_code,
            name=org.name,
            department=org.department,
            operating_region=org.operating_region,
            operating_zones=org.operating_zones or [],
            default_timezone=org.default_timezone,
            default_currency=org.default_currency,
            contact_email=org.contact_email,
            contact_phone=org.contact_phone,
            address=org.address,
            status=org.status,
            active_since=org.active_since,
            last_updated=last_updated_str,
        )

    @staticmethod
    def get_profile(user: User) -> AdminProfileResponse:
        role_str = user.role.value if hasattr(user.role, "value") else str(user.role)
        last_login_str = (
            user.last_login.strftime("%b %d, %Y %H:%M")
            if user.last_login
            else "Today, 08:30 IST"
        )
        account_created_str = (
            user.created_at.strftime("%b %d, %Y")
            if user.created_at
            else "Jan 10, 2025"
        )
        session_id = str(user.uuid)[:8].upper()

        return AdminProfileResponse(
            first_name=user.first_name,
            last_name=user.last_name or "",
            email=user.email,
            phone=user.phone or "+91 98765 12345",
            role=role_str,
            role_title="Waste Manager / Chief Systems Admin",
            department=user.department or "Municipal Waste Operations",
            zone="Vadodara Central Operations",
            avatar_url=None,
            last_login=last_login_str,
            last_active="Active now",
            account_created=account_created_str,
            current_session=f"Active (ID: {session_id}...)",
        )

    @staticmethod
    async def update_profile(
        db: AsyncSession, user: User, data: AdminProfileUpdate
    ) -> AdminProfileResponse:
        # If email is being changed, check if already taken
        if data.email and data.email.lower() != user.email.lower():
            check_stmt = select(User).where(
                User.email == data.email.lower(), User.id != user.id
            )
            res = await db.execute(check_stmt)
            if res.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email is already in use by another user",
                )
            user.email = data.email.lower()

        if data.first_name is not None:
            user.first_name = data.first_name
        if data.last_name is not None:
            user.last_name = data.last_name
        if data.phone is not None:
            user.phone = data.phone

        user.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(user)

        return SettingsService.get_profile(user)

    @staticmethod
    def get_profile_activity(user: User) -> AdminActivityResponse:
        now_str = datetime.now(timezone.utc).strftime("%b %d, %Y %H:%M IST")
        activities = [
            AdminActivityItem(
                id="ACT-001",
                action="Login",
                description="Authenticated via Admin Console (SSO)",
                timestamp=user.last_login.strftime("%b %d, %Y %H:%M IST")
                if user.last_login
                else now_str,
                ip_address="192.168.1.105",
                status="Success",
            ),
            AdminActivityItem(
                id="ACT-002",
                action="Settings Viewed",
                description="Accessed General Administration Settings",
                timestamp=now_str,
                ip_address="192.168.1.105",
                status="Success",
            ),
            AdminActivityItem(
                id="ACT-003",
                action="Profile Verification",
                description="Administrative session tokens refreshed",
                timestamp=now_str,
                ip_address="192.168.1.105",
                status="Success",
            ),
        ]
        return AdminActivityResponse(activities=activities, total=len(activities))
