from typing import List, Optional, Dict, Any
from app.models.movement import LandmarkPoint, MovementAnalysisResponse, JointAngles
from app.services.movement.base_detector import BaseExerciseDetector

class HammerCurlDetector(BaseExerciseDetector):
    """
    Hammer Curl Movement & Repetition Detector
    Full Cycle Rep Counting with Form Validation (Good Form vs Bad Form).
    """

    def __init__(self):
        super().__init__("Hammer Curl")

    def analyze(
        self,
        landmarks: List[LandmarkPoint],
        current_reps: int,
        current_stage: str,
        session_data: Optional[Dict[str, Any]] = None
    ) -> MovementAnalysisResponse:
        if session_data is None:
            session_data = {}

        l_shoulder = self.get_landmark(landmarks, 11)
        l_elbow = self.get_landmark(landmarks, 13)
        l_wrist = self.get_landmark(landmarks, 15)
        l_hip = self.get_landmark(landmarks, 23)

        r_shoulder = self.get_landmark(landmarks, 12)
        r_elbow = self.get_landmark(landmarks, 14)
        r_wrist = self.get_landmark(landmarks, 16)
        r_hip = self.get_landmark(landmarks, 24)

        left_elbow_angle = self.calculate_angle(l_shoulder, l_elbow, l_wrist)
        right_elbow_angle = self.calculate_angle(r_shoulder, r_elbow, r_wrist)

        left_shoulder_angle = self.calculate_angle(l_hip, l_shoulder, l_elbow) if (l_hip and l_shoulder and l_elbow) else None
        right_shoulder_angle = self.calculate_angle(r_hip, r_shoulder, r_elbow) if (r_hip and r_shoulder and r_elbow) else None

        left_arm_valid = left_elbow_angle is not None
        right_arm_valid = right_elbow_angle is not None

        if not left_arm_valid and not right_arm_valid:
            return MovementAnalysisResponse(
                success=False,
                exerciseName=self.name,
                stage=current_stage,
                repetitionCount=current_reps,
                repIncremented=False,
                formScore=0.0,
                isCorrectForm=False,
                feedback="Step into the camera frame so your arms are visible.",
            )

        active_angle = None
        active_shoulder_angle = None
        side = "both"

        if left_arm_valid and right_arm_valid:
            if left_elbow_angle <= right_elbow_angle:
                active_angle = left_elbow_angle
                active_shoulder_angle = left_shoulder_angle
                side = "left"
            else:
                active_angle = right_elbow_angle
                active_shoulder_angle = right_shoulder_angle
                side = "right"
        elif left_arm_valid:
            active_angle = left_elbow_angle
            active_shoulder_angle = left_shoulder_angle
            side = "left"
        else:
            active_angle = right_elbow_angle
            active_shoulder_angle = right_shoulder_angle
            side = "right"

        shoulder = l_shoulder if side == "left" else r_shoulder
        elbow = l_elbow if side == "left" else r_elbow

        in_hammer_frame = True
        is_good_form = True
        form_fault_reason = None

        if shoulder and elbow and elbow.y < shoulder.y - 0.05:
            in_hammer_frame = False
            is_good_form = False
            form_fault_reason = "Elbow raised too high! Keep elbows pinned at your ribs."

        # Biomechanical Note: MediaPipe Pose (33 points) does not provide reliable hand palm normal vectors
        # or knuckle articulation when holding dumbbells. Hammer Curl therefore shares the robust arm-hinge
        # identity validation of Bicep Curl without relying on noisy pseudo-grip calculations.
        if active_shoulder_angle is not None:
            if active_shoulder_angle > 55:
                in_hammer_frame = False
                is_good_form = False
                form_fault_reason = "Arm raise detected! Anchor your elbows near your torso to curl."
            elif active_shoulder_angle > 35:
                is_good_form = False
                form_fault_reason = "Avoid swinging upper arms. Pin elbows tight."

        new_stage = current_stage
        rep_incremented = False
        reps = current_reps
        feedback = "Good Form. Neutral hammer grip." if is_good_form else form_fault_reason
        ai_state = "ANALYZING"

        if in_hammer_frame:
            if active_angle >= 140:
                new_stage = "down"
                if session_data.get("inflection_reached"):
                    reps += 1
                    rep_incremented = True
                    ai_state = "REP_COUNTING"
                    if is_good_form:
                        feedback = "Rep Counted! (Good Form - Full Extension)"
                    else:
                        feedback = f"Rep Counted! Form note: {form_fault_reason}"
                    session_data["inflection_reached"] = False
                else:
                    ai_state = "TRACKING" if is_good_form else "FORM_FEEDBACK"
                    if is_good_form:
                        feedback = "Good Form. Arms fully extended. Ready to curl."
                    else:
                        feedback = f"Bad Form: {form_fault_reason}"
            elif active_angle <= 50:
                new_stage = "up"
                session_data["inflection_reached"] = True
                ai_state = "ANALYZING" if is_good_form else "FORM_FEEDBACK"
                if is_good_form:
                    feedback = "Holding peak contraction. Lower down for next rep."
                else:
                    feedback = f"Bad Form: {form_fault_reason}"
            else:
                ai_state = "ANALYZING" if is_good_form else "FORM_FEEDBACK"
                if is_good_form:
                    if session_data.get("inflection_reached"):
                        feedback = "Lowering arms down to full extension..."
                    else:
                        feedback = "Curling up with Good Form..."
                else:
                    feedback = f"Bad Form: {form_fault_reason}"
        else:
            ai_state = "FORM_FEEDBACK"
            feedback = f"Bad Form: {form_fault_reason or 'Align arms into neutral hammer curl frame.'}"

        rom_pct = max(0, min(100, int((150 - active_angle) / (150 - 45) * 100)))

        joint_angles = JointAngles(
            leftElbow=left_elbow_angle,
            rightElbow=right_elbow_angle,
            leftShoulder=left_shoulder_angle,
            rightShoulder=right_shoulder_angle
        )

        return MovementAnalysisResponse(
            success=True,
            exerciseName=self.name,
            stage=new_stage,
            repetitionCount=reps,
            repIncremented=rep_incremented,
            formScore=100.0 if is_good_form else (0.0 if not in_hammer_frame else 70.0),
            isCorrectForm=is_good_form,
            feedback=feedback,
            jointAngles=joint_angles,
            aiState=ai_state,
            sessionData=session_data,
            metrics={
                "formStatus": "Good Form" if is_good_form else "Bad Form",
                "flexionAngle": round(active_angle, 1),
                "detectedSide": side,
                "inHammerFrame": in_hammer_frame,
                "romPercentage": rom_pct
            }
        )
