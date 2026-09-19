import math
import re
import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Union
from fastapi import HTTPException, status
from sqlalchemy import func, select, desc, and_, or_, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.alert import Alert, AlertActivity
from app.schemas.alert import (
    AlertActivityItem,
    AlertCategoriesResponse,
    AlertCategoryItem,
    AlertCreate,
    AlertItemResponse,
    AlertListResponse,
    AlertSummaryResponse,
    AlertTrendItem,
    AlertTrendsResponse,
    AlertUpdate,
    BulkAlertActionRequest,
)


class AlertService:
    @staticmethod
    def _parse_duration(duration_str: Optional[str]) -> datetime:
        now = datetime.now(timezone.utc)
        if not duration_str:
            return now + timedelta(hours=1)

        d_str = duration_str.strip().lower()
        if "hour" in d_str:
            nums = re.findall(r"\d+", d_str)
            hours = int(nums[0]) if nums else 1
            return now + timedelta(hours=hours)
        elif "day" in d_str or "tomorrow" in d_str:
            nums = re.findall(r"\d+", d_str)
            days = int(nums[0]) if nums else 1
            return now + timedelta(days=days)
        elif "min" in d_str:
            nums = re.findall(r"\d+", d_str)
            mins = int(nums[0]) if nums else 30
            return now + timedelta(minutes=mins)
        else:
            try:
                dt = datetime.fromisoformat(duration_str)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt
            except Exception:
                return now + timedelta(hours=1)

    @staticmethod
    async def _generate_alert_code(db: AsyncSession) -> str:
        current_year = datetime.now(timezone.utc).year
        count_q = select(func.count(Alert.id))
        total_count = (await db.execute(count_q)).scalar_one() or 0
        return f"ALT-{current_year}-{total_count + 1:05d}"

    @classmethod
    async def create_alert(
        cls,
        db: AsyncSession,
        alert_in: AlertCreate,
        auto_commit: bool = True,
    ) -> AlertItemResponse:
        # 1. Deduplication check: prevent spam if active/unacknowledged alert exists for same entity & category in last 15 min
        fifteen_mins_ago = datetime.now(timezone.utc) - timedelta(minutes=15)
        existing_q = select(Alert).options(selectinload(Alert.activities)).where(
            Alert.entity_type == alert_in.entity_type,
            Alert.entity_id == alert_in.entity_id,
            Alert.category == alert_in.category,
            Alert.status.in_(["ACTIVE", "ACKNOWLEDGED"]),
            Alert.created_at >= fifteen_mins_ago,
        )
        existing = (await db.execute(existing_q)).scalars().first()
        if existing:
            # Return existing alert instead of creating duplicate
            return cls._to_response(existing)

        # 2. Create new alert
        alert_code = await cls._generate_alert_code(db)
        now = datetime.now(timezone.utc)

        record = Alert(
            uuid=uuid.uuid4(),
            alert_code=alert_code,
            title=alert_in.title,
            description=alert_in.description,
            category=alert_in.category.upper(),
            severity=alert_in.severity.upper(),
            status="ACTIVE",
            source=alert_in.source,
            entity_type=alert_in.entity_type.upper(),
            entity_id=alert_in.entity_id,
            location=alert_in.location or f"Zone {alert_in.zone or 'General'}",
            zone=alert_in.zone or "Central Zone",
            is_read=False,
            ai_generated=alert_in.ai_generated or ("ai" in alert_in.source.lower() or alert_in.category.upper() == "AI"),
            recommended_action=alert_in.recommended_action or "Review telemetry and dispatch collection if required.",
            metadata_json=alert_in.metadata or {},
            created_at=now,
            updated_at=now,
        )
        db.add(record)
        await db.flush()

        # Initial creation activity
        act = AlertActivity(
            alert_id=record.id,
            action="CREATED",
            performed_by=alert_in.source,
            note=f"Alert generated: {alert_in.title}",
            created_at=now,
        )
        db.add(act)

        if auto_commit:
            await db.commit()
            await db.refresh(record, attribute_names=["activities"])

        return cls._to_response(record)

    @classmethod
    async def list_alerts(
        cls,
        db: AsyncSession,
        status_filter: Optional[str] = None,
        severity_filter: Optional[str] = None,
        category_filter: Optional[str] = None,
        source_filter: Optional[str] = None,
        zone_filter: Optional[str] = None,
        entity_type_filter: Optional[str] = None,
        is_read_filter: Optional[bool] = None,
        search_query: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "created_at",
        sort_desc: bool = True,
    ) -> AlertListResponse:
        # Check and wake up expired snoozes automatically
        now = datetime.now(timezone.utc)
        await db.execute(
            update(Alert)
            .where(Alert.status == "SNOOZED", Alert.snoozed_until <= now)
            .values(status="ACTIVE", snoozed_until=None)
        )
        await db.commit()

        conditions = []

        if status_filter and status_filter.upper() != "ALL":
            if status_filter.upper() == "UNREAD":
                conditions.append(Alert.is_read.is_(False))
            else:
                conditions.append(Alert.status == status_filter.upper())

        if severity_filter and severity_filter != "All":
            conditions.append(Alert.severity == severity_filter.upper())

        if category_filter and category_filter != "All":
            conditions.append(Alert.category == category_filter.upper())

        if source_filter and source_filter != "All":
            conditions.append(Alert.source == source_filter)

        if zone_filter and zone_filter != "All":
            conditions.append(Alert.zone == zone_filter)

        if entity_type_filter and entity_type_filter != "All":
            conditions.append(Alert.entity_type == entity_type_filter.upper())

        if is_read_filter is not None:
            conditions.append(Alert.is_read == is_read_filter)

        if search_query and search_query.strip():
            q = f"%{search_query.strip().lower()}%"
            conditions.append(
                or_(
                    func.lower(Alert.alert_code).like(q),
                    func.lower(Alert.title).like(q),
                    func.lower(Alert.description).like(q),
                    func.lower(Alert.entity_id).like(q),
                    func.lower(Alert.location).like(q),
                    func.lower(Alert.zone).like(q),
                )
            )

        where_clause = and_(*conditions) if conditions else True

        # Total count
        total = (await db.execute(select(func.count(Alert.id)).where(where_clause))).scalar_one()

        # Sorting column
        sort_col = getattr(Alert, sort_by, Alert.created_at)
        order_expr = desc(sort_col) if sort_desc else sort_col

        offset = (page - 1) * page_size
        query = (
            select(Alert)
            .options(selectinload(Alert.activities))
            .where(where_clause)
            .order_by(order_expr)
            .offset(offset)
            .limit(page_size)
        )
        records = (await db.execute(query)).scalars().all()

        items = [cls._to_response(r) for r in records]
        total_pages = math.ceil(total / page_size) if page_size > 0 else 1

        return AlertListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    @classmethod
    async def get_alert_by_id(
        cls, db: AsyncSession, identifier: Union[int, str]
    ) -> AlertItemResponse:
        query = select(Alert).options(selectinload(Alert.activities))
        if isinstance(identifier, int) or (isinstance(identifier, str) and identifier.isdigit()):
            query = query.where(Alert.id == int(identifier))
        else:
            query = query.where(Alert.alert_code == str(identifier))

        record = (await db.execute(query)).scalars().first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Alert with identifier '{identifier}' not found.",
            )
        return cls._to_response(record)

    @classmethod
    async def acknowledge_alert(
        cls,
        db: AsyncSession,
        identifier: Union[int, str],
        actor: str = "Waste Manager (Admin)",
        note: Optional[str] = None,
    ) -> AlertItemResponse:
        query = select(Alert).options(selectinload(Alert.activities))
        if isinstance(identifier, int) or (isinstance(identifier, str) and identifier.isdigit()):
            query = query.where(Alert.id == int(identifier))
        else:
            query = query.where(Alert.alert_code == str(identifier))

        record = (await db.execute(query)).scalars().first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Alert '{identifier}' not found.",
            )

        if record.status == "RESOLVED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot acknowledge an already resolved alert.",
            )

        now = datetime.now(timezone.utc)
        record.status = "ACKNOWLEDGED"
        record.acknowledged_at = now
        record.acknowledged_by = actor
        record.is_read = True
        record.updated_at = now

        act = AlertActivity(
            alert_id=record.id,
            action="ACKNOWLEDGED",
            performed_by=actor,
            note=note or "Alert acknowledged by Waste Manager",
            created_at=now,
        )
        db.add(act)
        await db.commit()
        await db.refresh(record, attribute_names=["activities"])

        return cls._to_response(record)

    @classmethod
    async def resolve_alert(
        cls,
        db: AsyncSession,
        identifier: Union[int, str],
        note: Optional[str] = "Resolved by operational dispatch",
        actor: str = "Waste Manager (Admin)",
    ) -> AlertItemResponse:
        query = select(Alert).options(selectinload(Alert.activities))
        if isinstance(identifier, int) or (isinstance(identifier, str) and identifier.isdigit()):
            query = query.where(Alert.id == int(identifier))
        else:
            query = query.where(Alert.alert_code == str(identifier))

        record = (await db.execute(query)).scalars().first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Alert '{identifier}' not found.",
            )

        now = datetime.now(timezone.utc)
        record.status = "RESOLVED"
        record.resolved_at = now
        record.resolved_by = actor
        record.resolution_note = note or "Resolved by operational dispatch"
        record.is_read = True
        record.updated_at = now

        act = AlertActivity(
            alert_id=record.id,
            action="RESOLVED",
            performed_by=actor,
            note=f"Alert resolved. Note: {record.resolution_note}",
            created_at=now,
        )
        db.add(act)
        await db.commit()
        await db.refresh(record, attribute_names=["activities"])

        return cls._to_response(record)

    @classmethod
    async def snooze_alert(
        cls,
        db: AsyncSession,
        identifier: Union[int, str],
        duration_str: str = "1 hour",
        actor: str = "Waste Manager (Admin)",
    ) -> AlertItemResponse:
        query = select(Alert).options(selectinload(Alert.activities))
        if isinstance(identifier, int) or (isinstance(identifier, str) and identifier.isdigit()):
            query = query.where(Alert.id == int(identifier))
        else:
            query = query.where(Alert.alert_code == str(identifier))

        record = (await db.execute(query)).scalars().first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Alert '{identifier}' not found.",
            )

        if record.status == "RESOLVED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot snooze an already resolved alert.",
            )

        target_time = cls._parse_duration(duration_str)
        now = datetime.now(timezone.utc)
        record.status = "SNOOZED"
        record.snoozed_until = target_time
        record.is_read = True
        record.updated_at = now

        act = AlertActivity(
            alert_id=record.id,
            action="SNOOZED",
            performed_by=actor,
            note=f"Alert snoozed until {target_time.isoformat()}",
            created_at=now,
        )
        db.add(act)
        await db.commit()
        await db.refresh(record, attribute_names=["activities"])

        return cls._to_response(record)

    @classmethod
    async def unsnooze_alert(
        cls,
        db: AsyncSession,
        identifier: Union[int, str],
        actor: str = "Waste Manager (Admin)",
    ) -> AlertItemResponse:
        query = select(Alert).options(selectinload(Alert.activities))
        if isinstance(identifier, int) or (isinstance(identifier, str) and identifier.isdigit()):
            query = query.where(Alert.id == int(identifier))
        else:
            query = query.where(Alert.alert_code == str(identifier))

        record = (await db.execute(query)).scalars().first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Alert '{identifier}' not found.",
            )

        now = datetime.now(timezone.utc)
        record.status = "ACTIVE"
        record.snoozed_until = None
        record.updated_at = now

        act = AlertActivity(
            alert_id=record.id,
            action="UNSNOOZED",
            performed_by=actor,
            note="Alert un-snoozed and returned to active state",
            created_at=now,
        )
        db.add(act)
        await db.commit()
        await db.refresh(record, attribute_names=["activities"])

        return cls._to_response(record)

    @classmethod
    async def mark_as_read(
        cls, db: AsyncSession, identifier: Union[int, str]
    ) -> AlertItemResponse:
        query = select(Alert).options(selectinload(Alert.activities))
        if isinstance(identifier, int) or (isinstance(identifier, str) and identifier.isdigit()):
            query = query.where(Alert.id == int(identifier))
        else:
            query = query.where(Alert.alert_code == str(identifier))

        record = (await db.execute(query)).scalars().first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Alert '{identifier}' not found.",
            )

        if not record.is_read:
            record.is_read = True
            await db.commit()
            await db.refresh(record, attribute_names=["activities"])

        return cls._to_response(record)

    @classmethod
    async def mark_all_read(cls, db: AsyncSession) -> Dict[str, Any]:
        res = await db.execute(update(Alert).where(Alert.is_read.is_(False)).values(is_read=True))
        await db.commit()
        count = res.rowcount or 0
        return {"success": True, "updated": count, "affected": count}

    @classmethod
    async def bulk_action(
        cls,
        db: AsyncSession,
        request: BulkAlertActionRequest,
        actor: str = "Waste Manager (Admin)",
    ) -> Dict[str, Any]:
        successful_ids = []
        failed_ids = []

        note_val = request.payload.get("note") or request.note

        for item_id in request.alert_ids:
            try:
                if request.action == "read":
                    await cls.mark_as_read(db, item_id)
                elif request.action == "acknowledge":
                    await cls.acknowledge_alert(db, item_id, actor=actor, note=note_val)
                elif request.action == "resolve":
                    await cls.resolve_alert(db, item_id, note=note_val, actor=actor)
                elif request.action == "snooze":
                    duration = request.payload.get("duration") or "1 hour"
                    await cls.snooze_alert(db, item_id, duration_str=duration, actor=actor)
                successful_ids.append(item_id)
            except Exception as e:
                failed_ids.append({"id": item_id, "error": str(e)})

        return {
            "success": len(failed_ids) == 0,
            "action": request.action,
            "affected": len(successful_ids),
            "processed": len(request.alert_ids),
            "successful": successful_ids,
            "failed": failed_ids,
        }

    @classmethod
    async def get_summary(cls, db: AsyncSession) -> AlertSummaryResponse:
        total_q = select(func.count(Alert.id))
        total = (await db.execute(total_q)).scalar_one() or 0

        active_q = select(func.count(Alert.id)).where(Alert.status == "ACTIVE")
        active = (await db.execute(active_q)).scalar_one() or 0

        critical_q = select(func.count(Alert.id)).where(
            Alert.severity == "CRITICAL",
            Alert.status != "RESOLVED",
        )
        critical = (await db.execute(critical_q)).scalar_one() or 0

        unack_q = select(func.count(Alert.id)).where(
            Alert.status == "ACTIVE",
            Alert.acknowledged_at.is_(None),
        )
        unack = (await db.execute(unack_q)).scalar_one() or 0

        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        resolved_today_q = select(func.count(Alert.id)).where(
            Alert.status == "RESOLVED",
            Alert.resolved_at >= today_start,
        )
        resolved_today = (await db.execute(resolved_today_q)).scalar_one() or 0

        ai_q = select(func.count(Alert.id)).where(Alert.ai_generated.is_(True))
        ai_alerts = (await db.execute(ai_q)).scalar_one() or 0

        unread_q = select(func.count(Alert.id)).where(Alert.is_read.is_(False))
        unread = (await db.execute(unread_q)).scalar_one() or 0

        return AlertSummaryResponse(
            active=active,
            critical=critical,
            unacknowledged=unack,
            resolved_today=resolved_today,
            ai_alerts=ai_alerts,
            unread=unread,
            total=total,
        )

    @classmethod
    async def get_trends(cls, db: AsyncSession) -> AlertTrendsResponse:
        # 7 days trend
        now = datetime.now(timezone.utc)
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        trends: List[AlertTrendItem] = []

        for i in range(6, -1, -1):
            day_dt = now - timedelta(days=i)
            start_dt = day_dt.replace(hour=0, minute=0, second=0, microsecond=0)
            end_dt = day_dt.replace(hour=23, minute=59, second=59, microsecond=999999)
            day_abbr = day_names[day_dt.weekday()]

            q = select(
                func.count(Alert.id).filter(Alert.severity == "CRITICAL").label("crit"),
                func.count(Alert.id).filter(Alert.severity == "HIGH").label("high"),
                func.count(Alert.id).filter(Alert.severity == "MEDIUM").label("med"),
                func.count(Alert.id).filter(Alert.severity.in_(["LOW", "INFO"])).label("low"),
            ).where(Alert.created_at >= start_dt, Alert.created_at <= end_dt)

            row = (await db.execute(q)).one()
            trends.append(
                AlertTrendItem(
                    day=day_abbr,
                    critical=row.crit or 0,
                    high=row.high or 0,
                    medium=row.med or 0,
                    low=row.low or 0,
                )
            )

        return AlertTrendsResponse(trends=trends)

    @classmethod
    async def get_categories(cls, db: AsyncSession) -> AlertCategoriesResponse:
        total_q = select(func.count(Alert.id))
        total = (await db.execute(total_q)).scalar_one() or 1

        group_q = select(
            Alert.entity_type,
            func.count(Alert.id).label("count"),
        ).group_by(Alert.entity_type)
        rows = (await db.execute(group_q)).all()
        counts = {r.entity_type: r.count for r in rows}

        categories = []
        for name, key in [("Bin", "BIN"), ("Route", "ROUTE"), ("Vehicle", "VEHICLE"), ("Sensor", "SENSOR"), ("System", "SYSTEM")]:
            c = counts.get(key, 0)
            p = round((c / total) * 100) if total > 0 else 0
            categories.append(AlertCategoryItem(name=name, count=c, percent=p, percentage=p))

        return AlertCategoriesResponse(categories=categories)

    @classmethod
    def _to_response(cls, record: Alert) -> AlertItemResponse:
        acts = record.activities or []
        log_items = [
            AlertActivityItem(
                timestamp=act.created_at.strftime("%b %d, %H:%M"),
                description=act.note or f"Action {act.action}",
                actor=act.performed_by,
                action=act.action,
                note=act.note,
            )
            for act in acts
        ]

        return AlertItemResponse(
            id=record.alert_code,
            internal_id=record.id,
            alert_code=record.alert_code,
            severity=record.severity,
            category=record.category,
            type=record.title.split(" at ")[0] if " at " in record.title else record.category,
            title=record.title,
            description=record.description,
            source=record.source,
            entity_type=record.entity_type,
            entity_id=record.entity_id,
            location=record.location or "General Zone",
            zone=record.zone or "Central Zone",
            status=record.status,
            is_read=record.is_read,
            created_at=record.created_at.isoformat(),
            acknowledged_at=record.acknowledged_at.isoformat() if record.acknowledged_at else None,
            acknowledged_by=record.acknowledged_by,
            resolved_at=record.resolved_at.isoformat() if record.resolved_at else None,
            resolved_by=record.resolved_by,
            snoozed_until=record.snoozed_until.isoformat() if record.snoozed_until else None,
            resolution_note=record.resolution_note,
            recommended_action=record.recommended_action,
            ai_generated=record.ai_generated,
            metadata=record.metadata_json or {},
            activity_log=log_items,
        )
