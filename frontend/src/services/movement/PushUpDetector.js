import BaseExerciseDetector from "./BaseExerciseDetector";

export class PushUpDetector extends BaseExerciseDetector {
  constructor() {
    super("Push-up");
  }

  analyze(landmarks, currentReps, currentStage, sessionData = {}) {
    const l_shoulder = BaseExerciseDetector.getLandmark(landmarks, 11);
    const l_elbow = BaseExerciseDetector.getLandmark(landmarks, 13);
    const l_wrist = BaseExerciseDetector.getLandmark(landmarks, 15);
    const l_hip = BaseExerciseDetector.getLandmark(landmarks, 23);
    const l_ankle = BaseExerciseDetector.getLandmark(landmarks, 27);

    const r_shoulder = BaseExerciseDetector.getLandmark(landmarks, 12);
    const r_elbow = BaseExerciseDetector.getLandmark(landmarks, 14);
    const r_wrist = BaseExerciseDetector.getLandmark(landmarks, 16);
    const r_hip = BaseExerciseDetector.getLandmark(landmarks, 24);
    const r_ankle = BaseExerciseDetector.getLandmark(landmarks, 28);

    const left_arm_angle = BaseExerciseDetector.calculateAngle(l_shoulder, l_elbow, l_wrist);
    const right_arm_angle = BaseExerciseDetector.calculateAngle(r_shoulder, r_elbow, r_wrist);

    const left_body_angle = BaseExerciseDetector.calculateAngle(l_shoulder, l_hip, l_ankle);
    const right_body_angle = BaseExerciseDetector.calculateAngle(r_shoulder, r_hip, r_ankle);

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
        feedback: "Upper body not visible. Adjust camera angle.",
        jointAngles: {},
        metrics: { formStatus: "Bad Form" },
      };
    }

    let is_good_form = true;
    let form_fault_reason = null;

    const body_angle = left_body_angle || right_body_angle;
    if (body_angle !== null) {
      if (body_angle < 145) {
        is_good_form = false;
        form_fault_reason = "Hips sagging! Tighten core and glutes to align spine.";
      } else if (body_angle > 195) {
        is_good_form = false;
        form_fault_reason = "Hips piked too high! Maintain a flat plank.";
      }
    }

    let new_stage = currentStage;
    let rep_incremented = false;
    let reps = currentReps;
    let feedback = is_good_form ? "Good Form. Solid push-up plank." : form_fault_reason;

    if (active_elbow > 150) {
      if (currentStage === "down") {
        new_stage = "up";
        if (is_good_form) {
          reps += 1;
          rep_incremented = true;
          feedback = "Rep Counted! (Good Form - Full Press)";
        } else {
          rep_incremented = false;
          feedback = `Rep Discarded (Bad Form: ${form_fault_reason || "Improper plank"})`;
        }
      } else if (currentStage === "up") {
        new_stage = "up";
        feedback = is_good_form
          ? "Good Form. Top plank held. Lower chest down."
          : `Bad Form: ${form_fault_reason}`;
      } else {
        new_stage = "up";
        feedback = "Plank held. Ready for push-ups.";
      }
    } else if (active_elbow <= 95) {
      new_stage = "down";
      feedback = is_good_form
        ? "Full depth reached (Good Form)! Press straight up."
        : `Bad Form: ${form_fault_reason}`;
    } else {
      if (is_good_form) {
        feedback = currentStage === "up"
          ? "Lowering chest with Good Form..."
          : "Pushing up with Good Form...";
      } else {
        feedback = `Bad Form: ${form_fault_reason}`;
      }
    }

    const rom_pct = Math.max(0, Math.min(100, Math.round(((160 - active_elbow) / (160 - 85)) * 100)));

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
        backAngle: body_angle,
      },
      metrics: {
        formStatus: is_good_form ? "Good Form" : "Bad Form",
        elbowAngle: Math.round(active_elbow * 10) / 10,
        bodyAlignmentAngle: body_angle ? Math.round(body_angle * 10) / 10 : null,
        romPercentage: rom_pct,
      },
    };
  }
}

export default PushUpDetector;


