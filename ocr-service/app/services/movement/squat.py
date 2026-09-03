from typing import List, Optional, Dict, Any
from app.models.movement import LandmarkPoint, MovementAnalysisResponse, JointAngles
from app.services.movement.base_detector import BaseExerciseDetector

class SquatDetector(BaseExerciseDetector):
    """
    Squat Movement & Repetition Detector
    MediaPipe Pose Landmark Indexes:
    Left: Hip (23), Knee (25), Ankle (27), Shoulder (11)
    Right: Hip (24), Knee (26), Ankle (28), Shoulder (12)
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
        session_data = session_data or {}

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
                feedback="Legs not detected. Ensure your full body is visible.",
            )

        # 2. State Machine & Rep Counting
        # Standing (Up): Knee Angle > 160°
        # Deep Squat (Down): Knee Angle < 95°
        new_stage = current_stage
        rep_incremented = False
        reps = current_reps
        form_score = 95.0
        is_correct = True
        feedback = "Good stance! Keep your chest proud."

        if active_knee > 160:
            if current_stage == "down":
                new_stage = "up"
                reps += 1
                rep_incremented = True
                feedback = "Rep completed! Good lockout."
            else:
                new_stage = "up"
                feedback = "Standing tall. Lower your hips into a squat."
        elif active_knee <= 95:
            new_stage = "down"
            feedback = "Great depth! Drive through your heels to stand up."
        elif 95 < active_knee <= 140:
            if current_stage == "up":
                feedback = "Squatting down... Go a little lower for full depth."
            else:
                feedback = "Pushing back up..."

        # Check back angle / excessive forward lean
        torso_angle = left_hip_angle or right_hip_angle
        if torso_angle is not None and torso_angle < 65:
            form_score -= 25.0
            is_correct = False
            feedback = "Chest falling forward! Keep your spine neutral and eyes forward."

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
            formScore=max(form_score, 10.0),
            isCorrectForm=is_correct,
            feedback=feedback,
            jointAngles=joint_angles,
            metrics={
                "kneeAngle": round(active_knee, 1),
                "squatDepth": "Full" if active_knee <= 90 else "Partial",
                "romPercentage": max(0, min(100, int((170 - active_knee) / (170 - 80) * 100)))
            }
        )
