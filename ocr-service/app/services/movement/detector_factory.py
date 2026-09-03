from typing import Dict, Type, Optional
from app.services.movement.base_detector import BaseExerciseDetector
from app.services.movement.bicep_curl import BicepCurlDetector
from app.services.movement.squat import SquatDetector
from app.services.movement.pushup import PushUpDetector
from app.services.movement.shoulder_press import ShoulderPressDetector

class DetectorFactory:
    """
    Modular Factory & Registry for Exercise Movement Detectors.
    Allows dynamic registration and retrieval of exercise models.
    """
    _registry: Dict[str, BaseExerciseDetector] = {
        "bicep curl": BicepCurlDetector(),
        "bicep curls": BicepCurlDetector(),
        "squat": SquatDetector(),
        "squats": SquatDetector(),
        "push up": PushUpDetector(),
        "push-up": PushUpDetector(),
        "pushups": PushUpDetector(),
        "shoulder press": ShoulderPressDetector(),
        "overhead press": ShoulderPressDetector(),
    }

    @classmethod
    def get_detector(cls, exercise_name: str) -> Optional[BaseExerciseDetector]:
        normalized = exercise_name.strip().lower()
        if normalized in cls._registry:
            return cls._registry[normalized]
        # Partial match fallback
        for key, detector in cls._registry.items():
            if key in normalized or normalized in key:
                return detector
        return cls._registry["bicep curl"]

    @classmethod
    def register_detector(cls, key: str, detector: BaseExerciseDetector) -> None:
        cls._registry[key.strip().lower()] = detector
