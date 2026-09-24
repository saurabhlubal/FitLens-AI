# Pose Landmark & Repetition Detection Calibration & Full-Cycle State Tests
import pytest
from app.models.movement import LandmarkPoint
from app.services.movement.bicep_curl import BicepCurlDetector
from app.services.movement.squat import SquatDetector
from app.services.movement.pushup import PushUpDetector
from app.services.movement.shoulder_press import ShoulderPressDetector

def make_landmark(x: float, y: float, z: float = 0.0, visibility: float = 0.99):
    return LandmarkPoint(x=x, y=y, z=z, visibility=visibility)

def create_full_body_landmarks(left_elbow_y: float = 0.5, left_wrist_y: float = 0.8, left_wrist_x: float = 0.4):
    """
    Creates a full 33-point MediaPipe mock landmark list.
    Shoulder: (0.4, 0.3)
    Elbow: (0.4, left_elbow_y)
    Wrist: (left_wrist_x, left_wrist_y)
    Hip: (0.4, 0.7)
    """
    landmarks = [make_landmark(0.5, 0.1) for _ in range(33)]
    
    # Left side (Index 11: Shoulder, 13: Elbow, 15: Wrist, 23: Hip)
    landmarks[11] = make_landmark(0.4, 0.3) # Shoulder
    landmarks[13] = make_landmark(0.4, left_elbow_y) # Elbow
    landmarks[15] = make_landmark(left_wrist_x, left_wrist_y) # Wrist
    landmarks[23] = make_landmark(0.4, 0.7) # Hip
    landmarks[25] = make_landmark(0.4, 0.85)
    landmarks[27] = make_landmark(0.4, 0.95)
    
    # Right side (Index 12: Shoulder, 14: Elbow, 16: Wrist, 24: Hip)
    landmarks[12] = make_landmark(0.6, 0.3)
    landmarks[14] = make_landmark(0.6, left_elbow_y)
    landmarks[16] = make_landmark(0.6, left_wrist_y)
    landmarks[24] = make_landmark(0.6, 0.7)
    landmarks[26] = make_landmark(0.6, 0.85)
    landmarks[28] = make_landmark(0.6, 0.95)
    
    return landmarks

def test_static_curl_hold_never_increments_reps():
    """Holding the top of a bicep curl statically must NEVER continuously increment reps."""
    detector = BicepCurlDetector()
    up_landmarks = create_full_body_landmarks(left_elbow_y=0.5, left_wrist_y=0.35, left_wrist_x=0.4)
    session_data = {}
    stage = "down"
    reps = 0

    # User curls up and holds statically for 50 consecutive frames
    for _ in range(50):
        res = detector.analyze(up_landmarks, current_reps=reps, current_stage=stage, session_data=session_data)
        stage = res.stage
        reps = res.repetitionCount
        assert not res.repIncremented
        assert reps == 0

    assert reps == 0

def test_complete_curl_cycle():
    """Bicep curl full cycle: down -> up -> down = 1 rep."""
    detector = BicepCurlDetector()
    down_landmarks = create_full_body_landmarks(left_elbow_y=0.5, left_wrist_y=0.8, left_wrist_x=0.4)
    up_landmarks = create_full_body_landmarks(left_elbow_y=0.5, left_wrist_y=0.35, left_wrist_x=0.4)
    session_data = {}

    # 1. Start extended down
    res1 = detector.analyze(down_landmarks, current_reps=0, current_stage="up", session_data=session_data)
    assert res1.stage == "down"
    assert res1.repetitionCount == 0

    # 2. Curl up to peak contraction
    res2 = detector.analyze(up_landmarks, current_reps=res1.repetitionCount, current_stage=res1.stage, session_data=session_data)
    assert res2.stage == "up"
    assert res2.repetitionCount == 0  # Not completed until return to extension!
    assert not res2.repIncremented

    # 3. Lower down to full extension -> Rep is completed!
    res3 = detector.analyze(down_landmarks, current_reps=res2.repetitionCount, current_stage=res2.stage, session_data=session_data)
    assert res3.stage == "down"
    assert res3.repetitionCount == 1
    assert res3.repIncremented

    # 4. Holding at bottom should not increment further
    for _ in range(20):
        res_rest = detector.analyze(down_landmarks, current_reps=res3.repetitionCount, current_stage=res3.stage, session_data=session_data)
        assert res_rest.repetitionCount == 1
        assert not res_rest.repIncremented

