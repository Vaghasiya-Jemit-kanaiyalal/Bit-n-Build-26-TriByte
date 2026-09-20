import asyncio
import logging
import random
from datetime import datetime, timezone
from typing import Dict, List, Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import AsyncSessionLocal
from app.models.bin import Bin, BinStatus, CollectionPriority
from app.models.bin_telemetry import BinTelemetry
from app.models.alert import Alert

logger = logging.getLogger("ecotrack.iot_simulator")

class IoTSimulatorService:
    def __init__(self):
        self.is_running: bool = False
        self._task: Optional[asyncio.Task] = None
        self.interval_seconds: int = 30
        self.simulated_bins_count: int = 0

    async def start_simulator(self):
        if self.is_running:
            logger.info("[IoTSimulator] Simulator already running.")
            return
        self.is_running = True
        self._task = asyncio.create_task(self._simulation_loop())
        logger.info("[IoTSimulator] Background IoT simulator started.")

    async def stop_simulator(self):
        if not self.is_running:
            return
        self.is_running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None
        logger.info("[IoTSimulator] Background IoT simulator stopped.")

    async def _simulation_loop(self):
        while self.is_running:
            try:
                await self._step_simulation()
            except Exception as e:
                logger.error(f"[IoTSimulator] Error during simulation step: {e}")
            await asyncio.sleep(self.interval_seconds)

    async def _step_simulation(self):
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Bin).where(Bin.is_active == True).limit(20))
            bins: List[Bin] = result.scalars().all()
            self.simulated_bins_count = len(bins)

            if not bins:
                logger.info("[IoTSimulator] No active bins found to simulate.")
                return

            now = datetime.now(timezone.utc)
            updated_count = 0

            for bin_obj in bins:
                # 70% chance to increment fill level per tick
                if random.random() < 0.7 and bin_obj.current_fill_percentage < 99.0:
                    increment = round(random.uniform(1.5, 4.0), 1)
                    old_fill = bin_obj.current_fill_percentage
                    new_fill = min(99.9, round(old_fill + increment, 1))

                    # Calculate weight
                    estimated_weight = round((new_fill / 100.0) * (bin_obj.capacity_liters or 240.0) * 0.18, 1)

                    # Determine status
                    new_status = BinStatus.NORMAL
                    if new_fill >= 90.0:
                        new_status = BinStatus.CRITICAL
                    elif new_fill >= 75.0:
                        new_status = BinStatus.WARNING

                    # Determine priority
                    new_priority = CollectionPriority.LOW
                    if new_fill >= 90.0:
                        new_priority = CollectionPriority.CRITICAL
                    elif new_fill >= 80.0:
                        new_priority = CollectionPriority.HIGH
                    elif new_fill >= 65.0:
                        new_priority = CollectionPriority.MEDIUM

                    # Update Bin model
                    bin_obj.current_fill_percentage = new_fill
                    bin_obj.current_weight_kg = estimated_weight
                    bin_obj.status = new_status
                    bin_obj.priority = new_priority
                    bin_obj.last_telemetry_at = now
                    bin_obj.updated_at = now

                    # Insert Telemetry Log
                    telemetry = BinTelemetry(
                        bin_id=bin_obj.id,
                        fill_percentage=new_fill,
                        weight_kg=estimated_weight,
                        battery_percentage=round(random.uniform(85.0, 99.0), 1),
                        signal_strength_dbm=random.randint(-85, -60),
                        measured_at=now,
                    )
                    db.add(telemetry)

                    # Generate Alert if crossed 90%
                    if new_fill >= 90.0 and old_fill < 90.0:
                        alert = Alert(
                            alert_code=f"ALT-{bin_obj.bin_code}-{int(now.timestamp())}",
                            title=f"Bin Overflow Critical: {bin_obj.bin_code}",
                            description=f"Fill level crossed threshold to {new_fill}% at {bin_obj.name or bin_obj.address}",
                            category="BIN_OVERFLOW",
                            severity="CRITICAL",
                            status="ACTIVE",
                            created_at=now,
                        )
                        db.add(alert)

                    updated_count += 1

            await db.commit()
            logger.info(f"[IoTSimulator] Telemetry updated for {updated_count}/{len(bins)} bins at {now.isoformat()}")

iot_simulator = IoTSimulatorService()
