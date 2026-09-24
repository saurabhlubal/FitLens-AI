import math
from typing import List, Optional, Dict, Any, Tuple
from app.models.movement import LandmarkPoint

class ExerciseClassifier:
    """
    Temporal Movement Classifier.
    Analyzes kinetic landmarks across recent frames to distinguish active exercises
    (e.g., Push-up vs. Bicep Curl vs. Squat) and prevents single-frame false-mismatch noise.
    """

    HISTORY_WINDOW_SIZE = 4
    MISMATCH_THRESHOLD = 3

    @staticmethod
    def _calculate_angle(
        a: Optional[LandmarkPoint],
        b: Optional[LandmarkPoint],
        c: Optional[LandmarkPoint]
    ) -> Optional[float]:
        if not a or not b or not c:
            return None
        radians = math.atan2(c.y - b.y, c.x - b.x) - math.atan2(a.y - b.y, a.x - b.x)
        angle = abs(radians * 180.0 / math.pi)
        if angle > 180.0:
            angle = 360.0 - angle
        return round(angle, 1)

    @classmethod
    def classify_frame(cls, landmarks: List[LandmarkPoint]) -> str:
        """
        Extracts instantaneous kinetic signature from a single 33-point pose landmark frame.
        Returns candidate exercise name or 'neutral_standing' or 'inconclusive'.
        """
        if not landmarks or len(landmarks) < 25:
            return "inconclusive"

        l_sh = landmarks[11]
        r_sh = landmarks[12]
        l_elb = landmarks[13]
        r_elb = landmarks[14]
        l_wri = landmarks[15]
        r_wri = landmarks[16]
        l_hip = landmarks[23]
        r_hip = landmarks[24]
        l_knee = landmarks[25]
        r_knee = landmarks[26]
        l_ank = landmarks[27]
        r_ank = landmarks[28]

        # 1. Orientation Analysis: Horizontal Floor (Push-up / Plank) vs Vertical Standing
        mid_sh_x = (l_sh.x + r_sh.x) / 2.0
        mid_sh_y = (l_sh.y + r_sh.y) / 2.0
        mid_hip_x = (l_hip.x + r_hip.x) / 2.0
        mid_hip_y = (l_hip.y + r_hip.y) / 2.0

        dx = abs(mid_sh_x - mid_hip_x)
        dy = abs(mid_sh_y - mid_hip_y)

        # Torso inclination with horizontal plane (degrees)
        torso_angle_with_horiz = math.degrees(math.atan2(dy, max(0.001, dx)))

        # If body is horizontal (push-up / plank position)
        if torso_angle_with_horiz < 35.0:
            # Check elbow angles for push-up vs static plank
            l_arm = cls._calculate_angle(l_sh, l_elb, l_wri)
            r_arm = cls._calculate_angle(r_sh, r_elb, r_wri)
            arm_angle = l_arm if l_arm is not None else r_arm

            if arm_angle is not None and arm_angle <= 120.0:
                return "Push-up"
            return "Plank"

        # 2. Vertical Standing Movements
        # A. Check Knee Flexion (Lower Body: Squat vs Lunge)
        l_knee_angle = cls._calculate_angle(l_hip, l_knee, l_ank)
        r_knee_angle = cls._calculate_angle(r_hip, r_knee, r_ank)

        # Deep bilateral knee bend indicates Squat
        if l_knee_angle is not None and r_knee_angle is not None:
            if l_knee_angle <= 130.0 and r_knee_angle <= 130.0:
                return "Squat"
            # Asymmetric deep knee bend indicates Lunge
            if (l_knee_angle <= 120.0 and r_knee_angle > 140.0) or \
               (r_knee_angle <= 120.0 and l_knee_angle > 140.0):
                return "Lunge"
        elif l_knee_angle is not None and l_knee_angle <= 130.0:
            return "Squat"
        elif r_knee_angle is not None and r_knee_angle <= 130.0:
            return "Squat"

        # B. Check Overhead / Shoulder Press
        # Wrists above shoulders (y is lower in screen space)
        wrists_above_shoulders = (l_wri.y < l_sh.y - 0.05) or (r_wri.y < r_sh.y - 0.05)
        if wrists_above_shoulders:
            l_elb_angle = cls._calculate_angle(l_sh, l_elb, l_wri)
            r_elb_angle = cls._calculate_angle(r_sh, r_elb, r_wri)
            elb_angle = l_elb_angle or r_elb_angle
            if elb_angle is not None:
                return "Shoulder Press"

        # C. Check Lateral Raise (Arm Abduction)
        # Angle at shoulder between hip, shoulder, elbow
        l_abd = cls._calculate_angle(l_hip, l_sh, l_elb)
        r_abd = cls._calculate_angle(r_hip, r_sh, r_elb)
        l_elb_angle = cls._calculate_angle(l_sh, l_elb, l_wri)
        r_elb_angle = cls._calculate_angle(r_sh, r_elb, r_wri)

        # In lateral raise, arms are abducting (>= 45°) with relatively straight elbows (>= 120°)
        if (l_abd is not None and l_abd >= 45.0 and l_elb_angle is not None and l_elb_angle >= 120.0) or \
           (r_abd is not None and r_abd >= 45.0 and r_elb_angle is not None and r_elb_angle >= 120.0):
            # Check jumping jacks (wide ankle stance)
            ank_dist = abs(l_ank.x - r_ank.x) if (l_ank and r_ank) else 0.0
            if ank_dist > 0.35:
                return "Jumping Jacks"
            return "Lateral Raise"

        # D. Check Bicep Curl / Hammer Curl (Elbow Flexion with Pinned Elbows)
        # Elbows below shoulders, shoulder abduction angle is small (< 45°)
        elbows_below_sh = (l_elb.y > l_sh.y) or (r_elb.y > r_sh.y)
        if elbows_below_sh:
            l_elb_angle = cls._calculate_angle(l_sh, l_elb, l_wri)
            r_elb_angle = cls._calculate_angle(r_sh, r_elb, r_wri)
            
            # Active flexion in elbows while upper arm is near torso
            if (l_elb_angle is not None and l_elb_angle <= 110.0 and (l_abd is None or l_abd < 45.0)) or \
               (r_elb_angle is not None and r_elb_angle <= 110.0 and (r_abd is None or r_abd < 45.0)):
                return "Bicep Curl"

        return "neutral_standing"

    @classmethod
    def normalize_exercise_category(cls, name: str) -> str:
        n = name.lower().strip()
        if any(w in n for w in ["bicep", "hammer", "curl"]):
            return "curl"
        if "squat" in n:
            return "squat"
        if any(w in n for w in ["push", "plank"]):
            return "floor"
        if any(w in n for w in ["shoulder press", "overhead"]):
            return "shoulder_press"
        if "lateral" in n:
            return "lateral_raise"
        if "lunge" in n:
            return "lunge"
        if "jumping" in n:
            return "jumping_jacks"
        return n

    @classmethod
    def verify_exercise_match(
        cls,
        expected_exercise: str,
        landmarks: List[LandmarkPoint],
        session_data: Dict[str, Any]
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Temporally verifies if current movement matches the expected workout exercise.
        Returns:
            (is_match: bool, detected_exercise: Optional[str], mismatch_message: Optional[str])
        """
        # If target exercise changed within session, reset classification history
        if session_data.get("target_exercise") != expected_exercise:
            session_data["target_exercise"] = expected_exercise
            session_data["classification_history"] = []

        current_detected = cls.classify_frame(landmarks)
        
        # Sliding history buffer
        history = session_data.setdefault("classification_history", [])
        history.append(current_detected)
        if len(history) > cls.HISTORY_WINDOW_SIZE:
            history.pop(0)

        # Neutral standing or inconclusive transitions do NOT trigger a mismatch
        if current_detected in ["neutral_standing", "inconclusive"]:
            return True, None, None

        expected_cat = cls.normalize_exercise_category(expected_exercise)
        detected_cat = cls.normalize_exercise_category(current_detected)

        # If categories match, it's a valid match
        if expected_cat == detected_cat:
            return True, current_detected, None

        # Check for temporal consistency of the mismatch
        # Count how many of the last N frames match this conflicting exercise
        conflict_count = sum(1 for d in history if cls.normalize_exercise_category(d) == detected_cat)

        if conflict_count >= cls.MISMATCH_THRESHOLD:
            # Confirmed sustained mismatch across multiple frames
            msg = f"Wrong exercise detected. You appear to be performing {current_detected}. Your current exercise is {expected_exercise}."
            return False, current_detected, msg

        # Temporary single-frame divergence or noise: tolerate and allow tracking to continue
        return True, None, None
