from datetime import datetime
from typing import Any, Dict, Optional
from sqlalchemy import (
    JSON,
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class BinActivity(Base):
    __tablename__ = "bin_activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    bin_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("bins.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    activity_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )
    description: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    performed_by: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    activity_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
        nullable=False,
    )

    # Relationships
    bin: Mapped["Bin"] = relationship("Bin", back_populates="activities")
    user: Mapped[Optional["User"]] = relationship("User")

    def __repr__(self) -> str:
        return f"<BinActivity(bin_id={self.bin_id}, type='{self.activity_type}', at={self.created_at})>"
