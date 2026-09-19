import enum
from datetime import date, datetime
from typing import Optional
from sqlalchemy import (
    Date,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class MaintenanceStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"


class VehicleMaintenanceRecord(Base):
    __tablename__ = "vehicle_maintenance_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vehicle_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("vehicles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    service_type: Mapped[str] = mapped_column(String(100), nullable=False)
    service_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    next_service_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    odometer_km: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[MaintenanceStatus] = mapped_column(
        SQLEnum(MaintenanceStatus, name="maintenance_status_enum", native_enum=False),
        default=MaintenanceStatus.SCHEDULED,
        nullable=False,
        index=True,
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

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

    # Relationships
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="maintenance_records")

    def __repr__(self) -> str:
        return f"<VehicleMaintenanceRecord(id={self.id}, vehicle_id={self.vehicle_id}, type='{self.service_type}', status='{self.status}')>"
