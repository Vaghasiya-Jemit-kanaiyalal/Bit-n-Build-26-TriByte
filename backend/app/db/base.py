from app.db.base_class import Base  # noqa: F401
from app.models.user import User, UserRole, UserStatus  # noqa: F401
from app.models.password_reset import PasswordResetToken  # noqa: F401
from app.models.vehicle import Vehicle, VehicleType, EnergyType, VehicleStatus  # noqa: F401
from app.models.vehicle_maintenance import VehicleMaintenanceRecord, MaintenanceStatus  # noqa: F401
from app.models.vehicle_history import VehicleActivity  # noqa: F401
from app.models.bin import (  # noqa: F401
    Bin,
    BinType,
    WasteType,
    BinStatus,
    CollectionStatus,
    CollectionPriority,
    ConnectivityStatus,
)
from app.models.sensor import Sensor  # noqa: F401
from app.models.bin_telemetry import BinTelemetry  # noqa: F401
from app.models.bin_collection import BinCollectionHistory  # noqa: F401
from app.models.bin_activity import BinActivity  # noqa: F401
from app.models.route import Route, RoutePriority, RouteStatus  # noqa: F401
from app.models.route_stop import RouteStop, StopPriority, StopStatus  # noqa: F401
from app.models.waste_classification import WasteClassification, ClassificationSource  # noqa: F401
from app.models.alert import Alert, AlertActivity  # noqa: F401

__all__ = [
    "Base",
    "User",
    "UserRole",
    "UserStatus",
    "PasswordResetToken",
    "Vehicle",
    "VehicleType",
    "EnergyType",
    "VehicleStatus",
    "VehicleMaintenanceRecord",
    "MaintenanceStatus",
    "VehicleActivity",
    "Bin",
    "BinType",
    "WasteType",
    "BinStatus",
    "CollectionStatus",
    "CollectionPriority",
    "ConnectivityStatus",
    "Sensor",
    "BinTelemetry",
    "BinCollectionHistory",
    "BinActivity",
    "Route",
    "RoutePriority",
    "RouteStatus",
    "RouteStop",
    "StopPriority",
    "StopStatus",
    "WasteClassification",
    "ClassificationSource",
    "Alert",
    "AlertActivity",
]
