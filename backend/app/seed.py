import asyncio
import uuid
from datetime import date, datetime, timezone, timedelta
from sqlalchemy import select, and_, func
from app.core.security import hash_password
from app.db.database import AsyncSessionLocal
from app.models.user import User, UserRole, UserStatus
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
from app.models.route import Route, RouteStatus, RoutePriority
from app.models.route_stop import RouteStop, StopStatus, StopPriority
from app.models.waste_classification import WasteClassification, ClassificationSource

DEMO_USERS = [
    {
        "first_name": "Yug",
        "last_name": "Admin",
        "email": "yug@gmail.com",
        "password": "Yug@5599",
        "role": UserRole.ADMIN,
        "status": UserStatus.ACTIVE,
        "organization": "EcoTrack AI Central HQ",
        "department": "Platform Administration",
        "phone": "+91 98765 43210",
    },
    {
        "first_name": "System",
        "last_name": "Admin",
        "email": "admin@gmail.com",
        "password": "admin123",
        "role": UserRole.ADMIN,
        "status": UserStatus.ACTIVE,
        "organization": "EcoTrack AI Central HQ",
        "department": "IT Operations",
        "phone": "+91 98765 00001",
    },
    {
        "first_name": "Rahul",
        "last_name": "Driver",
        "email": "rahul@driver.gmail.com",
        "password": "driver123",
        "role": UserRole.DRIVER,
        "status": UserStatus.ACTIVE,
        "organization": "Metro Route Fleet #12",
        "department": "Field Operations",
        "phone": "+91 98765 00002",
    },
    {
        "first_name": "Jay",
        "last_name": "Analyst",
        "email": "jay@analyst.gmail.com",
        "password": "analyst123",
        "role": UserRole.ANALYST,
        "status": UserStatus.ACTIVE,
        "organization": "Environmental Oversight Bureau",
        "department": "Analytics & Audit",
        "phone": "+91 98765 00003",
    },
    # Driver accounts matching mock route data
    {
        "first_name": "Arjun",
        "last_name": "Patel",
        "email": "arjun@driver.gmail.com",
        "password": "Driver@2026!",
        "role": UserRole.DRIVER,
        "status": UserStatus.ACTIVE,
        "organization": "Metro Route Fleet #12",
        "department": "Zone A Logistics",
        "phone": "+91 98765 11001",
    },
    {
        "first_name": "Rohan",
        "last_name": "Shah",
        "email": "rohan@driver.gmail.com",
        "password": "Driver@2026!",
        "role": UserRole.DRIVER,
        "status": UserStatus.ACTIVE,
        "organization": "Metro Route Fleet #12",
        "department": "Zone C Logistics",
        "phone": "+91 98765 11002",
    },
    {
        "first_name": "Neha",
        "last_name": "Patel",
        "email": "neha@driver.gmail.com",
        "password": "Driver@2026!",
        "role": UserRole.DRIVER,
        "status": UserStatus.ACTIVE,
        "organization": "Metro Route Fleet #12",
        "department": "Zone B Logistics",
        "phone": "+91 98765 11003",
    },
    {
        "first_name": "Vivek",
        "last_name": "Shah",
        "email": "vivek@driver.gmail.com",
        "password": "Driver@2026!",
        "role": UserRole.DRIVER,
        "status": UserStatus.ACTIVE,
        "organization": "Metro Route Fleet #12",
        "department": "Zone D Logistics",
        "phone": "+91 98765 11004",
    },
    {
        "first_name": "Neha",
        "last_name": "Shah",
        "email": "nehashah@driver.gmail.com",
        "password": "Driver@2026!",
        "role": UserRole.DRIVER,
        "status": UserStatus.ACTIVE,
        "organization": "Metro Route Fleet #12",
        "department": "West Zone Logistics",
        "phone": "+91 98765 11005",
    },
    {
        "first_name": "Rohan",
        "last_name": "Patel",
        "email": "rohan.patel@wastewise.ai",
        "password": "Driver@2026!",
        "role": UserRole.DRIVER,
        "status": UserStatus.ACTIVE,
        "organization": "Metro Route Fleet #12",
        "department": "East Zone Logistics",
        "phone": "+91 98765 11006",
    },
    {
        "first_name": "Vikram",
        "last_name": "Joshi",
        "email": "vikram.joshi@wastewise.ai",
        "password": "Driver@2026!",
        "role": UserRole.DRIVER,
        "status": UserStatus.ACTIVE,
        "organization": "Metro Route Fleet #12",
        "department": "North Zone Logistics",
        "phone": "+91 98765 11007",
    },
]

