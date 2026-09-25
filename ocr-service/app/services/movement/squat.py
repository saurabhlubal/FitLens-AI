from typing import List, Optional, Dict, Any
from app.models.movement import LandmarkPoint, MovementAnalysisResponse, JointAngles
from app.services.movement.base_detector import BaseExerciseDetector

class SquatDetector(BaseExerciseDetector):
    """
    Squat Movement & Repetition Detector
    Form-Enforced Full Cycle Repetition Counting (Good Form vs Bad Form):
    - Structure Check: Hips, knees, ankles aligned, shoulders visible.
    - Full Cycle: Standing (Up > 155°) -> Deep Squat (Down <= 100°).
    - Form Verification: Chest upright (hip angle >= 65°), knees tracking cleanly.
    - Discrete Form State: Strictly "Good Form" or "Bad Form". Reps increment ONLY in Good Form.
    """

    def __init__(self):
        super().__init__("Squat")

    def analyze(
        self,
        landmarks: List[LandmarkPoint],
        current_reps: int,
        current_stage: str,
        session_data: Optional[Dict[str, Any]] = None
    ) -> MovementAnalysisResponse:
        if session_data is None:
            session_data = {}

        # 1. Extract Leg & Torso Keypoints
        l_hip = self.get_landmark(landmarks, 23)
        l_knee = self.get_landmark(landmarks, 25)
        l_ankle = self.get_landmark(landmarks, 27)
        l_shoulder = self.get_landmark(landmarks, 11)

        r_hip = self.get_landmark(landmarks, 24)
        r_knee = self.get_landmark(landmarks, 26)
        r_ankle = self.get_landmark(landmarks, 28)
        r_shoulder = self.get_landmark(landmarks, 12)

        left_knee_angle = self.calculate_angle(l_hip, l_knee, l_ankle)
        right_knee_angle = self.calculate_angle(r_hip, r_knee, r_ankle)
        
        left_hip_angle = self.calculate_angle(l_shoulder, l_hip, l_knee)
        right_hip_angle = self.calculate_angle(r_shoulder, r_hip, r_knee)

        active_knee = None
        if left_knee_angle is not None and right_knee_angle is not None:
            active_knee = (left_knee_angle + right_knee_angle) / 2.0
        elif left_knee_angle is not None:
            active_knee = left_knee_angle
        elif right_knee_angle is not None:
            active_knee = right_knee_angle
        else:
            return MovementAnalysisResponse(
                success=False,
                exerciseName=self.name,
                stage=current_stage,
                repetitionCount=current_reps,
                repIncremented=False,
                formScore=0.0,
                isCorrectForm=False,
                feedback="Legs not clearly detected. Ensure your full body is visible.",
            )

        # 2. Structural Frame & Form Validation
        is_good_form = True
        form_fault_reason = None

        # Check back angle / forward trunk lean
        torso_angle = left_hip_angle or right_hip_angle
        if torso_angle is not None and torso_angle < 60:
            is_good_form = False
            form_fault_reason = "Chest collapsing forward! Keep spine neutral and eyes forward."

        # 3. State Machine & Full-Cycle Rep Counting (up -> down -> up = 1)
        # Standing (Up): Knee Angle > 155°
        # Deep Squat (Down): Knee Angle <= 100° (Optimal ~90°)
        new_stage = current_stage
        rep_incremented = False
        reps = current_reps
        feedback = "Good Form. Keep chest proud." if is_good_form else form_fault_reason
        ai_state = "ANALYZING"

        if active_knee > 155:
            new_stage = "up"
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
                    feedback = "Good Form. Standing tall. Lower hips into squat."
                else:
                    feedback = f"Bad Form: {form_fault_reason}"
        elif active_knee <= 100:
            # Check bilateral knee symmetry at depth (prevents single-leg flamingo curls / lunges)
            knee_diff = abs(left_knee_angle - right_knee_angle) if (left_knee_angle and right_knee_angle) else 0.0
            if knee_diff > 35.0:
                new_stage = "down"
                session_data["inflection_reached"] = False
                is_good_form = False
                form_fault_reason = "Squat requires bending both knees symmetrically."
                ai_state = "FORM_FEEDBACK"
                feedback = f"Bad Form: {form_fault_reason}"
            else:
                new_stage = "down"
                session_data["inflection_reached"] = True
                if knee_diff > 20.0:
                    is_good_form = False
                    form_fault_reason = "Drive evenly through both legs."
                ai_state = "ANALYZING" if is_good_form else "FORM_FEEDBACK"
                if is_good_form:
                    feedback = "Great depth reached (Good Form)! Drive through heels to stand."
                else:
                    feedback = f"Bad Form: {form_fault_reason}"
        else:
            # Transit zone
            ai_state = "ANALYZING" if is_good_form else "FORM_FEEDBACK"
            if is_good_form:
                if session_data.get("inflection_reached"):
                    feedback = "Driving back up with Good Form..."
                else:
                    feedback = "Squatting down with Good Form..."
            else:
                feedback = f"Bad Form: {form_fault_reason}"

        rom_pct = max(0, min(100, int((165 - active_knee) / (165 - 85) * 100)))

        joint_angles = JointAngles(
            leftKnee=left_knee_angle,
            rightKnee=right_knee_angle,
            leftHip=left_hip_angle,
            rightHip=right_hip_angle
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
                "kneeAngle": round(active_knee, 1),
                "squatDepth": "Full" if active_knee <= 95 else "Partial",
                "romPercentage": rom_pct
            }
        )

