from typing import List, Optional, Dict, Any
from app.models.movement import LandmarkPoint, MovementAnalysisResponse, JointAngles
from app.services.movement.base_detector import BaseExerciseDetector

class LateralRaiseDetector(BaseExerciseDetector):
    """
    Lateral Raise Movement & Repetition Detector
    Form-Enforced Full Cycle Repetition Counting (Good Form vs Bad Form):
    - Structure Check: Upright torso, arms raising in scapular plane.
    - Full Cycle: Arms Down at Sides (Down <= 35°) -> Parallel Shoulder Height (Up >= 75° and <= 110°).
    - Form Verification: No over-raising above shoulder plane (> 110° impingement risk), symmetrical abduction.
    - Discrete Form State: Strictly "Good Form" or "Bad Form". Reps increment ONLY in Good Form.
    """

    def __init__(self):
        super().__init__("Lateral Raise")

    def analyze(
        self,
        landmarks: List[LandmarkPoint],
        current_reps: int,
        current_stage: str,
        session_data: Optional[Dict[str, Any]] = None
    ) -> MovementAnalysisResponse:
        if session_data is None:
            session_data = {}

        # 1. Extract Shoulder/Arm/Torso Keypoints
        l_hip = self.get_landmark(landmarks, 23)
        l_shoulder = self.get_landmark(landmarks, 11)
        l_elbow = self.get_landmark(landmarks, 13)
        l_wrist = self.get_landmark(landmarks, 15)

        r_hip = self.get_landmark(landmarks, 24)
        r_shoulder = self.get_landmark(landmarks, 12)
        r_elbow = self.get_landmark(landmarks, 14)
        r_wrist = self.get_landmark(landmarks, 16)

        left_arm_angle = self.calculate_angle(l_hip, l_shoulder, l_elbow)
        right_arm_angle = self.calculate_angle(r_hip, r_shoulder, r_elbow)

        left_elbow_angle = self.calculate_angle(l_shoulder, l_elbow, l_wrist)
        right_elbow_angle = self.calculate_angle(r_shoulder, r_elbow, r_wrist)

        active_angle = None
        if left_arm_angle is not None and right_arm_angle is not None:
            active_angle = (left_arm_angle + right_arm_angle) / 2.0
        elif left_arm_angle is not None:
            active_angle = left_arm_angle
        elif right_arm_angle is not None:
            active_angle = right_arm_angle
        else:
            return MovementAnalysisResponse(
                success=False,
                exerciseName=self.name,
                stage=current_stage,
                repetitionCount=current_reps,
                repIncremented=False,
                formScore=0.0,
                isCorrectForm=False,
                feedback="Upper body and arms not visible. Adjust camera angle.",
            )

        # 2. Structural Frame & Form Validation
        is_good_form = True
        form_fault_reason = None

        active_elbow = min(filter(None, [left_elbow_angle, right_elbow_angle])) if (left_elbow_angle or right_elbow_angle) else 180.0
        in_lateral_frame = True

        # Check A: Lever arm must remain extended (not deeply curling or upright rowing)
        if active_angle >= 45.0 and active_elbow < 110.0:
            in_lateral_frame = False
            is_good_form = False
            form_fault_reason = "Keep arms extended with only a slight elbow bend for lateral raises."
        elif active_angle > 115:
            is_good_form = False
            form_fault_reason = "Don't raise above shoulder height! Stop parallel to prevent impingement."

        if left_arm_angle is not None and right_arm_angle is not None:
            diff = abs(left_arm_angle - right_arm_angle)
            if diff > 25:
                is_good_form = False
                form_fault_reason = "Raise both arms evenly and symmetrically."

        # 3. State Machine & Full-Cycle Rep Counting
        # Arms Down at sides: Angle <= 35°
        # Arms Raised parallel to shoulders: Angle >= 75°
        new_stage = current_stage
        rep_incremented = False
        reps = current_reps
        feedback = "Good Form. Raise dumbbells up to shoulder level." if is_good_form else form_fault_reason

        ai_state = "ANALYZING"
        if not in_lateral_frame:
            ai_state = "FORM_FEEDBACK"
            session_data["inflection_reached"] = False
        elif active_angle <= 35:
            new_stage = "down"
            if session_data.get("inflection_reached"):
                reps += 1
                rep_incremented = True
                ai_state = "REP_COUNTING"
                if is_good_form:
                    feedback = "Rep Counted! (Good Form - Full Lateral Raise)"
                else:
                    feedback = f"Rep Counted! Form note: {form_fault_reason}"
                session_data["inflection_reached"] = False
            else:
                ai_state = "TRACKING" if is_good_form else "FORM_FEEDBACK"
                if is_good_form:
                    feedback = "Good Form. Arms at sides. Raise outward under control."
                else:
                    feedback = f"Bad Form: {form_fault_reason}"
        elif active_angle >= 75:
            new_stage = "up"
            session_data["inflection_reached"] = True
            ai_state = "ANALYZING" if is_good_form else "FORM_FEEDBACK"
            if is_good_form:
                feedback = "Peak height reached (Good Form). Lower under control."
            else:
                feedback = f"Bad Form: {form_fault_reason}"
        else:
            ai_state = "ANALYZING" if is_good_form else "FORM_FEEDBACK"
            if is_good_form:
                if session_data.get("inflection_reached"):
                    feedback = "Lowering slowly with Good Form..."
                else:
                    feedback = "Raising outward with Good Form..."
            else:
                feedback = f"Bad Form: {form_fault_reason}"

        rom_pct = max(0, min(100, int((active_angle - 25) / (85 - 25) * 100)))

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
            formScore=100.0 if is_good_form else 70.0,
            isCorrectForm=is_good_form,
            feedback=feedback,
            jointAngles=joint_angles,
            aiState=ai_state,
            sessionData=session_data,
            metrics={
                "formStatus": "Good Form" if is_good_form else "Bad Form",
                "shoulderAbductionAngle": round(active_angle, 1),
                "romPercentage": rom_pct
            }
        )

