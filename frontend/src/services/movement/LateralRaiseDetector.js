import { BaseExerciseDetector } from "./BaseExerciseDetector.js";

/**
 * Lateral Raise Movement & Repetition Detector
 * Form-Enforced Full Cycle Repetition Counting (Good Form vs Bad Form):
 * - Structure Check: Upright torso, arms raising in scapular plane.
 * - Full Cycle: Arms Down at Sides (Down <= 35°) -> Parallel Shoulder Height (Up >= 75° and <= 110°).
 * - Form Verification: No over-raising above shoulder plane (> 110° impingement risk), symmetrical abduction.
 * - Discrete Form State: Strictly "Good Form" or "Bad Form". Reps increment ONLY in Good Form.
 */
export class LateralRaiseDetector extends BaseExerciseDetector {
  constructor() {
    super("Lateral Raise");
  }

  analyze(landmarks, currentReps = 0, currentStage = "down", sessionData = {}) {
    // 1. Extract Shoulder/Torso Keypoints
    const lHip = BaseExerciseDetector.getLandmark(landmarks, 23);
    const lShoulder = BaseExerciseDetector.getLandmark(landmarks, 11);
    const lElbow = BaseExerciseDetector.getLandmark(landmarks, 13);

    const rHip = BaseExerciseDetector.getLandmark(landmarks, 24);
    const rShoulder = BaseExerciseDetector.getLandmark(landmarks, 12);
    const rElbow = BaseExerciseDetector.getLandmark(landmarks, 14);

    const leftArmAngle = BaseExerciseDetector.calculateAngle(lHip, lShoulder, lElbow);
    const rightArmAngle = BaseExerciseDetector.calculateAngle(rHip, rShoulder, rElbow);

    let activeAngle = null;
    if (leftArmAngle !== null && rightArmAngle !== null) {
      activeAngle = (leftArmAngle + rightArmAngle) / 2.0;
    } else if (leftArmAngle !== null) {
      activeAngle = leftArmAngle;
    } else if (rightArmAngle !== null) {
      activeAngle = rightArmAngle;
    } else {
      return {
        success: false,
        exerciseName: this.name,
        stage: currentStage,
        repetitionCount: currentReps,
        repIncremented: false,
        formScore: 0.0,
        isCorrectForm: false,
        feedback: "Upper body and arms not visible. Adjust camera angle.",
      };
    }

    // 2. Structural Frame & Form Validation
    let isGoodForm = true;
    let formFaultReason = null;

    if (activeAngle > 110) {
      isGoodForm = false;
      formFaultReason = "Don't raise above shoulder height! Stop parallel to prevent impingement.";
    }

    if (leftArmAngle !== null && rightArmAngle !== null) {
      const diff = Math.abs(leftArmAngle - rightArmAngle);
      if (diff > 25) {
        isGoodForm = false;
        formFaultReason = "Raise both arms evenly and symmetrically.";
      }
    }

    // 3. State Machine & Full-Cycle Rep Counting
    // Arms Down at sides: Angle <= 35°
    // Arms Raised parallel to shoulders: Angle >= 75°
    let newStage = currentStage;
    let repIncremented = false;
    let reps = currentReps;
    let feedback = isGoodForm
      ? "Good Form. Raise dumbbells up to shoulder level."
      : formFaultReason;

    if (activeAngle <= 35) {
      newStage = "down";
      feedback = isGoodForm
        ? "Good Form. Arms at sides. Raise outward under control."
        : `Bad Form: ${formFaultReason}`;
    } else if (activeAngle >= 75) {
      if (currentStage === "down") {
        newStage = "up";
        if (isGoodForm) {
          reps += 1;
          repIncremented = true;
          feedback = "Rep Counted! (Good Form - Shoulder Level)";
        } else {
          repIncremented = false;
          feedback = `Rep Discarded (Bad Form: ${formFaultReason || "Improper form"})`;
        }
      } else if (currentStage === "up") {
        newStage = "up";
        feedback = isGoodForm
          ? "Peak height reached (Good Form). Lower under control."
          : `Bad Form: ${formFaultReason}`;
      } else {
        newStage = "up";
        feedback = "Arms at shoulder plane. Ready to lower.";
      }
    } else {
      if (isGoodForm) {
        if (currentStage === "down") {
          feedback = "Raising outward with Good Form...";
        } else {
          feedback = "Lowering slowly with Good Form...";
        }
      } else {
        feedback = `Bad Form: ${formFaultReason}`;
      }
    }

    const romPct = Math.max(0, Math.min(100, Math.floor(((activeAngle - 25) / (85 - 25)) * 100)));

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
        leftShoulder: leftArmAngle,
        rightShoulder: rightArmAngle,
      },
      metrics: {
        formStatus: isGoodForm ? "Good Form" : "Bad Form",
        shoulderAbductionAngle: Math.round(activeAngle * 10) / 10,
        romPercentage: romPct,
      },
    };
  }
}

export default LateralRaiseDetector;
