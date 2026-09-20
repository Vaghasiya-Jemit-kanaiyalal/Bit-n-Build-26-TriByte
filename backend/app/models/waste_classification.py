import enum
import uuid as uuid_pkg
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.bin import WasteType


class ClassificationSource(str, enum.Enum):
    IMAGE = "IMAGE"
    SENSOR = "SENSOR"
    MANUAL = "MANUAL"
    AI_MODEL = "AI_MODEL"
    SIMULATION = "SIMULATION"


class WasteClassification(Base):
    __tablename__ = "waste_classifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(
        UUID(as_uuid=True),
        default=uuid_pkg.uuid4,
        unique=True,
        index=True,
        nullable=False,
    )
    bin_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("bins.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    collection_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("bin_collection_history.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    waste_type: Mapped[WasteType] = mapped_column(
        Enum(WasteType, native_enum=False),
        nullable=False,
        index=True,
    )
    confidence: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    source: Mapped[str] = mapped_column(
        String(50),
        default=ClassificationSource.IMAGE.value,
        server_default=ClassificationSource.IMAGE.value,
        nullable=False,
        index=True,
    )
    model_name: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )
    model_version: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )
    image_reference: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )
    metadata_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
    )
    is_low_confidence: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
        index=True,
    )
    classified_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships to existing entities
    bin = relationship("Bin", backref="classifications")
    collection = relationship("BinCollectionHistory", backref="classifications")
