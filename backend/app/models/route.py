import enum
import uuid as uuid_pkg
from datetime import date, datetime
from typing import List, Optional
from sqlalchemy import (
    Date,
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


class RouteStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    AT_RISK = "AT_RISK"


class RoutePriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Route(Base):
    __tablename__ = "routes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(
        UUID(as_uuid=True),
        default=uuid_pkg.uuid4,
        unique=True,
        index=True,
        nullable=False,
    )
    route_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    zone: Mapped[str] = mapped_column(String(100), index=True, nullable=False)

    vehicle_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("vehicles.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    driver_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[str] = mapped_column(String(50), default="08:00:00", nullable=False)
    estimated_completion_time: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    status: Mapped[RouteStatus] = mapped_column(
        SQLEnum(RouteStatus, name="route_status_enum", native_enum=False),
        default=RouteStatus.PLANNED,
        nullable=False,
        index=True,
    )
    priority: Mapped[RoutePriority] = mapped_column(
        SQLEnum(RoutePriority, name="route_priority_enum", native_enum=False),
        default=RoutePriority.MEDIUM,
        nullable=False,
    )

    total_stops: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed_stops: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_distance_km: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    estimated_duration_minutes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    current_load_kg: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

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
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="routes")
    driver: Mapped["User"] = relationship("User")
    stops: Mapped[List["RouteStop"]] = relationship(
        "RouteStop",
        back_populates="route",
        cascade="all, delete-orphan",
        order_by="RouteStop.sequence_number",
    )

    @property
    def vehicle_capacity_kg(self) -> float:
        try:
            return self.vehicle.capacity_kg if self.vehicle else 0.0
        except Exception:
            return 0.0

    @property
    def metrics(self) -> dict:
        if hasattr(self, "_metrics") and self._metrics is not None:
            return self._metrics
        total = self.total_stops
        comp = self.completed_stops
        rem = max(0, total - comp)
        cap = self.vehicle_capacity_kg
        load = self.current_load_kg
        util = round((load / cap * 100), 2) if cap > 0 else 0.0
        pct = round((comp / total * 100), 2) if total > 0 else 0.0
        return {
            "total_stops": total,
            "completed_stops": comp,
            "remaining_stops": rem,
            "distance_km": self.total_distance_km,
            "estimated_duration_minutes": self.estimated_duration_minutes,
            "current_load_kg": load,
            "vehicle_capacity_kg": cap,
            "capacity_utilization": util,
            "completion_percentage": pct,
        }

    @metrics.setter
    def metrics(self, val):
        self._metrics = val

    def __repr__(self) -> str:
        try:
            return f"<Route(id={self.id}, code='{self.route_code}', status='{self.status}')>"
        except Exception:
            return "<Route(detached)>"
