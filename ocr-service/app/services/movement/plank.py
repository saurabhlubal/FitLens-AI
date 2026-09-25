import math
from typing import List, Optional, Dict, Any
from app.models.movement import LandmarkPoint, MovementAnalysisResponse, JointAngles
from app.services.movement.base_detector import BaseExerciseDetector

class PlankDetector(BaseExerciseDetector):
    """
    Plank Isometric Hold Duration & Form Stability Detector
    True Isometric Hold Progression with Biomechanical Identity Verification:
    - Structure Check: Prone horizontal body orientation (angle with horizontal <= 35°).
      Standing upright is strictly rejected and never generates plank hold duration.
    - Hold Verification: Spine angle between 155° and 195°.
    - Form Verification: No hip sag (< 155°) and no hip pike (> 195°).
    - Duration Accumulation: Hold seconds accumulate ONLY in valid horizontal posture with Good Form.
    """

    def __init__(self):
        super().__init__("Plank")

    def analyze(
        self,
        landmarks: List[LandmarkPoint],
        current_reps: int,
        current_stage: str,
        session_data: Optional[Dict[str, Any]] = None
    ) -> MovementAnalysisResponse:
        if session_data is None:
            session_data = {}

        # 1. Extract Alignment Keypoints
        l_shoulder = self.get_landmark(landmarks, 11)
        l_hip = self.get_landmark(landmarks, 23)
        l_ankle = self.get_landmark(landmarks, 27)

        r_shoulder = self.get_landmark(landmarks, 12)
        r_hip = self.get_landmark(landmarks, 24)
        r_ankle = self.get_landmark(landmarks, 28)

        left_spine = self.calculate_angle(l_shoulder, l_hip, l_ankle)
        right_spine = self.calculate_angle(r_shoulder, r_hip, r_ankle)

        body_angle = None
        if left_spine is not None and right_spine is not None:
            body_angle = (left_spine + right_spine) / 2.0
        elif left_spine is not None:
            body_angle = left_spine
        elif right_spine is not None:
            body_angle = right_spine
        else:
            return MovementAnalysisResponse(
                success=False,
                exerciseName=self.name,
                stage=current_stage,
                repetitionCount=current_reps,
                repIncremented=False,
                formScore=0.0,
                isCorrectForm=False,
                feedback="Plank pose not clearly in frame. Adjust camera.",
            )

        # 2. Structural Frame & Horizontal Orientation Validation
        is_good_form = True
        form_fault_reason = None
        in_plank_frame = True

        # Check A: Horizontal Prone Body Orientation (Standing upright cannot count as plank!)
        sh = l_shoulder or r_shoulder
        hip = l_hip or r_hip
        if sh and hip:
            dx = abs(sh.x - hip.x)
            dy = abs(sh.y - hip.y)
            torso_horiz_angle = math.degrees(math.atan2(dy, max(0.001, dx)))
            if torso_horiz_angle > 35.0:
                in_plank_frame = False
                is_good_form = False
                form_fault_reason = "Plank requires a horizontal prone position on the floor, not standing upright."

        # Check B: Spine Alignment (No sagging or piking)
        if in_plank_frame and body_angle is not None:
            if body_angle < 155:
                is_good_form = False
                form_fault_reason = "Hips sagging down! Engage glutes and core to protect spine."
            elif body_angle > 195:
                is_good_form = False
                form_fault_reason = "Hips piked too high! Lower hips into a straight rigid line."

        # 3. Isometric Hold Duration Accumulator
        reps = current_reps
        rep_incremented = False

        if not in_plank_frame:
            # Standing or wrong orientation: hold paused immediately, no fake reps!
            session_data["valid_hold_frames"] = 0
            feedback = f"Bad Form: {form_fault_reason}"
            ai_state = "FORM_FEEDBACK"
            stage = "warning"
        elif is_good_form:
            valid_frames = session_data.get("valid_hold_frames", 0) + 1
            session_data["valid_hold_frames"] = valid_frames
            # Accumulate 1 second/point every 10 stable frames in Good Form
            if valid_frames % 10 == 0:
                reps += 1
                rep_incremented = True
                feedback = f"Hold active! {reps}s locked in with Good Form."
            else:
                feedback = f"Solid plank posture! Core engaged, hold steady ({reps}s)."
            ai_state = "REP_COUNTING" if rep_incremented else "ANALYZING"
            stage = "holding"
        else:
            # Horizontal but sagging or piked: pause accumulation and coach
            feedback = f"Bad Form: {form_fault_reason}"
            ai_state = "FORM_FEEDBACK"
            stage = "warning"

        joint_angles = JointAngles(
            backAngle=body_angle
        )

        return MovementAnalysisResponse(
            success=True,
            exerciseName=self.name,
            stage=stage,
            repetitionCount=reps,
            repIncremented=rep_incremented,
            formScore=100.0 if (in_plank_frame and is_good_form) else (0.0 if not in_plank_frame else 70.0),
            isCorrectForm=is_good_form and in_plank_frame,
            feedback=feedback,
            jointAngles=joint_angles,
            aiState=ai_state,
            sessionData=session_data,
            metrics={
                "formStatus": "Good Form" if (is_good_form and in_plank_frame) else "Bad Form",
                "spineAlignmentAngle": round(body_angle, 1) if body_angle else None,
                "inPlankFrame": in_plank_frame,
                "holdDurationSec": reps,
                "romPercentage": 100 if (is_good_form and in_plank_frame) else 50
            }
        )
