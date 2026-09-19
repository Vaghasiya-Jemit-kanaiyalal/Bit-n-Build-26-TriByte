from datetime import datetime
from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    Integer,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class PlanningConstraint(Base):
    __tablename__ = "planning_constraints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    max_vehicle_utilization: Mapped[float] = mapped_column(Float, default=90.0, nullable=False)
    max_route_duration_minutes: Mapped[int] = mapped_column(Integer, default=480, nullable=False)
    max_stops: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    respect_collection_windows: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    distance_weight: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    capacity_weight: Mapped[int] = mapped_column(Integer, default=25, nullable=False)
    priority_weight: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    time_weight: Mapped[int] = mapped_column(Integer, default=15, nullable=False)

    config_json: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class CollectionWindow(Base):
    __tablename__ = "collection_windows"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    start_time: Mapped[str] = mapped_column(String(50), nullable=False)
    end_time: Mapped[str] = mapped_column(String(50), nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
