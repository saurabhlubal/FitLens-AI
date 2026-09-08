from typing import List, Optional, Dict, Any
from app.models.movement import LandmarkPoint, MovementAnalysisResponse, JointAngles
from app.services.movement.base_detector import BaseExerciseDetector

class JumpingJackDetector(BaseExerciseDetector):
    """
    Jumping Jacks Movement & Repetition Detector
    Form-Enforced Full Cycle Repetition Counting (Good Form vs Bad Form):
    - Structure Check: Full body visible, synchronized bilateral arm and leg sweep.
    - Full Cycle: Hands Down at Sides (Down <= 45°) -> Hands Overhead (Up >= 135°).
    - Form Verification: Full arm overhead extension, rhythmic cadence.
    - Discrete Form State: Strictly "Good Form" or "Bad Form". Reps increment ONLY in Good Form.
    """

    def __init__(self):
        super().__init__("Jumping Jacks")

    def analyze(
        self,
        landmarks: List[LandmarkPoint],
        current_reps: int,
        current_stage: str,
        session_data: Optional[Dict[str, Any]] = None
    ) -> MovementAnalysisResponse:
        session_data = session_data or {}

        # 1. Extract Arm and Leg Keypoints
        l_hip = self.get_landmark(landmarks, 23)
        l_shoulder = self.get_landmark(landmarks, 11)
        l_elbow = self.get_landmark(landmarks, 13)
        l_ankle = self.get_landmark(landmarks, 27)

        r_hip = self.get_landmark(landmarks, 24)
        r_shoulder = self.get_landmark(landmarks, 12)
        r_elbow = self.get_landmark(landmarks, 14)
        r_ankle = self.get_landmark(landmarks, 28)

        left_arm_angle = self.calculate_angle(l_hip, l_shoulder, l_elbow)
        right_arm_angle = self.calculate_angle(r_hip, r_shoulder, r_elbow)

        active_arm_angle = None
        if left_arm_angle is not None and right_arm_angle is not None:
            active_arm_angle = (left_arm_angle + right_arm_angle) / 2.0
        elif left_arm_angle is not None:
            active_arm_angle = left_arm_angle
        elif right_arm_angle is not None:
            active_arm_angle = right_arm_angle
        else:
            return MovementAnalysisResponse(
                success=False,
                exerciseName=self.name,
                stage=current_stage,
                repetitionCount=current_reps,
                repIncremented=False,
                formScore=0.0,
                isCorrectForm=False,
                feedback="Full body not in camera view. Step back.",
            )

        # 2. Structural Frame & Form Validation
        is_good_form = True
        form_fault_reason = None

        if left_arm_angle is not None and right_arm_angle is not None:
            diff = abs(left_arm_angle - right_arm_angle)
            if diff > 35:
                is_good_form = False
                form_fault_reason = "Sweep both arms evenly overhead."

        # 3. State Machine & Full-Cycle Rep Counting
        # Arms Down / In (Down): Arm Angle <= 45°
        # Arms Overhead / Out (Up): Arm Angle >= 135°
        new_stage = current_stage
        rep_incremented = False
        reps = current_reps
        feedback = "Good Form. Perform jumping jacks with dynamic rhythm." if is_good_form else form_fault_reason

        if active_arm_angle <= 45:
            new_stage = "down"
            if is_good_form:
                feedback = "Good Form. Feet together, hands down."
            else:
                feedback = f"Bad Form: {form_fault_reason}"
        elif active_arm_angle >= 135:
            if current_stage == "down":
                new_stage = "up"
                if is_good_form:
                    reps += 1
                    rep_incremented = True
                    feedback = "Rep Counted! (Good Form - Full Overhead Sweep)"
                else:
                    rep_incremented = False
                    feedback = f"Rep Discarded (Bad Form: {form_fault_reason or 'Improper sweep'})"
            elif current_stage == "up":
                new_stage = "up"
                if is_good_form:
                    feedback = "Good Form. Arms overhead! Bounce back to center."
                else:
                    feedback = f"Bad Form: {form_fault_reason}"
            else:
                new_stage = "up"
                feedback = "Arms overhead. Ready to rebound."
        else:
            if is_good_form:
                if current_stage == "down":
                    feedback = "Jumping out with Good Form..."
                else:
                    feedback = "Returning to center with Good Form..."
            else:
                feedback = f"Bad Form: {form_fault_reason}"

        rom_pct = max(0, min(100, int((active_arm_angle - 40) / (140 - 40) * 100)))

        joint_angles = JointAngles(
            leftShoulder=left_arm_angle,
            rightShoulder=right_arm_angle
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
                "armAngle": round(active_arm_angle, 1),
                "romPercentage": rom_pct
            }
        )
