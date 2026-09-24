import BaseExerciseDetector from "./BaseExerciseDetector";

export class SquatDetector extends BaseExerciseDetector {
  constructor() {
    super("Squat");
  }

  analyze(landmarks, currentReps, currentStage, sessionData = {}) {
    // 1. Extract Leg & Torso Keypoints
    const l_hip = BaseExerciseDetector.getLandmark(landmarks, 23, 0.40);
    const l_knee = BaseExerciseDetector.getLandmark(landmarks, 25, 0.40);
    const l_ankle = BaseExerciseDetector.getLandmark(landmarks, 27, 0.35);
    const l_shoulder = BaseExerciseDetector.getLandmark(landmarks, 11, 0.40);

    const r_hip = BaseExerciseDetector.getLandmark(landmarks, 24, 0.40);
    const r_knee = BaseExerciseDetector.getLandmark(landmarks, 26, 0.40);
    const r_ankle = BaseExerciseDetector.getLandmark(landmarks, 28, 0.35);
    const r_shoulder = BaseExerciseDetector.getLandmark(landmarks, 12, 0.40);

    const left_knee_angle = BaseExerciseDetector.calculateAngle(l_hip, l_knee, l_ankle);
    const right_knee_angle = BaseExerciseDetector.calculateAngle(r_hip, r_knee, r_ankle);

    const left_hip_angle = BaseExerciseDetector.calculateAngle(l_shoulder, l_hip, l_knee);
    const right_hip_angle = BaseExerciseDetector.calculateAngle(r_shoulder, r_hip, r_knee);

    let active_knee = null;
    if (left_knee_angle !== null && right_knee_angle !== null) {
      active_knee = (left_knee_angle + right_knee_angle) / 2.0;
    } else if (left_knee_angle !== null) {
      active_knee = left_knee_angle;
    } else if (right_knee_angle !== null) {
      active_knee = right_knee_angle;
    } else {
      return {
        success: false,
        exerciseName: this.name,
        stage: currentStage,
        repetitionCount: currentReps,
        repIncremented: false,
        formScore: 0.0,
        isCorrectForm: false,
        feedback: "Legs/knees not clearly detected. Step back so your hips, knees, and ankles are in frame.",
        jointAngles: {},
        metrics: { formStatus: "Bad Form" },
      };
    }

    // 2. Form Validation
    let is_good_form = true;
    let form_fault_reason = null;

    const torso_angle = left_hip_angle || right_hip_angle;
    if (torso_angle !== null && torso_angle < 60) {
      is_good_form = false;
      form_fault_reason = "Chest collapsing forward! Keep spine neutral and eyes forward.";
    }

    // 3. State Machine & Full-Cycle Rep Counting
    let new_stage = currentStage;
    let rep_incremented = false;
    let reps = currentReps;
    let feedback = is_good_form ? "Good Form. Keep chest proud." : form_fault_reason;

    if (active_knee > 155) {
      if (currentStage === "down") {
        new_stage = "up";
        if (is_good_form) {
          reps += 1;
          rep_incremented = true;
          feedback = "Rep Counted! (Good Form - Full Extension)";
        } else {
          rep_incremented = false;
          feedback = `Rep Discarded (Bad Form: ${form_fault_reason || "Improper squat mechanics"})`;
        }
      } else if (currentStage === "up") {
        new_stage = "up";
        feedback = is_good_form
          ? "Good Form. Standing tall. Lower hips into squat."
          : `Bad Form: ${form_fault_reason}`;
      } else {
        new_stage = "up";
        feedback = "Standing tall. Ready to squat.";
      }
    } else if (active_knee <= 100) {
      new_stage = "down";
      feedback = is_good_form
        ? "Great depth reached (Good Form)! Drive through heels to stand."
        : `Bad Form: ${form_fault_reason}`;
    } else {
      if (is_good_form) {
        feedback = currentStage === "up"
          ? "Squatting down with Good Form..."
          : "Driving back up with Good Form...";
      } else {
        feedback = `Bad Form: ${form_fault_reason}`;
      }
    }

    const rom_pct = Math.max(0, Math.min(100, Math.round(((165 - active_knee) / (165 - 85)) * 100)));

    return {
      success: true,
      exerciseName: this.name,
      stage: new_stage,
      repetitionCount: reps,
      repIncremented: rep_incremented,
      formScore: is_good_form ? 100.0 : 0.0,
      isCorrectForm: is_good_form,
      feedback,
      jointAngles: {
        leftKnee: left_knee_angle,
        rightKnee: right_knee_angle,
        leftHip: left_hip_angle,
        rightHip: right_hip_angle,
      },
      metrics: {
        formStatus: is_good_form ? "Good Form" : "Bad Form",
        kneeAngle: Math.round(active_knee * 10) / 10,
        squatDepth: active_knee <= 95 ? "Full" : "Partial",
        romPercentage: rom_pct,
      },
    };
  }
}

export default SquatDetector;
