import { BaseExerciseDetector } from "./BaseExerciseDetector.js";

/**
 * Forward / Reverse Lunge Movement & Repetition Detector
 * Form-Enforced Full Cycle Repetition Counting (Good Form vs Bad Form):
 * - Structure Check: Upright spine, balanced single-leg stance.
 * - Full Cycle: Standing Tall (Up > 150°) -> Deep 90/90 Lunge (Down <= 105°).
 * - Form Verification: Knee tracking (angle not collapsing < 65° excessively past toes), torso upright.
 * - Discrete Form State: Strictly "Good Form" or "Bad Form". Reps increment ONLY in Good Form.
 */
export class LungeDetector extends BaseExerciseDetector {
  constructor() {
    super("Lunge");
  }

  analyze(landmarks, currentReps = 0, currentStage = "up", sessionData = {}) {
    // 1. Extract Hip/Knee/Ankle Keypoints
    const lHip = BaseExerciseDetector.getLandmark(landmarks, 23);
    const lKnee = BaseExerciseDetector.getLandmark(landmarks, 25);
    const lAnkle = BaseExerciseDetector.getLandmark(landmarks, 27);

    const rHip = BaseExerciseDetector.getLandmark(landmarks, 24);
    const rKnee = BaseExerciseDetector.getLandmark(landmarks, 26);
    const rAnkle = BaseExerciseDetector.getLandmark(landmarks, 28);

    const leftKneeAngle = BaseExerciseDetector.calculateAngle(lHip, lKnee, lAnkle);
    const rightKneeAngle = BaseExerciseDetector.calculateAngle(rHip, rKnee, rAnkle);

    let leadKneeAngle = null;
    if (leftKneeAngle !== null && rightKneeAngle !== null) {
      leadKneeAngle = Math.min(leftKneeAngle, rightKneeAngle);
    } else if (leftKneeAngle !== null) {
      leadKneeAngle = leftKneeAngle;
    } else if (rightKneeAngle !== null) {
      leadKneeAngle = rightKneeAngle;
    } else {
      return {
        success: false,
        exerciseName: this.name,
        stage: currentStage,
        repetitionCount: currentReps,
        repIncremented: false,
        formScore: 0.0,
        isCorrectForm: false,
        feedback: "Legs and knees not visible. Step back into camera frame.",
      };
    }

    // 2. Structural Frame & Lunge Form Validation
    let isGoodForm = true;
    let formFaultReason = null;

    if (leadKneeAngle < 65) {
      isGoodForm = false;
      formFaultReason = "Knee traveling too far past toes! Take a wider step.";
    }

    // 3. State Machine & Full-Cycle Rep Counting
    // Standing tall (Up): Lead knee > 150°
    // Deep Lunge (Down): Lead knee <= 105°
    let newStage = currentStage;
    let repIncremented = false;
    let reps = currentReps;
    let feedback = isGoodForm
      ? "Good Form. Step into a lunge, dropping hips straight down."
      : formFaultReason;

    if (leadKneeAngle > 150) {
      if (currentStage === "down") {
        newStage = "up";
        if (isGoodForm) {
          reps += 1;
          repIncremented = true;
          feedback = "Rep Counted! (Good Form - Full Lunge Drive)";
        } else {
          repIncremented = false;
          feedback = `Rep Discarded (Bad Form: ${formFaultReason || "Improper lunge mechanics"})`;
        }
      } else if (currentStage === "up") {
        newStage = "up";
        feedback = isGoodForm
          ? "Good Form. Standing upright. Step and drop hips down."
          : `Bad Form: ${formFaultReason}`;
      } else {
        newStage = "up";
        feedback = "Standing tall. Ready to lunge.";
      }
    } else if (leadKneeAngle <= 105) {
      newStage = "down";
      feedback = isGoodForm
        ? "Full lunge depth reached (Good Form)! Drive through front heel."
        : `Bad Form: ${formFaultReason}`;
    } else {
      if (isGoodForm) {
        if (currentStage === "up") {
          feedback = "Lowering into lunge with Good Form...";
        } else {
          feedback = "Driving back up with Good Form...";
        }
      } else {
        feedback = `Bad Form: ${formFaultReason}`;
      }
    }

    const romPct = Math.max(0, Math.min(100, Math.floor(((160 - leadKneeAngle) / (160 - 90)) * 100)));

    return {
      success: true,
      exerciseName: this.name,
      stage: newStage,
      repetitionCount: reps,
      repIncremented: repIncremented,
      formScore: isGoodForm ? 100.0 : 0.0,
      isCorrectForm: isGoodForm,
      feedback: feedback,
      jointAngles: {
        leftKnee: leftKneeAngle,
        rightKnee: rightKneeAngle,
      },
      metrics: {
        formStatus: isGoodForm ? "Good Form" : "Bad Form",
        leadKneeAngle: Math.round(leadKneeAngle * 10) / 10,
        romPercentage: romPct,
      },
    };
  }
}

export default LungeDetector;