DEMO_VEHICLES = [
    # Core fleet vehicles matching frontend vehicle page
    {
        "vehicle_code": "VEH-001",
        "name": "EcoCompactor 01",
        "vehicle_type": "COMPACTOR",
        "registration_number": "GJ-01-AB-1234",
        "capacity_kg": 1200.0,
        "current_load_kg": 780.0,
        "energy_type": "DIESEL",
        "status": "ON_ROUTE",
        "zone": "North Zone",
        "driver_email": "arjun.patel@wastewise.ai",
        "latitude": 22.3072,
        "longitude": 73.1812,
    },
    {
        "vehicle_code": "VEH-002",
        "name": "GreenHaul 02",
        "vehicle_type": "RECYCLING_TRUCK",
        "registration_number": "GJ-01-CD-5678",
        "capacity_kg": 900.0,
        "current_load_kg": 420.0,
        "energy_type": "CNG",
        "status": "AVAILABLE",
        "zone": "West Zone",
        "driver_email": "neha.shah@wastewise.ai",
        "latitude": 22.2980,
        "longitude": 73.1750,
    },
    {
        "vehicle_code": "VEH-003",
        "name": "CleanMove 07",
        "vehicle_type": "TIPPER",
        "registration_number": "GJ-01-EF-9012",
        "capacity_kg": 1500.0,
        "current_load_kg": 0.0,
        "energy_type": "DIESEL",
        "status": "MAINTENANCE",
        "zone": "Central Zone",
        "driver_email": None,
        "latitude": 22.3120,
        "longitude": 73.1900,
    },
    {
        "vehicle_code": "VEH-004",
        "name": "EcoMini 03",
        "vehicle_type": "MINI_COLLECTION",
        "registration_number": "GJ-01-GH-3456",
        "capacity_kg": 500.0,
        "current_load_kg": 310.0,
        "energy_type": "ELECTRIC",
        "status": "ON_ROUTE",
        "zone": "East Zone",
        "driver_email": "rohan.patel@wastewise.ai",
        "latitude": 22.3050,
        "longitude": 73.2010,
    },
    {
        "vehicle_code": "VEH-005",
        "name": "VoltClean EV-01",
        "vehicle_type": "ELECTRIC_COLLECTION",
        "registration_number": "GJ-01-EV-0001",
        "capacity_kg": 750.0,
        "current_load_kg": 620.0,
        "energy_type": "ELECTRIC",
        "status": "ON_ROUTE",
        "zone": "North Zone",
        "driver_email": "vikram.joshi@wastewise.ai",
        "latitude": 22.3150,
        "longitude": 73.1840,
    },
    {
        "vehicle_code": "VEH-007",
        "name": "GreenHaul 05",
        "vehicle_type": "COMPACTOR",
        "registration_number": "GJ-01-CD-7744",
        "capacity_kg": 1000.0,
        "current_load_kg": 920.0,  # 92% capacity - Near collection limit
        "energy_type": "CNG",
        "status": "ON_ROUTE",
        "zone": "South Zone",
        "driver_email": "vivek.shah@wastewise.ai",
        "latitude": 22.2850,
        "longitude": 73.1700,
    },
    {
        "vehicle_code": "VEH-013",
        "name": "EcoMini 01",
        "vehicle_type": "MINI_COLLECTION",
        "registration_number": "GJ-01-GH-1122",
        "capacity_kg": 600.0,
        "current_load_kg": 0.0,
        "energy_type": "CNG",
        "status": "MAINTENANCE",
        "zone": "Central Zone",
        "driver_email": None,
        "latitude": 22.3100,
        "longitude": 73.1890,
    },
    {
        "vehicle_code": "VEH-018",
        "name": "VoltClean EV-02",
        "vehicle_type": "ELECTRIC_COLLECTION",
        "registration_number": "GJ-01-EV-0002",
        "capacity_kg": 800.0,
        "current_load_kg": 550.0,
        "energy_type": "ELECTRIC",
        "status": "OFFLINE",
        "zone": "West Zone",
        "driver_email": None,
        "latitude": 22.2900,
        "longitude": 73.1600,
    },
    # Existing route demo trucks
    {
        "vehicle_code": "TRK-04",
        "name": "EcoCompactor 04",
        "vehicle_type": "COMPACTOR",
        "registration_number": "GJ-01-WW-1004",
        "capacity_kg": 1200.0,
        "current_load_kg": 864.0,
        "energy_type": "DIESEL",
        "status": "ON_ROUTE",
        "zone": "Zone A",
        "driver_email": "arjun.patel@wastewise.ai",
        "latitude": 23.0225,
        "longitude": 72.5714,
    },
    {
        "vehicle_code": "TRK-01",
        "name": "EcoCompactor 01",
        "vehicle_type": "COMPACTOR",
        "registration_number": "GJ-01-WW-1001",
        "capacity_kg": 1500.0,
        "current_load_kg": 1425.0,
        "energy_type": "DIESEL",
        "status": "AVAILABLE",
        "zone": "Zone C",
        "driver_email": "rohan.shah@wastewise.ai",
        "latitude": 23.0338,
        "longitude": 72.5850,
    },
    {
        "vehicle_code": "TRK-02",
        "name": "EcoHauler 02",
        "vehicle_type": "COMPACTOR",
        "registration_number": "GJ-01-WW-1002",
        "capacity_kg": 1200.0,
        "current_load_kg": 1008.0,
        "energy_type": "CNG",
        "status": "ON_ROUTE",
        "zone": "Zone B",
        "driver_email": "neha.patel@wastewise.ai",
        "latitude": 23.0450,
        "longitude": 72.5620,
    },
    {
        "vehicle_code": "TRK-03",
        "name": "EcoHauler 03",
        "vehicle_type": "TIPPER",
        "registration_number": "GJ-01-WW-1003",
        "capacity_kg": 1400.0,
        "current_load_kg": 0.0,
        "energy_type": "DIESEL",
        "status": "AVAILABLE",
        "zone": "Zone D",
        "driver_email": None,
        "latitude": 23.0180,
        "longitude": 72.5910,
    },
    {
        "vehicle_code": "TRK-05",
        "name": "EcoReserve 05",
        "vehicle_type": "MINI_COLLECTION",
        "registration_number": "GJ-01-WW-1005",
        "capacity_kg": 800.0,
        "current_load_kg": 0.0,
        "energy_type": "ELECTRIC",
        "status": "AVAILABLE",
        "zone": "Zone A",
        "driver_email": None,
        "latitude": 23.0290,
        "longitude": 72.5690,
    },
]

