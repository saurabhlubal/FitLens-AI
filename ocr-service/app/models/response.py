from typing import List, Optional

from pydantic import BaseModel, Field


class DetectedExercise(BaseModel):
    exerciseName: str
    sets: Optional[int] = None
    reps: Optional[int] = None
    confidence: float


class OcrAnalysisResponse(BaseModel):
    success: bool
    text: str = ""
    exerciseName: Optional[str] = None
    sets: Optional[int] = None
    reps: Optional[int] = None
    confidence: float = 0.0
    exercises: List[DetectedExercise] = Field(default_factory=list)
