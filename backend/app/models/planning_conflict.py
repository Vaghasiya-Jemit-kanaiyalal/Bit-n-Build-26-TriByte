import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Boolean,
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


class ConflictType(str, enum.Enum):
    VEHICLE_CAPACITY = "VEHICLE_CAPACITY"
    DRIVER_CONFLICT = "DRIVER_CONFLICT"
    VEHICLE_UNAVAILABLE = "VEHICLE_UNAVAILABLE"
    DRIVER_UNAVAILABLE = "DRIVER_UNAVAILABLE"
    DUPLICATE_BIN = "DUPLICATE_BIN"
    DURATION_LIMIT = "DURATION_LIMIT"
    STOP_LIMIT = "STOP_LIMIT"
    WASTE_COMPATIBILITY = "WASTE_COMPATIBILITY"
    COLLECTION_WINDOW = "COLLECTION_WINDOW"
    ZONE_CONFLICT = "ZONE_CONFLICT"
    UNASSIGNED_PRIORITY = "UNASSIGNED_PRIORITY"
    UTILIZATION_LIMIT = "UTILIZATION_LIMIT"
    OTHER = "OTHER"


class ConflictSeverity(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class PlanningConflict(Base):
    __tablename__ = "planning_conflicts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    plan_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("collection_plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type: Mapped[ConflictType] = mapped_column(
        SQLEnum(ConflictType, name="planning_conflict_type_enum", native_enum=False),
        default=ConflictType.OTHER,
        nullable=False,
    )
    severity: Mapped[ConflictSeverity] = mapped_column(
        SQLEnum(ConflictSeverity, name="planning_conflict_severity_enum", native_enum=False),
        default=ConflictSeverity.WARNING,
        nullable=False,
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    entity_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    entity_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    blocking: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    resolution: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    plan = relationship("CollectionPlan", back_populates="conflicts")