DEMO_BINS = [
    # Existing Campus Bins
    {"bin_code": "BIN-104", "name": "Cafeteria Primary Bin", "location_name": "Central Cafeteria", "zone": "Central Zone", "waste_type": WasteType.OTHER, "bin_type": BinType.COMMERCIAL, "capacity_kg": 100.0, "fill_level": 96.0, "priority": CollectionPriority.CRITICAL, "status": BinStatus.CRITICAL, "collection_status": CollectionStatus.PRIORITY, "sensor_id": "SNS-0104", "battery_percentage": 78.0, "latitude": 23.0231, "longitude": 72.5718},
    {"bin_code": "BIN-217", "name": "North Gate Bin", "location_name": "North Gate", "zone": "North Zone", "waste_type": WasteType.PLASTIC, "bin_type": BinType.RECYCLING, "capacity_kg": 50.0, "fill_level": 91.0, "priority": CollectionPriority.CRITICAL, "status": BinStatus.CRITICAL, "collection_status": CollectionStatus.PRIORITY, "sensor_id": "SNS-0217", "battery_percentage": 85.0, "latitude": 23.0255, "longitude": 72.5732},
    {"bin_code": "BIN-083", "name": "Library Plaza Bin", "location_name": "Library Block", "zone": "East Zone", "waste_type": WasteType.PAPER, "bin_type": BinType.RECYCLING, "capacity_kg": 75.0, "fill_level": 78.0, "priority": CollectionPriority.HIGH, "status": BinStatus.WARNING, "collection_status": CollectionStatus.SCHEDULED, "sensor_id": "SNS-0083", "battery_percentage": 92.0, "latitude": 23.0270, "longitude": 72.5695},
    {"bin_code": "BIN-142", "name": "Sports Field Bin", "location_name": "Sports Complex", "zone": "South Zone", "waste_type": WasteType.ORGANIC, "bin_type": BinType.ORGANIC, "capacity_kg": 100.0, "fill_level": 74.0, "priority": CollectionPriority.HIGH, "status": BinStatus.NORMAL, "collection_status": CollectionStatus.SCHEDULED, "sensor_id": "SNS-0142", "battery_percentage": 88.0, "latitude": 23.0295, "longitude": 72.5680},
    {"bin_code": "BIN-099", "name": "Student Center Bin", "location_name": "Student Center", "zone": "Central Zone", "waste_type": WasteType.PLASTIC, "bin_type": BinType.STANDARD, "capacity_kg": 100.0, "fill_level": 88.0, "priority": CollectionPriority.HIGH, "status": BinStatus.WARNING, "collection_status": CollectionStatus.SCHEDULED, "sensor_id": "SNS-0099", "battery_percentage": 64.0, "latitude": 23.0240, "longitude": 72.5725},
    {"bin_code": "BIN-112", "name": "Engineering Annex Bin", "location_name": "Engineering Annex", "zone": "North Zone", "waste_type": WasteType.PAPER, "bin_type": BinType.STANDARD, "capacity_kg": 50.0, "fill_level": 65.0, "priority": CollectionPriority.LOW, "status": BinStatus.NORMAL, "collection_status": CollectionStatus.NOT_REQUIRED, "sensor_id": "SNS-0112", "battery_percentage": 95.0, "latitude": 23.0260, "longitude": 72.5740},
    {"bin_code": "BIN-401", "name": "Hostel 1 Bin", "location_name": "Hostel Block 1", "zone": "Residential Zone", "waste_type": WasteType.OTHER, "bin_type": BinType.STANDARD, "capacity_kg": 100.0, "fill_level": 82.0, "priority": CollectionPriority.HIGH, "status": BinStatus.WARNING, "collection_status": CollectionStatus.SCHEDULED, "sensor_id": "SNS-0401", "battery_percentage": 71.0, "latitude": 23.0210, "longitude": 72.5760},
    {"bin_code": "BIN-402", "name": "Hostel 2 Bin", "location_name": "Hostel Block 2", "zone": "Residential Zone", "waste_type": WasteType.ORGANIC, "bin_type": BinType.ORGANIC, "capacity_kg": 100.0, "fill_level": 79.0, "priority": CollectionPriority.HIGH, "status": BinStatus.WARNING, "collection_status": CollectionStatus.SCHEDULED, "sensor_id": "SNS-0402", "battery_percentage": 82.0, "latitude": 23.0205, "longitude": 72.5775},
    {"bin_code": "BIN-403", "name": "Faculty Housing Bin", "location_name": "Faculty Housing", "zone": "Residential Zone", "waste_type": WasteType.PAPER, "bin_type": BinType.STANDARD, "capacity_kg": 50.0, "fill_level": 55.0, "priority": CollectionPriority.LOW, "status": BinStatus.NORMAL, "collection_status": CollectionStatus.NOT_REQUIRED, "sensor_id": "SNS-0403", "battery_percentage": 90.0, "latitude": 23.0310, "longitude": 72.5660},
    {"bin_code": "BIN-404", "name": "Admin Quad Bin", "location_name": "Admin Quad", "zone": "Central Zone", "waste_type": WasteType.PLASTIC, "bin_type": BinType.RECYCLING, "capacity_kg": 75.0, "fill_level": 60.0, "priority": CollectionPriority.LOW, "status": BinStatus.NORMAL, "collection_status": CollectionStatus.NOT_REQUIRED, "sensor_id": "SNS-0404", "battery_percentage": 94.0, "latitude": 23.0245, "longitude": 72.5710},
    {"bin_code": "BIN-305", "name": "Science Block Bin", "location_name": "Science Building", "zone": "North Zone", "waste_type": WasteType.GLASS, "bin_type": BinType.RECYCLING, "capacity_kg": 50.0, "fill_level": 85.0, "priority": CollectionPriority.HIGH, "status": BinStatus.WARNING, "collection_status": CollectionStatus.SCHEDULED, "sensor_id": "SNS-0305", "battery_percentage": 69.0, "latitude": 23.0330, "longitude": 72.5675},
    {"bin_code": "BIN-308", "name": "Auditorium Bin", "location_name": "Auditorium Rear", "zone": "West Zone", "waste_type": WasteType.OTHER, "bin_type": BinType.COMMERCIAL, "capacity_kg": 100.0, "fill_level": 68.0, "priority": CollectionPriority.LOW, "status": BinStatus.NORMAL, "collection_status": CollectionStatus.NOT_REQUIRED, "sensor_id": "SNS-0308", "battery_percentage": 88.0, "latitude": 23.0345, "longitude": 72.5650},
    {"bin_code": "BIN-312", "name": "Health Center Bin", "location_name": "Health Center", "zone": "West Zone", "waste_type": WasteType.ORGANIC, "bin_type": BinType.ORGANIC, "capacity_kg": 50.0, "fill_level": 72.0, "priority": CollectionPriority.LOW, "status": BinStatus.NORMAL, "collection_status": CollectionStatus.NOT_REQUIRED, "sensor_id": "SNS-0312", "battery_percentage": 91.0, "latitude": 23.0360, "longitude": 72.5635},
    {"bin_code": "BIN-319", "name": "Main Gate Bin", "location_name": "Main Gate Exit", "zone": "Central Zone", "waste_type": WasteType.METAL, "bin_type": BinType.RECYCLING, "capacity_kg": 75.0, "fill_level": 50.0, "priority": CollectionPriority.LOW, "status": BinStatus.NORMAL, "collection_status": CollectionStatus.NOT_REQUIRED, "sensor_id": "SNS-0319", "battery_percentage": 87.0, "latitude": 23.0220, "longitude": 72.5700},

    # City-wide Smart Fleet Bins (Matching Frontend Mock Data)
    {"bin_code": "BIN-1087", "name": "Central Market Main Bin", "location_name": "Central Market, Sector 4", "zone": "Central Zone", "waste_type": WasteType.ORGANIC, "bin_type": BinType.SMART, "capacity_kg": 450.0, "fill_level": 92.0, "priority": CollectionPriority.CRITICAL, "status": BinStatus.CRITICAL, "collection_status": CollectionStatus.PRIORITY, "sensor_id": "SNS-1087", "battery_percentage": 82.0, "latitude": 22.3072, "longitude": 73.1812},
    {"bin_code": "BIN-1201", "name": "Industrial Estate Gate 2", "location_name": "GIDC Phase 1", "zone": "Industrial Zone", "waste_type": WasteType.OTHER, "bin_type": BinType.INDUSTRIAL, "capacity_kg": 500.0, "fill_level": 86.0, "priority": CollectionPriority.HIGH, "status": BinStatus.WARNING, "collection_status": CollectionStatus.SCHEDULED, "sensor_id": "SNS-1201", "battery_percentage": 74.0, "latitude": 22.3150, "longitude": 73.1900},
    {"bin_code": "BIN-1342", "name": "Tech Park Tower A", "location_name": "Infocity IT Corridor", "zone": "North Zone", "waste_type": WasteType.PLASTIC, "bin_type": BinType.COMMERCIAL, "capacity_kg": 250.0, "fill_level": 78.0, "priority": CollectionPriority.HIGH, "status": BinStatus.WARNING, "collection_status": CollectionStatus.SCHEDULED, "sensor_id": "SNS-1342", "battery_percentage": 89.0, "latitude": 22.3250, "longitude": 73.1750},
    {"bin_code": "BIN-1405", "name": "City Hospital West Wing", "location_name": "General Hospital Area", "zone": "West Zone", "waste_type": WasteType.ORGANIC, "bin_type": BinType.SMART, "capacity_kg": 450.0, "fill_level": 65.0, "priority": CollectionPriority.LOW, "status": BinStatus.NORMAL, "collection_status": CollectionStatus.NOT_REQUIRED, "sensor_id": "SNS-1405", "battery_percentage": 95.0, "latitude": 22.2980, "longitude": 73.1650},
    {"bin_code": "BIN-1520", "name": "Railway Station Platform 1", "location_name": "Central Railway Junction", "zone": "Central Zone", "waste_type": WasteType.METAL, "bin_type": BinType.SMART, "capacity_kg": 300.0, "fill_level": 94.0, "priority": CollectionPriority.CRITICAL, "status": BinStatus.CRITICAL, "collection_status": CollectionStatus.PRIORITY, "sensor_id": "SNS-1520", "battery_percentage": 68.0, "latitude": 22.3100, "longitude": 73.1850},
    {"bin_code": "BIN-1689", "name": "Riverside Promenade North", "location_name": "Riverfront Walkway", "zone": "North Zone", "waste_type": WasteType.GLASS, "bin_type": BinType.RECYCLING, "capacity_kg": 100.0, "fill_level": 42.0, "priority": CollectionPriority.LOW, "status": BinStatus.NORMAL, "collection_status": CollectionStatus.NOT_REQUIRED, "sensor_id": "SNS-1689", "battery_percentage": 91.0, "latitude": 22.3200, "longitude": 73.1700},
    {"bin_code": "BIN-1744", "name": "Metro Station Concourse", "location_name": "Rapid Transit Line 1", "zone": "South Zone", "waste_type": WasteType.PAPER, "bin_type": BinType.COMMERCIAL, "capacity_kg": 200.0, "fill_level": 88.0, "priority": CollectionPriority.HIGH, "status": BinStatus.WARNING, "collection_status": CollectionStatus.SCHEDULED, "sensor_id": "SNS-1744", "battery_percentage": 79.0, "latitude": 22.2900, "longitude": 73.1800},
    {"bin_code": "BIN-1890", "name": "Community Center Sector 9", "location_name": "Urban Community Hall", "zone": "Residential Zone", "waste_type": WasteType.ORGANIC, "bin_type": BinType.ORGANIC, "capacity_kg": 450.0, "fill_level": 25.0, "priority": CollectionPriority.LOW, "status": BinStatus.NORMAL, "collection_status": CollectionStatus.NOT_REQUIRED, "sensor_id": "SNS-1890", "battery_percentage": 97.0, "latitude": 22.2850, "longitude": 73.1950},
    {"bin_code": "BIN-1923", "name": "University Campus Library", "location_name": "East Academic Quad", "zone": "East Zone", "waste_type": WasteType.PAPER, "bin_type": BinType.RECYCLING, "capacity_kg": 80.0, "fill_level": 91.0, "priority": CollectionPriority.CRITICAL, "status": BinStatus.CRITICAL, "collection_status": CollectionStatus.PRIORITY, "sensor_id": "SNS-1923", "battery_percentage": 84.0, "latitude": 22.3050, "longitude": 73.2050},
    {"bin_code": "BIN-2045", "name": "Sports Complex Gate 4", "location_name": "Olympic Stadium Entry", "zone": "South Zone", "waste_type": WasteType.PLASTIC, "bin_type": BinType.STANDARD, "capacity_kg": 220.0, "fill_level": 58.0, "priority": CollectionPriority.LOW, "status": BinStatus.NORMAL, "collection_status": CollectionStatus.NOT_REQUIRED, "sensor_id": "SNS-2045", "battery_percentage": 86.0, "latitude": 22.2800, "longitude": 73.1750},
    {"bin_code": "BIN-2110", "name": "Old Town Heritage Square", "location_name": "Heritage Clock Tower", "zone": "Central Zone", "waste_type": WasteType.OTHER, "bin_type": BinType.STANDARD, "capacity_kg": 100.0, "fill_level": 0.0, "priority": CollectionPriority.LOW, "status": BinStatus.MAINTENANCE, "collection_status": CollectionStatus.NOT_REQUIRED, "sensor_id": "SNS-2110", "battery_percentage": 45.0, "latitude": 22.3020, "longitude": 73.1830},
    {"bin_code": "BIN-2250", "name": "Highway Service Station East", "location_name": "National Highway Toll", "zone": "East Zone", "waste_type": WasteType.OTHER, "bin_type": BinType.INDUSTRIAL, "capacity_kg": 500.0, "fill_level": 40.0, "priority": CollectionPriority.LOW, "status": BinStatus.OFFLINE, "collection_status": CollectionStatus.NOT_REQUIRED, "sensor_id": "SNS-2250", "battery_percentage": 12.0, "latitude": 22.3120, "longitude": 73.2150},
    {"bin_code": "BIN-2380", "name": "Shopping Mall Food Court", "location_name": "Mega Mall Level 3", "zone": "Central Zone", "waste_type": WasteType.ORGANIC, "bin_type": BinType.SMART, "capacity_kg": 450.0, "fill_level": 95.0, "priority": CollectionPriority.CRITICAL, "status": BinStatus.CRITICAL, "collection_status": CollectionStatus.PRIORITY, "sensor_id": "SNS-2380", "battery_percentage": 80.0, "latitude": 22.3085, "longitude": 73.1818},
    {"bin_code": "BIN-2415", "name": "Residential Colony Park", "location_name": "Green Valley Gardens", "zone": "Residential Zone", "waste_type": WasteType.PLASTIC, "bin_type": BinType.STANDARD, "capacity_kg": 90.0, "fill_level": 35.0, "priority": CollectionPriority.LOW, "status": BinStatus.NORMAL, "collection_status": CollectionStatus.NOT_REQUIRED, "sensor_id": "SNS-2415", "battery_percentage": 93.0, "latitude": 22.2880, "longitude": 73.1900},
]


