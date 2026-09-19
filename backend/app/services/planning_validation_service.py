from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.collection_plan import CollectionPlan, PlanStatus
from app.models.collection_plan_item import CollectionPlanItem
from app.models.planning_conflict import ConflictType, ConflictSeverity
from app.models.user import User, UserRole, UserStatus
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.bin import Bin, BinStatus


class PlanningValidationService:
    """Validates plans, state transitions, driver/vehicle availability, and conflict detection."""

    VALID_TRANSITIONS = {
        PlanStatus.DRAFT: [PlanStatus.CALCULATING, PlanStatus.CANCELLED],
        PlanStatus.CALCULATING: [PlanStatus.READY, PlanStatus.DRAFT, PlanStatus.CANCELLED],
        PlanStatus.READY: [PlanStatus.IN_PROGRESS, PlanStatus.CANCELLED, PlanStatus.DRAFT],
        PlanStatus.IN_PROGRESS: [PlanStatus.COMPLETED, PlanStatus.CANCELLED],
        PlanStatus.COMPLETED: [],
        PlanStatus.CANCELLED: [],
    }

    @classmethod
    def validate_state_transition(cls, current_status: PlanStatus, new_status: PlanStatus) -> bool:
        if current_status == new_status:
            return True
        allowed = cls.VALID_TRANSITIONS.get(current_status, [])
        return new_status in allowed

    @staticmethod
    async def validate_vehicle(session: AsyncSession, vehicle_id: int) -> Tuple[bool, str]:
        res = await session.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
        veh = res.scalar_one_or_none()
        if not veh:
            return False, f"Vehicle ID {vehicle_id} does not exist."
        if veh.status == VehicleStatus.MAINTENANCE:
            return False, f"Vehicle {veh.name} ({veh.vehicle_code}) is in MAINTENANCE."
        if veh.status == VehicleStatus.INACTIVE:
            return False, f"Vehicle {veh.name} ({veh.vehicle_code}) is INACTIVE."
        return True, "Vehicle is active and available."

    @staticmethod
    async def validate_driver(session: AsyncSession, driver_id: int) -> Tuple[bool, str]:
        res = await session.execute(select(User).where(User.id == driver_id))
        usr = res.scalar_one_or_none()
        if not usr:
            return False, f"Driver User ID {driver_id} does not exist."
        if usr.role != UserRole.DRIVER:
            return False, f"User {usr.full_name} does not have DRIVER role (Role: {usr.role.value})."
        if usr.status != UserStatus.ACTIVE:
            return False, f"Driver {usr.full_name} account status is {usr.status.value}."
        return True, "Driver is valid and active."

    @staticmethod
    async def detect_plan_conflicts(
        session: AsyncSession,
        plan: CollectionPlan,
        items: List[CollectionPlanItem],
        assigned_vehicles: List[Any],
    ) -> List[dict]:
        """Detects blocking and non-blocking planning conflicts."""
        conflicts = []

        # Check duplicate bins
        seen_bins = set()
        for item in items:
            if item.bin_id in seen_bins:
                conflicts.append({
                    "type": ConflictType.DUPLICATE_BIN,
                    "severity": ConflictSeverity.CRITICAL,
                    "message": f"Bin ID {item.bin_id} is assigned multiple times in plan {plan.plan_code}.",
                    "entity_type": "Bin",
                    "entity_id": str(item.bin_id),
                    "blocking": True,
                })
            seen_bins.add(item.bin_id)

        # Check for unassigned critical bins
        for item in items:
            if item.priority == "CRITICAL" and item.assignment_status.value == "UNASSIGNED":
                conflicts.append({
                    "type": ConflictType.UNASSIGNED_PRIORITY,
                    "severity": ConflictSeverity.WARNING,
                    "message": f"Critical priority bin ID {item.bin_id} ({item.zone}) is currently unassigned.",
                    "entity_type": "CollectionPlanItem",
                    "entity_id": str(item.id),
                    "blocking": False,
                })

        # Check vehicle allocation capacity
        for pv in assigned_vehicles:
            if pv.utilization_percentage > 95.0:
                conflicts.append({
                    "type": ConflictType.UTILIZATION_LIMIT,
                    "severity": ConflictSeverity.WARNING,
                    "message": f"Vehicle ID {pv.vehicle_id} load utilization ({pv.utilization_percentage:.1f}%) exceeds recommended max (90%).",
                    "entity_type": "Vehicle",
                    "entity_id": str(pv.vehicle_id),
                    "blocking": False,
                })

        return conflicts


planning_validation_service = PlanningValidationService()
