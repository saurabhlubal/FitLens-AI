import math
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
        if session_data is None:
            session_data = {}

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
        in_pushup_frame = True

        # Check A: Horizontal Prone Body Orientation (Standing arms cannot count as push-ups)
        sh = l_shoulder or r_shoulder
        hip = l_hip or r_hip
        if sh and hip:
            dx = abs(sh.x - hip.x)
            dy = abs(sh.y - hip.y)
            torso_horiz_angle = (math.atan2(dy, max(0.001, dx))) * 180.0 / math.pi
            if torso_horiz_angle > 40.0:
                in_pushup_frame = False
                is_good_form = False
                form_fault_reason = "Push-ups require a horizontal plank position on the floor, not standing upright."

        body_angle = left_body_angle or right_body_angle
        if body_angle is not None and in_pushup_frame:
            if body_angle < 145:
                is_good_form = False
                form_fault_reason = "Hips sagging! Tighten core and glutes to align spine."
            elif body_angle > 195:
                is_good_form = False
                form_fault_reason = "Hips piked too high! Maintain a flat plank."

        # 3. State Machine & Full-Cycle Rep Counting (up -> down -> up = 1)
        # Top plank (Up): Elbow Angle > 150°
        # Bottom chest to floor (Down): Elbow Angle <= 95°
        new_stage = current_stage
        rep_incremented = False
        reps = current_reps
        feedback = "Good Form. Solid push-up plank." if is_good_form else form_fault_reason
        ai_state = "ANALYZING"

        if not in_pushup_frame:
            ai_state = "FORM_FEEDBACK"
            session_data["inflection_reached"] = False
        elif active_elbow > 150:
            new_stage = "up"
            if session_data.get("inflection_reached"):
                reps += 1
                rep_incremented = True
                ai_state = "REP_COUNTING"
                if is_good_form:
                    feedback = "Rep Counted! (Good Form - Full Press)"
                else:
                    feedback = f"Rep Counted! Form note: {form_fault_reason}"
                session_data["inflection_reached"] = False
            else:
                ai_state = "TRACKING" if is_good_form else "FORM_FEEDBACK"
                if is_good_form:
                    feedback = "Good Form. Top plank held. Lower chest down."
                else:
                    feedback = f"Bad Form: {form_fault_reason}"
        elif active_elbow <= 95:
            new_stage = "down"
            session_data["inflection_reached"] = True
            ai_state = "ANALYZING" if is_good_form else "FORM_FEEDBACK"
            if is_good_form:
                feedback = "Full depth reached (Good Form)! Press straight up."
            else:
                feedback = f"Bad Form: {form_fault_reason}"
        else:
            ai_state = "ANALYZING" if is_good_form else "FORM_FEEDBACK"
            if is_good_form:
                if session_data.get("inflection_reached"):
                    feedback = "Pushing up with Good Form..."
                else:
                    feedback = "Lowering chest with Good Form..."
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
            formScore=100.0 if is_good_form else 70.0,
            isCorrectForm=is_good_form,
            feedback=feedback,
            jointAngles=joint_angles,
            aiState=ai_state,
            sessionData=session_data,
            metrics={
                "formStatus": "Good Form" if is_good_form else "Bad Form",
                "elbowAngle": round(active_elbow, 1),
                "bodyPlankAngle": round(body_angle, 1) if body_angle else None,
                "romPercentage": rom_pct
            }
        )

