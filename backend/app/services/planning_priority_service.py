from typing import Dict, Any, Tuple
from app.models.bin import Bin, CollectionPriority


class PlanningPriorityService:
    """Calculates collection priority level based on fill telemetry and overflow predictions."""

    @staticmethod
    def calculate_bin_priority(
        bin_obj: Bin,
        predicted_fill: float,
        predicted_overflow: bool,
    ) -> Tuple[str, float]:
        """Returns priority string (CRITICAL, HIGH, MEDIUM, LOW) and estimated waste weight in kg."""
        capacity_kg = bin_obj.capacity_kg or 240.0
        current_fill = bin_obj.fill_level or 0.0
        max_fill = max(current_fill, predicted_fill)
        estimated_waste_kg = round((max_fill / 100.0) * capacity_kg, 1)

        status_str = str(getattr(bin_obj.status, "value", bin_obj.status))
        prio_enum_str = str(getattr(bin_obj.priority, "value", bin_obj.priority))

        if predicted_overflow or max_fill >= 90.0 or status_str == "CRITICAL":
            priority = "CRITICAL"
        elif max_fill >= 75.0 or prio_enum_str == "HIGH":
            priority = "HIGH"
        elif max_fill >= 50.0 or prio_enum_str == "MEDIUM":
            priority = "MEDIUM"
        else:
            priority = "LOW"

        return priority, estimated_waste_kg


planning_priority_service = PlanningPriorityService()
