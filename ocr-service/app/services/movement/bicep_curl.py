from typing import List, Optional, Dict, Any
from app.models.movement import LandmarkPoint, MovementAnalysisResponse, JointAngles
from app.services.movement.base_detector import BaseExerciseDetector

class BicepCurlDetector(BaseExerciseDetector):
    """
    Bicep Curl Movement & Repetition Detector
    MediaPipe Pose Landmark Indexes:
    Left: Shoulder (11), Elbow (13), Wrist (15)
    Right: Shoulder (12), Elbow (14), Wrist (16)
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
        session_data = session_data or {}
        
        # 1. Extract Arm Keypoints
        l_shoulder = self.get_landmark(landmarks, 11)
        l_elbow = self.get_landmark(landmarks, 13)
        l_wrist = self.get_landmark(landmarks, 15)

        r_shoulder = self.get_landmark(landmarks, 12)
        r_elbow = self.get_landmark(landmarks, 14)
        r_wrist = self.get_landmark(landmarks, 16)

        left_angle = self.calculate_angle(l_shoulder, l_elbow, l_wrist)
        right_angle = self.calculate_angle(r_shoulder, r_elbow, r_wrist)

        # Determine active arm (or take average/primary visible arm)
        active_angle = None
        side = "both"
        if left_angle is not None and right_angle is not None:
            active_angle = min(left_angle, right_angle)  # take more flexed arm
        elif left_angle is not None:
            active_angle = left_angle
            side = "left"
        elif right_angle is not None:
            active_angle = right_angle
            side = "right"
        else:
            return MovementAnalysisResponse(
                success=False,
                exerciseName=self.name,
                stage=current_stage,
                repetitionCount=current_reps,
                repIncremented=False,
                formScore=0.0,
                isCorrectForm=False,
                feedback="Arm landmarks not clearly visible. Step into view.",
            )

        # 2. State Machine & Rep Counting
        # Full Extension (Down): Angle > 155°
        # Full Flexion/Curl (Up): Angle < 45°
        new_stage = current_stage
        rep_incremented = False
        reps = current_reps
        form_score = 95.0
        is_correct = True
        feedback = "Good form! Keep going."

        if active_angle > 155:
            new_stage = "down"
            feedback = "Arm extended. Ready for next rep."
        elif active_angle < 50:
            if current_stage == "down":
                new_stage = "up"
                reps += 1
                rep_incremented = True
                feedback = "Rep completed! Great contraction."
            else:
                new_stage = "up"
                feedback = "Holding at the top."
        elif 50 <= active_angle <= 155:
            if current_stage == "down":
                feedback = "Curling up... Squeeze your biceps."
            else:
                feedback = "Lowering under control..."

        # Form Checks
        # Check shoulder drift (elbow swinging forward excessively)
        hip = self.get_landmark(landmarks, 23 if side == "left" else 24)
        shoulder = l_shoulder if side == "left" else r_shoulder
        elbow = l_elbow if side == "left" else r_elbow
        
        shoulder_angle = self.calculate_angle(hip, shoulder, elbow) if (hip and shoulder and elbow) else None
        if shoulder_angle is not None and shoulder_angle > 35:
            form_score -= 20.0
            is_correct = False
            feedback = "Keep your elbows pinned to your sides! Avoid swinging."

        joint_angles = JointAngles(
            leftElbow=left_angle,
            rightElbow=right_angle,
            leftShoulder=shoulder_angle if side == "left" else None,
            rightShoulder=shoulder_angle if side == "right" else None
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
                "flexionAngle": active_angle,
                "detectedSide": side,
                "romPercentage": max(0, min(100, int((160 - active_angle) / (160 - 40) * 100)))
            }
        )
