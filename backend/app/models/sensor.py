import uuid as uuid_pkg
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.bin import ConnectivityStatus


class Sensor(Base):
    __tablename__ = "sensors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(
        UUID(as_uuid=True),
        default=uuid_pkg.uuid4,
        unique=True,
        index=True,
        nullable=False,
    )
    sensor_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )
    bin_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("bins.id", ondelete="SET NULL"),
        unique=True,
        nullable=True,
        index=True,
    )
    sensor_type: Mapped[str] = mapped_column(
        String(50),
        default="ULTRASONIC",
        server_default="ULTRASONIC",
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default="ACTIVE",
        server_default="ACTIVE",
        nullable=False,
    )
    battery_percentage: Mapped[float] = mapped_column(
        Float,
        default=100.0,
        server_default="100.0",
        nullable=False,
    )
    last_reading_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    last_fill_reading: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    temperature_celsius: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    connectivity_status: Mapped[ConnectivityStatus] = mapped_column(
        Enum(ConnectivityStatus, native_enum=False),
        default=ConnectivityStatus.ONLINE,
        server_default=ConnectivityStatus.ONLINE.value,
        nullable=False,
    )
    firmware_version: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )
    installed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    last_maintenance_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
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
    bin: Mapped[Optional["Bin"]] = relationship("Bin", back_populates="sensor")

    def __repr__(self) -> str:
        return f"<Sensor(id={self.id}, sensor_id='{self.sensor_id}', battery={self.battery_percentage}%)>"