def test_bicep_curl_rejects_waving_hands_without_elbow_anchor():
    detector = BicepCurlDetector()
    # Hand waving up in the air without elbows down near torso:
    waving_landmarks = create_full_body_landmarks(left_elbow_y=0.1, left_wrist_y=0.05, left_wrist_x=0.4)
    res_waving = detector.analyze(waving_landmarks, current_reps=0, current_stage="up", session_data={})
    assert not res_waving.isCorrectForm or res_waving.formScore < 80.0

def create_squat_landmarks(knee_angle_standing: bool = True):
    landmarks = [make_landmark(0.5, 0.5) for _ in range(33)]
    landmarks[11] = make_landmark(0.5, 0.15)
    landmarks[12] = make_landmark(0.5, 0.15)
    
    # Hip at y=0.4
    landmarks[23] = make_landmark(0.5, 0.4)
    landmarks[24] = make_landmark(0.5, 0.4)
    
    if knee_angle_standing:
        # Standing straight: Knee at (0.5, 0.65), Ankle at (0.5, 0.9) -> Angle 180°
        landmarks[25] = make_landmark(0.5, 0.65)
        landmarks[26] = make_landmark(0.5, 0.65)
        landmarks[27] = make_landmark(0.5, 0.9)
        landmarks[28] = make_landmark(0.5, 0.9)
    else:
        # Deep squat: Thigh horizontal, shin vertical -> 90° angle
        landmarks[11] = make_landmark(0.55, 0.35)
        landmarks[12] = make_landmark(0.55, 0.35)
        landmarks[23] = make_landmark(0.55, 0.65)
        landmarks[24] = make_landmark(0.55, 0.65)
        landmarks[25] = make_landmark(0.35, 0.65)
        landmarks[26] = make_landmark(0.35, 0.65)
        landmarks[27] = make_landmark(0.35, 0.9)
        landmarks[28] = make_landmark(0.35, 0.9)
        
    return landmarks

def test_static_squat_hold_never_increments_reps():
    """Holding bottom of squat must NEVER continuously increment reps."""
    detector = SquatDetector()
    deep_squat = create_squat_landmarks(knee_angle_standing=False)
    session_data = {}
    stage = "up"
    reps = 0

    # User descends into deep squat and holds statically for 50 frames
    for _ in range(50):
        res = detector.analyze(deep_squat, current_reps=reps, current_stage=stage, session_data=session_data)
        stage = res.stage
        reps = res.repetitionCount
        session_data = res.sessionData or session_data
        assert not res.repIncremented
        assert reps == 0

    assert reps == 0

def test_complete_squat_cycle():
    """Squat full cycle: standing (up) -> deep squat (down) -> standing lockout (up) = 1 rep."""
    detector = SquatDetector()
    standing = create_squat_landmarks(knee_angle_standing=True)
    deep_squat = create_squat_landmarks(knee_angle_standing=False)
    session_data = {}

    # 1. Standing tall
    res1 = detector.analyze(standing, current_reps=0, current_stage="up", session_data=session_data)
    assert res1.stage == "up"
    assert res1.repetitionCount == 0

    # 2. Drop into deep squat
    res2 = detector.analyze(deep_squat, current_reps=0, current_stage=res1.stage, session_data=res1.sessionData or session_data)
    assert res2.stage == "down"
    assert res2.repetitionCount == 0
    assert not res2.repIncremented

    # 3. Drive back up to standing lockout -> Rep is completed!
    res3 = detector.analyze(standing, current_reps=0, current_stage=res2.stage, session_data=res2.sessionData or session_data)
    assert res3.stage == "up"
    assert res3.repetitionCount == 1
    assert res3.repIncremented

    # 4. Holding standing tall does not increment further
    for _ in range(20):
        res_rest = detector.analyze(standing, current_reps=1, current_stage="up", session_data=res3.sessionData or session_data)
        assert res_rest.repetitionCount == 1
        assert not res_rest.repIncremented

