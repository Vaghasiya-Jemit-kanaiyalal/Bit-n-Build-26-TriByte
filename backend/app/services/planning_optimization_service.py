import math
from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.bin import Bin, BinStatus
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.user import User, UserRole, UserStatus
from app.models.collection_plan import PlanStrategy
from app.services.planning_priority_service import planning_priority_service

ROAD_DISTANCE_MULTIPLIER = 1.3  # Multiplier converting straight-line Haversine to road distance


class PlanningOptimizationService:
    """Heuristic optimization engine for bin route allocation and distance estimation."""

    @staticmethod
    def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculates distance between two GPS coordinates in kilometers."""
        if not lat1 or not lon1 or not lat2 or not lon2:
            return 1.5  # Default estimation if coordinates missing

        R = 6371.0  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        straight = R * c
        return round(straight * ROAD_DISTANCE_MULTIPLIER, 2)

    @classmethod
    async def optimize_plan_allocations(
        cls,
        session: AsyncSession,
        target_bins: List[Bin],
        available_vehicles: List[Vehicle],
        available_drivers: List[User],
        strategy: PlanStrategy = PlanStrategy.BALANCED,
        max_utilization_pct: float = 90.0,
        max_stops_per_route: int = 30,
    ) -> Dict[str, Any]:
        """Runs heuristic route allocation and returns generated route proposals."""
        if not target_bins or not available_vehicles or not available_drivers:
            return {
                "proposals": [],
                "unassigned_bin_ids": [b.id for b in target_bins],
                "assigned_bins_count": 0,
                "total_distance_km": 0.0,
                "total_duration_minutes": 0,
                "average_utilization": 0.0,
            }

        # Filter active vehicles and drivers
        active_vehicles = [
            v for v in available_vehicles
            if str(getattr(v.status, "value", v.status)) in ("AVAILABLE", "ON_ROUTE")
        ]
        active_drivers = [
            d for d in available_drivers
            if str(getattr(d.role, "value", d.role)) == "DRIVER"
            and str(getattr(d.status, "value", d.status)) == "ACTIVE"
        ]

        if not active_vehicles or not active_drivers:
            return {
                "proposals": [],
                "unassigned_bin_ids": [b.id for b in target_bins],
                "assigned_bins_count": 0,
                "total_distance_km": 0.0,
                "total_duration_minutes": 0,
                "average_utilization": 0.0,
            }

        # Priority score for sorting: CRITICAL = 4, HIGH = 3, MEDIUM = 2, LOW = 1
        priority_map = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}

        # Build evaluated bin items
        evaluated_bins = []
        for b in target_bins:
            b_status_str = str(getattr(b.status, "value", b.status))
            if b_status_str in ("INACTIVE", "MAINTENANCE"):
                continue
            pred_fill = getattr(b, "predicted_fill_percentage", None) or getattr(b, "fill_level", None) or 0.0
            overflow = b_status_str == "CRITICAL" or pred_fill >= 90.0
            prio_str, est_waste_kg = planning_priority_service.calculate_bin_priority(b, pred_fill, overflow)
            evaluated_bins.append({
                "bin": b,
                "priority_str": prio_str,
                "priority_score": priority_map.get(prio_str, 2),
                "est_waste_kg": est_waste_kg,
                "fill": getattr(b, "fill_level", None) or 0.0,
            })

        # Sort bins according to strategy
        if strategy == PlanStrategy.SHORTEST_DISTANCE:
            evaluated_bins.sort(key=lambda x: (x["bin"].zone, -x["priority_score"], -x["fill"]))
        elif strategy == PlanStrategy.MINIMUM_TIME:
            evaluated_bins.sort(key=lambda x: (-x["priority_score"], -x["fill"]))
        elif strategy == PlanStrategy.MAX_CAPACITY_UTILIZATION:
            evaluated_bins.sort(key=lambda x: (-x["est_waste_kg"], -x["priority_score"]))
        else:  # BALANCED
            evaluated_bins.sort(key=lambda x: (-x["priority_score"], -x["fill"], -x["est_waste_kg"]))

        proposals = []
        unassigned_bin_ids = set(item["bin"].id for item in evaluated_bins)
        assigned_count = 0
        total_dist_km = 0.0
        total_dur_min = 0

        # Pair vehicles with drivers
        num_pairs = min(len(active_vehicles), len(active_drivers))
        for i in range(num_pairs):
            veh = active_vehicles[i]
            drv = active_drivers[i]

            cap_kg = (veh.capacity_kg or 1200.0) * (max_utilization_pct / 100.0)
            current_load = 0.0
            route_stops = []
            last_lat, last_lon = veh.latitude or 22.3072, veh.longitude or 73.1812
            route_dist = 0.0

            candidates = [item for item in evaluated_bins if item["bin"].id in unassigned_bin_ids]

            for item in candidates:
                b = item["bin"]
                if len(route_stops) >= max_stops_per_route:
                    break
                if current_load + item["est_waste_kg"] > cap_kg and route_stops:
                    continue  # Skip if vehicle capacity exceeded

                # Add to route
                dist = cls.haversine_distance_km(last_lat, last_lon, b.latitude, b.longitude)
                route_dist += dist
                last_lat, last_lon = b.latitude, b.longitude
                current_load += item["est_waste_kg"]

                seq = len(route_stops) + 1
                arr_minutes = int(seq * 12 + route_dist * 2)
                arr_str = f"{8 + arr_minutes // 60:02d}:{arr_minutes % 60:02d}"

                route_stops.append({
                    "bin_id": b.id,
                    "bin_code": b.bin_code,
                    "sequence": seq,
                    "estimated_arrival": arr_str,
                    "estimated_collection_kg": item["est_waste_kg"],
                    "latitude": b.latitude,
                    "longitude": b.longitude,
                })

                unassigned_bin_ids.remove(b.id)
                assigned_count += 1

            if route_stops:
                util_pct = round((current_load / (veh.capacity_kg or 1200.0)) * 100, 1)
                est_dur = int(len(route_stops) * 12 + route_dist * 2.5)

                proposals.append({
                    "vehicle_id": veh.id,
                    "driver_id": drv.id,
                    "vehicle_code": veh.vehicle_code,
                    "driver_name": drv.full_name,
                    "estimated_distance_km": round(route_dist, 2),
                    "estimated_duration_minutes": est_dur,
                    "estimated_load_kg": round(current_load, 1),
                    "utilization_percentage": util_pct,
                    "stop_count": len(route_stops),
                    "status": "PROPOSED",
                    "stops": route_stops,
                })

                total_dist_km += route_dist
                total_dur_min += est_dur

        avg_util = (
            round(sum(p["utilization_percentage"] for p in proposals) / len(proposals), 1)
            if proposals
            else 0.0
        )

        return {
            "proposals": proposals,
            "unassigned_bin_ids": list(unassigned_bin_ids),
            "assigned_bins_count": assigned_count,
            "total_distance_km": round(total_dist_km, 2),
            "total_duration_minutes": total_dur_min,
            "average_utilization": avg_util,
        }


planning_optimization_service = PlanningOptimizationService()
