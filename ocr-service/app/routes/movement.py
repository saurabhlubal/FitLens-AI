from fastapi import APIRouter, HTTPException, status
import time
from app.models.movement import MovementAnalysisRequest, MovementAnalysisResponse
from app.services.movement.detector_factory import DetectorFactory
from app.services.movement.body_part_classifier import BodyPartSegmenter
from app.services.movement.pose_quality import PoseQualityValidator
from app.services.movement.classifier import ExerciseClassifier

router = APIRouter(prefix="/api/ai/movement", tags=["Movement & Repetition Detection"])

@router.post("/detect-landmarks", response_model=MovementAnalysisResponse)
async def analyze_movement_landmarks(payload: MovementAnalysisRequest):
    """
    Analyzes live pose landmarks (33-point coordinates), evaluates kinematics & joint angles,
    manages the repetition state machine, calculates form score, and returns real-time coaching feedback.
    Includes Pose Quality & Framing Gate, and Temporal Exercise Mismatch Validation.
    """
    if not payload.landmarks or len(payload.landmarks) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pose landmarks provided in request payload."
        )

    session_data = payload.sessionData or {}

    # 1. Pose Quality & Framing Gate (Pre-Analysis)
    validator = PoseQualityValidator()
    quality_res = validator.validate(payload.exerciseName, payload.landmarks)
    if not quality_res.is_valid:
        # Temporary tracking loss, out of frame, too close/far, or bad camera orientation
        return MovementAnalysisResponse(
            success=True,
            exerciseName=payload.exerciseName,
            stage=payload.currentStage or "up",
            repetitionCount=payload.currentReps or 0,
            repIncremented=False,
            formScore=None,  # Null formScore for positioning/framing adjustment
            isCorrectForm=True,
            feedback=quality_res.guidance,
            aiState="POSITION_ADJUSTMENT",
            poseQuality=quality_res.details,
            sessionData=session_data,  # Session state preserved
            timestamp=time.time()
        )

    # 2. Temporal Exercise Validation & Mismatch Gate
    is_match, detected_exercise, mismatch_msg = ExerciseClassifier.verify_exercise_match(
        expected_exercise=payload.exerciseName,
        landmarks=payload.landmarks,
        session_data=session_data
    )
    if not is_match:
        # Confirmed temporal mismatch across multiple consecutive frames
        return MovementAnalysisResponse(
            success=True,
            exerciseName=payload.exerciseName,
            stage=payload.currentStage or "up",
            repetitionCount=payload.currentReps or 0,
            repIncremented=False,
            formScore=None,  # Not 0.0 - a wrong exercise is not bad form!
            isCorrectForm=True,
            feedback=mismatch_msg,
            aiState="EXERCISE_MISMATCH",
            detectedExercise=detected_exercise,
            poseQuality=quality_res.details,
            sessionData=session_data,
            timestamp=time.time()
        )

    # 3. Detector Retrieval and Execution (Full-Cycle Repetition State Machine)
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
        session_data=session_data
    )
    
    response.sessionData = session_data
    response.detectedExercise = payload.exerciseName
    response.poseQuality = quality_res.details

    # Run Body-Part Segmenter Model
    segmenter = BodyPartSegmenter.get_instance()
    seg_data = segmenter.segment_landmarks(payload.landmarks)
    response.metrics["bodyPartSegmentation"] = seg_data["summary"]
    
    response.timestamp = time.time()
    return response


@router.post("/segment-body-parts")
async def segment_body_parts(payload: MovementAnalysisRequest):
    """Classifies individual landmarks into face, shoulders, arms, torso, and legs using ResNet classifier."""
    segmenter = BodyPartSegmenter.get_instance()
    return segmenter.segment_landmarks(payload.landmarks)

@router.get("/exercises")
async def get_supported_exercises():
    """Returns list of supported AI movement detection exercises"""
    return {
        "exercises": [
            {"name": "Bicep Curl", "category": "Arms", "tracking": "Elbow flexion, shoulder swing"},
            {"name": "Squat", "category": "Legs", "tracking": "Knee depth, chest inclination"},
            {"name": "Push-up", "category": "Chest", "tracking": "Elbow angle, body plank alignment"},
            {"name": "Shoulder Press", "category": "Shoulders", "tracking": "Overhead lockout, pressing symmetry"},
            {"name": "Lateral Raise", "category": "Shoulders", "tracking": "Shoulder abduction angle, symmetry"},
            {"name": "Lunge", "category": "Legs", "tracking": "Lead knee angle, hip depth"},
            {"name": "Jumping Jacks", "category": "Cardio", "tracking": "Arm overhead sweep, rhythmic cadence"},
            {"name": "Plank", "category": "Core", "tracking": "Spine alignment angle, duration hold"},
            {"name": "Hammer Curl", "category": "Arms", "tracking": "Neutral grip elbow flexion, tempo"}
        ]
    }
