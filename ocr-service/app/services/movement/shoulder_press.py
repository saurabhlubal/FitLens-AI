from typing import List, Optional, Dict, Any
from app.models.movement import LandmarkPoint, MovementAnalysisResponse, JointAngles
from app.services.movement.base_detector import BaseExerciseDetector

class ShoulderPressDetector(BaseExerciseDetector):
    """
    Overhead Shoulder Press Movement & Repetition Detector
    MediaPipe Pose Landmark Indexes:
    Left: Hip (23), Shoulder (11), Elbow (13), Wrist (15)
    Right: Hip (24), Shoulder (12), Elbow (14), Wrist (16)
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

        # 2. State Machine & Rep Counting
        # Lockout overhead (Up): Elbow Angle > 160°
        # Bottom rack (Down): Elbow Angle < 85°
        new_stage = current_stage
        rep_incremented = False
        reps = current_reps
        form_score = 95.0
        is_correct = True
        feedback = "Press overhead with control."

        if active_elbow > 160:
            if current_stage == "down":
                new_stage = "up"
                reps += 1
                rep_incremented = True
                feedback = "Rep completed! Solid overhead lockout."
            else:
                new_stage = "up"
                feedback = "Locked out overhead. Lower down to clavicle."
        elif active_elbow <= 85:
            new_stage = "down"
            feedback = "Full depth! Drive the weight upward."
        elif 85 < active_elbow <= 145:
            if current_stage == "down":
                feedback = "Pressing overhead..."
            else:
                feedback = "Lowering under control..."

        # Check asymmetry between arms
        if left_arm_angle is not None and right_arm_angle is not None:
            diff = abs(left_arm_angle - right_arm_angle)
            if diff > 25:
                form_score -= 20.0
                is_correct = False
                feedback = "Asymmetrical press! Push both arms evenly."

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
            formScore=max(form_score, 10.0),
            isCorrectForm=is_correct,
            feedback=feedback,
            jointAngles=joint_angles,
            metrics={
                "elbowAngle": round(active_elbow, 1),
                "romPercentage": max(0, min(100, int((active_elbow - 80) / (165 - 80) * 100)))
            }
        )
