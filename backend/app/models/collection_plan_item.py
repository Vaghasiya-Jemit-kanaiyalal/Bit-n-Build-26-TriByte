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
    Boolean,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class PlanItemAssignmentStatus(str, enum.Enum):
    UNASSIGNED = "UNASSIGNED"
    ASSIGNED = "ASSIGNED"
    COLLECTED = "COLLECTED"
    SKIPPED = "SKIPPED"


class CollectionPlanItem(Base):
    __tablename__ = "collection_plan_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    plan_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("collection_plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    bin_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("bins.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    zone: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    priority: Mapped[str] = mapped_column(String(50), default="MEDIUM", nullable=False)

    estimated_waste_kg: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    current_fill_percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    predicted_fill_percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    predicted_overflow: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    prediction_confidence: Mapped[float] = mapped_column(Float, default=0.90, nullable=False)
    collection_window: Mapped[str] = mapped_column(String(50), default="MORNING", nullable=False)

    assignment_status: Mapped[PlanItemAssignmentStatus] = mapped_column(
        SQLEnum(PlanItemAssignmentStatus, name="plan_item_assignment_status_enum", native_enum=False),
        default=PlanItemAssignmentStatus.UNASSIGNED,
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    plan = relationship("CollectionPlan", back_populates="items")
    bin = relationship("Bin", lazy="selectin")


class CollectionPlanVehicle(Base):
    __tablename__ = "collection_plan_vehicles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    plan_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("collection_plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    vehicle_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("vehicles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    driver_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    planned_load_kg: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    utilization_percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    planned_stops: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    estimated_distance_km: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    estimated_duration_minutes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    assignment_status: Mapped[str] = mapped_column(String(50), default="ALLOCATED", nullable=False)

    # Relationships
    plan = relationship("CollectionPlan", back_populates="assigned_vehicles")
    vehicle = relationship("Vehicle", lazy="selectin")
    driver = relationship("User", lazy="selectin")
