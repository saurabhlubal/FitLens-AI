import pytest
from app.models.movement import LandmarkPoint
from app.services.movement.pose_quality import PoseQualityValidator, PoseQualityConfig

def make_lm(x: float, y: float, z: float = 0.0, visibility: float = 0.99):
    return LandmarkPoint(x=x, y=y, z=z, visibility=visibility)

def create_valid_standing_landmarks(torso_scale: float = 0.4):
    """Generates standard 33 MediaPipe landmarks centered in frame."""
    lms = [make_lm(0.5, 0.5) for _ in range(33)]
    
    # Head / Nose
    lms[0] = make_lm(0.5, 0.15)
    
    # Shoulders
    sh_y = 0.3
    hip_y = sh_y + torso_scale
    lms[11] = make_lm(0.4, sh_y)
    lms[12] = make_lm(0.6, sh_y)
    
    # Elbows & Wrists
    lms[13] = make_lm(0.38, sh_y + 0.2)
    lms[14] = make_lm(0.62, sh_y + 0.2)
    lms[15] = make_lm(0.38, sh_y + 0.35)
    lms[16] = make_lm(0.62, sh_y + 0.35)
    
    # Hips
    lms[23] = make_lm(0.42, hip_y)
    lms[24] = make_lm(0.58, hip_y)
    
    # Knees & Ankles
    lms[25] = make_lm(0.42, min(0.95, hip_y + 0.25))
    lms[26] = make_lm(0.58, min(0.95, hip_y + 0.25))
    lms[27] = make_lm(0.42, min(0.97, hip_y + 0.45))
    lms[28] = make_lm(0.58, min(0.97, hip_y + 0.45))
    
    return lms

def test_missing_landmarks_empty_or_too_few():
    validator = PoseQualityValidator()
    # Empty landmarks
    res = validator.validate("Bicep Curl", [])
    assert not res.is_valid
    assert res.ai_state == "POSITION_ADJUSTMENT"
    assert "Step into frame" in res.guidance

    # Fewer than minimum landmarks
    res_few = validator.validate("Bicep Curl", [make_lm(0.5, 0.5) for _ in range(10)])
    assert not res_few.is_valid
    assert res_few.ai_state == "POSITION_ADJUSTMENT"

def test_user_too_far():
    validator = PoseQualityValidator()
    # Torso scale very small (e.g. 0.08 < 0.12)
    far_landmarks = create_valid_standing_landmarks(torso_scale=0.08)
    res = validator.validate("Squat", far_landmarks)
    assert not res.is_valid
    assert res.ai_state == "POSITION_ADJUSTMENT"
    assert "Move closer" in res.guidance

def test_user_too_close():
    validator = PoseQualityValidator()
    # Torso scale larger than 0.85
    close_landmarks = create_valid_standing_landmarks(torso_scale=0.88)
    res = validator.validate("Bicep Curl", close_landmarks)
    assert not res.is_valid
    assert res.ai_state == "POSITION_ADJUSTMENT"
    assert "Move farther back" in res.guidance

def test_user_out_of_frame_clipping():
    validator = PoseQualityValidator()
    landmarks = create_valid_standing_landmarks(torso_scale=0.4)
    # Clip left shoulder out of frame (x < 0.02)
    landmarks[11] = make_lm(0.01, 0.3)
    res = validator.validate("Bicep Curl", landmarks)
    assert not res.is_valid
    assert res.ai_state == "POSITION_ADJUSTMENT"
    assert "Move farther back" in res.guidance

def test_missing_landmarks_arm():
    validator = PoseQualityValidator()
    landmarks = create_valid_standing_landmarks(torso_scale=0.4)
    # Drop arm landmarks below visibility threshold 0.5
    landmarks[13].visibility = 0.2
    landmarks[14].visibility = 0.2
    landmarks[15].visibility = 0.1
    landmarks[16].visibility = 0.1
    res = validator.validate("Bicep Curl", landmarks)
    assert not res.is_valid
    assert res.ai_state == "POSITION_ADJUSTMENT"
    assert "full arm" in res.guidance

def test_missing_landmarks_legs():
    validator = PoseQualityValidator()
    landmarks = create_valid_standing_landmarks(torso_scale=0.4)
    # Drop knee and ankle landmarks below visibility
    landmarks[25].visibility = 0.2
    landmarks[26].visibility = 0.2
    landmarks[27].visibility = 0.1
    landmarks[28].visibility = 0.1
    res = validator.validate("Squat", landmarks)
    assert not res.is_valid
    assert res.ai_state == "POSITION_ADJUSTMENT"
    assert "hips, knees, and feet" in res.guidance

def test_bad_orientation_for_pushup():
    validator = PoseQualityValidator()
    # Frontal camera view: broad shoulders, foreshortened torso
    lms = [make_lm(0.5, 0.5) for _ in range(33)]
    lms[11] = make_lm(0.3, 0.5)  # Left shoulder
    lms[12] = make_lm(0.7, 0.5)  # Right shoulder (width = 0.40 > 0.35)
    lms[23] = make_lm(0.45, 0.68) # Hips foreshortened (torso len = 0.18 < 0.25, but >= 0.12)
    lms[24] = make_lm(0.55, 0.68)
    lms[13] = make_lm(0.25, 0.6)
    lms[14] = make_lm(0.75, 0.6)
    
    res = validator.validate("Push-up", lms)
    assert not res.is_valid
    assert res.ai_state == "POSITION_ADJUSTMENT"
    assert "Turn slightly to the side" in res.guidance

def test_valid_pose_passes():
    validator = PoseQualityValidator()
    landmarks = create_valid_standing_landmarks(torso_scale=0.35)
    res = validator.validate("Bicep Curl", landmarks)
    assert res.is_valid
    assert res.ai_state == "READY"
