from datetime import datetime
from typing import Optional
from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class PlanningRouteProposal(Base):
    __tablename__ = "planning_route_proposals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    plan_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("collection_plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
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

    estimated_distance_km: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    estimated_duration_minutes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    estimated_load_kg: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    utilization_percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    stop_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PROPOSED", nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    plan = relationship("CollectionPlan", back_populates="proposals")
    vehicle = relationship("Vehicle", lazy="selectin")
    driver = relationship("User", lazy="selectin")
    stops = relationship("PlanningRouteProposalStop", back_populates="proposal", cascade="all, delete-orphan", lazy="selectin")


class PlanningRouteProposalStop(Base):
    __tablename__ = "planning_route_proposal_stops"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    proposal_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("planning_route_proposals.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    bin_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("bins.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    estimated_arrival: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    estimated_collection_kg: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Relationships
    proposal = relationship("PlanningRouteProposal", back_populates="stops")
    bin = relationship("Bin", lazy="selectin")