def create_pushup_mock_landmarks(elbow_flexed: bool = False):
    landmarks = [make_landmark(0.5, 0.5) for _ in range(33)]
    landmarks[11] = make_landmark(0.3, 0.5)
    landmarks[12] = make_landmark(0.3, 0.55)
    landmarks[23] = make_landmark(0.6, 0.5)
    landmarks[24] = make_landmark(0.6, 0.55)
    landmarks[27] = make_landmark(0.9, 0.5)
    landmarks[28] = make_landmark(0.9, 0.55)
    
    if not elbow_flexed:
        # Straight arms (lockout > 150°)
        landmarks[13] = make_landmark(0.3, 0.65)
        landmarks[14] = make_landmark(0.3, 0.65)
        landmarks[15] = make_landmark(0.3, 0.8)
        landmarks[16] = make_landmark(0.3, 0.8)
    else:
        # Chest to floor (elbows bent <= 90°)
        landmarks[13] = make_landmark(0.2, 0.5)
        landmarks[14] = make_landmark(0.2, 0.55)
        landmarks[15] = make_landmark(0.3, 0.6)
        landmarks[16] = make_landmark(0.3, 0.65)
    return landmarks

def test_static_pushup_hold_never_increments_reps():
    """Holding bottom of push-up must NEVER continuously increment reps."""
    detector = PushUpDetector()
    bottom_pushup = create_pushup_mock_landmarks(elbow_flexed=True)
    session_data = {}
    stage = "up"
    reps = 0

    for _ in range(50):
        res = detector.analyze(bottom_pushup, current_reps=reps, current_stage=stage, session_data=session_data)
        stage = res.stage
        reps = res.repetitionCount
        assert not res.repIncremented
        assert reps == 0

    assert reps == 0

def test_complete_pushup_cycle():
    """Push-up full cycle: top plank (up) -> chest to floor (down) -> press to lockout (up) = 1 rep."""
    detector = PushUpDetector()
    top_plank = create_pushup_mock_landmarks(elbow_flexed=False)
    bottom_pushup = create_pushup_mock_landmarks(elbow_flexed=True)
    session_data = {}

    res1 = detector.analyze(top_plank, current_reps=0, current_stage="up", session_data=session_data)
    assert res1.stage == "up"

    res2 = detector.analyze(bottom_pushup, current_reps=0, current_stage=res1.stage, session_data=res1.sessionData or session_data)
    assert res2.stage == "down"
    assert res2.repetitionCount == 0

    res3 = detector.analyze(top_plank, current_reps=0, current_stage=res2.stage, session_data=res2.sessionData or session_data)
    assert res3.stage == "up"
    assert res3.repetitionCount == 1
    assert res3.repIncremented

def test_shoulder_press_rep_cycle():
    """Shoulder press full cycle: rack (down) -> lockout overhead (up) -> return to rack (down) = 1 rep."""
    detector = ShoulderPressDetector()
    session_data = {}

    # Rack position (elbows bent <= 90°)
    rack_landmarks = [make_landmark(0.5, 0.5) for _ in range(33)]
    rack_landmarks[11] = make_landmark(0.4, 0.5)
    rack_landmarks[12] = make_landmark(0.6, 0.5)
    rack_landmarks[13] = make_landmark(0.3, 0.5)
    rack_landmarks[14] = make_landmark(0.7, 0.5)
    rack_landmarks[15] = make_landmark(0.3, 0.35)
    rack_landmarks[16] = make_landmark(0.7, 0.35)
    rack_landmarks[23] = make_landmark(0.4, 0.8)
    rack_landmarks[24] = make_landmark(0.6, 0.8)

    # Lockout overhead (elbows straight >= 155°)
    lockout_landmarks = [make_landmark(0.5, 0.5) for _ in range(33)]
    lockout_landmarks[11] = make_landmark(0.4, 0.5)
    lockout_landmarks[12] = make_landmark(0.6, 0.5)
    lockout_landmarks[13] = make_landmark(0.4, 0.3)
    lockout_landmarks[14] = make_landmark(0.6, 0.3)
    lockout_landmarks[15] = make_landmark(0.4, 0.1)
    lockout_landmarks[16] = make_landmark(0.6, 0.1)
    lockout_landmarks[23] = make_landmark(0.4, 0.8)
    lockout_landmarks[24] = make_landmark(0.6, 0.8)

    res1 = detector.analyze(rack_landmarks, current_reps=0, current_stage="up", session_data=session_data)
    assert res1.stage == "down"

    res2 = detector.analyze(lockout_landmarks, current_reps=0, current_stage="down", session_data=res1.sessionData or session_data)
    assert res2.stage == "up"
    assert res2.repetitionCount == 0  # Reached lockout, not completed until return!

    res3 = detector.analyze(rack_landmarks, current_reps=0, current_stage="up", session_data=res2.sessionData or session_data)
    assert res3.stage == "down"
    assert res3.repetitionCount == 1
    assert res3.repIncremented
