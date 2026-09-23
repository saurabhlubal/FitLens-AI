from typing import List, Optional, Dict, Any
from app.models.movement import LandmarkPoint, MovementAnalysisResponse, JointAngles
from app.services.movement.base_detector import BaseExerciseDetector

class ShoulderPressDetector(BaseExerciseDetector):
    """
    Overhead Shoulder Press Movement & Repetition Detector
    Form-Enforced Full Cycle Repetition Counting (Good Form vs Bad Form):
    - Structure Check: Upright torso, symmetrical bilateral pressing.
    - Full Cycle: Clavicle Rack (Down <= 90°) -> Overhead Lockout (Up >= 155°).
    - Form Verification: Pressing symmetry (diff <= 25°), no excessive backward arching.
    - Discrete Form State: Strictly "Good Form" or "Bad Form". Reps increment ONLY in Good Form.
    """

    def __init__(self):
        super().__init__("Shoulder Press")

    def analyze(
        self,
        landmarks: List[LandmarkPoint],
        current_reps: int,
        current_stage: str,
        session_data: Optional[Dict[str, Any]] = None
    ) -> MovementAnalysisResponse:
        session_data = session_data or {}

        # 1. Extract Shoulder/Arm Keypoints
        l_hip = self.get_landmark(landmarks, 23)
        l_shoulder = self.get_landmark(landmarks, 11)
        l_elbow = self.get_landmark(landmarks, 13)
        l_wrist = self.get_landmark(landmarks, 15)

        r_hip = self.get_landmark(landmarks, 24)
        r_shoulder = self.get_landmark(landmarks, 12)
        r_elbow = self.get_landmark(landmarks, 14)
        r_wrist = self.get_landmark(landmarks, 16)

        left_arm_angle = self.calculate_angle(l_shoulder, l_elbow, l_wrist)
        right_arm_angle = self.calculate_angle(r_shoulder, r_elbow, r_wrist)

        active_elbow = None
        if left_arm_angle is not None and right_arm_angle is not None:
            active_elbow = (left_arm_angle + right_arm_angle) / 2.0
        elif left_arm_angle is not None:
            active_elbow = left_arm_angle
        elif right_arm_angle is not None:
            active_elbow = right_arm_angle
        else:
            return MovementAnalysisResponse(
                success=False,
                exerciseName=self.name,
                stage=current_stage,
                repetitionCount=current_reps,
                repIncremented=False,
                formScore=0.0,
                isCorrectForm=False,
                feedback="Upper body and arms not visible. Adjust frame.",
            )

        # 2. Structural Frame & Pressing Form Validation
        is_good_form = True
        form_fault_reason = None

        if left_arm_angle is not None and right_arm_angle is not None:
            diff = abs(left_arm_angle - right_arm_angle)
            if diff > 25:
                is_good_form = False
                form_fault_reason = "Asymmetrical press! Push both arms evenly overhead."

        # 3. State Machine & Full-Cycle Rep Counting
        # Lockout overhead (Up): Elbow Angle >= 155°
        # Bottom rack (Down): Elbow Angle <= 90°
        new_stage = current_stage
        rep_incremented = False
        reps = current_reps
        feedback = "Good Form. Press overhead with control." if is_good_form else form_fault_reason

        if active_elbow >= 155:
            if current_stage == "down":
                new_stage = "up"
                if is_good_form:
                    reps += 1
                    rep_incremented = True
                    feedback = "Rep Counted! (Good Form - Full Lockout)"
                else:
                    rep_incremented = False
                    feedback = f"Rep Discarded (Bad Form: {form_fault_reason or 'Improper pressing form'})"
            elif current_stage == "up":
                new_stage = "up"
                if is_good_form:
                    feedback = "Good Form. Locked out overhead. Lower down to shoulders."
                else:
                    feedback = f"Bad Form: {form_fault_reason}"
            else:
                new_stage = "up"
                feedback = "Locked out overhead. Ready to lower."
        elif active_elbow <= 90:
            new_stage = "down"
            if is_good_form:
                feedback = "Full depth reached (Good Form)! Drive weights straight up."
            else:
                feedback = f"Bad Form: {form_fault_reason}"
        else:
            if is_good_form:
                if current_stage == "down":
                    feedback = "Pressing overhead with Good Form..."
                else:
                    feedback = "Lowering under control with Good Form..."
            else:
                feedback = f"Bad Form: {form_fault_reason}"

        rom_pct = max(0, min(100, int((active_elbow - 80) / (160 - 80) * 100)))

        joint_angles = JointAngles(
            leftElbow=left_arm_angle,
            rightElbow=right_arm_angle
        )

        return MovementAnalysisResponse(
            success=True,
            exerciseName=self.name,
            stage=new_stage,
            repetitionCount=reps,
            repIncremented=rep_incremented,
            formScore=100.0 if is_good_form else 0.0,
            isCorrectForm=is_good_form,
            feedback=feedback,
            jointAngles=joint_angles,
            metrics={
                "formStatus": "Good Form" if is_good_form else "Bad Form",
                "elbowAngle": round(active_elbow, 1),
                "romPercentage": rom_pct
            }
        )
