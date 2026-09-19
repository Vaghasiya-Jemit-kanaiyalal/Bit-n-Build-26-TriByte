import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    DateTime,
    Float,
    Integer,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Bin(Base):
    __tablename__ = "bins"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uuid: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        default=uuid.uuid4,
        unique=True,
        index=True,
        nullable=False,
    )
    bin_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )
    name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    location_name: Mapped[str] = mapped_column(String(150), nullable=False)
    zone: Mapped[str] = mapped_column(String(100), nullable=False)
    waste_type: Mapped[str] = mapped_column(String(50), default="Mixed", nullable=False)
    capacity_liters: Mapped[float] = mapped_column(Float, default=240.0, nullable=False)
    fill_level: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    priority: Mapped[str] = mapped_column(String(50), default="NORMAL", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

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
    stops: Mapped[List["RouteStop"]] = relationship(
        "RouteStop",
        back_populates="bin",
    )

    def __repr__(self) -> str:
        return f"<Bin(id={self.id}, code='{self.bin_code}', fill={self.fill_level}%)>"
