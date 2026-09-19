import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    DateTime,
    Enum as SQLEnum,
    Float,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class StopStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    SKIPPED = "SKIPPED"
    ISSUE = "ISSUE"


class StopPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class RouteStop(Base):
    __tablename__ = "route_stops"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    route_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("routes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    bin_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("bins.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    sequence_number: Mapped[int] = mapped_column(Integer, nullable=False)

    priority: Mapped[StopPriority] = mapped_column(
        SQLEnum(StopPriority, name="stop_priority_enum", native_enum=False),
        default=StopPriority.MEDIUM,
        nullable=False,
    )
    status: Mapped[StopStatus] = mapped_column(
        SQLEnum(StopStatus, name="stop_status_enum", native_enum=False),
        default=StopStatus.PENDING,
        nullable=False,
        index=True,
    )

    eta: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    arrived_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    estimated_fill_level: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    actual_collected_weight_kg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

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

    # Table constraints
    __table_args__ = (
        UniqueConstraint("route_id", "bin_id", name="uq_route_bin"),
        UniqueConstraint("route_id", "sequence_number", name="uq_route_sequence"),
    )

    # Relationships
    route: Mapped["Route"] = relationship("Route", back_populates="stops")
    bin: Mapped["Bin"] = relationship("Bin", back_populates="stops")

    def __repr__(self) -> str:
        return f"<RouteStop(id={self.id}, route_id={self.route_id}, seq={self.sequence_number}, status='{self.status}')>"