async def seed_all():
    print("[*] Starting WasteWise AI Database Seeding...")
    async with AsyncSessionLocal() as session:
        # 1. Users
        user_map = {}
        for u in DEMO_USERS:
            res = await session.execute(select(User).where(User.email == u["email"]))
            existing = res.scalar_one_or_none()
            if existing:
                existing.first_name = u["first_name"]
                existing.last_name = u["last_name"]
                existing.password_hash = hash_password(u["password"])
                existing.role = u["role"]
                existing.status = u["status"]
                user_map[u["email"]] = existing
            else:
                new_user = User(
                    uuid=uuid.uuid4(),
                    first_name=u["first_name"],
                    last_name=u["last_name"],
                    email=u["email"],
                    phone=u["phone"],
                    password_hash=hash_password(u["password"]),
                    role=u["role"],
                    status=u["status"],
                    organization=u["organization"],
                    department=u["department"],
                )
                session.add(new_user)
                await session.flush()
                user_map[u["email"]] = new_user
        print(f"[+] Users checked/seeded: {len(user_map)}")

        # 2. Vehicles
        vehicle_map = {}
        for v in DEMO_VEHICLES:
            driver_user = user_map.get(v.get("driver_email")) if v.get("driver_email") else None
            driver_id = driver_user.id if driver_user else None

            res = await session.execute(select(Vehicle).where(Vehicle.vehicle_code == v["vehicle_code"]))
            existing_v = res.scalar_one_or_none()
            if existing_v:
                existing_v.name = v["name"]
                existing_v.vehicle_type = v["vehicle_type"]
                existing_v.registration_number = v.get("registration_number")
                existing_v.license_plate = v.get("registration_number")
                existing_v.capacity_kg = v["capacity_kg"]
                existing_v.current_load_kg = v["current_load_kg"]
                existing_v.energy_type = v["energy_type"]
                existing_v.status = v["status"]
                existing_v.zone = v["zone"]
                existing_v.driver_id = driver_id
                existing_v.current_latitude = v["latitude"]
                existing_v.current_longitude = v["longitude"]
                existing_v.latitude = v["latitude"]
                existing_v.longitude = v["longitude"]
                existing_v.is_active = (v["status"] != "INACTIVE")
                vehicle_map[v["vehicle_code"]] = existing_v
            else:
                new_v = Vehicle(
                    uuid=uuid.uuid4(),
                    vehicle_code=v["vehicle_code"],
                    name=v["name"],
                    vehicle_type=v["vehicle_type"],
                    registration_number=v.get("registration_number"),
                    license_plate=v.get("registration_number"),
                    capacity_kg=v["capacity_kg"],
                    current_load_kg=v["current_load_kg"],
                    energy_type=v["energy_type"],
                    status=v["status"],
                    zone=v["zone"],
                    driver_id=driver_id,
                    current_latitude=v["latitude"],
                    current_longitude=v["longitude"],
                    latitude=v["latitude"],
                    longitude=v["longitude"],
                    is_active=(v["status"] != "INACTIVE"),
                )
                session.add(new_v)
                await session.flush()
                vehicle_map[v["vehicle_code"]] = new_v
        print(f"[+] Vehicles checked/seeded: {len(vehicle_map)}")

        # Maintenance records seeding
        demo_maintenance = [
            {"vehicle_code": "VEH-001", "service_type": "Routine Service", "service_date": date(2026, 9, 12), "next_service_date": date(2026, 10, 12), "odometer_km": 18420, "status": MaintenanceStatus.COMPLETED, "notes": "Oil and filter inspection, pressure check"},
            {"vehicle_code": "VEH-001", "service_type": "Brake Inspection", "service_date": date(2026, 8, 12), "next_service_date": date(2026, 9, 12), "odometer_km": 16900, "status": MaintenanceStatus.COMPLETED, "notes": "No major issues, pads 80%"},
            {"vehicle_code": "VEH-002", "service_type": "Spark Plug & CNG Check", "service_date": date(2026, 9, 5), "next_service_date": date(2026, 10, 5), "odometer_km": 14200, "status": MaintenanceStatus.COMPLETED, "notes": "Cleaned intake valves"},
            {"vehicle_code": "VEH-003", "service_type": "Hydraulics Check", "service_date": date(2026, 8, 10), "next_service_date": date(2026, 9, 10), "odometer_km": 21000, "status": MaintenanceStatus.COMPLETED, "notes": "Replaced hydraulic fluid line"},
            {"vehicle_code": "VEH-004", "service_type": "EV Battery Diagnostic", "service_date": date(2026, 9, 14), "next_service_date": date(2026, 10, 14), "odometer_km": 9200, "status": MaintenanceStatus.COMPLETED, "notes": "Health 98%"},
            {"vehicle_code": "VEH-013", "service_type": "Transmission Overhaul", "service_date": date(2026, 6, 2), "next_service_date": date(2026, 7, 2), "odometer_km": 28000, "status": MaintenanceStatus.OVERDUE, "notes": "Filter replacement & fluid leak"},
        ]
        for m in demo_maintenance:
            v_obj = vehicle_map.get(m["vehicle_code"])
            if v_obj:
                m_stmt = select(VehicleMaintenanceRecord).where(
                    and_(
                        VehicleMaintenanceRecord.vehicle_id == v_obj.id,
                        VehicleMaintenanceRecord.service_type == m["service_type"],
                    )
                )
                if not (await session.execute(m_stmt)).scalar_one_or_none():
                    rec = VehicleMaintenanceRecord(
                        vehicle_id=v_obj.id,
                        service_type=m["service_type"],
                        service_date=m["service_date"],
                        next_service_date=m["next_service_date"],
                        odometer_km=m["odometer_km"],
                        status=m["status"],
                        notes=m["notes"],
                    )
                    session.add(rec)
        print("[+] Maintenance records checked/seeded")

        # 3. Bins
        bin_map = {}
        now = datetime.now(timezone.utc)
        for b in DEMO_BINS:
            cap_kg = b.get("capacity_kg", 100.0)
            fill_pct = b["fill_level"]
            fill_kg = round((fill_pct / 100.0) * cap_kg, 2)
            c_status = b.get("connectivity_status", ConnectivityStatus.OFFLINE if b["status"] == BinStatus.OFFLINE else ConnectivityStatus.ONLINE)

            res = await session.execute(select(Bin).where(Bin.bin_code == b["bin_code"]))
            existing_b = res.scalar_one_or_none()
            if existing_b:
                existing_b.name = b["name"]
                existing_b.location_name = b["location_name"]
                existing_b.bin_type = b.get("bin_type", BinType.STANDARD)
                existing_b.capacity_kg = cap_kg
                existing_b.capacity_liters = cap_kg * 2.4
                existing_b.current_fill_kg = fill_kg
                existing_b.current_fill_percentage = fill_pct
                existing_b.fill_level = fill_pct
                existing_b.waste_type = b["waste_type"]
                existing_b.status = b["status"]
                existing_b.collection_status = b.get("collection_status", CollectionStatus.NOT_REQUIRED)
                existing_b.priority = b["priority"]
                existing_b.latitude = b["latitude"]
                existing_b.longitude = b["longitude"]
                existing_b.sensor_id = b.get("sensor_id")
                existing_b.battery_percentage = b.get("battery_percentage", 100.0)
                existing_b.connectivity_status = c_status
                existing_b.last_telemetry_at = now - timedelta(minutes=10)
                existing_b.predicted_fill_percentage = min(100.0, fill_pct + 5.0)
                existing_b.predicted_overflow_at = now + timedelta(hours=3) if fill_pct >= 85.0 else None
                existing_b.prediction_confidence = 90.0 if fill_pct >= 75.0 else 80.0
                existing_b.is_active = b["status"] != BinStatus.INACTIVE
                target_bin = existing_b
            else:
                new_b = Bin(
                    uuid=uuid.uuid4(),
                    bin_code=b["bin_code"],
                    name=b["name"],
                    location_name=b["location_name"],
                    zone=b["zone"],
                    bin_type=b.get("bin_type", BinType.STANDARD),
                    capacity_kg=cap_kg,
                    capacity_liters=cap_kg * 2.4,
                    current_fill_kg=fill_kg,
                    current_fill_percentage=fill_pct,
                    fill_level=fill_pct,
                    waste_type=b["waste_type"],
                    status=b["status"],
                    collection_status=b.get("collection_status", CollectionStatus.NOT_REQUIRED),
                    priority=b["priority"],
                    latitude=b["latitude"],
                    longitude=b["longitude"],
                    sensor_id=b.get("sensor_id"),
                    battery_percentage=b.get("battery_percentage", 100.0),
                    connectivity_status=c_status,
                    last_telemetry_at=now - timedelta(minutes=10),
                    predicted_fill_percentage=min(100.0, fill_pct + 5.0),
                    predicted_overflow_at=now + timedelta(hours=3) if fill_pct >= 85.0 else None,
                    prediction_confidence=90.0 if fill_pct >= 75.0 else 80.0,
                    is_active=b["status"] != BinStatus.INACTIVE,
                )
                session.add(new_b)
                await session.flush()
                target_bin = new_b

            bin_map[b["bin_code"]] = target_bin

            # Seed Sensor if sensor_id present
            s_id = b.get("sensor_id")
            if s_id:
                s_res = await session.execute(select(Sensor).where(Sensor.sensor_id == s_id))
                existing_sensor = s_res.scalar_one_or_none()
                if not existing_sensor:
                    sensor = Sensor(
                        sensor_id=s_id,
                        bin_id=target_bin.id,
                        sensor_type="ULTRASONIC",
                        status="ACTIVE",
                        battery_percentage=b.get("battery_percentage", 100.0),
                        last_reading_at=now - timedelta(minutes=10),
                        last_fill_reading=fill_pct,
                        temperature_celsius=26.5,
                        connectivity_status=c_status,
                        firmware_version="v2.4.1",
                    )
                    session.add(sensor)

            # Seed 2 Telemetry records
            t_res = await session.execute(select(BinTelemetry).where(BinTelemetry.bin_id == target_bin.id))
            if not t_res.scalars().first():
                t1 = BinTelemetry(
                    bin_id=target_bin.id,
                    sensor_id=s_id,
                    fill_percentage=max(0.0, fill_pct - 10.0),
                    fill_kg=round(max(0.0, fill_pct - 10.0) / 100.0 * cap_kg, 2),
                    battery_percentage=min(100.0, b.get("battery_percentage", 100.0) + 1.0),
                    temperature_celsius=27.0,
                    connectivity_status=c_status,
                    recorded_at=now - timedelta(hours=2),
                    source="IOT",
                )
                t2 = BinTelemetry(
                    bin_id=target_bin.id,
                    sensor_id=s_id,
                    fill_percentage=fill_pct,
                    fill_kg=fill_kg,
                    battery_percentage=b.get("battery_percentage", 100.0),
                    temperature_celsius=26.5,
                    connectivity_status=c_status,
                    recorded_at=now - timedelta(minutes=10),
                    source="IOT",
                )
                session.add_all([t1, t2])

            # Seed 1 Activity record
            a_res = await session.execute(select(BinActivity).where(BinActivity.bin_id == target_bin.id))
            if not a_res.scalars().first():
                act = BinActivity(
                    bin_id=target_bin.id,
                    activity_type="CREATED",
                    description=f"Bin {target_bin.bin_code} commissioned in {target_bin.zone}.",
                    created_at=now - timedelta(days=5),
                )
                session.add(act)

        print(f"[+] Bins checked/seeded: {len(bin_map)}")

        # 4. Routes
        arjun = user_map.get("arjun.patel@driver.gmail.com") or user_map.get("arjun.patel@wastewise.ai") or list(user_map.values())[0]
        rohan = user_map.get("rohan.shah@driver.gmail.com") or user_map.get("rohan.shah@wastewise.ai") or arjun
        neha = user_map.get("neha.patel@driver.gmail.com") or user_map.get("neha.patel@wastewise.ai") or arjun
        vivek = user_map.get("vivek.shah@driver.gmail.com") or user_map.get("vivek.shah@wastewise.ai") or arjun

        demo_routes = [
            {
                "route_code": "RT-024",
                "name": "North Campus Route 24",
                "zone": "Zone A",
                "vehicle_id": vehicle_map["TRK-04"].id,
                "driver_id": arjun.id,
                "scheduled_date": date.today(),
                "start_time": "08:30:00",
                "estimated_completion_time": "11:45:00",
                "status": RouteStatus.IN_PROGRESS,
                "priority": RoutePriority.HIGH,
                "total_stops": 14,
                "completed_stops": 8,
                "total_distance_km": 18.6,
                "estimated_duration_minutes": 195,
                "current_load_kg": 864.0,
                "vehicle_capacity_kg": 1200.0,
                "stops": [
                    ("BIN-104", 1, StopPriority.CRITICAL, StopStatus.PENDING, "09:02 AM", 96.0, None),
                    ("BIN-217", 2, StopPriority.CRITICAL, StopStatus.PENDING, "09:18 AM", 91.0, None),
                    ("BIN-083", 3, StopPriority.HIGH, StopStatus.PENDING, "09:31 AM", 78.0, None),
                    ("BIN-142", 4, StopPriority.HIGH, StopStatus.COMPLETED, "08:56 AM", 74.0, 115.0),
                    ("BIN-099", 5, StopPriority.HIGH, StopStatus.COMPLETED, "08:44 AM", 88.0, 120.5),
                    ("BIN-112", 6, StopPriority.MEDIUM, StopStatus.COMPLETED, "08:32 AM", 65.0, 90.0),
                    ("BIN-401", 7, StopPriority.HIGH, StopStatus.COMPLETED, "08:20 AM", 82.0, 130.0),
                    ("BIN-402", 8, StopPriority.MEDIUM, StopStatus.COMPLETED, "08:10 AM", 79.0, 110.0),
                    ("BIN-403", 9, StopPriority.MEDIUM, StopStatus.COMPLETED, "08:00 AM", 55.0, 85.0),
                    ("BIN-404", 10, StopPriority.MEDIUM, StopStatus.COMPLETED, "07:50 AM", 60.0, 95.0),
                    ("BIN-305", 11, StopPriority.HIGH, StopStatus.COMPLETED, "09:45 AM", 85.0, 118.5),
                    ("BIN-308", 12, StopPriority.MEDIUM, StopStatus.PENDING, "10:05 AM", 68.0, None),
                    ("BIN-312", 13, StopPriority.MEDIUM, StopStatus.PENDING, "10:20 AM", 72.0, None),
                    ("BIN-319", 14, StopPriority.MEDIUM, StopStatus.PENDING, "10:40 AM", 50.0, None),
                ],
            },
            {
                "route_code": "RT-021",
                "name": "West Campus Route 21",
                "zone": "Zone C",
                "vehicle_id": vehicle_map["TRK-01"].id,
                "driver_id": rohan.id,
                "scheduled_date": date.today(),
                "start_time": "06:00:00",
                "estimated_completion_time": "09:30:00",
                "status": RouteStatus.COMPLETED,
                "priority": RoutePriority.HIGH,
                "total_stops": 4,
                "completed_stops": 4,
                "total_distance_km": 22.4,
                "estimated_duration_minutes": 210,
                "current_load_kg": 1425.0,
                "vehicle_capacity_kg": 1500.0,
                "stops": [
                    ("BIN-083", 1, StopPriority.HIGH, StopStatus.COMPLETED, "06:40 AM", 80.0, 350.0),
                    ("BIN-142", 2, StopPriority.HIGH, StopStatus.COMPLETED, "07:15 AM", 75.0, 400.0),
                    ("BIN-305", 3, StopPriority.MEDIUM, StopStatus.COMPLETED, "08:00 AM", 70.0, 320.0),
                    ("BIN-308", 4, StopPriority.MEDIUM, StopStatus.COMPLETED, "08:45 AM", 65.0, 355.0),
                ],
            },
            {
                "route_code": "RT-022",
                "name": "Central Zone Route 22",
                "zone": "Zone B",
                "vehicle_id": vehicle_map["TRK-02"].id,
                "driver_id": neha.id,
                "scheduled_date": date.today(),
                "start_time": "07:15:00",
                "estimated_completion_time": "11:00:00",
                "status": RouteStatus.AT_RISK,
                "priority": RoutePriority.CRITICAL,
                "total_stops": 3,
                "completed_stops": 2,
                "total_distance_km": 17.8,
                "estimated_duration_minutes": 180,
                "current_load_kg": 1008.0,
                "vehicle_capacity_kg": 1200.0,
                "stops": [
                    ("BIN-403", 1, StopPriority.MEDIUM, StopStatus.COMPLETED, "07:45 AM", 60.0, 450.0),
                    ("BIN-312", 2, StopPriority.HIGH, StopStatus.COMPLETED, "08:30 AM", 80.0, 558.0),
                    ("BIN-404", 3, StopPriority.HIGH, StopStatus.PENDING, "09:15 AM", 85.0, None),
                ],
            },
            {
                "route_code": "RT-023",
                "name": "East Campus Route 23",
                "zone": "Zone D",
                "vehicle_id": vehicle_map["TRK-03"].id,
                "driver_id": vivek.id,
                "scheduled_date": date.today(),
                "start_time": "13:00:00",
                "estimated_completion_time": "16:30:00",
                "status": RouteStatus.PLANNED,
                "priority": RoutePriority.MEDIUM,
                "total_stops": 2,
                "completed_stops": 0,
                "total_distance_km": 25.1,
                "estimated_duration_minutes": 210,
                "current_load_kg": 0.0,
                "vehicle_capacity_kg": 1400.0,
                "stops": [
                    ("BIN-104", 1, StopPriority.CRITICAL, StopStatus.PENDING, "01:20 PM", 95.0, None),
                    ("BIN-217", 2, StopPriority.HIGH, StopStatus.PENDING, "01:50 PM", 90.0, None),
                ],
            },
        ]

        for rd in demo_routes:
            res = await session.execute(select(Route).where(Route.route_code == rd["route_code"]))
            existing_r = res.scalar_one_or_none()
            if existing_r:
                existing_r.name = rd["name"]
                existing_r.zone = rd["zone"]
                existing_r.vehicle_id = rd["vehicle_id"]
                existing_r.driver_id = rd["driver_id"]
                existing_r.scheduled_date = rd["scheduled_date"]
                existing_r.start_time = rd["start_time"]
                existing_r.estimated_completion_time = rd["estimated_completion_time"]
                existing_r.status = rd["status"]
                existing_r.priority = rd["priority"]
                existing_r.total_stops = rd["total_stops"]
                existing_r.completed_stops = rd["completed_stops"]
                existing_r.total_distance_km = rd["total_distance_km"]
                existing_r.estimated_duration_minutes = rd["estimated_duration_minutes"]
                existing_r.current_load_kg = rd["current_load_kg"]
                route_obj = existing_r
            else:
                route_obj = Route(
                    uuid=uuid.uuid4(),
                    route_code=rd["route_code"],
                    name=rd["name"],
                    zone=rd["zone"],
                    vehicle_id=rd["vehicle_id"],
                    driver_id=rd["driver_id"],
                    scheduled_date=rd["scheduled_date"],
                    start_time=rd["start_time"],
                    estimated_completion_time=rd["estimated_completion_time"],
                    status=rd["status"],
                    priority=rd["priority"],
                    total_stops=rd["total_stops"],
                    completed_stops=rd["completed_stops"],
                    total_distance_km=rd["total_distance_km"],
                    estimated_duration_minutes=rd["estimated_duration_minutes"],
                    current_load_kg=rd["current_load_kg"],
                )
                session.add(route_obj)
                await session.flush()

            # Stops for this route
            for bin_code, seq, prio, st_status, eta_val, est_fill, weight in rd["stops"]:
                bin_item = bin_map.get(bin_code)
                if not bin_item:
                    continue
                s_res = await session.execute(
                    select(RouteStop).where(
                        RouteStop.route_id == route_obj.id,
                        RouteStop.bin_id == bin_item.id,
                    )
                )
                existing_stop = s_res.scalar_one_or_none()
                if existing_stop:
                    existing_stop.sequence_number = seq
                    existing_stop.priority = prio
                    existing_stop.status = st_status
                    existing_stop.eta = eta_val
                    existing_stop.estimated_fill_level = est_fill
                    existing_stop.actual_collected_weight_kg = weight
                else:
                    new_stop = RouteStop(
                        route_id=route_obj.id,
                        bin_id=bin_item.id,
                        sequence_number=seq,
                        priority=prio,
                        status=st_status,
                        eta=eta_val,
                        estimated_fill_level=est_fill,
                        actual_collected_weight_kg=weight,
                        completed_at=datetime.now(timezone.utc) if st_status == StopStatus.COMPLETED else None,
                    )
                    session.add(new_stop)

        await session.commit()
        print("[+] Seeded demo routes RT-021, RT-022, RT-023, RT-024 with stops successfully!")

        # -------------------------------------------------------------------------
        # Seed Waste Classifications
        # -------------------------------------------------------------------------
        class_res = await session.execute(select(func.count(WasteClassification.id)))
        class_count = class_res.scalar_one()
        if class_count < 20:
            active_bins_res = await session.execute(select(Bin).limit(30))
            active_bins = active_bins_res.scalars().all()

            waste_types_cycle = [
                (WasteType.PLASTIC, 0.94, "https://storage.wastewise.ai/demo/plastic_bottle_01.jpg", ClassificationSource.IMAGE),
                (WasteType.PAPER, 0.92, "https://storage.wastewise.ai/demo/cardboard_box_02.jpg", ClassificationSource.IMAGE),
                (WasteType.ORGANIC, 0.96, "https://storage.wastewise.ai/demo/fruit_scraps_03.jpg", ClassificationSource.IMAGE),
                (WasteType.METAL, 0.89, "https://storage.wastewise.ai/demo/aluminum_can_04.jpg", ClassificationSource.SENSOR),
                (WasteType.GLASS, 0.91, "https://storage.wastewise.ai/demo/glass_bottle_05.jpg", ClassificationSource.IMAGE),
                (WasteType.OTHER, 0.58, "https://storage.wastewise.ai/demo/mixed_residue_06.jpg", ClassificationSource.AI_MODEL),
                (WasteType.PLASTIC, 0.88, "https://storage.wastewise.ai/demo/polythene_bag_07.jpg", ClassificationSource.SIMULATION),
                (WasteType.ORGANIC, 0.93, "https://storage.wastewise.ai/demo/food_waste_08.jpg", ClassificationSource.MANUAL),
            ]

            now = datetime.now(timezone.utc)
            for idx, b in enumerate(active_bins):
                for sub_idx in range(2):
                    w_type, conf, img_ref, src = waste_types_cycle[(idx * 2 + sub_idx) % len(waste_types_cycle)]
                    time_offset = timedelta(hours=(idx * 2 + sub_idx) % 72, minutes=sub_idx * 17)
                    classified_time = now - time_offset
                    is_low = conf < 0.70

                    c_record = WasteClassification(
                        uuid=uuid.uuid4(),
                        bin_id=b.id,
                        waste_type=w_type,
                        confidence=conf,
                        source=src.value,
                        model_name="wastewise-vision-classifier" if src != ClassificationSource.MANUAL else "manual-operator",
                        model_version="1.0.0",
                        image_reference=img_ref,
                        metadata_json={
                            "detection_method": src.value,
                            "inference_time_ms": 38.4,
                            "sensor_ambient_temp_c": 26.5,
                        },
                        is_low_confidence=is_low,
                        classified_at=classified_time,
                        created_at=classified_time,
                    )
                    session.add(c_record)

            await session.commit()
            print("[+] Seeded 60 realistic waste classifications across active bins!")

    print("[*] Database seeding finished successfully!\n")


if __name__ == "__main__":
    asyncio.run(seed_all())
