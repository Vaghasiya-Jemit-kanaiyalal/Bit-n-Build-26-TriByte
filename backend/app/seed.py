import asyncio
import uuid
from datetime import date, datetime, timezone
from sqlalchemy import select
from app.core.security import hash_password
from app.db.database import AsyncSessionLocal
from app.models.user import User, UserRole, UserStatus
from app.models.vehicle import Vehicle
from app.models.bin import Bin
from app.models.route import Route, RouteStatus, RoutePriority
from app.models.route_stop import RouteStop, StopStatus, StopPriority

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
        "first_name": "Waste",
        "last_name": "Collector",
        "email": "collector@gmail.com",
        "password": "collector123",
        "role": UserRole.COLLECTOR,
        "status": UserStatus.ACTIVE,
        "organization": "Metro Route Fleet #12",
        "department": "Field Operations",
        "phone": "+91 98765 00002",
    },
    {
        "first_name": "EcoTrack",
        "last_name": "Viewer",
        "email": "xyz@gmail.com",
        "password": "viewer123",
        "role": UserRole.VIEWER,
        "status": UserStatus.ACTIVE,
        "organization": "Environmental Oversight Bureau",
        "department": "Analytics & Audit",
        "phone": "+91 98765 00003",
    },
    # Driver accounts matching mock route data
    {
        "first_name": "Arjun",
        "last_name": "Patel",
        "email": "arjun.patel@wastewise.ai",
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
        "email": "rohan.shah@wastewise.ai",
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
        "email": "neha.patel@wastewise.ai",
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
        "email": "vivek.shah@wastewise.ai",
        "password": "Driver@2026!",
        "role": UserRole.DRIVER,
        "status": UserStatus.ACTIVE,
        "organization": "Metro Route Fleet #12",
        "department": "Zone D Logistics",
        "phone": "+91 98765 11004",
    },
]

DEMO_VEHICLES = [
    {
        "vehicle_code": "TRK-04",
        "name": "EcoCompactor 04",
        "vehicle_type": "Compactor Truck",
        "capacity_kg": 1200.0,
        "current_load_kg": 864.0,
        "status": "IN_USE",
        "license_plate": "GJ-01-WW-1004",
        "zone": "Zone A",
        "latitude": 23.0225,
        "longitude": 72.5714,
    },
    {
        "vehicle_code": "TRK-01",
        "name": "EcoCompactor 01",
        "vehicle_type": "Compactor Truck",
        "capacity_kg": 1500.0,
        "current_load_kg": 1425.0,
        "status": "AVAILABLE",
        "license_plate": "GJ-01-WW-1001",
        "zone": "Zone C",
        "latitude": 23.0338,
        "longitude": 72.5850,
    },
    {
        "vehicle_code": "TRK-02",
        "name": "EcoHauler 02",
        "vehicle_type": "Rear Loader",
        "capacity_kg": 1200.0,
        "current_load_kg": 1008.0,
        "status": "IN_USE",
        "license_plate": "GJ-01-WW-1002",
        "zone": "Zone B",
        "latitude": 23.0450,
        "longitude": 72.5620,
    },
    {
        "vehicle_code": "TRK-03",
        "name": "EcoHauler 03",
        "vehicle_type": "Side Loader",
        "capacity_kg": 1400.0,
        "current_load_kg": 0.0,
        "status": "AVAILABLE",
        "license_plate": "GJ-01-WW-1003",
        "zone": "Zone D",
        "latitude": 23.0180,
        "longitude": 72.5910,
    },
    {
        "vehicle_code": "TRK-05",
        "name": "EcoReserve 05",
        "vehicle_type": "Electric Mini Truck",
        "capacity_kg": 800.0,
        "current_load_kg": 0.0,
        "status": "AVAILABLE",
        "license_plate": "GJ-01-WW-1005",
        "zone": "Zone A",
        "latitude": 23.0290,
        "longitude": 72.5690,
    },
]

