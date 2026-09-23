# Pose Landmark & Repetition Detection Calibration & State Tests
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
    
    # Right side (Index 12: Shoulder, 14: Elbow, 16: Wrist, 24: Hip)
    landmarks[12] = make_landmark(0.6, 0.3)
    landmarks[14] = make_landmark(0.6, left_elbow_y)
    landmarks[16] = make_landmark(0.6, left_wrist_y)
    landmarks[24] = make_landmark(0.6, 0.7)
    
    return landmarks

def test_bicep_curl_requires_down_then_up_full_cycle():
    detector = BicepCurlDetector()
    
    # 1. Start in neutral / down position: Elbow at y=0.5, Wrist hanging straight down at y=0.8 (angle ~180°)
    down_landmarks = create_full_body_landmarks(left_elbow_y=0.5, left_wrist_y=0.8, left_wrist_x=0.4)
    res_down = detector.analyze(down_landmarks, current_reps=0, current_stage="up")
    
    assert res_down.stage == "down"
    assert res_down.repetitionCount == 0
    assert not res_down.repIncremented
    
    # 2. Curl up to top: Wrist curled up at y=0.35, x=0.4 (angle ~30°)
    up_landmarks = create_full_body_landmarks(left_elbow_y=0.5, left_wrist_y=0.35, left_wrist_x=0.4)
    res_up = detector.analyze(up_landmarks, current_reps=0, current_stage="down")
    
    assert res_up.stage == "up"
    assert res_up.repetitionCount == 1
    assert res_up.repIncremented
    
    # 3. Holding at top should NOT increment again
    res_hold = detector.analyze(up_landmarks, current_reps=1, current_stage="up")
    assert res_hold.repetitionCount == 1
    assert not res_hold.repIncremented
    
    # 4. Moving down to extension
    res_down2 = detector.analyze(down_landmarks, current_reps=1, current_stage="up")
    assert res_down2.stage == "down"
    assert res_down2.repetitionCount == 1
    assert not res_down2.repIncremented
    
    # 5. Curling up again completes 2nd rep
    res_up2 = detector.analyze(up_landmarks, current_reps=1, current_stage="down")
    assert res_up2.stage == "up"
    assert res_up2.repetitionCount == 2
    assert res_up2.repIncremented

def test_bicep_curl_rejects_waving_hands_without_elbow_anchor():
    detector = BicepCurlDetector()
    # Hand waving up in the air without elbows down near torso:
    # Shoulder at (0.4, 0.3), Elbow raised high at (0.4, 0.1)
    waving_landmarks = create_full_body_landmarks(left_elbow_y=0.1, left_wrist_y=0.05, left_wrist_x=0.4)
    res_waving = detector.analyze(waving_landmarks, current_reps=0, current_stage="up")
    
    # Should flag improper form / elbow drift
    assert not res_waving.isCorrectForm or res_waving.formScore < 80.0

def test_squat_rep_cycle():
    detector = SquatDetector()
    landmarks = [make_landmark(0.5, 0.5) for _ in range(33)]
    
    # Standing position: Hip(0.5, 0.3), Knee(0.5, 0.6), Ankle(0.5, 0.9) -> Angle ~180°
    landmarks[23] = make_landmark(0.5, 0.3)
    landmarks[25] = make_landmark(0.5, 0.6)
    landmarks[27] = make_landmark(0.5, 0.9)
    landmarks[11] = make_landmark(0.5, 0.1)
    
    landmarks[24] = make_landmark(0.5, 0.3)
    landmarks[26] = make_landmark(0.5, 0.6)
    landmarks[28] = make_landmark(0.5, 0.9)
    landmarks[12] = make_landmark(0.5, 0.1)
    
    res_stand = detector.analyze(landmarks, current_reps=0, current_stage="up")
    assert res_stand.stage == "up"
    assert res_stand.repetitionCount == 0

def test_shoulder_press_rep_cycle():
    detector = ShoulderPressDetector()
    landmarks = [make_landmark(0.5, 0.5) for _ in range(33)]
    
    # Overhead lockout: Shoulder(0.5, 0.5), Elbow(0.5, 0.3), Wrist(0.5, 0.1) -> 180°
    landmarks[11] = make_landmark(0.5, 0.5)
    landmarks[13] = make_landmark(0.5, 0.3)
    landmarks[15] = make_landmark(0.5, 0.1)
    landmarks[23] = make_landmark(0.5, 0.8)
    
    landmarks[12] = make_landmark(0.5, 0.5)
    landmarks[14] = make_landmark(0.5, 0.3)
    landmarks[16] = make_landmark(0.5, 0.1)
    landmarks[24] = make_landmark(0.5, 0.8)
    
    res_press = detector.analyze(landmarks, current_reps=0, current_stage="down")
    assert res_press.stage == "up"
    assert res_press.repetitionCount == 1

def test_plank_timer_and_shoulder_view():
    from app.services.movement.plank import PlankDetector
    detector = PlankDetector()
    landmarks = [make_landmark(0.5, 0.5) for _ in range(33)]
    
    # 1. Shoulder view setup: Shoulders level (y=0.4), Elbows grounded (y=0.6)
    landmarks[11] = make_landmark(0.4, 0.4, visibility=0.9)
    landmarks[12] = make_landmark(0.6, 0.4, visibility=0.9)
    landmarks[13] = make_landmark(0.4, 0.6, visibility=0.85)
    landmarks[14] = make_landmark(0.6, 0.6, visibility=0.85)
    
    # Lower body hidden / low visibility
    landmarks[23] = make_landmark(0.4, 0.5, visibility=0.1)
    landmarks[24] = make_landmark(0.6, 0.5, visibility=0.1)
    landmarks[27] = make_landmark(0.4, 0.9, visibility=0.1)
    landmarks[28] = make_landmark(0.6, 0.9, visibility=0.1)
    
    res = detector.analyze(landmarks, current_reps=0, current_stage="holding", session_data={"hold_accumulator": 5.0})
    assert res.success
    assert res.isCorrectForm
    assert res.stage == "holding"
    assert res.metrics["isTimerExercise"] is True
    assert res.metrics["holdDurationSec"] >= 5

def test_confidence_filtering_rejects_occluded_joints():
    detector = BicepCurlDetector()
    landmarks = [make_landmark(0.5, 0.5, visibility=0.1) for _ in range(33)]
    res = detector.analyze(landmarks, current_reps=0, current_stage="up")
    assert not res.success
    assert "visible" in res.feedback.lower()

