from fastapi import APIRouter, HTTPException, status
import time
from app.models.movement import MovementAnalysisRequest, MovementAnalysisResponse
from app.services.movement.detector_factory import DetectorFactory

router = APIRouter(prefix="/api/ai/movement", tags=["Movement & Repetition Detection"])

@router.post("/detect-landmarks", response_model=MovementAnalysisResponse)
async def analyze_movement_landmarks(payload: MovementAnalysisRequest):
    """
    Analyzes live pose landmarks (33-point coordinates), evaluates kinematics & joint angles,
    manages the repetition state machine, calculates form score, and returns real-time coaching feedback.
    """
    if not payload.landmarks or len(payload.landmarks) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pose landmarks provided in request payload."
        )

    detector = DetectorFactory.get_detector(payload.exerciseName)
    if not detector:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No movement detector registered for exercise '{payload.exerciseName}'"
        )

    response = detector.analyze(
        landmarks=payload.landmarks,
        current_reps=payload.currentReps or 0,
        current_stage=payload.currentStage or "up",
        session_data=payload.sessionData or {}
    )
    response.timestamp = time.time()
    return response

@router.get("/exercises")
async def get_supported_exercises():
    """Returns list of supported AI movement detection exercises"""
    return {
        "exercises": [
            {"name": "Bicep Curl", "category": "Arms", "tracking": "Elbow flexion, shoulder swing"},
            {"name": "Squat", "category": "Legs", "tracking": "Knee depth, chest inclination"},
            {"name": "Push-up", "category": "Chest", "tracking": "Elbow angle, body plank alignment"},
            {"name": "Shoulder Press", "category": "Shoulders", "tracking": "Overhead lockout, pressing symmetry"}
        ]
    }