DEMO_BINS = [
    {"bin_code": "BIN-104", "name": "Cafeteria Primary Bin", "location_name": "Central Cafeteria", "zone": "Zone A", "waste_type": "Mixed", "capacity_liters": 240.0, "fill_level": 96.0, "priority": "CRITICAL", "status": "ACTIVE", "latitude": 23.0231, "longitude": 72.5718},
    {"bin_code": "BIN-217", "name": "North Gate Bin", "location_name": "North Gate", "zone": "Zone A", "waste_type": "Plastic", "capacity_liters": 120.0, "fill_level": 91.0, "priority": "CRITICAL", "status": "ACTIVE", "latitude": 23.0255, "longitude": 72.5732},
    {"bin_code": "BIN-083", "name": "Library Plaza Bin", "location_name": "Library Block", "zone": "Zone B", "waste_type": "Paper", "capacity_liters": 180.0, "fill_level": 78.0, "priority": "HIGH", "status": "ACTIVE", "latitude": 23.0270, "longitude": 72.5695},
    {"bin_code": "BIN-142", "name": "Sports Field Bin", "location_name": "Sports Complex", "zone": "Zone B", "waste_type": "Organic", "capacity_liters": 240.0, "fill_level": 74.0, "priority": "HIGH", "status": "ACTIVE", "latitude": 23.0295, "longitude": 72.5680},
    {"bin_code": "BIN-099", "name": "Student Center Bin", "location_name": "Student Center", "zone": "Zone A", "waste_type": "Plastic", "capacity_liters": 240.0, "fill_level": 88.0, "priority": "HIGH", "status": "ACTIVE", "latitude": 23.0240, "longitude": 72.5725},
    {"bin_code": "BIN-112", "name": "Engineering Annex Bin", "location_name": "Engineering Annex", "zone": "Zone A", "waste_type": "Paper", "capacity_liters": 120.0, "fill_level": 65.0, "priority": "NORMAL", "status": "ACTIVE", "latitude": 23.0260, "longitude": 72.5740},
    {"bin_code": "BIN-401", "name": "Hostel 1 Bin", "location_name": "Hostel Block 1", "zone": "Zone A", "waste_type": "Mixed", "capacity_liters": 240.0, "fill_level": 82.0, "priority": "HIGH", "status": "ACTIVE", "latitude": 23.0210, "longitude": 72.5760},
    {"bin_code": "BIN-402", "name": "Hostel 2 Bin", "location_name": "Hostel Block 2", "zone": "Zone A", "waste_type": "Organic", "capacity_liters": 240.0, "fill_level": 79.0, "priority": "NORMAL", "status": "ACTIVE", "latitude": 23.0205, "longitude": 72.5775},
    {"bin_code": "BIN-403", "name": "Faculty Housing Bin", "location_name": "Faculty Housing", "zone": "Zone B", "waste_type": "Paper", "capacity_liters": 120.0, "fill_level": 55.0, "priority": "NORMAL", "status": "ACTIVE", "latitude": 23.0310, "longitude": 72.5660},
    {"bin_code": "BIN-404", "name": "Admin Quad Bin", "location_name": "Admin Quad", "zone": "Zone A", "waste_type": "Plastic", "capacity_liters": 180.0, "fill_level": 60.0, "priority": "NORMAL", "status": "ACTIVE", "latitude": 23.0245, "longitude": 72.5710},
    {"bin_code": "BIN-305", "name": "Science Block Bin", "location_name": "Science Building", "zone": "Zone B", "waste_type": "Glass", "capacity_liters": 120.0, "fill_level": 85.0, "priority": "HIGH", "status": "ACTIVE", "latitude": 23.0330, "longitude": 72.5675},
    {"bin_code": "BIN-308", "name": "Auditorium Bin", "location_name": "Auditorium Rear", "zone": "Zone B", "waste_type": "Mixed", "capacity_liters": 240.0, "fill_level": 68.0, "priority": "NORMAL", "status": "ACTIVE", "latitude": 23.0345, "longitude": 72.5650},
    {"bin_code": "BIN-312", "name": "Health Center Bin", "location_name": "Health Center", "zone": "Zone B", "waste_type": "Organic", "capacity_liters": 120.0, "fill_level": 72.0, "priority": "NORMAL", "status": "ACTIVE", "latitude": 23.0360, "longitude": 72.5635},
    {"bin_code": "BIN-319", "name": "Main Gate Bin", "location_name": "Main Gate Exit", "zone": "Zone A", "waste_type": "Metal", "capacity_liters": 180.0, "fill_level": 50.0, "priority": "NORMAL", "status": "ACTIVE", "latitude": 23.0220, "longitude": 72.5700},
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
            res = await session.execute(select(Vehicle).where(Vehicle.vehicle_code == v["vehicle_code"]))
            existing_v = res.scalar_one_or_none()
            if existing_v:
                existing_v.name = v["name"]
                existing_v.capacity_kg = v["capacity_kg"]
                existing_v.current_load_kg = v["current_load_kg"]
                existing_v.status = v["status"]
                existing_v.latitude = v["latitude"]
                existing_v.longitude = v["longitude"]
                vehicle_map[v["vehicle_code"]] = existing_v
            else:
                new_v = Vehicle(
                    uuid=uuid.uuid4(),
                    vehicle_code=v["vehicle_code"],
                    name=v["name"],
                    vehicle_type=v["vehicle_type"],
                    capacity_kg=v["capacity_kg"],
                    current_load_kg=v["current_load_kg"],
                    status=v["status"],
                    license_plate=v["license_plate"],
                    zone=v["zone"],
                    latitude=v["latitude"],
                    longitude=v["longitude"],
                )
                session.add(new_v)
                await session.flush()
                vehicle_map[v["vehicle_code"]] = new_v
        print(f"[+] Vehicles checked/seeded: {len(vehicle_map)}")

        # 3. Bins
        bin_map = {}
        for b in DEMO_BINS:
            res = await session.execute(select(Bin).where(Bin.bin_code == b["bin_code"]))
            existing_b = res.scalar_one_or_none()
            if existing_b:
                existing_b.name = b["name"]
                existing_b.location_name = b["location_name"]
                existing_b.fill_level = b["fill_level"]
                existing_b.priority = b["priority"]
                existing_b.latitude = b["latitude"]
                existing_b.longitude = b["longitude"]
                bin_map[b["bin_code"]] = existing_b
            else:
                new_b = Bin(
                    uuid=uuid.uuid4(),
                    bin_code=b["bin_code"],
                    name=b["name"],
                    location_name=b["location_name"],
                    zone=b["zone"],
                    waste_type=b["waste_type"],
                    capacity_liters=b["capacity_liters"],
                    fill_level=b["fill_level"],
                    priority=b["priority"],
                    status=b["status"],
                    latitude=b["latitude"],
                    longitude=b["longitude"],
                )
                session.add(new_b)
                await session.flush()
                bin_map[b["bin_code"]] = new_b
        print(f"[+] Bins checked/seeded: {len(bin_map)}")

        # 4. Routes
        arjun = user_map["arjun.patel@wastewise.ai"]
        rohan = user_map["rohan.shah@wastewise.ai"]
        neha = user_map["neha.patel@wastewise.ai"]
        vivek = user_map["vivek.shah@wastewise.ai"]

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

    print("[*] Database seeding finished successfully!\n")


if __name__ == "__main__":
    asyncio.run(seed_all())
