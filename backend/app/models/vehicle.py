import enum
import uuid as uuid_pkg
from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SQLEnum,
    Float,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class VehicleType(str, enum.Enum):
    COMPACTOR = "COMPACTOR"
    TIPPER = "TIPPER"
    RECYCLING_TRUCK = "RECYCLING_TRUCK"
    MINI_COLLECTION = "MINI_COLLECTION"
    ELECTRIC_COLLECTION = "ELECTRIC_COLLECTION"


class EnergyType(str, enum.Enum):
    DIESEL = "DIESEL"
    CNG = "CNG"
    ELECTRIC = "ELECTRIC"
    HYBRID = "HYBRID"


class VehicleStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ON_ROUTE = "ON_ROUTE"
    IDLE = "IDLE"
    MAINTENANCE = "MAINTENANCE"
    OFFLINE = "OFFLINE"
    INACTIVE = "INACTIVE"


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(
        UUID(as_uuid=True),
        default=uuid_pkg.uuid4,
        unique=True,
        index=True,
        nullable=False,
    )
    vehicle_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    vehicle_type: Mapped[VehicleType] = mapped_column(
        SQLEnum(VehicleType, name="vehicle_type_enum", native_enum=False),
        default=VehicleType.COMPACTOR,
        nullable=False,
        index=True,
    )
    registration_number: Mapped[Optional[str]] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=True,
    )
    license_plate: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    capacity_kg: Mapped[float] = mapped_column(Float, nullable=False)
    current_load_kg: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    energy_type: Mapped[EnergyType] = mapped_column(
        SQLEnum(EnergyType, name="vehicle_energy_type_enum", native_enum=False),
        default=EnergyType.DIESEL,
        nullable=False,
    )
    status: Mapped[VehicleStatus] = mapped_column(
        SQLEnum(VehicleStatus, name="vehicle_status_enum", native_enum=False),
        default=VehicleStatus.AVAILABLE,
        nullable=False,
        index=True,
    )
    zone: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    driver_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Location Telemetry
    current_latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    current_longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    last_location_update: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

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
    driver: Mapped[Optional["User"]] = relationship("User")
    routes: Mapped[List["Route"]] = relationship(
        "Route",
        back_populates="vehicle",
    )
    maintenance_records: Mapped[List["VehicleMaintenanceRecord"]] = relationship(
        "VehicleMaintenanceRecord",
        back_populates="vehicle",
        cascade="all, delete-orphan",
        order_by="desc(VehicleMaintenanceRecord.service_date)",
    )
    activities: Mapped[List["VehicleActivity"]] = relationship(
        "VehicleActivity",
        back_populates="vehicle",
        cascade="all, delete-orphan",
        order_by="desc(VehicleActivity.created_at)",
    )

    @property
    def capacity_utilization(self) -> float:
        """Calculate capacity utilization percentage."""
        if self.capacity_kg <= 0:
            return 0.0
        return round((self.current_load_kg / self.capacity_kg * 100), 2)

    @property
    def registration(self) -> str:
        return self.registration_number or self.license_plate or ""

    def __repr__(self) -> str:
        try:
            return f"<Vehicle(id={self.id}, code='{self.vehicle_code}', status='{self.status}')>"
        except Exception:
            return "<Vehicle(detached)>"
