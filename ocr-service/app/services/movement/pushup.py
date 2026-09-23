from typing import List, Optional, Dict, Any
from app.models.movement import LandmarkPoint, MovementAnalysisResponse, JointAngles
from app.services.movement.base_detector import BaseExerciseDetector

class PushUpDetector(BaseExerciseDetector):
    """
    Push-Up Movement & Repetition Detector
    Form-Enforced Full Cycle Repetition Counting (Good Form vs Bad Form):
    - Structure Check: Solid plank posture (Shoulder -> Hip -> Ankle straight line).
    - Full Cycle: Top Plank (Up > 150°) -> Bottom Chest to Floor (Down <= 95°).
    - Form Verification: Core braced, no hip sag (body angle < 150°) or hip pike (body angle > 195°).
    - Discrete Form State: Strictly "Good Form" or "Bad Form". Reps increment ONLY in Good Form.
    """

    def __init__(self):
        super().__init__("Push-up")

    def analyze(
        self,
        landmarks: List[LandmarkPoint],
        current_reps: int,
        current_stage: str,
        session_data: Optional[Dict[str, Any]] = None
    ) -> MovementAnalysisResponse:
        session_data = session_data or {}

        # 1. Extract Arm & Torso Keypoints
        l_shoulder = self.get_landmark(landmarks, 11)
        l_elbow = self.get_landmark(landmarks, 13)
        l_wrist = self.get_landmark(landmarks, 15)
        l_hip = self.get_landmark(landmarks, 23)
        l_ankle = self.get_landmark(landmarks, 27)

        r_shoulder = self.get_landmark(landmarks, 12)
        r_elbow = self.get_landmark(landmarks, 14)
        r_wrist = self.get_landmark(landmarks, 16)
        r_hip = self.get_landmark(landmarks, 24)
        r_ankle = self.get_landmark(landmarks, 28)

        left_arm_angle = self.calculate_angle(l_shoulder, l_elbow, l_wrist)
        right_arm_angle = self.calculate_angle(r_shoulder, r_elbow, r_wrist)

        # Body alignment angle (Shoulder -> Hip -> Ankle)
        left_body_angle = self.calculate_angle(l_shoulder, l_hip, l_ankle)
        right_body_angle = self.calculate_angle(r_shoulder, r_hip, r_ankle)

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
                feedback="Upper body not visible. Adjust camera angle.",
            )

        # 2. Structural Frame & Plank Form Validation
        is_good_form = True
        form_fault_reason = None

        body_angle = left_body_angle or right_body_angle
        if body_angle is not None:
            if body_angle < 145:
                is_good_form = False
                form_fault_reason = "Hips sagging! Tighten core and glutes to align spine."
            elif body_angle > 195:
                is_good_form = False
                form_fault_reason = "Hips piked too high! Maintain a flat plank."

        # 3. State Machine & Full-Cycle Rep Counting
        # Top plank (Up): Elbow Angle > 150°
        # Bottom chest to floor (Down): Elbow Angle <= 95°
        new_stage = current_stage
        rep_incremented = False
        reps = current_reps
        feedback = "Good Form. Solid push-up plank." if is_good_form else form_fault_reason

        if active_elbow > 150:
            if current_stage == "down":
                new_stage = "up"
                if is_good_form:
                    reps += 1
                    rep_incremented = True
                    feedback = "Rep Counted! (Good Form - Full Press)"
                else:
                    rep_incremented = False
                    feedback = f"Rep Discarded (Bad Form: {form_fault_reason or 'Improper plank'})"
            elif current_stage == "up":
                new_stage = "up"
                if is_good_form:
                    feedback = "Good Form. Top plank held. Lower chest down."
                else:
                    feedback = f"Bad Form: {form_fault_reason}"
            else:
                new_stage = "up"
                feedback = "Plank held. Ready for push-ups."
        elif active_elbow <= 95:
            new_stage = "down"
            if is_good_form:
                feedback = "Full depth reached (Good Form)! Press straight up."
            else:
                feedback = f"Bad Form: {form_fault_reason}"
        else:
            if is_good_form:
                if current_stage == "up":
                    feedback = "Lowering chest with Good Form..."
                else:
                    feedback = "Pushing up with Good Form..."
            else:
                feedback = f"Bad Form: {form_fault_reason}"

        rom_pct = max(0, min(100, int((160 - active_elbow) / (160 - 85) * 100)))

        joint_angles = JointAngles(
            leftElbow=left_arm_angle,
            rightElbow=right_arm_angle,
            backAngle=body_angle
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
                "bodyPlankAngle": round(body_angle, 1) if body_angle else None,
                "romPercentage": rom_pct
            }
        )
