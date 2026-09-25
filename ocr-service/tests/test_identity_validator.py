import pytest
from app.models.movement import LandmarkPoint
from app.services.movement.identity_validator import ExerciseIdentityValidator, IdentityValidationResult
from app.services.movement.identity_config import IdentityConstraintsConfig

def make_lm(x: float, y: float, z: float = 0.0, visibility: float = 0.99):
    return LandmarkPoint(x=x, y=y, z=z, visibility=visibility)

def make_standing_landmarks():
    """Generates standard standing full-body landmarks (vertical orientation)."""
    lms = [make_lm(0.5, 0.5) for _ in range(33)]
    lms[0] = make_lm(0.5, 0.1)    # Nose
    lms[11] = make_lm(0.4, 0.25)  # Left Shoulder
    lms[12] = make_lm(0.6, 0.25)  # Right Shoulder
    lms[13] = make_lm(0.4, 0.45)  # Left Elbow (anchored)
    lms[14] = make_lm(0.6, 0.45)  # Right Elbow (anchored)
    lms[15] = make_lm(0.4, 0.70)  # Left Wrist (down)
    lms[16] = make_lm(0.6, 0.70)  # Right Wrist (down)
    lms[23] = make_lm(0.4, 0.60)  # Left Hip
    lms[24] = make_lm(0.6, 0.60)  # Right Hip
    lms[25] = make_lm(0.4, 0.78)  # Left Knee
    lms[26] = make_lm(0.6, 0.78)  # Right Knee
    lms[27] = make_lm(0.4, 0.95)  # Left Ankle
    lms[28] = make_lm(0.6, 0.95)  # Right Ankle
    return lms

def make_horizontal_pushup_landmarks(elbow_flexed: bool = False):
    """Generates horizontal prone landmarks (0° with horizontal floor)."""
    lms = [make_lm(0.5, 0.5) for _ in range(33)]
    lms[0] = make_lm(0.2, 0.5)    # Nose
    lms[11] = make_lm(0.3, 0.5)   # Left Shoulder
    lms[12] = make_lm(0.3, 0.55)  # Right Shoulder
    lms[23] = make_lm(0.6, 0.5)   # Left Hip
    lms[24] = make_lm(0.6, 0.55)  # Right Hip
    lms[25] = make_lm(0.75, 0.5)  # Left Knee
    lms[26] = make_lm(0.75, 0.55) # Right Knee
    lms[27] = make_lm(0.9, 0.5)   # Left Ankle
    lms[28] = make_lm(0.9, 0.55)  # Right Ankle
    
    if not elbow_flexed:
        lms[13] = make_lm(0.3, 0.65)  # Elbow
        lms[14] = make_lm(0.3, 0.65)
        lms[15] = make_lm(0.3, 0.8)   # Wrist on floor
        lms[16] = make_lm(0.3, 0.8)
    else:
        lms[13] = make_lm(0.2, 0.5)   # Elbow bent
        lms[14] = make_lm(0.2, 0.55)
        lms[15] = make_lm(0.3, 0.6)   # Wrist on floor
        lms[16] = make_lm(0.3, 0.65)
    return lms

# =============================================================================
# 1. BICEP CURL & HAMMER CURL IDENTITY TESTS
# =============================================================================

def test_bicep_curl_real_curl_passes_identity():
    validator = ExerciseIdentityValidator()
    lms = make_standing_landmarks()
    session_data = {}
    
    # Real curl: elbow anchored below shoulder, upper arm along torso
    res = validator.validate("Bicep Curl", lms, session_data)
    assert res.is_valid

def test_bicep_curl_arm_raise_fails_identity():
    validator = ExerciseIdentityValidator()
    lms = make_standing_landmarks()
    session_data = {}
    
    # Simple arm raise: elbow swings up to shoulder level (0.28) and forwards
    lms[13] = make_lm(0.15, 0.28)  # Elbow lifted way forward/up
    lms[15] = make_lm(0.10, 0.25)  # Wrist in front
    
    # Sustained over 3 frames
    res = None
    for _ in range(3):
        res = validator.validate("Bicep Curl", lms, session_data)
    
    assert not res.is_valid
    assert "Arm Raise" in res.detected_movement or "Elbow" in res.feedback

def test_hammer_curl_shares_same_kinematics_no_fake_grip():
    validator = ExerciseIdentityValidator()
    lms = make_standing_landmarks()
    session_data = {}
    
    # Standard curl kinematics pass without fake grip rejection
    res = validator.validate("Hammer Curl", lms, session_data)
    assert res.is_valid

# =============================================================================
# 2. SQUAT IDENTITY TESTS
# =============================================================================

