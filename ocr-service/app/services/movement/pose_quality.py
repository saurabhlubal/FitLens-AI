from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any, Tuple
from app.models.movement import LandmarkPoint

@dataclass
class PoseQualityConfig:
    """
    Configurable constants for Pose Quality & Framing Gate.
    All thresholds are centralized here for easy tuning and calibration.
    """
    min_total_landmarks: int = 25
    min_landmark_visibility: float = 0.5
    
    # Boundary clipping limits (normalized coordinates [0.0, 1.0])
    frame_boundary_min_x: float = 0.02
    frame_boundary_max_x: float = 0.98
    frame_boundary_min_y: float = 0.02
    frame_boundary_max_y: float = 0.98
    
    # Torso vertical scale (distance between mid-shoulders and mid-hips)
    # If torso_scale < torso_min_scale: User is too far from camera
    torso_min_scale: float = 0.12
    # If torso_scale > torso_max_scale: User is too close to camera
    torso_max_scale: float = 0.85
    
    # Clearance thresholds
    head_clearance_min_y: float = 0.04
    lateral_clearance_min_x: float = 0.03
    lateral_clearance_max_x: float = 0.97
    
    # Push-up / Plank side-profile check
    pushup_horizontal_max_angle: float = 40.0
    pushup_frontal_shoulder_width_threshold: float = 0.35


@dataclass
class PoseQualityResult:
    is_valid: bool
    ai_state: str  # "READY" | "POSITION_ADJUSTMENT"
    guidance: str
    details: Dict[str, Any] = field(default_factory=dict)


