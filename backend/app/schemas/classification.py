import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.bin import WasteType
from app.models.waste_classification import ClassificationSource


class ClassificationCreateRequest(BaseModel):
    bin_id: Optional[int] = Field(None, description="Optional ID of the associated smart bin")
    collection_id: Optional[int] = Field(None, description="Optional ID of the associated collection event")
    source: ClassificationSource = Field(ClassificationSource.IMAGE, description="Source of classification")
    image_reference: Optional[str] = Field(None, max_length=500, description="Image URL, filename, or storage reference")
    manual_waste_type: Optional[WasteType] = Field(None, description="Required if source is MANUAL; overrides AI inference")
    manual_confidence: Optional[float] = Field(None, description="Confidence score for manual classification (0.0 to 1.0)")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Custom metadata or telemetry context")

    @field_validator("manual_confidence")
    @classmethod
    def validate_confidence(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (0.0 <= v <= 1.0):
            raise ValueError("Confidence must be a decimal between 0.0 and 1.0")
        return v

    @field_validator("manual_waste_type")
    @classmethod
    def validate_manual_waste_type(cls, v: Optional[WasteType]) -> Optional[WasteType]:
        if v is not None and v not in WasteType:
            raise ValueError(f"Invalid waste type. Must be one of {[t.value for t in WasteType]}")
        return v


class ClassificationBatchRequest(BaseModel):
    items: List[ClassificationCreateRequest] = Field(
        ..., min_length=1, max_length=100, description="Batch of items to classify (1 to 100)"
    )


class ClassificationResponse(BaseModel):
    id: int
    uuid: uuid.UUID
    bin_id: Optional[int] = None
    bin_code: Optional[str] = None
    collection_id: Optional[int] = None
    waste_type: WasteType
    confidence: Optional[float] = None
    source: str
    model_name: Optional[str] = None
    model_version: Optional[str] = None
    image_reference: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    is_low_confidence: bool
    review_required: bool
    classified_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ClassificationListResponse(BaseModel):
    items: List[ClassificationResponse]
    total: int
    page: int
    page_size: int


class ClassificationSummaryResponse(BaseModel):
    total_classifications: int
    average_confidence: float
    classifications_today: int
    low_confidence_count: int
    most_common_waste_type: Optional[WasteType] = None
    last_classified_at: Optional[datetime] = None


class ClassificationClassDistribution(BaseModel):
    waste_type: WasteType
    count: int
    percentage: float


class ClassificationDistributionResponse(BaseModel):
    total: int
    distribution: List[ClassificationClassDistribution]
