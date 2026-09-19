import enum
import uuid
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


class PlanStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    CALCULATING = "CALCULATING"
    READY = "READY"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class PlanHorizon(str, enum.Enum):
    TODAY = "TODAY"
    NEXT_12_HOURS = "NEXT_12_HOURS"
    NEXT_24_HOURS = "NEXT_24_HOURS"
    NEXT_48_HOURS = "NEXT_48_HOURS"
    NEXT_7_DAYS = "NEXT_7_DAYS"


class PlanStrategy(str, enum.Enum):
    SHORTEST_DISTANCE = "SHORTEST_DISTANCE"
    MINIMUM_TIME = "MINIMUM_TIME"
    MAX_CAPACITY_UTILIZATION = "MAX_CAPACITY_UTILIZATION"
    BALANCED = "BALANCED"


class CollectionPlan(Base):
    __tablename__ = "collection_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uuid: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        default=uuid.uuid4,
        unique=True,
        index=True,
        nullable=False,
    )
    plan_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )
    planning_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    horizon: Mapped[PlanHorizon] = mapped_column(
        SQLEnum(PlanHorizon, name="plan_horizon_enum", native_enum=False),
        default=PlanHorizon.TODAY,
        nullable=False,
    )
    status: Mapped[PlanStatus] = mapped_column(
        SQLEnum(PlanStatus, name="plan_status_enum", native_enum=False),
        default=PlanStatus.DRAFT,
        nullable=False,
        index=True,
    )
    strategy: Mapped[PlanStrategy] = mapped_column(
        SQLEnum(PlanStrategy, name="plan_strategy_enum", native_enum=False),
        default=PlanStrategy.BALANCED,
        nullable=False,
    )

    start_time: Mapped[str] = mapped_column(String(50), default="08:00:00", nullable=False)
    end_time: Mapped[str] = mapped_column(String(50), default="17:00:00", nullable=False)

    created_by_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    total_bins: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    assigned_bins: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    unassigned_bins: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    estimated_waste_kg: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    estimated_distance_km: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    estimated_duration_minutes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    average_vehicle_utilization: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

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
    created_by = relationship("User", foreign_keys=[created_by_id], lazy="noload")
    items = relationship("CollectionPlanItem", back_populates="plan", cascade="all, delete-orphan", lazy="selectin")
    assigned_vehicles = relationship("CollectionPlanVehicle", back_populates="plan", cascade="all, delete-orphan", lazy="selectin")
    conflicts = relationship("PlanningConflict", back_populates="plan", cascade="all, delete-orphan", lazy="selectin")
    proposals = relationship("PlanningRouteProposal", back_populates="plan", cascade="all, delete-orphan", lazy="selectin")
