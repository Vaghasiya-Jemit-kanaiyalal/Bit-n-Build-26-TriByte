from app.models.user import User, UserRole, UserStatus
from app.models.password_reset import PasswordResetToken
from app.models.vehicle import Vehicle, VehicleType, EnergyType, VehicleStatus
from app.models.vehicle_maintenance import VehicleMaintenanceRecord, MaintenanceStatus
from app.models.vehicle_history import VehicleActivity
from app.models.bin import (
    Bin,
    BinType,
    WasteType,
    BinStatus,
    CollectionStatus,
    CollectionPriority,
    ConnectivityStatus,
)
from app.models.sensor import Sensor
from app.models.bin_telemetry import BinTelemetry
from app.models.bin_collection import BinCollectionHistory
from app.models.bin_activity import BinActivity
from app.models.route import Route, RoutePriority, RouteStatus
from app.models.route_stop import RouteStop, StopPriority, StopStatus
from app.models.waste_classification import WasteClassification, ClassificationSource
from app.models.alert import Alert, AlertActivity

__all__ = [
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
