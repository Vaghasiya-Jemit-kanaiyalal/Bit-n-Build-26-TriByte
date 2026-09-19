from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    DateTime,
    Integer,
    String,
    Text,
    JSON,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    org_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, default="WW-ORG-001")
    name: Mapped[str] = mapped_column(String(200), nullable=False, default="WasteWise Municipal Operations")
    department: Mapped[str] = mapped_column(String(150), nullable=False, default="Municipal Waste Management")
    operating_region: Mapped[str] = mapped_column(String(150), nullable=False, default="Vadodara Operating Region")
    operating_zones: Mapped[List[str]] = mapped_column(
        JSON,
        nullable=False,
        default=lambda: [
            "Zone A - Alkapuri",
            "Zone B - Sayajigunj",
            "Zone C - Manjalpur",
            "Zone D - Fatehgunj",
        ],
    )
    default_timezone: Mapped[str] = mapped_column(String(100), nullable=False, default="Asia/Kolkata (IST +5:30)")
    default_currency: Mapped[str] = mapped_column(String(50), nullable=False, default="INR (₹)")
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False, default="operations@wastewise.local")
    contact_phone: Mapped[str] = mapped_column(String(50), nullable=False, default="+91 98765 43210")
    address: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="Municipal Corporation Complex, Sector 4, Vadodara, Gujarat 390001",
    )
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="Operational")
    active_since: Mapped[str] = mapped_column(String(50), nullable=False, default="Jan 15, 2025")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Organization(id={self.id}, code='{self.org_code}', name='{self.name}')>"
