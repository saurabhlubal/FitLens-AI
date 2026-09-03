from abc import ABC, abstractmethod
import math
from typing import List, Tuple, Optional, Dict, Any
from app.models.movement import LandmarkPoint, MovementAnalysisResponse, JointAngles

class BaseExerciseDetector(ABC):
    """
    Modular Base Class for Exercise Movement & Repetition Detection Models.
    Allows easy extension for custom PyTorch, ONNX, Scikit-Learn or Kinematic models.
    """

    def __init__(self, name: str):
        self.name = name

    @staticmethod
    def calculate_angle(
        a: Optional[LandmarkPoint],
        b: Optional[LandmarkPoint],
        c: Optional[LandmarkPoint]
    ) -> Optional[float]:
        """Calculates the 2D joint angle between three landmarks: a (start), b (vertex), c (end)"""
        if not a or not b or not c:
            return None
        
        # Calculate angle in degrees
        radians = math.atan2(c.y - b.y, c.x - b.x) - math.atan2(a.y - b.y, a.x - b.x)
        angle = abs(radians * 180.0 / math.pi)
        if angle > 180.0:
            angle = 360.0 - angle
        return round(angle, 1)

    @staticmethod
    def get_landmark(landmarks: List[LandmarkPoint], index: int) -> Optional[LandmarkPoint]:
        if 0 <= index < len(landmarks):
            return landmarks[index]
        return None

    @abstractmethod
    def analyze(
        self,
        landmarks: List[LandmarkPoint],
        current_reps: int,
        current_stage: str,
        session_data: Optional[Dict[str, Any]] = None
    ) -> MovementAnalysisResponse:
        """Analyze landmark telemetry and determine movement stage, reps, form score & cues."""
        pass
