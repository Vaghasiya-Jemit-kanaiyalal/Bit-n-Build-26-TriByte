from datetime import datetime
from typing import Optional
from sqlalchemy import (
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.bin import ConnectivityStatus


class BinTelemetry(Base):
    __tablename__ = "bin_telemetry"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    bin_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("bins.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    sensor_id: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )
    fill_percentage: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    fill_kg: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    battery_percentage: Mapped[float] = mapped_column(
        Float,
        nullable=False,
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
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
        nullable=False,
    )
    source: Mapped[str] = mapped_column(
        String(50),
        default="IOT",
        server_default="IOT",
        nullable=False,
    )

    # Relationships
    bin: Mapped["Bin"] = relationship("Bin", back_populates="telemetry_records")

    __table_args__ = (
        Index("ix_bin_telemetry_bin_id_recorded_at", "bin_id", "recorded_at"),
    )

    def __repr__(self) -> str:
        return f"<BinTelemetry(bin_id={self.bin_id}, fill={self.fill_percentage}%, recorded_at={self.recorded_at})>"
