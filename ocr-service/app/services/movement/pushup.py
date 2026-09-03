from typing import List, Optional, Dict, Any
from app.models.movement import LandmarkPoint, MovementAnalysisResponse, JointAngles
from app.services.movement.base_detector import BaseExerciseDetector

class PushUpDetector(BaseExerciseDetector):
    """
    Push-Up Movement & Repetition Detector
    MediaPipe Pose Landmark Indexes:
    Left: Shoulder (11), Elbow (13), Wrist (15), Hip (23), Ankle (27)
    Right: Shoulder (12), Elbow (14), Wrist (16), Hip (24), Ankle (28)
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

        # 2. State Machine & Rep Counting
        # Top plank (Up): Elbow Angle > 155°
        # Bottom chest to floor (Down): Elbow Angle < 90°
        new_stage = current_stage
        rep_incremented = False
        reps = current_reps
        form_score = 95.0
        is_correct = True
        feedback = "Solid push-up plank. Lower under control."

        if active_elbow > 155:
            if current_stage == "down":
                new_stage = "up"
                reps += 1
                rep_incremented = True
                feedback = "Rep completed! Excellent push."
            else:
                new_stage = "up"
                feedback = "Plank held. Lower your chest down."
        elif active_elbow <= 90:
            new_stage = "down"
            feedback = "Full depth reached! Press straight up."
        elif 90 < active_elbow <= 140:
            if current_stage == "up":
                feedback = "Lowering down..."
            else:
                feedback = "Pushing up..."

        # Body alignment check (avoid hip sag or pike)
        body_angle = left_body_angle or right_body_angle
        if body_angle is not None and (body_angle < 150 or body_angle > 195):
            form_score -= 30.0
            is_correct = False
            feedback = "Keep your core tight! Don't let hips sag or pike up."

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
            formScore=max(form_score, 10.0),
            isCorrectForm=is_correct,
            feedback=feedback,
            jointAngles=joint_angles,
            metrics={
                "elbowAngle": round(active_elbow, 1),
                "bodyPlankAngle": round(body_angle, 1) if body_angle else None,
                "romPercentage": max(0, min(100, int((160 - active_elbow) / (160 - 80) * 100)))
            }
        )
