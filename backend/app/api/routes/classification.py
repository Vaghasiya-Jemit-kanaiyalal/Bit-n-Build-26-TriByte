from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_admin, require_roles
from app.db.database import get_db
from app.models.bin import WasteType
from app.models.user import User, UserRole
from app.models.waste_classification import ClassificationSource
from app.schemas.classification import (
    ClassificationBatchRequest,
    ClassificationCreateRequest,
    ClassificationDistributionResponse,
    ClassificationListResponse,
    ClassificationResponse,
    ClassificationSummaryResponse,
)
from app.services.classification_service import ClassificationService

router = APIRouter(
    prefix="/admin/classification",
    tags=["Admin Classification"],
)

_service = ClassificationService()


# ============================================================================
# 1. SUMMARY & DISTRIBUTION (READ ENDPOINTS - ADMIN & ANALYST)
# ============================================================================

@router.get(
    "/summary",
    response_model=ClassificationSummaryResponse,
    summary="Get overall classification summary",
    description="Returns aggregate classification metrics: total classifications, average confidence, classifications today, low confidence count, and most common waste type.",
)
async def get_classification_summary(
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST)),
    db: AsyncSession = Depends(get_db),
) -> ClassificationSummaryResponse:
    return await _service.get_summary(db)


@router.get(
    "/distribution",
    response_model=ClassificationDistributionResponse,
    summary="Get waste type distribution",
    description="Returns classification counts and percentages across all 6 supported waste categories (PLASTIC, PAPER, METAL, GLASS, ORGANIC, OTHER).",
)
async def get_classification_distribution(
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST)),
    db: AsyncSession = Depends(get_db),
) -> ClassificationDistributionResponse:
    return await _service.get_distribution(db)


# ============================================================================
# 2. LIST & FILTER CLASSIFICATIONS (ADMIN & ANALYST)
# ============================================================================

@router.get(
    "",
    response_model=ClassificationListResponse,
    summary="List waste classification records",
    description="Retrieve paginated classification history with optional filters for waste type, source, smart bin, low-confidence flag, and date range.",
)
async def list_classifications(
    waste_type: Optional[WasteType] = Query(None, description="Filter by waste category"),
    source: Optional[ClassificationSource] = Query(None, description="Filter by classification source (IMAGE, SENSOR, MANUAL, AI_MODEL, SIMULATION)"),
    bin_id: Optional[int] = Query(None, ge=1, description="Filter by smart bin ID"),
    is_low_confidence: Optional[bool] = Query(None, description="Filter by low confidence flag (< 0.70)"),
    start_date: Optional[datetime] = Query(None, description="Filter records on or after this timestamp"),
    end_date: Optional[datetime] = Query(None, description="Filter records on or before this timestamp"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("classified_at", description="Field to sort by (classified_at, confidence, waste_type)"),
    sort_desc: bool = Query(True, description="Sort descending if true"),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST)),
    db: AsyncSession = Depends(get_db),
) -> ClassificationListResponse:
    return await _service.list_classifications(
        db=db,
        waste_type=waste_type,
        source=source,
        bin_id=bin_id,
        is_low_confidence=is_low_confidence,
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_desc=sort_desc,
    )


# ============================================================================
# 3. BIN-SPECIFIC CLASSIFICATIONS (ADMIN, ANALYST, DRIVER)
# ============================================================================

@router.get(
    "/bin/{bin_id}",
    response_model=ClassificationListResponse,
    summary="Get classification history for a smart bin",
    description="Retrieve chronological waste classification history associated with a specific bin.",
)
async def get_bin_classifications(
    bin_id: int = Path(..., ge=1, description="Smart bin ID"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST, UserRole.DRIVER)),
    db: AsyncSession = Depends(get_db),
) -> ClassificationListResponse:
    return await _service.get_by_bin_id(db=db, bin_id=bin_id, page=page, page_size=page_size)


# ============================================================================
# 4. SINGLE CLASSIFICATION DETAILS (ADMIN & ANALYST)
# ============================================================================

@router.get(
    "/{classification_id}",
    response_model=ClassificationResponse,
    summary="Get classification record by ID",
    description="Retrieve full details for a specific waste classification record.",
)
async def get_classification_by_id(
    classification_id: int = Path(..., ge=1, description="Classification record ID"),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST)),
    db: AsyncSession = Depends(get_db),
) -> ClassificationResponse:
    return await _service.get_by_id(db=db, classification_id=classification_id)


# ============================================================================
# 5. EXECUTE / CREATE CLASSIFICATION (ADMIN ONLY)
# ============================================================================

@router.post(
    "",
    response_model=ClassificationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Classify waste (Single)",
    description="Run classification on waste input (image, sensor telemetry, simulation, or manual operator assignment). Stores and returns the validated result with confidence and model metadata.",
)
async def create_classification(
    request: ClassificationCreateRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> ClassificationResponse:
    return await _service.create_classification(db=db, request=request)


@router.post(
    "/batch",
    response_model=List[ClassificationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Classify waste (Batch)",
    description="Process up to 100 classification inputs in a single transactional batch operation.",
)
async def create_batch_classification(
    request: ClassificationBatchRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> List[ClassificationResponse]:
    return await _service.create_batch_classification(db=db, request=request)


from fastapi import File, UploadFile, Form

@router.post(
    "/upload",
    response_model=ClassificationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Classify uploaded waste image",
    description="Accepts a real waste photo file, processes it via VisionClassificationEngine, stores classification record in DB, and returns prediction result.",
)
async def upload_and_classify_image(
    file: UploadFile = File(...),
    bin_id: Optional[int] = Form(None),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.ANALYST, UserRole.DRIVER)),
    db: AsyncSession = Depends(get_db),
) -> ClassificationResponse:
    content = await file.read()
    return await _service.classify_uploaded_image(
        db=db,
        image_bytes=content,
        filename=file.filename or "uploaded_waste.jpg",
        bin_id=bin_id,
    )

