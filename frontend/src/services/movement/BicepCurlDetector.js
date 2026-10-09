import BaseExerciseDetector from "./BaseExerciseDetector";

export class BicepCurlDetector extends BaseExerciseDetector {
  constructor() {
    super("Bicep Curl");
  }

  analyze(landmarks, currentReps, currentStage, sessionData = {}) {
    // 1. Extract Arm and Torso Keypoints
    const l_shoulder = BaseExerciseDetector.getLandmark(landmarks, 11, 0.45);
    const l_elbow = BaseExerciseDetector.getLandmark(landmarks, 13, 0.45);
    const l_wrist = BaseExerciseDetector.getLandmark(landmarks, 15, 0.40);
    const l_hip = BaseExerciseDetector.getLandmark(landmarks, 23, 0.35);

    const r_shoulder = BaseExerciseDetector.getLandmark(landmarks, 12, 0.45);
    const r_elbow = BaseExerciseDetector.getLandmark(landmarks, 14, 0.45);
    const r_wrist = BaseExerciseDetector.getLandmark(landmarks, 16, 0.40);
    const r_hip = BaseExerciseDetector.getLandmark(landmarks, 24, 0.35);

    // Calculate Elbow Flexion Angles
    const left_elbow_angle = BaseExerciseDetector.calculateAngle(l_shoulder, l_elbow, l_wrist);
    const right_elbow_angle = BaseExerciseDetector.calculateAngle(r_shoulder, r_elbow, r_wrist);

    // Calculate Upper Arm / Torso Angles
    const left_shoulder_angle = (l_hip && l_shoulder && l_elbow)
      ? BaseExerciseDetector.calculateAngle(l_hip, l_shoulder, l_elbow)
      : null;
    const right_shoulder_angle = (r_hip && r_shoulder && r_elbow)
      ? BaseExerciseDetector.calculateAngle(r_hip, r_shoulder, r_elbow)
      : null;

    const left_arm_valid = left_elbow_angle !== null;
    const right_arm_valid = right_elbow_angle !== null;

    if (!left_arm_valid && !right_arm_valid) {
      return {
        success: false,
        exerciseName: this.name,
        stage: currentStage,
        repetitionCount: currentReps,
        repIncremented: false,
        formScore: 0.0,
        isCorrectForm: false,
        feedback: "Arms or shoulders not clearly visible. Step into camera view.",
        jointAngles: {},
        metrics: { formStatus: "Bad Form", inBicepFrame: false },
      };
    }

    // Select primary active arm
    let side = "both";
    let active_angle = null;
    let active_shoulder_angle = null;

    if (left_arm_valid && right_arm_valid) {
      if (left_elbow_angle <= right_elbow_angle) {
        active_angle = left_elbow_angle;
        active_shoulder_angle = left_shoulder_angle;
        side = "left";
      } else {
        active_angle = right_elbow_angle;
        active_shoulder_angle = right_shoulder_angle;
        side = "right";
      }
    } else if (left_arm_valid) {
      active_angle = left_elbow_angle;
      active_shoulder_angle = left_shoulder_angle;
      side = "left";
    } else {
      active_angle = right_elbow_angle;
      active_shoulder_angle = right_shoulder_angle;
      side = "right";
    }

    // 2. Structural Frame & Anatomical Anchor Validation
    const shoulder = side === "left" ? l_shoulder : r_shoulder;
    const elbow = side === "left" ? l_elbow : r_elbow;

    let in_bicep_frame = true;
    let is_good_form = true;
    let form_fault_reason = null;

    if (shoulder && elbow && elbow.y < shoulder.y - 0.05) {
      in_bicep_frame = false;
      is_good_form = false;
      form_fault_reason = "Elbow raised too high! Anchor elbows at your ribs.";
    }

    if (active_shoulder_angle !== null && active_shoulder_angle > 45) {
      is_good_form = false;
      form_fault_reason = "Keep elbows pinned to your ribs. Avoid swinging.";
    }

    // 3. State Machine & Full-Cycle Rep Counting
    let new_stage = currentStage;
    let rep_incremented = false;
    let reps = currentReps;
    let feedback = is_good_form ? "Good Form. Keep going!" : form_fault_reason;

    if (in_bicep_frame) {
      if (active_angle >= 140) {
        new_stage = "down";
        feedback = is_good_form
          ? "Good Form. Arms extended down. Ready to curl."
          : `Bad Form: ${form_fault_reason}`;
      } else if (active_angle <= 50) {
        if (currentStage === "down") {
          new_stage = "up";
          if (is_good_form) {
            reps += 1;
            rep_incremented = true;
            feedback = "Rep Counted! (Good Form)";
          } else {
            rep_incremented = false;
            feedback = `Rep Discarded (Bad Form: ${form_fault_reason || "Improper form"})`;
          }
        } else if (currentStage === "up") {
          new_stage = "up";
          feedback = is_good_form
            ? "Holding contraction. Lower arms down for next rep."
            : `Bad Form: ${form_fault_reason}`;
        } else {
          new_stage = "up";
          feedback = "Extend arms down to begin next rep.";
        }
      } else {
        if (is_good_form) {
          feedback = currentStage === "down"
            ? "Curling up with Good Form..."
            : "Lowering arms down to full extension...";
        } else {
          feedback = `Bad Form: ${form_fault_reason}`;
        }
      }
    } else {
      feedback = `Bad Form: ${form_fault_reason || "Align arms into bicep curl structure."}`;
    }

    const rom_pct = Math.max(0, Math.min(100, Math.round(((150 - active_angle) / (150 - 45)) * 100)));

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
        leftElbow: left_elbow_angle,
        rightElbow: right_elbow_angle,
        leftShoulder: left_shoulder_angle,
        rightShoulder: right_shoulder_angle,
      },
      metrics: {
        formStatus: is_good_form ? "Good Form" : "Bad Form",
        activeArm: side,
        flexionAngle: active_angle,
        shoulderAngle: active_shoulder_angle,
        inBicepFrame: in_bicep_frame,
        romPercentage: rom_pct,
      },
    };
  }
}

export default BicepCurlDetector;


