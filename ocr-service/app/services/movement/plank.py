from typing import List, Optional, Dict, Any
import time
from app.models.movement import LandmarkPoint, MovementAnalysisResponse, JointAngles
from app.services.movement.base_detector import BaseExerciseDetector

class PlankDetector(BaseExerciseDetector):
    """
    Plank Hold Duration & Form Stability Detector (Timer-Based).
    
    Robustness Features:
    1. Dual Frame Compatibility:
       - Full-Body Mode: Assesses full head-to-heel spine angle (155° - 195°) via Shoulders -> Hips -> Ankles.
       - Shoulder / Upper-Body Mode (Webcam close-up): When only upper body is visible, tracks
         horizontal shoulder level, shoulder-to-elbow stack, and shoulder-to-hip alignment.
    2. Real-Time Timer Accumulation:
       - Tracks hold duration strictly in seconds.
       - Increments hold timer ONLY when form is "Good Form" & stable.
       - Automatically pauses hold timer and alerts user when form degrades (hip sag / pike or shoulder tilt).
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
        now = time.time()

        # 1. Extract Keypoints with confidence filtering
        l_shoulder = self.get_landmark(landmarks, 11, min_visibility=0.45)
        r_shoulder = self.get_landmark(landmarks, 12, min_visibility=0.45)
        l_elbow = self.get_landmark(landmarks, 13, min_visibility=0.40)
        r_elbow = self.get_landmark(landmarks, 14, min_visibility=0.40)
        l_hip = self.get_landmark(landmarks, 23, min_visibility=0.40)
        r_hip = self.get_landmark(landmarks, 24, min_visibility=0.40)
        l_ankle = self.get_landmark(landmarks, 27, min_visibility=0.35)
        r_ankle = self.get_landmark(landmarks, 28, min_visibility=0.35)

        # Baseline: At least shoulders must be clearly visible
        if not l_shoulder and not r_shoulder:
            return MovementAnalysisResponse(
                success=False,
                exerciseName=self.name,
                stage="paused",
                repetitionCount=current_reps,
                repIncremented=False,
                formScore=0.0,
                isCorrectForm=False,
                feedback="Shoulders not detected. Adjust camera to face your upper body or side profile.",
                metrics={
                    "isTimerExercise": True,
                    "holdDurationSec": current_reps,
                    "formStatus": "Adjust Position",
                    "mode": "undetected"
                }
            )

        # 2. Determine Detection Mode: Full-Body vs Upper-Body / Shoulder Mode
        has_ankles = (l_ankle is not None or r_ankle is not None)
        has_hips = (l_hip is not None or r_hip is not None)
        is_good_form = True
        form_fault_reason = None
        spine_angle = None
        mode = "full_body" if (has_hips and has_ankles) else ("upper_body" if has_hips else "shoulder_only")

        # --- A. FULL BODY EVALUATION ---
        if mode == "full_body":
            left_spine = self.calculate_angle(l_shoulder, l_hip, l_ankle)
            right_spine = self.calculate_angle(r_shoulder, r_hip, r_ankle)

            if left_spine is not None and right_spine is not None:
                spine_angle = (left_spine + right_spine) / 2.0
            elif left_spine is not None:
                spine_angle = left_spine
            elif right_spine is not None:
                spine_angle = right_spine

            if spine_angle is not None:
                if spine_angle < 155:
                    is_good_form = False
                    form_fault_reason = "Hips sagging! Engage core and glutes to lift hips."
                elif spine_angle > 195:
                    is_good_form = False
                    form_fault_reason = "Hips piked too high! Lower hips into a flat neutral line."

        # --- B. UPPER BODY / SHOULDER-TO-HIP EVALUATION ---
        elif mode == "upper_body":
            # Torso inclination / shoulder level check
            if l_shoulder and r_shoulder:
                shoulder_tilt = abs(l_shoulder.y - r_shoulder.y)
                if shoulder_tilt > 0.15:
                    is_good_form = False
                    form_fault_reason = "Shoulders uneven! Keep shoulders squared and level."

            # Evaluate shoulder-to-hip alignment
            hip = l_hip or r_hip
            shoulder = l_shoulder or r_shoulder
            if shoulder and hip:
                # In horizontal plank, vertical height difference between shoulder and hip should be small
                torso_y_diff = abs(shoulder.y - hip.y)
                if torso_y_diff > 0.30:
                    is_good_form = False
                    form_fault_reason = "Torso out of alignment! Keep shoulders and hips at equal height."

        # --- C. SHOULDER ONLY WEBCAM VIEW ---
        else:
            # When camera only sees shoulders & upper chest
            if l_shoulder and r_shoulder:
                shoulder_tilt = abs(l_shoulder.y - r_shoulder.y)
                if shoulder_tilt > 0.12:
                    is_good_form = False
                    form_fault_reason = "Shoulders tilting! Maintain firm, symmetrical shoulder engagement."
            
            # Check elbow stack if visible
            if (l_shoulder and l_elbow) or (r_shoulder and r_elbow):
                s = l_shoulder or r_shoulder
                e = l_elbow or r_elbow
                if e.y < s.y:
                    is_good_form = False
                    form_fault_reason = "Elbows raised above shoulders! Plant forearms firmly under shoulders."

        # 3. Time-Based Hold Accumulator (Seconds)
        # Uses timestamp delta to accumulate hold time precisely regardless of frame rate
        last_hold_time = session_data.get("last_hold_time", now)
        hold_accumulator = session_data.get("hold_accumulator", float(current_reps))
        dt = min(now - last_hold_time, 0.25)  # Cap max dt to avoid jumps when resuming
        session_data["last_hold_time"] = now

        rep_incremented = False
        if is_good_form:
            hold_accumulator += dt
            session_data["hold_accumulator"] = hold_accumulator
            new_seconds = int(hold_accumulator)
            if new_seconds > current_reps:
                rep_incremented = True
                current_reps = new_seconds

        # 4. Form Cues & Feedback
        if is_good_form:
            feedback = f"Hold active! {current_reps}s locked in with Good Form."
        else:
            feedback = f"Timer Paused: {form_fault_reason}"

        joint_angles = JointAngles(
            backAngle=round(spine_angle, 1) if spine_angle else None
        )

        return MovementAnalysisResponse(
            success=True,
            exerciseName=self.name,
            stage="holding" if is_good_form else "paused",
            repetitionCount=current_reps,
            repIncremented=rep_incremented,
            formScore=100.0 if is_good_form else 0.0,
            isCorrectForm=is_good_form,
            feedback=feedback,
            jointAngles=joint_angles,
            metrics={
                "isTimerExercise": True,
                "formStatus": "Good Form" if is_good_form else "Bad Form",
                "holdDurationSec": current_reps,
                "formattedTime": f"{current_reps // 60:02d}:{current_reps % 60:02d}",
                "spineAlignmentAngle": round(spine_angle, 1) if spine_angle else None,
                "detectionMode": mode,
                "romPercentage": 100 if is_good_form else 30
            }
        )
