from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from app.models.bin import WasteType


@dataclass
class ClassificationInput:
    """Input parameters passed to any classification engine."""
    image_reference: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    bin_waste_type: Optional[WasteType] = None
    manual_waste_type: Optional[WasteType] = None
    manual_confidence: Optional[float] = None
    source: str = "IMAGE"


@dataclass
class ClassificationOutput:
    """Standardized output produced by a classification engine."""
    waste_type: WasteType
    confidence: Optional[float]
    model_name: str
    model_version: str
    is_low_confidence: bool = False
    attributes: Dict[str, Any] = field(default_factory=dict)


class ClassificationEngine(ABC):
    """
    Abstract interface for waste classification engines.
    Enables drop-in replacement of the mock engine with a real computer vision
    or edge ML inference model (e.g., PyTorch, ONNX, TensorFlow Lite)
    without modifying API routes or database services.
    """

    @abstractmethod
    async def classify(self, input_data: ClassificationInput) -> ClassificationOutput:
        """Classifies waste based on provided input data."""
        pass

    @abstractmethod
    async def classify_batch(
        self, inputs: List[ClassificationInput]
    ) -> List[ClassificationOutput]:
        """Performs batch classification for multiple inputs."""
        pass