def test_squat_real_squat_passes_identity():
    validator = ExerciseIdentityValidator()
    lms = make_standing_landmarks()
    session_data = {}
    
    # Deep bilateral squat: hips down, both knees flexed to 90°
    lms[23] = make_lm(0.4, 0.75)  # Hips descended
    lms[24] = make_lm(0.6, 0.75)
    lms[25] = make_lm(0.3, 0.75)  # Knees bent
    lms[26] = make_lm(0.7, 0.75)
    
    res = validator.validate("Squat", lms, session_data)
    assert res.is_valid

def test_squat_single_leg_flamingo_curl_fails_identity():
    validator = ExerciseIdentityValidator()
    lms = make_standing_landmarks()
    session_data = {}
    
    # Single-leg flamingo: left knee straight (180°), right knee flexed to butt (60°)
    lms[25] = make_lm(0.4, 0.78)  # Left knee straight
    lms[27] = make_lm(0.4, 0.95)  # Left ankle on floor
    lms[26] = make_lm(0.6, 0.78)  # Right knee
    lms[28] = make_lm(0.6, 0.55)  # Right ankle lifted high in the air!
    
    res = None
    for _ in range(3):
        res = validator.validate("Squat", lms, session_data)
    
    assert not res.is_valid
    assert "Single Leg" in res.detected_movement or "symmetric" in res.feedback.lower()

# =============================================================================
# 3. PUSH-UP IDENTITY TESTS
# =============================================================================

def test_pushup_real_horizontal_pushup_passes():
    validator = ExerciseIdentityValidator()
    lms = make_horizontal_pushup_landmarks(elbow_flexed=False)
    session_data = {}
    
    res = validator.validate("Push-up", lms, session_data)
    assert res.is_valid

def test_pushup_standing_arm_press_fails_identity():
    validator = ExerciseIdentityValidator()
    lms = make_standing_landmarks()  # Vertical standing posture
    session_data = {}
    
    res = None
    for _ in range(3):
        res = validator.validate("Push-up", lms, session_data)
    
    assert not res.is_valid
    assert "Standing" in res.detected_movement or "horizontal" in res.feedback.lower()

# =============================================================================
# 4. SHOULDER PRESS IDENTITY TESTS
# =============================================================================

def test_shoulder_press_real_overhead_passes():
    validator = ExerciseIdentityValidator()
    lms = make_standing_landmarks()
    session_data = {}
    
    # Rack position: hands at chest/shoulders
    lms[15] = make_lm(0.4, 0.28)  # Wrist near shoulder
    lms[16] = make_lm(0.6, 0.28)
    
    res = validator.validate("Shoulder Press", lms, session_data)
    assert res.is_valid

def test_shoulder_press_curling_at_waist_fails_identity():
    validator = ExerciseIdentityValidator()
    lms = make_standing_landmarks()
    session_data = {}
    
    # Hands down at waist/hips (0.65)
    lms[15] = make_lm(0.4, 0.65)
    lms[16] = make_lm(0.6, 0.65)
    
    res = None
    for _ in range(3):
        res = validator.validate("Shoulder Press", lms, session_data)
    
    assert not res.is_valid
    assert "Waist" in res.detected_movement or "shoulder level" in res.feedback.lower()

# =============================================================================
# 5. LATERAL RAISE IDENTITY TESTS
# =============================================================================

def test_lateral_raise_extended_arms_passes():
    validator = ExerciseIdentityValidator()
    lms = make_standing_landmarks()
    session_data = {}
    
    # Extended arms abducting outward at 75°
    lms[13] = make_lm(0.25, 0.28)  # Left elbow out
    lms[14] = make_lm(0.75, 0.28)  # Right elbow out
    lms[15] = make_lm(0.12, 0.30)  # Left wrist extended out
    lms[16] = make_lm(0.88, 0.30)  # Right wrist extended out
    
    res = validator.validate("Lateral Raise", lms, session_data)
    assert res.is_valid

def test_lateral_raise_deeply_bent_arm_curl_fails_identity():
    validator = ExerciseIdentityValidator()
    lms = make_standing_landmarks()
    session_data = {}
    
    # Elbows flared outward (abduction 60°), but arms deeply flexed into 45° curl
    lms[13] = make_lm(0.25, 0.35)
    lms[14] = make_lm(0.75, 0.35)
    lms[15] = make_lm(0.38, 0.25)  # Hands tucked tight to shoulders (elbow angle ~40°)
    lms[16] = make_lm(0.62, 0.25)
    
    res = None
    for _ in range(3):
        res = validator.validate("Lateral Raise", lms, session_data)
    
    assert not res.is_valid
    assert "Curl" in res.detected_movement or "extended" in res.feedback.lower()

