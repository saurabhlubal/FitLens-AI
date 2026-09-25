from typing import List, Optional, Dict, Any
from app.models.movement import LandmarkPoint, MovementAnalysisResponse, JointAngles
from app.services.movement.base_detector import BaseExerciseDetector

class BicepCurlDetector(BaseExerciseDetector):
    """
    Bicep Curl Movement & Repetition Detector
    Full Cycle Rep Counting with Form Validation:
    - Extended bottom (Down): angle >= 140°
    - Peak curl (Up): angle <= 50°
    - Rep increment: triggers exactly when moving from 'down' to 'up' in Good Form.
    - Good Form verification: Elbows below shoulders, no severe arm flaring/swinging.
    """

    def __init__(self):
        super().__init__("Bicep Curl")

    def analyze(
        self,
        landmarks: List[LandmarkPoint],
        current_reps: int,
        current_stage: str,
        session_data: Optional[Dict[str, Any]] = None
    ) -> MovementAnalysisResponse:
        if session_data is None:
            session_data = {}
        
        # 1. Extract Arm and Torso Keypoints
        l_shoulder = self.get_landmark(landmarks, 11)
        l_elbow = self.get_landmark(landmarks, 13)
        l_wrist = self.get_landmark(landmarks, 15)
        l_hip = self.get_landmark(landmarks, 23)

        r_shoulder = self.get_landmark(landmarks, 12)
        r_elbow = self.get_landmark(landmarks, 14)
        r_wrist = self.get_landmark(landmarks, 16)
        r_hip = self.get_landmark(landmarks, 24)

        # Calculate Elbow Flexion Angles (Shoulder -> Elbow -> Wrist)
        left_elbow_angle = self.calculate_angle(l_shoulder, l_elbow, l_wrist)
        right_elbow_angle = self.calculate_angle(r_shoulder, r_elbow, r_wrist)

        # Calculate Upper Arm / Torso Angles (Hip -> Shoulder -> Elbow) to check elbow anchor
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
                feedback="Step into the camera frame so your shoulders, elbows, and hands are visible.",
            )

        # Select primary active arm
        side = "both"
        active_angle = None
        active_shoulder_angle = None

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

        # 2. Structural Frame & Anatomical Anchor Validation
        shoulder = l_shoulder if side == "left" else r_shoulder
        elbow = l_elbow if side == "left" else r_elbow

        in_bicep_frame = True
        is_good_form = True
        form_fault_reason = None

        # Check A: Elbows must be below shoulders (cannot wave hands up in the air with high elbows)
        if shoulder and elbow and elbow.y < shoulder.y - 0.05:
            in_bicep_frame = False
            is_good_form = False
            form_fault_reason = "Elbow raised too high! Anchor elbows at your ribs."

        # Check B: Upper arm / Torso angle (Shoulder drift / swinging vs Arm Raise)
        if active_shoulder_angle is not None:
            if active_shoulder_angle > 55:
                # Gross arm raise: whole upper arm is swinging up towards shoulder level
                in_bicep_frame = False
                is_good_form = False
                form_fault_reason = "Arm raise detected! Anchor your elbows near your torso to curl."
            elif active_shoulder_angle > 35:
                # Mild elbow drift / swing: valid curl movement, but form coaching feedback
                is_good_form = False
                form_fault_reason = "Keep elbows pinned to your ribs. Avoid swinging."

        # 3. State Machine & Full-Cycle Multi-Rep Counting (down -> up -> down = 1)
        # Extension (Down): Elbow Angle >= 140° (Natural full extension)
        # Peak Flexion (Up): Elbow Angle <= 50° (Full curl)
        new_stage = current_stage
        rep_incremented = False
        reps = current_reps
        feedback = "Good Form. Keep going!" if is_good_form else form_fault_reason
        ai_state = "ANALYZING"

        if in_bicep_frame:
            if active_angle >= 140:
                new_stage = "down"
                if session_data.get("inflection_reached"):
                    # Completed full cycle: down -> up -> down!
                    reps += 1
                    rep_incremented = True
                    ai_state = "REP_COUNTING"
                    if is_good_form:
                        feedback = "Rep Counted! (Good Form - Full Extension)"
                    else:
                        feedback = f"Rep Counted! Form note: {form_fault_reason}"
                    session_data["inflection_reached"] = False
                else:
                    # Resting or starting at bottom extension
                    ai_state = "TRACKING" if is_good_form else "FORM_FEEDBACK"
                    if is_good_form:
                        feedback = "Good Form. Arms extended down. Ready to curl."
                    else:
                        feedback = f"Bad Form: {form_fault_reason}"
            elif active_angle <= 50:
                new_stage = "up"
                session_data["inflection_reached"] = True
                ai_state = "ANALYZING" if is_good_form else "FORM_FEEDBACK"
                if is_good_form:
                    feedback = "Holding peak contraction. Lower arms down to full extension."
                else:
                    feedback = f"Bad Form: {form_fault_reason}"
            else:
                # In transit between 50° and 140°
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
            feedback = f"Bad Form: {form_fault_reason or 'Align arms into bicep curl structure.'}"

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
            formScore=100.0 if is_good_form else (0.0 if not in_bicep_frame else 70.0),
            isCorrectForm=is_good_form,
            feedback=feedback,
            jointAngles=joint_angles,
            aiState=ai_state,
            sessionData=session_data,
            metrics={
                "formStatus": "Good Form" if is_good_form else "Bad Form",
                "flexionAngle": round(active_angle, 1),
                "detectedSide": side,
                "inBicepFrame": in_bicep_frame,
                "romPercentage": rom_pct
            }
        )
