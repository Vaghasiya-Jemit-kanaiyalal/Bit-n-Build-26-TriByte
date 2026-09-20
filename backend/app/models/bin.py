import enum
import uuid as uuid_pkg
from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    Integer,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class BinType(str, enum.Enum):
    STANDARD = "STANDARD"
    RECYCLING = "RECYCLING"
    ORGANIC = "ORGANIC"
    COMMERCIAL = "COMMERCIAL"
    INDUSTRIAL = "INDUSTRIAL"
    SMART = "SMART"


class WasteType(str, enum.Enum):
    PLASTIC = "PLASTIC"
    PAPER = "PAPER"
    METAL = "METAL"
    GLASS = "GLASS"
    ORGANIC = "ORGANIC"
    OTHER = "OTHER"


class BinStatus(str, enum.Enum):
    NORMAL = "NORMAL"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"
    OFFLINE = "OFFLINE"
    MAINTENANCE = "MAINTENANCE"
    INACTIVE = "INACTIVE"
    ACTIVE = "ACTIVE"  # Backward-compatible alias for route module/legacy seeds


class CollectionStatus(str, enum.Enum):
    NOT_REQUIRED = "NOT_REQUIRED"
    SCHEDULED = "SCHEDULED"
    PRIORITY = "PRIORITY"
    OVERDUE = "OVERDUE"
    IN_PROGRESS = "IN_PROGRESS"
    COLLECTED = "COLLECTED"


class CollectionPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ConnectivityStatus(str, enum.Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    DEGRADED = "DEGRADED"


class Bin(Base):
    __tablename__ = "bins"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uuid: Mapped[uuid_pkg.UUID] = mapped_column(
        UUID(as_uuid=True),
        default=uuid_pkg.uuid4,
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
    bin_type: Mapped[BinType] = mapped_column(
        Enum(BinType, native_enum=False),
        default=BinType.STANDARD,
        server_default=BinType.STANDARD.value,
        nullable=False,
        index=True,
    )
    capacity_kg: Mapped[float] = mapped_column(
        Float,
        default=100.0,
        server_default="100.0",
        nullable=False,
    )
    current_fill_kg: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        server_default="0.0",
        nullable=False,
    )
    current_fill_percentage: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        server_default="0.0",
        nullable=False,
        index=True,
    )
    waste_type: Mapped[WasteType] = mapped_column(
        Enum(WasteType, native_enum=False),
        default=WasteType.ORGANIC,
        server_default=WasteType.ORGANIC.value,
        nullable=False,
        index=True,
    )
    status: Mapped[BinStatus] = mapped_column(
        Enum(BinStatus, native_enum=False),
        default=BinStatus.NORMAL,
        server_default=BinStatus.NORMAL.value,
        nullable=False,
        index=True,
    )
    zone: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    location_name: Mapped[str] = mapped_column(
        String(150),
        default="Default Location",
        server_default="Default Location",
        nullable=False,
    )
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Sensor & Connectivity
    sensor_id: Mapped[Optional[str]] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=True,
    )
    battery_percentage: Mapped[float] = mapped_column(
        Float,
        default=100.0,
        server_default="100.0",
        nullable=False,
    )
    connectivity_status: Mapped[ConnectivityStatus] = mapped_column(
        Enum(ConnectivityStatus, native_enum=False),
        default=ConnectivityStatus.ONLINE,
        server_default=ConnectivityStatus.ONLINE.value,
        nullable=False,
        index=True,
    )

    # Collection Operations & Priority
    collection_status: Mapped[CollectionStatus] = mapped_column(
        Enum(CollectionStatus, native_enum=False),
        default=CollectionStatus.NOT_REQUIRED,
        server_default=CollectionStatus.NOT_REQUIRED.value,
        nullable=False,
        index=True,
    )
    priority: Mapped[CollectionPriority] = mapped_column(
        Enum(CollectionPriority, native_enum=False),
        default=CollectionPriority.LOW,
        server_default=CollectionPriority.LOW.value,
        nullable=False,
        index=True,
    )
    last_collection_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    next_collection_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    last_telemetry_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
    )

    # AI Predictions (Stored outputs)
    predicted_fill_percentage: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    predicted_overflow_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
    )
    prediction_confidence: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    # Lifecycle
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
        index=True,
    )

    # Backward compatibility with RouteStop module
    capacity_liters: Mapped[float] = mapped_column(
        Float,
        default=240.0,
        server_default="240.0",
        nullable=False,
    )
    fill_level: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        server_default="0.0",
        nullable=False,
    )

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
        cascade="all, delete-orphan",
    )
    sensor: Mapped[Optional["Sensor"]] = relationship(
        "Sensor",
        back_populates="bin",
        uselist=False,
    )
    telemetry_records: Mapped[List["BinTelemetry"]] = relationship(
        "BinTelemetry",
        back_populates="bin",
        cascade="all, delete-orphan",
    )
    collection_history: Mapped[List["BinCollectionHistory"]] = relationship(
        "BinCollectionHistory",
        back_populates="bin",
        cascade="all, delete-orphan",
    )
    activities: Mapped[List["BinActivity"]] = relationship(
        "BinActivity",
        back_populates="bin",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Bin(id={self.id}, code='{self.bin_code}', fill={self.current_fill_percentage}%)>"
