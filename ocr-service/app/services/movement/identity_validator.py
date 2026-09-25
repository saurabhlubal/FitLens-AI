import math
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any, Tuple
from app.models.movement import LandmarkPoint
from app.services.movement.identity_config import IdentityConstraintsConfig

@dataclass
class IdentityValidationResult:
    """Outcome of Exercise-Specific Biomechanical Identity Validation."""
    is_valid: bool
    feedback: Optional[str] = None
    detected_movement: Optional[str] = None
    details: Dict[str, Any] = field(default_factory=dict)

class ExerciseIdentityValidator:
    """
    Tier 2 Exercise Identity Validator.
    Verifies that the user's physical kinematics genuinely conform to the
    biomechanical identity of the expected exercise (e.g., horizontal prone body for Push-up,
    anchored elbow for Bicep Curl, bilateral symmetry for Squats, etc.)
    before allowing repetition detectors to manage phase transitions.
    Uses temporal multi-frame confirmation to prevent single-frame false rejections.
    """

    def __init__(self, config: Optional[IdentityConstraintsConfig] = None):
        self.config = config or IdentityConstraintsConfig()

    @staticmethod
    def get_lm(landmarks: List[LandmarkPoint], index: int) -> Optional[LandmarkPoint]:
        if landmarks and 0 <= index < len(landmarks):
            return landmarks[index]
        return None

    @staticmethod
    def calculate_angle(
        a: Optional[LandmarkPoint],
        b: Optional[LandmarkPoint],
        c: Optional[LandmarkPoint]
    ) -> Optional[float]:
        """Calculates 2D joint angle at vertex b in degrees."""
        if not a or not b or not c:
            return None
        radians = math.atan2(c.y - b.y, c.x - b.x) - math.atan2(a.y - b.y, a.x - b.x)
        angle = abs(radians * 180.0 / math.pi)
        if angle > 180.0:
            angle = 360.0 - angle
        return round(angle, 1)

    @classmethod
    def get_torso_scale(cls, landmarks: List[LandmarkPoint]) -> float:
        """2D Euclidean distance from mid-shoulder to mid-hip."""
        l_sh = cls.get_lm(landmarks, 11)
        r_sh = cls.get_lm(landmarks, 12)
        l_hip = cls.get_lm(landmarks, 23)
        r_hip = cls.get_lm(landmarks, 24)
        if l_sh and r_sh and l_hip and r_hip:
            mid_sh_x = (l_sh.x + r_sh.x) / 2.0
            mid_sh_y = (l_sh.y + r_sh.y) / 2.0
            mid_hip_x = (l_hip.x + r_hip.x) / 2.0
            mid_hip_y = (l_hip.y + r_hip.y) / 2.0
            dx = mid_sh_x - mid_hip_x
            dy = mid_sh_y - mid_hip_y
            return max(0.10, math.sqrt(dx * dx + dy * dy))
        return 0.35

    @classmethod
    def get_torso_horizontal_angle(cls, landmarks: List[LandmarkPoint]) -> float:
        """
        Calculates angle of torso relative to the horizontal floor plane in degrees.
        0° = perfectly horizontal (floor push-up / plank)
        90° = perfectly vertical (standing tall)
        """
        l_sh = cls.get_lm(landmarks, 11)
        r_sh = cls.get_lm(landmarks, 12)
        l_hip = cls.get_lm(landmarks, 23)
        r_hip = cls.get_lm(landmarks, 24)
        if l_sh and r_sh and l_hip and r_hip:
            mid_sh_x = (l_sh.x + r_sh.x) / 2.0
            mid_sh_y = (l_sh.y + r_sh.y) / 2.0
            mid_hip_x = (l_hip.x + r_hip.x) / 2.0
            mid_hip_y = (l_hip.y + r_hip.y) / 2.0
            dx = abs(mid_sh_x - mid_hip_x)
            dy = abs(mid_sh_y - mid_hip_y)
            return math.degrees(math.atan2(dy, max(0.001, dx)))
        return 90.0

    @classmethod
    def get_shoulder_width(cls, landmarks: List[LandmarkPoint]) -> float:
        l_sh = cls.get_lm(landmarks, 11)
        r_sh = cls.get_lm(landmarks, 12)
        if l_sh and r_sh:
            return max(0.05, abs(l_sh.x - r_sh.x))
        return 0.20

    @classmethod
    def get_ankle_distance(cls, landmarks: List[LandmarkPoint]) -> float:
        l_ank = cls.get_lm(landmarks, 27)
        r_ank = cls.get_lm(landmarks, 28)
        if l_ank and r_ank:
            return abs(l_ank.x - r_ank.x)
        return 0.0

    # =========================================================================
    # INDIVIDUAL EXERCISE IDENTITY CHECKERS (Single Frame Evaluation)
    # =========================================================================

    def _check_bicep_curl(
        self,
        landmarks: List[LandmarkPoint],
        session_data: Dict[str, Any]
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Validates Bicep / Hammer Curl identity:
        Upper arm must remain relatively anchored to torso; elbow stays below shoulder;
        wrist must perform the primary excursion rather than whole-arm raise.
        """
        cfg = self.config.bicep_curl
        torso_scale = self.get_torso_scale(landmarks)

        l_sh = self.get_lm(landmarks, 11)
        r_sh = self.get_lm(landmarks, 12)
        l_elb = self.get_lm(landmarks, 13)
        r_elb = self.get_lm(landmarks, 14)
        l_wri = self.get_lm(landmarks, 15)
        r_wri = self.get_lm(landmarks, 16)
        l_hip = self.get_lm(landmarks, 23)
        r_hip = self.get_lm(landmarks, 24)

        # Calculate upper arm torso angles (hip -> shoulder -> elbow)
        l_sh_angle = self.calculate_angle(l_hip, l_sh, l_elb) if (l_hip and l_sh and l_elb) else None
        r_sh_angle = self.calculate_angle(r_hip, r_sh, r_elb) if (r_hip and r_sh and r_elb) else None

        active_sh_angle = min(filter(None, [l_sh_angle, r_sh_angle])) if (l_sh_angle or r_sh_angle) else None

        # Check A: Gross arm raise / swinging
        if active_sh_angle is not None and active_sh_angle > cfg.max_elbow_swing_angle:
            return False, "Arm Raise", "Arm raise detected. Anchor your elbows near your torso for curls."

        # Check B: Elbow above shoulder
        sh = l_sh or r_sh
        elb = l_elb or r_elb
        if sh and elb and elb.y < (sh.y - cfg.elbow_below_shoulder_margin * torso_scale):
            return False, "High Arm Movement", "Elbows raised too high. Keep elbows below shoulders for curls."

        return True, None, None

    def _check_squat(
        self,
        landmarks: List[LandmarkPoint],
        session_data: Dict[str, Any]
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Validates Squat identity:
        Torso generally upright (not horizontal); bilateral knee symmetry at depth;
        feet planted on floor plane (not single-leg flamingo or high knee).
        """
        cfg = self.config.squat
        torso_scale = self.get_torso_scale(landmarks)

        # Check A: Must be in vertical/standing orientation
        torso_horiz_angle = self.get_torso_horizontal_angle(landmarks)
        if torso_horiz_angle < cfg.min_torso_vertical_angle:
            return False, "Floor Posture", "Squats must be performed standing upright, not lying down."

        l_hip = self.get_lm(landmarks, 23)
        r_hip = self.get_lm(landmarks, 24)
        l_knee = self.get_lm(landmarks, 25)
        r_knee = self.get_lm(landmarks, 26)
        l_ank = self.get_lm(landmarks, 27)
        r_ank = self.get_lm(landmarks, 28)

        l_knee_angle = self.calculate_angle(l_hip, l_knee, l_ank) if (l_hip and l_knee and l_ank) else None
        r_knee_angle = self.calculate_angle(r_hip, r_knee, r_ank) if (r_hip and r_knee and r_ank) else None

        if l_knee_angle is not None and r_knee_angle is not None:
            # Check B: Deep asymmetric bend indicates single-leg flamingo or lunge
            min_knee = min(l_knee_angle, r_knee_angle)
            if min_knee <= cfg.deep_squat_knee_angle:
                knee_diff = abs(l_knee_angle - r_knee_angle)
                if knee_diff > cfg.max_knee_angle_diff:
                    return False, "Asymmetric Knee Bend", "Squats require bending both knees symmetrically."

        # Check C: Ankles must remain near the floor (flamingo / high knee rejection)
        if l_ank and r_ank:
            ank_y_diff = abs(l_ank.y - r_ank.y)
            if ank_y_diff > cfg.max_ankle_lift_ratio * torso_scale * 2.5:
                return False, "Single Leg Lift", "Keep both feet planted on the ground for squats."

        return True, None, None

    def _check_pushup(
        self,
        landmarks: List[LandmarkPoint],
        session_data: Dict[str, Any]
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Validates Push-up identity:
        Requires horizontal prone body orientation (torso angle with horizontal <= 40°).
        Standing upright immediately fails identity!
        """
        cfg = self.config.pushup
        torso_scale = self.get_torso_scale(landmarks)

        # Check A: Body orientation must be horizontal
        torso_horiz_angle = self.get_torso_horizontal_angle(landmarks)
        if torso_horiz_angle > cfg.max_torso_horizontal_angle:
            return False, "Standing Arm Press", "Push-ups require a horizontal plank/push-up posture on the floor."

        # Check B: Hand support plane (wrists near or below shoulders)
        l_sh = self.get_lm(landmarks, 11)
        r_sh = self.get_lm(landmarks, 12)
        l_wri = self.get_lm(landmarks, 15)
        r_wri = self.get_lm(landmarks, 16)

        sh = l_sh or r_sh
        wri = l_wri or r_wri
        if sh and wri:
            if wri.y < (sh.y - cfg.max_wrist_above_shoulder * torso_scale):
                return False, "Inverted Hand Position", "Hands must be positioned on the floor supporting your chest."

        return True, None, None

    def _check_shoulder_press(
        self,
        landmarks: List[LandmarkPoint],
        session_data: Dict[str, Any]
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Validates Shoulder Press identity:
        Characteristic overhead trajectory: hands must operate above waist/chest
        and travel into an overhead peak reach (above shoulders/head).
        """
        cfg = self.config.shoulder_press
        torso_scale = self.get_torso_scale(landmarks)

        l_sh = self.get_lm(landmarks, 11)
        r_sh = self.get_lm(landmarks, 12)
        l_wri = self.get_lm(landmarks, 15)
        r_wri = self.get_lm(landmarks, 16)
        l_hip = self.get_lm(landmarks, 23)
        r_hip = self.get_lm(landmarks, 24)

        # Check A: Wrists must not be curled down at the waist/hips
        hip_y = min(l_hip.y if l_hip else 1.0, r_hip.y if r_hip else 1.0)
        sh_y = max(l_sh.y if l_sh else 0.0, r_sh.y if r_sh else 0.0)
        wri_y = max(l_wri.y if l_wri else 0.0, r_wri.y if r_wri else 0.0)

        # In shoulder press rack, wrists are at shoulder/upper chest level, NEVER at waist
        mid_torso_y = (sh_y + hip_y) / 2.0
        if wri_y > (mid_torso_y - cfg.min_rack_wrist_elevation * torso_scale):
            return False, "Waist Level Movement", "Shoulder press requires holding weights at shoulder level, not waist."

        return True, None, None

    def _check_lateral_raise(
        self,
        landmarks: List[LandmarkPoint],
        session_data: Dict[str, Any]
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Validates Lateral Raise identity:
        Arms must operate as extended levers (elbow angle >= 118°),
        preventing bicep curls and upright rows with bent arms from counting.
        """
        cfg = self.config.lateral_raise

        l_sh = self.get_lm(landmarks, 11)
        r_sh = self.get_lm(landmarks, 12)
        l_elb = self.get_lm(landmarks, 13)
        r_elb = self.get_lm(landmarks, 14)
        l_wri = self.get_lm(landmarks, 15)
        r_wri = self.get_lm(landmarks, 16)
        l_hip = self.get_lm(landmarks, 23)
        r_hip = self.get_lm(landmarks, 24)

        l_elb_angle = self.calculate_angle(l_sh, l_elb, l_wri) if (l_sh and l_elb and l_wri) else None
        r_elb_angle = self.calculate_angle(r_sh, r_elb, r_wri) if (r_sh and r_elb and r_wri) else None

        l_abd = self.calculate_angle(l_hip, l_sh, l_elb) if (l_hip and l_sh and l_elb) else None
        r_abd = self.calculate_angle(r_hip, r_sh, r_elb) if (r_hip and r_sh and r_elb) else None

        active_abd = max(filter(None, [l_abd, r_abd])) if (l_abd or r_abd) else 0.0
        active_elb = min(filter(None, [l_elb_angle, r_elb_angle])) if (l_elb_angle or r_elb_angle) else 180.0

        # When arms are abducted outward (>= 50°), elbow must remain relatively extended
        if active_abd >= 50.0 and active_elb < cfg.min_extended_elbow_angle:
            return False, "Bent Arm Curl/Row", "Keep your arms extended with only a slight soft elbow bend for lateral raises."

        return True, None, None

    def _check_lunge(
        self,
        landmarks: List[LandmarkPoint],
        session_data: Dict[str, Any]
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Validates Lunge identity:
        Requires staggered/split stance (separation between left and right ankles);
        distinguishes lunges from parallel-stance squats.
        """
        cfg = self.config.lunge
        torso_scale = self.get_torso_scale(landmarks)

        l_hip = self.get_lm(landmarks, 23)
        r_hip = self.get_lm(landmarks, 24)
        l_knee = self.get_lm(landmarks, 25)
        r_knee = self.get_lm(landmarks, 26)
        l_ank = self.get_lm(landmarks, 27)
        r_ank = self.get_lm(landmarks, 28)

        l_knee_angle = self.calculate_angle(l_hip, l_knee, l_ank) if (l_hip and l_knee and l_ank) else None
        r_knee_angle = self.calculate_angle(r_hip, r_knee, r_ank) if (r_hip and r_knee and r_ank) else None

        min_knee = min(filter(None, [l_knee_angle, r_knee_angle])) if (l_knee_angle or r_knee_angle) else 180.0

        # When descending into deep knee bend (<= 115°), check for parallel squat vs staggered lunge
        if min_knee <= cfg.deep_lunge_knee_angle + 7.0 and l_knee and r_knee and l_ank and r_ank:
            knee_diff = abs(l_knee_angle - r_knee_angle) if (l_knee_angle and r_knee_angle) else 0.0
            knee_y_diff = abs(l_knee.y - r_knee.y)
            ankle_z_sep = abs((l_ank.z or 0.0) - (r_ank.z or 0.0))
            ankle_x_sep = abs(l_ank.x - r_ank.x)

            # If both knees bend symmetrically at the same level with parallel feet, it is a squat!
            if knee_diff < 20.0 and knee_y_diff < 0.08 and ankle_z_sep < 0.12 and ankle_x_sep > 0.15:
                return False, "Squat Stance", "Lunges require a staggered split stance (one foot forward, one back)."

        return True, None, None

    def _check_jumping_jacks(
        self,
        landmarks: List[LandmarkPoint],
        session_data: Dict[str, Any]
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Validates Jumping Jacks whole-body identity:
        Requires coordinated arm sweep AND leg abduction.
        Moving arms overhead while feet stay glued together is rejected.
        """
        cfg = self.config.jumping_jacks
        torso_scale = self.get_torso_scale(landmarks)

        l_hip = self.get_lm(landmarks, 23)
        r_hip = self.get_lm(landmarks, 24)
        l_sh = self.get_lm(landmarks, 11)
        r_sh = self.get_lm(landmarks, 12)
        l_elb = self.get_lm(landmarks, 13)
        r_elb = self.get_lm(landmarks, 14)
        l_wri = self.get_lm(landmarks, 15)
        r_wri = self.get_lm(landmarks, 16)
        l_ank = self.get_lm(landmarks, 27)
        r_ank = self.get_lm(landmarks, 28)

        l_arm = self.calculate_angle(l_hip, l_sh, l_elb) if (l_hip and l_sh and l_elb) else None
        r_arm = self.calculate_angle(r_hip, r_sh, r_elb) if (r_hip and r_sh and r_elb) else None

        active_arm = max(filter(None, [l_arm, r_arm])) if (l_arm or r_arm) else 0.0
        l_overhead = (l_wri and l_sh and l_wri.y < l_sh.y) or (l_elb and l_sh and l_elb.y < l_sh.y)
        r_overhead = (r_wri and r_sh and r_wri.y < r_sh.y) or (r_elb and r_sh and r_elb.y < r_sh.y)
        arm_high = (active_arm >= cfg.arms_overhead_angle - 5.0) or l_overhead or r_overhead

        # When arms are reaching overhead, feet must be abducted wide
        if arm_high and l_ank and r_ank:
            ankle_dist = abs(l_ank.x - r_ank.x)
            if ankle_dist < cfg.min_wide_ankle_separation * torso_scale:
                return False, "Arm Wave / Standing Overhead", "Jumping jacks require jumping your feet wide as arms sweep overhead."

        return True, None, None

    def _check_plank(
        self,
        landmarks: List[LandmarkPoint],
        session_data: Dict[str, Any]
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Validates Plank identity:
        Requires horizontal prone body orientation (torso angle with horizontal <= 35°).
        Standing upright must immediately fail identity!
        """
        cfg = self.config.plank

        # Check A: Must be in horizontal prone orientation
        torso_horiz_angle = self.get_torso_horizontal_angle(landmarks)
        if torso_horiz_angle > cfg.max_torso_horizontal_angle:
            return False, "Standing Upright", "Plank requires a horizontal prone position on the floor, not standing upright."

        # Check B: Floor support span
        torso_scale = self.get_torso_scale(landmarks)
        l_sh = self.get_lm(landmarks, 11)
        r_sh = self.get_lm(landmarks, 12)
        l_ank = self.get_lm(landmarks, 27)
        r_ank = self.get_lm(landmarks, 28)

        sh = l_sh or r_sh
        ank = l_ank or r_ank
        if sh and ank:
            body_span = abs(sh.x - ank.x)
            if body_span < cfg.min_horizontal_body_span * torso_scale:
                return False, "Compact Posture", "Extend your legs fully into a straight horizontal plank line."

        return True, None, None

    # =========================================================================
    # TEMPORAL IDENTITY VALIDATOR
    # =========================================================================

    def validate(
        self,
        expected_exercise: str,
        landmarks: List[LandmarkPoint],
        session_data: Dict[str, Any]
    ) -> IdentityValidationResult:
        """
        Validates exercise-specific biomechanical identity using multi-frame temporal confirmation.
        Returns IdentityValidationResult.
        """
        norm_name = expected_exercise.lower().strip().replace("_", " ")

        # 1. Evaluate single frame against expected exercise identity constraints
        is_frame_valid = True
        fault_name = None
        fault_msg = None

        if any(w in norm_name for w in ["bicep", "curl"]):
            is_frame_valid, fault_name, fault_msg = self._check_bicep_curl(landmarks, session_data)
        elif "squat" in norm_name:
            is_frame_valid, fault_name, fault_msg = self._check_squat(landmarks, session_data)
        elif "push" in norm_name:
            is_frame_valid, fault_name, fault_msg = self._check_pushup(landmarks, session_data)
        elif any(w in norm_name for w in ["shoulder", "overhead"]):
            is_frame_valid, fault_name, fault_msg = self._check_shoulder_press(landmarks, session_data)
        elif "lateral" in norm_name:
            is_frame_valid, fault_name, fault_msg = self._check_lateral_raise(landmarks, session_data)
        elif "lunge" in norm_name:
            is_frame_valid, fault_name, fault_msg = self._check_lunge(landmarks, session_data)
        elif "jumping" in norm_name:
            is_frame_valid, fault_name, fault_msg = self._check_jumping_jacks(landmarks, session_data)
        elif "plank" in norm_name:
            is_frame_valid, fault_name, fault_msg = self._check_plank(landmarks, session_data)

        # 2. Manage Temporal Rolling History in session_data
        history = session_data.setdefault("identity_history", [])
        history.append({
            "is_valid": is_frame_valid,
            "fault_name": fault_name,
            "fault_msg": fault_msg
        })
        if len(history) > self.config.temporal_window_size:
            history.pop(0)

        # If current frame is valid, identity is preserved
        if is_frame_valid:
            return IdentityValidationResult(is_valid=True)

        # 3. Check for sustained identity violation across recent frames
        invalid_count = sum(1 for h in history if not h["is_valid"])
        if invalid_count >= self.config.mismatch_trigger_count:
            return IdentityValidationResult(
                is_valid=False,
                feedback=fault_msg or f"Movement does not match the identity of {expected_exercise}.",
                detected_movement=fault_name or "Unexpected Movement",
                details={"invalid_count": invalid_count, "history_size": len(history)}
            )

        # 4. Single-frame transient violation: tolerate to prevent jitter
        return IdentityValidationResult(is_valid=True)
