import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import func, select, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.classification.engine import ClassificationEngine, ClassificationInput
from app.classification.vision_engine import VisionClassificationEngine
from app.core.config import settings
from app.models.bin import Bin, WasteType
from app.models.bin_collection import BinCollectionHistory
from app.models.waste_classification import WasteClassification, ClassificationSource
from app.schemas.classification import (
    ClassificationBatchRequest,
    ClassificationClassDistribution,
    ClassificationCreateRequest,
    ClassificationDistributionResponse,
    ClassificationListResponse,
    ClassificationResponse,
    ClassificationSummaryResponse,
)


class ClassificationService:
    def __init__(self, engine: Optional[ClassificationEngine] = None):
        self.engine = engine or VisionClassificationEngine()

    async def classify_uploaded_image(
        self, db: AsyncSession, image_bytes: bytes, filename: str, bin_id: Optional[int] = None
    ) -> ClassificationResponse:
        vision_engine = self.engine if isinstance(self.engine, VisionClassificationEngine) else VisionClassificationEngine()
        w_type, conf, meta = vision_engine.analyze_image_bytes(image_bytes, filename=filename)

        bin_obj: Optional[Bin] = None
        if bin_id:
            res = await db.execute(select(Bin).where(Bin.id == bin_id))
            bin_obj = res.scalars().first()

        now = datetime.now(timezone.utc)
        record = WasteClassification(
            uuid=uuid.uuid4(),
            bin_id=bin_id,
            waste_type=w_type,
            confidence=conf,
            source="IMAGE",
            model_name=vision_engine.model_name,
            model_version=vision_engine.model_version,
            image_reference=filename,
            metadata_json={**meta, "original_filename": filename},
            is_low_confidence=conf < vision_engine.low_confidence_threshold,
            classified_at=now,
            created_at=now,
        )
        db.add(record)
        await db.commit()
        await db.refresh(record)

        return self._to_response(record, bin_code=bin_obj.bin_code if bin_obj else None)


    async def create_classification(
        self, db: AsyncSession, request: ClassificationCreateRequest
    ) -> ClassificationResponse:
        bin_obj: Optional[Bin] = None
        if request.bin_id is not None:
            bin_result = await db.execute(select(Bin).where(Bin.id == request.bin_id))
            bin_obj = bin_result.scalars().first()
            if not bin_obj:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Smart bin with ID {request.bin_id} does not exist.",
                )

        if request.collection_id is not None:
            coll_result = await db.execute(
                select(BinCollectionHistory).where(BinCollectionHistory.id == request.collection_id)
            )
            coll_obj = coll_result.scalars().first()
            if not coll_obj:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Collection event with ID {request.collection_id} does not exist.",
                )

        # Run inference via engine abstraction
        engine_input = ClassificationInput(
            image_reference=request.image_reference,
            metadata=request.metadata,
            bin_waste_type=bin_obj.waste_type if bin_obj else None,
            manual_waste_type=request.manual_waste_type,
            manual_confidence=request.manual_confidence,
            source=request.source.value,
        )
        engine_output = await self.engine.classify(engine_input)

        now = datetime.now(timezone.utc)
        record = WasteClassification(
            uuid=uuid.uuid4(),
            bin_id=request.bin_id,
            collection_id=request.collection_id,
            waste_type=engine_output.waste_type,
            confidence=engine_output.confidence,
            source=request.source.value,
            model_name=engine_output.model_name,
            model_version=engine_output.model_version,
            image_reference=request.image_reference,
            metadata_json={**(request.metadata or {}), **engine_output.attributes},
            is_low_confidence=engine_output.is_low_confidence,
            classified_at=now,
            created_at=now,
        )
        db.add(record)
        await db.commit()
        await db.refresh(record)

        return self._to_response(record, bin_code=bin_obj.bin_code if bin_obj else None)

    async def create_batch_classification(
        self, db: AsyncSession, request: ClassificationBatchRequest
    ) -> List[ClassificationResponse]:
        # Pre-verify bins
        bin_ids = {item.bin_id for item in request.items if item.bin_id is not None}
        bins_map: Dict[int, Bin] = {}
        if bin_ids:
            bin_rows = await db.execute(select(Bin).where(Bin.id.in_(bin_ids)))
            for b in bin_rows.scalars().all():
                bins_map[b.id] = b
            for bid in bin_ids:
                if bid not in bins_map:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Smart bin with ID {bid} does not exist.",
                    )

        # Pre-verify collections
        coll_ids = {item.collection_id for item in request.items if item.collection_id is not None}
        if coll_ids:
            coll_rows = await db.execute(select(BinCollectionHistory.id).where(BinCollectionHistory.id.in_(coll_ids)))
            found_colls = set(coll_rows.scalars().all())
            for cid in coll_ids:
                if cid not in found_colls:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Collection event with ID {cid} does not exist.",
                    )

        # Prepare batch inputs
        engine_inputs: List[ClassificationInput] = []
        for item in request.items:
            b_obj = bins_map.get(item.bin_id) if item.bin_id else None
            engine_inputs.append(
                ClassificationInput(
                    image_reference=item.image_reference,
                    metadata=item.metadata,
                    bin_waste_type=b_obj.waste_type if b_obj else None,
                    manual_waste_type=item.manual_waste_type,
                    manual_confidence=item.manual_confidence,
                    source=item.source.value,
                )
            )

        outputs = await self.engine.classify_batch(engine_inputs)
        now = datetime.now(timezone.utc)
        created_records: List[WasteClassification] = []

        for item, out in zip(request.items, outputs):
            rec = WasteClassification(
                uuid=uuid.uuid4(),
                bin_id=item.bin_id,
                collection_id=item.collection_id,
                waste_type=out.waste_type,
                confidence=out.confidence,
                source=item.source.value,
                model_name=out.model_name,
                model_version=out.model_version,
                image_reference=item.image_reference,
                metadata_json={**(item.metadata or {}), **out.attributes},
                is_low_confidence=out.is_low_confidence,
                classified_at=now,
                created_at=now,
            )
            db.add(rec)
            created_records.append(rec)

        await db.commit()
        for r in created_records:
            await db.refresh(r)

        return [
            self._to_response(r, bin_code=bins_map[r.bin_id].bin_code if r.bin_id and r.bin_id in bins_map else None)
            for r in created_records
        ]

    async def get_by_id(self, db: AsyncSession, classification_id: int) -> ClassificationResponse:
        query = (
            select(WasteClassification)
            .options(selectinload(WasteClassification.bin))
            .where(WasteClassification.id == classification_id)
        )
        result = await db.execute(query)
        record = result.scalars().first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Classification record with ID {classification_id} not found.",
            )
        bin_code = record.bin.bin_code if record.bin else None
        return self._to_response(record, bin_code=bin_code)

    async def get_by_bin_id(
        self, db: AsyncSession, bin_id: int, page: int = 1, page_size: int = 50
    ) -> ClassificationListResponse:
        # Check bin exists
        b_res = await db.execute(select(Bin).where(Bin.id == bin_id))
        bin_obj = b_res.scalars().first()
        if not bin_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Smart bin with ID {bin_id} does not exist.",
            )

        offset = (page - 1) * page_size
        count_q = select(func.count(WasteClassification.id)).where(WasteClassification.bin_id == bin_id)
        total = (await db.execute(count_q)).scalar_one()

        data_q = (
            select(WasteClassification)
            .where(WasteClassification.bin_id == bin_id)
            .order_by(desc(WasteClassification.classified_at))
            .offset(offset)
            .limit(page_size)
        )
        records = (await db.execute(data_q)).scalars().all()

        items = [self._to_response(r, bin_code=bin_obj.bin_code) for r in records]
        return ClassificationListResponse(items=items, total=total, page=page, page_size=page_size)

    async def list_classifications(
        self,
        db: AsyncSession,
        waste_type: Optional[WasteType] = None,
        source: Optional[ClassificationSource] = None,
        bin_id: Optional[int] = None,
        is_low_confidence: Optional[bool] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "classified_at",
        sort_desc: bool = True,
    ) -> ClassificationListResponse:
        conditions = []
        if waste_type is not None:
            conditions.append(WasteClassification.waste_type == waste_type)
        if source is not None:
            conditions.append(WasteClassification.source == source.value)
        if bin_id is not None:
            conditions.append(WasteClassification.bin_id == bin_id)
        if is_low_confidence is not None:
            conditions.append(WasteClassification.is_low_confidence == is_low_confidence)
        if start_date is not None:
            conditions.append(WasteClassification.classified_at >= start_date)
        if end_date is not None:
            conditions.append(WasteClassification.classified_at <= end_date)

        where_clause = and_(*conditions) if conditions else True

        # Total count
        count_query = select(func.count(WasteClassification.id)).where(where_clause)
        total = (await db.execute(count_query)).scalar_one()

        # Sorting column
        sort_col = getattr(WasteClassification, sort_by, WasteClassification.classified_at)
        order_expr = desc(sort_col) if sort_desc else sort_col

        offset = (page - 1) * page_size
        data_query = (
            select(WasteClassification)
            .options(selectinload(WasteClassification.bin))
            .where(where_clause)
            .order_by(order_expr)
            .offset(offset)
            .limit(page_size)
        )
        records = (await db.execute(data_query)).scalars().all()

        items = [self._to_response(r, bin_code=r.bin.bin_code if r.bin else None) for r in records]
        return ClassificationListResponse(items=items, total=total, page=page, page_size=page_size)

    async def get_summary(self, db: AsyncSession) -> ClassificationSummaryResponse:
        total_q = select(
            func.count(WasteClassification.id).label("total"),
            func.coalesce(func.avg(WasteClassification.confidence), 0.0).label("avg_conf"),
            func.max(WasteClassification.classified_at).label("last_at"),
        )
        row = (await db.execute(total_q)).one()
        total_count = row.total or 0
        avg_confidence = round(float(row.avg_conf or 0.0), 4)
        last_classified_at = row.last_at

        # Classifications today (UTC)
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_q = select(func.count(WasteClassification.id)).where(WasteClassification.classified_at >= today_start)
        today_count = (await db.execute(today_q)).scalar_one()

        # Low confidence count
        low_q = select(func.count(WasteClassification.id)).where(WasteClassification.is_low_confidence.is_(True))
        low_count = (await db.execute(low_q)).scalar_one()

        # Most common waste type
        top_type_q = (
            select(WasteClassification.waste_type)
            .group_by(WasteClassification.waste_type)
            .order_by(desc(func.count(WasteClassification.id)))
            .limit(1)
        )
        top_waste_type = (await db.execute(top_type_q)).scalar_one_or_none()

        return ClassificationSummaryResponse(
            total_classifications=total_count,
            average_confidence=avg_confidence,
            classifications_today=today_count,
            low_confidence_count=low_count,
            most_common_waste_type=top_waste_type,
            last_classified_at=last_classified_at,
        )

    async def get_distribution(self, db: AsyncSession) -> ClassificationDistributionResponse:
        group_q = (
            select(
                WasteClassification.waste_type,
                func.count(WasteClassification.id).label("count"),
            )
            .group_by(WasteClassification.waste_type)
        )
        rows = (await db.execute(group_q)).all()
        counts_map = {r.waste_type: r.count for r in rows}
        total = sum(counts_map.values())

        distribution_items: List[ClassificationClassDistribution] = []
        for wt in WasteType:
            cnt = counts_map.get(wt, 0)
            pct = round((cnt / total * 100.0), 2) if total > 0 else 0.0
            distribution_items.append(
                ClassificationClassDistribution(waste_type=wt, count=cnt, percentage=pct)
            )

        return ClassificationDistributionResponse(total=total, distribution=distribution_items)

    def _to_response(
        self, record: WasteClassification, bin_code: Optional[str] = None
    ) -> ClassificationResponse:
        return ClassificationResponse(
            id=record.id,
            uuid=record.uuid,
            bin_id=record.bin_id,
            bin_code=bin_code,
            collection_id=record.collection_id,
            waste_type=record.waste_type,
            confidence=record.confidence,
            source=record.source,
            model_name=record.model_name,
            model_version=record.model_version,
            image_reference=record.image_reference,
            metadata=record.metadata_json or {},
            is_low_confidence=record.is_low_confidence,
            review_required=record.is_low_confidence,
            classified_at=record.classified_at,
            created_at=record.created_at,
        )
