import hashlib
import random
from typing import List

from app.classification.engine import (
    ClassificationEngine,
    ClassificationInput,
    ClassificationOutput,
)
from app.core.config import settings
from app.models.bin import WasteType


class MockClassificationEngine(ClassificationEngine):
    """
    Simulation / Mock classification engine for testing and demonstration.
    Returns realistic predictions across the 6 core waste types:
    PLASTIC, PAPER, METAL, GLASS, ORGANIC, OTHER.
    """

    def __init__(
        self,
        model_name: str = settings.CLASSIFICATION_DEFAULT_MODEL_NAME,
        model_version: str = settings.CLASSIFICATION_DEFAULT_MODEL_VERSION,
        low_confidence_threshold: float = settings.CLASSIFICATION_LOW_CONFIDENCE_THRESHOLD,
    ):
        self.model_name = model_name
        self.model_version = model_version
        self.low_confidence_threshold = low_confidence_threshold

    async def classify(self, input_data: ClassificationInput) -> ClassificationOutput:
        # 1. Handle MANUAL classification
        if input_data.source == "MANUAL" and input_data.manual_waste_type:
            confidence = input_data.manual_confidence if input_data.manual_confidence is not None else 1.0
            is_low = confidence < self.low_confidence_threshold
            return ClassificationOutput(
                waste_type=input_data.manual_waste_type,
                confidence=round(confidence, 4),
                model_name="manual-operator",
                model_version="1.0.0",
                is_low_confidence=is_low,
                attributes={"review_notes": "Operator visual assessment"},
            )

        # 2. Heuristic inference based on image_reference or metadata clues
        ref_text = (input_data.image_reference or "").lower()
        meta_str = str(input_data.metadata or {}).lower()
        combined_clues = f"{ref_text} {meta_str}"

        detected_type: WasteType
        confidence: float

        if any(w in combined_clues for w in ["plastic", "pet", "bottle", "wrapper", "poly"]):
            detected_type = WasteType.PLASTIC
            confidence = 0.94
        elif any(w in combined_clues for w in ["paper", "cardboard", "box", "carton", "newspaper"]):
            detected_type = WasteType.PAPER
            confidence = 0.92
        elif any(w in combined_clues for w in ["metal", "can", "tin", "aluminum", "foil"]):
            detected_type = WasteType.METAL
            confidence = 0.91
        elif any(w in combined_clues for w in ["glass", "jar", "wine", "mirror"]):
            detected_type = WasteType.GLASS
            confidence = 0.89
        elif any(w in combined_clues for w in ["food", "leaf", "organic", "vegetable", "compost", "fruit"]):
            detected_type = WasteType.ORGANIC
            confidence = 0.95
        elif any(w in combined_clues for w in ["ambiguous", "dirty", "mixed", "low_conf", "unknown"]):
            detected_type = WasteType.OTHER
            confidence = 0.58  # Deliberately below 0.70 threshold to test low-confidence flow
        elif input_data.bin_waste_type:
            # Consistent with designated bin type if available
            detected_type = input_data.bin_waste_type
            confidence = 0.88
        else:
            # Deterministic pseudo-random classification based on hash of input or random
            seed_source = ref_text or str(random.random())
            hash_val = int(hashlib.md5(seed_source.encode("utf-8")).hexdigest(), 16)
            classes = [
                (WasteType.PLASTIC, 0.93),
                (WasteType.PAPER, 0.91),
                (WasteType.ORGANIC, 0.95),
                (WasteType.METAL, 0.88),
                (WasteType.GLASS, 0.89),
                (WasteType.OTHER, 0.65),
            ]
            detected_type, confidence = classes[hash_val % len(classes)]

        is_low = confidence < self.low_confidence_threshold

        return ClassificationOutput(
            waste_type=detected_type,
            confidence=round(confidence, 4),
            model_name=self.model_name,
            model_version=self.model_version,
            is_low_confidence=is_low,
            attributes={
                "inference_time_ms": 42.5,
                "detected_features": [detected_type.value.lower(), "edge_contour_verified"],
            },
        )

    async def classify_batch(
        self, inputs: List[ClassificationInput]
    ) -> List[ClassificationOutput]:
        return [await self.classify(item) for item in inputs]
