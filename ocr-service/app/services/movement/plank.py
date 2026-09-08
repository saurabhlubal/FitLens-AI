from typing import List, Optional, Dict, Any
from app.models.movement import LandmarkPoint, MovementAnalysisResponse, JointAngles
from app.services.movement.base_detector import BaseExerciseDetector

class PlankDetector(BaseExerciseDetector):
    """
    Plank Hold Duration & Form Stability Detector
    Form-Enforced Hold Progression (Good Form vs Bad Form):
    - Structure Check: Neutral horizontal spine from shoulders through hips and ankles.
    - Hold Verification: Spine angle between 155° and 195°.
    - Form Verification: No hip sag (< 155°) and no hip pike (> 195°).
    - Discrete Form State: Strictly "Good Form" or "Bad Form". Duration seconds accumulate ONLY in Good Form.
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
        session_data = session_data or {}

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

        # 2. Structural Frame & Plank Stability Validation
        is_good_form = True
        form_fault_reason = None

        if body_angle < 155:
            is_good_form = False
            form_fault_reason = "Hips sagging down! Engage glutes and core to protect spine."
        elif body_angle > 195:
            is_good_form = False
            form_fault_reason = "Hips piked too high! Lower hips into a straight rigid line."

        # 3. Holding Accumulator
        ticks = session_data.get("hold_ticks", 0) + 1
        session_data["hold_ticks"] = ticks
        reps = current_reps
        rep_incremented = False

        feedback = "Good Form. Solid plank posture! Core engaged, hold steady." if is_good_form else form_fault_reason

        # Accumulate 1 second/point every ~10 stable frames in Good Form
        if ticks % 10 == 0 and is_good_form:
            reps += 1
            rep_incremented = True
            feedback = f"Hold active! {reps}s locked in with Good Form."

        joint_angles = JointAngles(
            backAngle=body_angle
        )

        return MovementAnalysisResponse(
            success=True,
            exerciseName=self.name,
            stage="holding" if is_good_form else "warning",
            repetitionCount=reps,
            repIncremented=rep_incremented,
            formScore=100.0 if is_good_form else 0.0,
            isCorrectForm=is_good_form,
            feedback=feedback,
            jointAngles=joint_angles,
            metrics={
                "formStatus": "Good Form" if is_good_form else "Bad Form",
                "spineAlignmentAngle": round(body_angle, 1),
                "holdDurationSec": reps,
                "romPercentage": 100 if is_good_form else 50
            }
        )
