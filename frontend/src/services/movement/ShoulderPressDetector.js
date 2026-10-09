import BaseExerciseDetector from "./BaseExerciseDetector";

export class ShoulderPressDetector extends BaseExerciseDetector {
  constructor() {
    super("Shoulder Press");
  }

  analyze(landmarks, currentReps, currentStage, sessionData = {}) {
    const l_shoulder = BaseExerciseDetector.getLandmark(landmarks, 11);
    const l_elbow = BaseExerciseDetector.getLandmark(landmarks, 13);
    const l_wrist = BaseExerciseDetector.getLandmark(landmarks, 15);

    const r_shoulder = BaseExerciseDetector.getLandmark(landmarks, 12);
    const r_elbow = BaseExerciseDetector.getLandmark(landmarks, 14);
    const r_wrist = BaseExerciseDetector.getLandmark(landmarks, 16);

    const left_arm_angle = BaseExerciseDetector.calculateAngle(l_shoulder, l_elbow, l_wrist);
    const right_arm_angle = BaseExerciseDetector.calculateAngle(r_shoulder, r_elbow, r_wrist);

    let active_elbow = null;
    if (left_arm_angle !== null && right_arm_angle !== null) {
      active_elbow = (left_arm_angle + right_arm_angle) / 2.0;
    } else if (left_arm_angle !== null) {
      active_elbow = left_arm_angle;
    } else if (right_arm_angle !== null) {
      active_elbow = right_arm_angle;
    } else {
      return {
        success: false,
        exerciseName: this.name,
        stage: currentStage,
        repetitionCount: currentReps,
        repIncremented: false,
        formScore: 0.0,
        isCorrectForm: false,
        feedback: "Upper body and arms not visible. Adjust frame.",
        jointAngles: {},
        metrics: { formStatus: "Bad Form" },
      };
    }

    let is_good_form = true;
    let form_fault_reason = null;

    if (left_arm_angle !== null && right_arm_angle !== null) {
      const diff = Math.abs(left_arm_angle - right_arm_angle);
      if (diff > 25) {
        is_good_form = false;
        form_fault_reason = "Asymmetrical press! Push both arms evenly overhead.";
      }
    }

    let new_stage = currentStage;
    let rep_incremented = false;
    let reps = currentReps;
    let feedback = is_good_form ? "Good Form. Press overhead with control." : form_fault_reason;

    if (active_elbow >= 155) {
      if (currentStage === "down") {
        new_stage = "up";
        if (is_good_form) {
          reps += 1;
          rep_incremented = true;
          feedback = "Rep Counted! (Good Form - Full Lockout)";
        } else {
          rep_incremented = false;
          feedback = `Rep Discarded (Bad Form: ${form_fault_reason || "Improper pressing form"})`;
        }
      } else if (currentStage === "up") {
        new_stage = "up";
        feedback = is_good_form
          ? "Good Form. Locked out overhead. Lower down to shoulders."
          : `Bad Form: ${form_fault_reason}`;
      } else {
        new_stage = "up";
        feedback = "Locked out overhead. Ready to lower.";
      }
    } else if (active_elbow <= 90) {
      new_stage = "down";
      feedback = is_good_form
        ? "Full depth reached (Good Form)! Drive weights straight up."
        : `Bad Form: ${form_fault_reason}`;
    } else {
      if (is_good_form) {
        feedback = currentStage === "down"
          ? "Pressing overhead with Good Form..."
          : "Lowering under control with Good Form...";
      } else {
        feedback = `Bad Form: ${form_fault_reason}`;
      }
    }

    const rom_pct = Math.max(0, Math.min(100, Math.round(((active_elbow - 80) / (160 - 80)) * 100)));

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
        leftElbow: left_arm_angle,
        rightElbow: right_arm_angle,
      },
      metrics: {
        formStatus: is_good_form ? "Good Form" : "Bad Form",
        elbowAngle: Math.round(active_elbow * 10) / 10,
        romPercentage: rom_pct,
      },
    };
  }
}

export default ShoulderPressDetector;