# =============================================================================
# 6. LUNGE IDENTITY TESTS
# =============================================================================

def test_lunge_split_stance_passes():
    validator = ExerciseIdentityValidator()
    lms = make_standing_landmarks()
    session_data = {}
    
    # Split stance: left ankle forward (x=0.35), right ankle back (x=0.65)
    lms[25] = make_lm(0.35, 0.70)
    lms[26] = make_lm(0.65, 0.85)
    lms[27] = make_lm(0.35, 0.95)
    lms[28] = make_lm(0.65, 0.95)
    
    res = validator.validate("Lunge", lms, session_data)
    assert res.is_valid

def test_lunge_parallel_squat_fails_identity():
    validator = ExerciseIdentityValidator()
    lms = make_standing_landmarks()
    session_data = {}
    
    # Deep bend with both feet parallel side-by-side (squat stance, knee angle ~90°)
    lms[23] = make_lm(0.45, 0.70)
    lms[24] = make_lm(0.55, 0.70)
    lms[25] = make_lm(0.35, 0.70)
    lms[26] = make_lm(0.65, 0.70)
    lms[27] = make_lm(0.35, 0.95)
    lms[28] = make_lm(0.65, 0.95)
    
    res = None
    for _ in range(3):
        res = validator.validate("Lunge", lms, session_data)
    
    assert not res.is_valid
    assert "Squat" in res.detected_movement or "split" in res.feedback.lower()

# =============================================================================
# 7. JUMPING JACKS IDENTITY TESTS
# =============================================================================

def test_jumping_jacks_coordinated_sweep_passes():
    validator = ExerciseIdentityValidator()
    lms = make_standing_landmarks()
    session_data = {}
    
    # Arms overhead (angle > 130°) AND feet jumped wide (ankle dist > 0.4)
    lms[13] = make_lm(0.3, 0.15)
    lms[14] = make_lm(0.7, 0.15)
    lms[15] = make_lm(0.45, 0.05)
    lms[16] = make_lm(0.55, 0.05)
    lms[27] = make_lm(0.25, 0.95)  # Left foot wide
    lms[28] = make_lm(0.75, 0.95)  # Right foot wide
    
    res = validator.validate("Jumping Jacks", lms, session_data)
    assert res.is_valid

def test_jumping_jacks_arm_only_wave_fails_identity():
    validator = ExerciseIdentityValidator()
    lms = make_standing_landmarks()
    session_data = {}
    
    # Arms overhead, but feet remain glued together (dist = 0.04)
    lms[13] = make_lm(0.3, 0.15)
    lms[14] = make_lm(0.7, 0.15)
    lms[15] = make_lm(0.45, 0.05)
    lms[16] = make_lm(0.55, 0.05)
    lms[27] = make_lm(0.48, 0.95)  # Feet together
    lms[28] = make_lm(0.52, 0.95)
    
    res = None
    for _ in range(3):
        res = validator.validate("Jumping Jacks", lms, session_data)
    
    assert not res.is_valid
    assert "Arm Wave" in res.detected_movement or "feet wide" in res.feedback.lower()

# =============================================================================
# 8. PLANK IDENTITY TESTS
# =============================================================================

def test_plank_real_horizontal_plank_passes():
    validator = ExerciseIdentityValidator()
    lms = make_horizontal_pushup_landmarks(elbow_flexed=False)
    session_data = {}
    
    res = validator.validate("Plank", lms, session_data)
    assert res.is_valid

def test_plank_standing_upright_fails_identity():
    validator = ExerciseIdentityValidator()
    lms = make_standing_landmarks()  # Vertical standing posture
    session_data = {}
    
    res = None
    for _ in range(3):
        res = validator.validate("Plank", lms, session_data)
    
    assert not res.is_valid
    assert "Standing" in res.detected_movement or "horizontal" in res.feedback.lower()

# =============================================================================
# 9. TEMPORAL HYSTERESIS TEST
# =============================================================================

def test_single_frame_noise_does_not_abort_identity():
    validator = ExerciseIdentityValidator()
    session_data = {}
    
    # Frame 1: Valid curl
    res1 = validator.validate("Bicep Curl", make_standing_landmarks(), session_data)
    assert res1.is_valid
    
    # Frame 2: 1 single noisy frame with arm raise
    noisy_lms = make_standing_landmarks()
    noisy_lms[13] = make_lm(0.15, 0.28)
    res2 = validator.validate("Bicep Curl", noisy_lms, session_data)
    # Hysteresis: Single frame does NOT declare mismatch!
    assert res2.is_valid
    
    # Frame 3: Normal curl returns
    res3 = validator.validate("Bicep Curl", make_standing_landmarks(), session_data)
    assert res3.is_valid
