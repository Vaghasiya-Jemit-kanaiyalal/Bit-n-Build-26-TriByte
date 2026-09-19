from datetime import datetime
from typing import Optional
from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class BinCollectionHistory(Base):
    __tablename__ = "bin_collection_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    bin_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("bins.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    route_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("routes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    collected_by: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    vehicle_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("vehicles.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    collection_status: Mapped[str] = mapped_column(
        String(50),
        default="COLLECTED",
        server_default="COLLECTED",
        nullable=False,
    )
    collected_fill_percentage: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    collected_weight_kg: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    waste_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    collected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
        nullable=False,
    )
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    bin: Mapped["Bin"] = relationship("Bin", back_populates="collection_history")
    collector: Mapped[Optional["User"]] = relationship("User")
    vehicle: Mapped[Optional["Vehicle"]] = relationship("Vehicle")
    route: Mapped[Optional["Route"]] = relationship("Route")

    def __repr__(self) -> str:
        return f"<BinCollectionHistory(bin_id={self.bin_id}, weight={self.collected_weight_kg}kg, at={self.collected_at})>"
