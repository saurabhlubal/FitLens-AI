import pytest
import asyncio
from app.models.movement import LandmarkPoint, MovementAnalysisRequest
from app.services.movement.classifier import ExerciseClassifier
from app.routes.movement import analyze_movement_landmarks

def make_lm(x: float, y: float, z: float = 0.0, visibility: float = 0.99):
    return LandmarkPoint(x=x, y=y, z=z, visibility=visibility)

def create_standing_curl_landmarks(elbow_angle_flexed: bool = True):
    """Standing with elbows pinned and flexed (Bicep Curl signature)."""
    lms = [make_lm(0.5, 0.5) for _ in range(33)]
    lms[11] = make_lm(0.4, 0.3)
    lms[12] = make_lm(0.6, 0.3)
    lms[13] = make_lm(0.4, 0.5)
    lms[14] = make_lm(0.6, 0.5)
    
    # Wrist position: curled up vs extended down
    wrist_y = 0.35 if elbow_angle_flexed else 0.75
    lms[15] = make_lm(0.4, wrist_y)
    lms[16] = make_lm(0.6, wrist_y)
    
    lms[23] = make_lm(0.42, 0.65)
    lms[24] = make_lm(0.58, 0.65)
    lms[25] = make_lm(0.42, 0.8)
    lms[26] = make_lm(0.58, 0.8)
    lms[27] = make_lm(0.42, 0.95)
    lms[28] = make_lm(0.58, 0.95)
    return lms

def create_horizontal_pushup_landmarks():
    """Horizontal prone plank/pushup posture (torso horizontal)."""
    lms = [make_lm(0.5, 0.5) for _ in range(33)]
    # Torso lies horizontally across screen: shoulders at (0.2, 0.6), hips at (0.6, 0.62), feet at (0.9, 0.65)
    lms[11] = make_lm(0.2, 0.6)
    lms[12] = make_lm(0.2, 0.65)
    lms[13] = make_lm(0.25, 0.52)
    lms[14] = make_lm(0.25, 0.57)
    lms[15] = make_lm(0.22, 0.68)
    lms[16] = make_lm(0.22, 0.72)
    
    lms[23] = make_lm(0.6, 0.62)
    lms[24] = make_lm(0.6, 0.67)
    lms[25] = make_lm(0.75, 0.64)
    lms[26] = make_lm(0.75, 0.68)
    lms[27] = make_lm(0.9, 0.65)
    lms[28] = make_lm(0.9, 0.7)
    return lms

def test_noisy_single_frame_does_not_trigger_mismatch():
    session_data = {}
    curl_lms = create_standing_curl_landmarks()
    
    # User is expected to do Push-up, but 1 noisy frame shows Bicep Curl
    is_match, detected, msg = ExerciseClassifier.verify_exercise_match("Push-up", curl_lms, session_data)
    
    # 1 single frame MUST NOT trigger mismatch!
    assert is_match
    assert msg is None

def test_sustained_wrong_exercise_triggers_exercise_mismatch():
    session_data = {}
    curl_lms = create_standing_curl_landmarks()
    
    # Send 4 consecutive frames of Bicep Curl when Push-up is expected
    results = []
    for _ in range(4):
        res = ExerciseClassifier.verify_exercise_match("Push-up", curl_lms, session_data)
        results.append(res)
        
    last_match, last_detected, last_msg = results[-1]
    assert not last_match
    assert last_detected == "Bicep Curl"
    assert "Wrong exercise detected" in last_msg
    assert "Push-up" in last_msg

def test_mismatch_returns_null_form_score_and_unchanged_reps():
    async def _test():
        session_data = {}
        curl_lms = create_standing_curl_landmarks()
        
        # Send 4 frames through analyze_movement_landmarks
        req = MovementAnalysisRequest(
            exerciseName="Push-up",
            landmarks=curl_lms,
            currentReps=3,
            currentStage="up",
            sessionData=session_data
        )
        
        resp = None
        for _ in range(4):
            resp = await analyze_movement_landmarks(req)
            req.sessionData = resp.sessionData
            
        assert resp.aiState == "EXERCISE_MISMATCH"
        assert resp.detectedExercise == "Bicep Curl"
        # User requirement 1: formScore must be None (null), NOT 0.0
        assert resp.formScore is None
        # Reps must remain unchanged
        assert resp.repetitionCount == 3
        assert not resp.repIncremented

    asyncio.run(_test())

def test_correct_exercise_matches_and_scores_form():
    async def _test():
        session_data = {}
        curl_lms = create_standing_curl_landmarks(elbow_angle_flexed=False)
        
        req = MovementAnalysisRequest(
            exerciseName="Bicep Curl",
            landmarks=curl_lms,
            currentReps=0,
            currentStage="up",
            sessionData=session_data
        )
        
        resp = await analyze_movement_landmarks(req)
        assert resp.aiState != "EXERCISE_MISMATCH"
        assert resp.formScore is not None
        assert resp.formScore >= 90.0

    asyncio.run(_test())

def test_temporary_tracking_loss_and_recovery():
    async def _test():
        session_data = {"test_val": 42}
        curl_lms = create_standing_curl_landmarks()
        
        # Frame 1: Valid curl
        req1 = MovementAnalysisRequest(
            exerciseName="Bicep Curl",
            landmarks=curl_lms,
            currentReps=2,
            currentStage="down",
            sessionData=session_data
        )
        resp1 = await analyze_movement_landmarks(req1)
        assert resp1.repetitionCount == 2
        
        # Frame 2: User arm temporarily dropped from tracking (low visibility)
        dropped_lms = create_standing_curl_landmarks()
        dropped_lms[13].visibility = 0.1
        dropped_lms[14].visibility = 0.1
        dropped_lms[15].visibility = 0.1
        dropped_lms[16].visibility = 0.1
        
        req2 = MovementAnalysisRequest(
            exerciseName="Bicep Curl",
            landmarks=dropped_lms,
            currentReps=resp1.repetitionCount,
            currentStage=resp1.stage,
            sessionData=resp1.sessionData
        )
        resp2 = await analyze_movement_landmarks(req2)
        
        # User requirement 4: Must return POSITION_ADJUSTMENT, not EXERCISE_MISMATCH
        assert resp2.aiState == "POSITION_ADJUSTMENT"
        assert "full arm" in resp2.feedback
        assert resp2.repetitionCount == 2  # Reps preserved
        assert resp2.sessionData["test_val"] == 42  # State preserved
        
        # Frame 3: Tracking recovered
        req3 = MovementAnalysisRequest(
            exerciseName="Bicep Curl",
            landmarks=curl_lms,
            currentReps=resp2.repetitionCount,
            currentStage=resp2.stage,
            sessionData=resp2.sessionData
        )
        resp3 = await analyze_movement_landmarks(req3)
        assert resp3.aiState != "POSITION_ADJUSTMENT"
        assert resp3.repetitionCount == 2

    asyncio.run(_test())