class PoseQualityValidator:
    """
    Validates framing, distance, camera angle, and exercise-specific landmark visibility
    BEFORE running kinematic detectors or counting repetitions.
    """

    def __init__(self, config: Optional[PoseQualityConfig] = None):
        self.config = config or PoseQualityConfig()

    @staticmethod
    def _get_lm(landmarks: List[LandmarkPoint], index: int) -> Optional[LandmarkPoint]:
        if 0 <= index < len(landmarks):
            return landmarks[index]
        return None

    def _is_visible(self, lm: Optional[LandmarkPoint]) -> bool:
        if not lm:
            return False
        vis = lm.visibility if lm.visibility is not None else 1.0
        return vis >= self.config.min_landmark_visibility

    def validate(
        self,
        exercise_name: str,
        landmarks: List[LandmarkPoint]
    ) -> PoseQualityResult:
        """
        Validates landmark availability, framing scale, boundary clipping, and
        exercise-specific joint requirements.
        Returns PoseQualityResult.
        """
        cfg = self.config
        norm_name = exercise_name.lower().strip()

        # 1. Total Landmark Check
        if not landmarks or len(landmarks) < cfg.min_total_landmarks:
            return PoseQualityResult(
                is_valid=False,
                ai_state="POSITION_ADJUSTMENT",
                guidance="Step into frame so the camera can see you.",
                details={"reason": "insufficient_landmarks", "count": len(landmarks) if landmarks else 0}
            )

        # 2. Extract Primary Anchors (Shoulders & Hips)
        l_shoulder = self._get_lm(landmarks, 11)
        r_shoulder = self._get_lm(landmarks, 12)
        l_hip = self._get_lm(landmarks, 23)
        r_hip = self._get_lm(landmarks, 24)

        has_shoulders = self._is_visible(l_shoulder) or self._is_visible(r_shoulder)
        has_hips = self._is_visible(l_hip) or self._is_visible(r_hip)

        if not has_shoulders and not has_hips:
            return PoseQualityResult(
                is_valid=False,
                ai_state="POSITION_ADJUSTMENT",
                guidance="Step into frame so your body is visible.",
                details={"reason": "torso_not_visible"}
            )

        # 3. Scale / Distance Check (Torso Scale)
        torso_scale = None
        if l_shoulder and r_shoulder and l_hip and r_hip:
            mid_shoulder_y = (l_shoulder.y + r_shoulder.y) / 2.0
            mid_hip_y = (l_hip.y + r_hip.y) / 2.0
            mid_shoulder_x = (l_shoulder.x + r_shoulder.x) / 2.0
            mid_hip_x = (l_hip.x + r_hip.x) / 2.0
            
            # Use 2D Euclidean distance for torso length to handle standing and horizontal poses
            dx = mid_shoulder_x - mid_hip_x
            dy = mid_shoulder_y - mid_hip_y
            torso_scale = (dx * dx + dy * dy) ** 0.5

        if torso_scale is not None:
            if torso_scale < cfg.torso_min_scale:
                return PoseQualityResult(
                    is_valid=False,
                    ai_state="POSITION_ADJUSTMENT",
                    guidance="Move closer to the camera.",
                    details={"reason": "too_far", "torso_scale": round(torso_scale, 3)}
                )
            if torso_scale > cfg.torso_max_scale:
                return PoseQualityResult(
                    is_valid=False,
                    ai_state="POSITION_ADJUSTMENT",
                    guidance="Move farther back to fit your full body in frame.",
                    details={"reason": "too_close", "torso_scale": round(torso_scale, 3)}
                )

        # 4. Boundary Clipping Check
        # Key functional joints shouldn't be clipped against the edge of the viewport
        boundary_clipped = False
        clipped_part = None
        for idx in [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]:
            lm = self._get_lm(landmarks, idx)
            if lm and self._is_visible(lm):
                if lm.x < cfg.frame_boundary_min_x or lm.x > cfg.frame_boundary_max_x or \
                   lm.y < cfg.frame_boundary_min_y or lm.y > cfg.frame_boundary_max_y:
                    boundary_clipped = True
                    clipped_part = idx
                    break

        if boundary_clipped:
            return PoseQualityResult(
                is_valid=False,
                ai_state="POSITION_ADJUSTMENT",
                guidance="Move farther back to fit your full body in frame.",
                details={"reason": "boundary_clipping", "landmark_index": clipped_part}
            )

        # 5. Exercise-Specific Joint Visibility & Framing Checks
        # A. BICEP CURL / HAMMER CURL
        if any(w in norm_name for w in ["bicep", "curl", "hammer"]):
            l_elbow = self._get_lm(landmarks, 13)
            l_wrist = self._get_lm(landmarks, 15)
            r_elbow = self._get_lm(landmarks, 14)
            r_wrist = self._get_lm(landmarks, 16)

            left_arm_ok = self._is_visible(l_shoulder) and self._is_visible(l_elbow) and self._is_visible(l_wrist)
            right_arm_ok = self._is_visible(r_shoulder) and self._is_visible(r_elbow) and self._is_visible(r_wrist)

            if not left_arm_ok and not right_arm_ok:
                return PoseQualityResult(
                    is_valid=False,
                    ai_state="POSITION_ADJUSTMENT",
                    guidance="Make sure your full arm (shoulder, elbow, wrist) is visible.",
                    details={"reason": "arm_landmarks_missing"}
                )

        # B. SQUAT
        elif "squat" in norm_name:
            l_knee = self._get_lm(landmarks, 25)
            r_knee = self._get_lm(landmarks, 26)
            l_ankle = self._get_lm(landmarks, 27)
            r_ankle = self._get_lm(landmarks, 28)

            legs_visible = (self._is_visible(l_hip) and self._is_visible(l_knee) and self._is_visible(l_ankle)) or \
                           (self._is_visible(r_hip) and self._is_visible(r_knee) and self._is_visible(r_ankle))

            if not legs_visible:
                return PoseQualityResult(
                    is_valid=False,
                    ai_state="POSITION_ADJUSTMENT",
                    guidance="Ensure your hips, knees, and feet are visible in frame.",
                    details={"reason": "leg_landmarks_missing"}
                )

        # C. LUNGE
        elif "lunge" in norm_name:
            l_knee = self._get_lm(landmarks, 25)
            r_knee = self._get_lm(landmarks, 26)
            l_ankle = self._get_lm(landmarks, 27)
            r_ankle = self._get_lm(landmarks, 28)

            legs_visible = (self._is_visible(l_knee) and self._is_visible(l_ankle)) or \
                           (self._is_visible(r_knee) and self._is_visible(r_ankle))

            if not legs_visible:
                return PoseQualityResult(
                    is_valid=False,
                    ai_state="POSITION_ADJUSTMENT",
                    guidance="Step back so your legs and stride are fully visible.",
                    details={"reason": "lunge_stride_missing"}
                )

        # D. PUSH-UP & PLANK
        elif any(w in norm_name for w in ["push", "plank"]):
            l_ankle = self._get_lm(landmarks, 27)
            r_ankle = self._get_lm(landmarks, 28)
            l_elbow = self._get_lm(landmarks, 13)
            r_elbow = self._get_lm(landmarks, 14)

            upper_body_ok = (self._is_visible(l_shoulder) and self._is_visible(l_elbow)) or \
                            (self._is_visible(r_shoulder) and self._is_visible(r_elbow))
            lower_body_ok = self._is_visible(l_hip) or self._is_visible(r_hip) or \
                            self._is_visible(l_ankle) or self._is_visible(r_ankle)

            if not upper_body_ok or not lower_body_ok:
                return PoseQualityResult(
                    is_valid=False,
                    ai_state="POSITION_ADJUSTMENT",
                    guidance="Step into frame so your whole body is visible for push-ups.",
                    details={"reason": "pushup_body_missing"}
                )

            # Check Side-Profile Orientation:
            # If user is directly facing camera, shoulder width is wide relative to visible torso length
            if l_shoulder and r_shoulder and l_hip and r_hip:
                shoulder_width = abs(l_shoulder.x - r_shoulder.x)
                torso_len = abs(l_shoulder.y - l_hip.y)
                # If frontal horizontal view where shoulders are broad and torso is foreshortened
                if shoulder_width > cfg.pushup_frontal_shoulder_width_threshold and torso_len < 0.25:
                    return PoseQualityResult(
                        is_valid=False,
                        ai_state="POSITION_ADJUSTMENT",
                        guidance="Turn slightly to the side for push-up tracking.",
                        details={"reason": "bad_camera_orientation", "shoulder_width": round(shoulder_width, 2)}
                    )

        # E. SHOULDER PRESS
        elif any(w in norm_name for w in ["shoulder press", "overhead"]):
            l_wrist = self._get_lm(landmarks, 15)
            r_wrist = self._get_lm(landmarks, 16)
            head = self._get_lm(landmarks, 0)

            overhead_clipped = False
            for w in [l_wrist, r_wrist, head]:
                if w and self._is_visible(w) and w.y < cfg.head_clearance_min_y:
                    overhead_clipped = True
                    break

            if overhead_clipped:
                return PoseQualityResult(
                    is_valid=False,
                    ai_state="POSITION_ADJUSTMENT",
                    guidance="Step back so your hands have room overhead.",
                    details={"reason": "overhead_clearance_clipped"}
                )

        # F. LATERAL RAISE
        elif "lateral" in norm_name:
            l_wrist = self._get_lm(landmarks, 15)
            r_wrist = self._get_lm(landmarks, 16)

            lateral_clipped = False
            for w in [l_wrist, r_wrist]:
                if w and self._is_visible(w):
                    if w.x < cfg.lateral_clearance_min_x or w.x > cfg.lateral_clearance_max_x:
                        lateral_clipped = True
                        break

            if lateral_clipped:
                return PoseQualityResult(
                    is_valid=False,
                    ai_state="POSITION_ADJUSTMENT",
                    guidance="Step back or clear space so your arms can extend out to the sides.",
                    details={"reason": "lateral_clearance_clipped"}
                )

        # G. JUMPING JACKS
        elif "jumping" in norm_name:
            l_ankle = self._get_lm(landmarks, 27)
            r_ankle = self._get_lm(landmarks, 28)
            if not self._is_visible(l_ankle) and not self._is_visible(r_ankle):
                return PoseQualityResult(
                    is_valid=False,
                    ai_state="POSITION_ADJUSTMENT",
                    guidance="Step back so your full body from hands to feet is in frame.",
                    details={"reason": "feet_not_visible"}
                )

        # All pose quality checks passed
        return PoseQualityResult(
            is_valid=True,
            ai_state="READY",
            guidance="Pose detected cleanly.",
            details={"torso_scale": round(torso_scale, 3) if torso_scale else None}
        )
