from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class LandmarkPoint(BaseModel):
    x: float
    y: float
    z: Optional[float] = 0.0
    visibility: Optional[float] = 1.0

class MovementAnalysisRequest(BaseModel):
    exerciseName: str
    landmarks: List[LandmarkPoint]
    image: Optional[str] = None  # Base64 encoded image frame (optional)
    currentReps: Optional[int] = 0
    currentStage: Optional[str] = "up"  # "up" | "down" | "holding"
    sessionData: Optional[Dict[str, Any]] = Field(default_factory=dict)

class JointAngles(BaseModel):
    leftElbow: Optional[float] = None
    rightElbow: Optional[float] = None
    leftShoulder: Optional[float] = None
    rightShoulder: Optional[float] = None
    leftHip: Optional[float] = None
    rightHip: Optional[float] = None
    leftKnee: Optional[float] = None
    rightKnee: Optional[float] = None
    backAngle: Optional[float] = None

class MovementAnalysisResponse(BaseModel):
    success: bool = True
    exerciseName: str
    stage: str = "up"  # "up" | "down" | "hold"
    repetitionCount: int = 0
    repIncremented: bool = False
    formScore: float = 100.0  # 0 to 100
    isCorrectForm: bool = True
    feedback: str = ""
    jointAngles: Optional[JointAngles] = None
    metrics: Dict[str, Any] = Field(default_factory=dict)
    timestamp: Optional[float] = None
