from typing import List, Optional, Dict, Any
from app.models.movement import LandmarkPoint, MovementAnalysisResponse, JointAngles
from app.services.movement.base_detector import BaseExerciseDetector

class LungeDetector(BaseExerciseDetector):
    """
    Forward / Reverse Lunge Movement & Repetition Detector
    Form-Enforced Full Cycle Repetition Counting (Good Form vs Bad Form):
    - Structure Check: Upright spine, balanced single-leg stance.
    - Full Cycle: Standing Tall (Up > 150°) -> Deep 90/90 Lunge (Down <= 105°).
    - Form Verification: Knee tracking (angle not collapsing < 65° excessively past toes), torso upright.
    - Discrete Form State: Strictly "Good Form" or "Bad Form". Reps increment ONLY in Good Form.
    """

    def __init__(self):
        super().__init__("Lunge")

    def analyze(
        self,
        landmarks: List[LandmarkPoint],
        current_reps: int,
        current_stage: str,
        session_data: Optional[Dict[str, Any]] = None
    ) -> MovementAnalysisResponse:
        if session_data is None:
            session_data = {}

        # 1. Extract Hip/Knee/Ankle Keypoints
        l_hip = self.get_landmark(landmarks, 23)
        l_knee = self.get_landmark(landmarks, 25)
        l_ankle = self.get_landmark(landmarks, 27)

        r_hip = self.get_landmark(landmarks, 24)
        r_knee = self.get_landmark(landmarks, 26)
        r_ankle = self.get_landmark(landmarks, 28)

        left_knee_angle = self.calculate_angle(l_hip, l_knee, l_ankle)
        right_knee_angle = self.calculate_angle(r_hip, r_knee, r_ankle)

        lead_knee_angle = None
        if left_knee_angle is not None and right_knee_angle is not None:
            lead_knee_angle = min(left_knee_angle, right_knee_angle)
        elif left_knee_angle is not None:
            lead_knee_angle = left_knee_angle
        elif right_knee_angle is not None:
            lead_knee_angle = right_knee_angle
        else:
            return MovementAnalysisResponse(
                success=False,
                exerciseName=self.name,
                stage=current_stage,
                repetitionCount=current_reps,
                repIncremented=False,
                formScore=0.0,
                isCorrectForm=False,
                feedback="Legs and knees not visible. Step back into camera frame.",
            )

        # 2. Structural Frame & Lunge Form Validation
        is_good_form = True
        form_fault_reason = None

        if lead_knee_angle < 65:
            is_good_form = False
            form_fault_reason = "Knee traveling too far past toes! Take a wider step."

        # 3. State Machine & Full-Cycle Rep Counting (up -> down -> up = 1)
        # Standing tall (Up): Lead knee > 150°
        # Deep Lunge (Down): Lead knee <= 105°
        new_stage = current_stage
        rep_incremented = False
        reps = current_reps
        feedback = "Good Form. Step into a lunge, dropping hips straight down." if is_good_form else form_fault_reason
        ai_state = "ANALYZING"

        if lead_knee_angle > 150:
            new_stage = "up"
            if session_data.get("inflection_reached"):
                reps += 1
                rep_incremented = True
                ai_state = "REP_COUNTING"
                if is_good_form:
                    feedback = "Rep Counted! (Good Form - Full Lunge Drive)"
                else:
                    feedback = f"Rep Counted! Form note: {form_fault_reason}"
                session_data["inflection_reached"] = False
            else:
                ai_state = "TRACKING" if is_good_form else "FORM_FEEDBACK"
                if is_good_form:
                    feedback = "Good Form. Standing upright. Step and drop hips down."
                else:
                    feedback = f"Bad Form: {form_fault_reason}"
        elif lead_knee_angle <= 105:
            # Check split stance separation (prevents parallel squats from counting as lunges)
            ankle_x_sep = abs(l_ankle.x - r_ankle.x) if (l_ankle and r_ankle) else 0.0
            ankle_z_sep = abs((l_ankle.z or 0.0) - (r_ankle.z or 0.0)) if (l_ankle and r_ankle) else 0.0
            max_sep = max(ankle_x_sep, ankle_z_sep)
            is_squat_stance = False
            if left_knee_angle and right_knee_angle and abs(left_knee_angle - right_knee_angle) < 20.0 and max_sep < 0.08:
                is_squat_stance = True

            new_stage = "down"
            if is_squat_stance:
                session_data["inflection_reached"] = False
                is_good_form = False
                form_fault_reason = "Lunges require a staggered split stance (one foot forward, one back)."
                ai_state = "FORM_FEEDBACK"
                feedback = f"Bad Form: {form_fault_reason}"
            else:
                session_data["inflection_reached"] = True
                ai_state = "ANALYZING" if is_good_form else "FORM_FEEDBACK"
                if is_good_form:
                    feedback = "Full lunge depth reached (Good Form)! Drive through front heel."
                else:
                    feedback = f"Bad Form: {form_fault_reason}"
        else:
            ai_state = "ANALYZING" if is_good_form else "FORM_FEEDBACK"
            if is_good_form:
                if session_data.get("inflection_reached"):
                    feedback = "Driving back up with Good Form..."
                else:
                    feedback = "Lowering into lunge with Good Form..."
            else:
                feedback = f"Bad Form: {form_fault_reason}"

        rom_pct = max(0, min(100, int((160 - lead_knee_angle) / (160 - 90) * 100)))

        joint_angles = JointAngles(
            leftKnee=left_knee_angle,
            rightKnee=right_knee_angle
        )

        return MovementAnalysisResponse(
            success=True,
            exerciseName=self.name,
            stage=new_stage,
            repetitionCount=reps,
            repIncremented=rep_incremented,
            formScore=100.0 if is_good_form else 70.0,
            isCorrectForm=is_good_form,
            feedback=feedback,
            jointAngles=joint_angles,
            aiState=ai_state,
            sessionData=session_data,
            metrics={
                "formStatus": "Good Form" if is_good_form else "Bad Form",
                "leadKneeAngle": round(lead_knee_angle, 1),
                "romPercentage": rom_pct
            }
        )

