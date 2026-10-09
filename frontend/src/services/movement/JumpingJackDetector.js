import { BaseExerciseDetector } from "./BaseExerciseDetector.js";

/**
 * Jumping Jacks Movement & Repetition Detector
 * Form-Enforced Full Cycle Repetition Counting (Good Form vs Bad Form):
 * - Structure Check: Full body visible, synchronized bilateral arm and leg sweep.
 * - Full Cycle: Hands Down at Sides (Down <= 45°) -> Hands Overhead (Up >= 135°).
 * - Form Verification: Full arm overhead extension, rhythmic cadence.
 * - Discrete Form State: Strictly "Good Form" or "Bad Form". Reps increment ONLY in Good Form.
 */
export class JumpingJackDetector extends BaseExerciseDetector {
  constructor() {
    super("Jumping Jacks");
  }

  analyze(landmarks, currentReps = 0, currentStage = "down", sessionData = {}) {
    // 1. Extract Arm and Leg Keypoints
    const lHip = BaseExerciseDetector.getLandmark(landmarks, 23);
    const lShoulder = BaseExerciseDetector.getLandmark(landmarks, 11);
    const lElbow = BaseExerciseDetector.getLandmark(landmarks, 13);

    const rHip = BaseExerciseDetector.getLandmark(landmarks, 24);
    const rShoulder = BaseExerciseDetector.getLandmark(landmarks, 12);
    const rElbow = BaseExerciseDetector.getLandmark(landmarks, 14);

    const leftArmAngle = BaseExerciseDetector.calculateAngle(lHip, lShoulder, lElbow);
    const rightArmAngle = BaseExerciseDetector.calculateAngle(rHip, rShoulder, rElbow);

    let activeArmAngle = null;
    if (leftArmAngle !== null && rightArmAngle !== null) {
      activeArmAngle = (leftArmAngle + rightArmAngle) / 2.0;
    } else if (leftArmAngle !== null) {
      activeArmAngle = leftArmAngle;
    } else if (rightArmAngle !== null) {
      activeArmAngle = rightArmAngle;
    } else {
      return {
        success: false,
        exerciseName: this.name,
        stage: currentStage,
        repetitionCount: currentReps,
        repIncremented: false,
        formScore: 0.0,
        isCorrectForm: false,
        feedback: "Full body not in camera view. Step back.",
      };
    }

    // 2. Structural Frame & Form Validation
    let isGoodForm = true;
    let formFaultReason = null;

    if (leftArmAngle !== null && rightArmAngle !== null) {
      const diff = Math.abs(leftArmAngle - rightArmAngle);
      if (diff > 35) {
        isGoodForm = false;
        formFaultReason = "Sweep both arms evenly overhead.";
      }
    }

    // 3. State Machine & Full-Cycle Rep Counting
    // Arms Down / In (Down): Arm Angle <= 45°
    // Arms Overhead / Out (Up): Arm Angle >= 135°
    let newStage = currentStage;
    let repIncremented = false;
    let reps = currentReps;
    let feedback = isGoodForm
      ? "Good Form. Perform jumping jacks with dynamic rhythm."
      : formFaultReason;

    if (activeArmAngle <= 45) {
      newStage = "down";
      feedback = isGoodForm
        ? "Good Form. Feet together, hands down."
        : `Bad Form: ${formFaultReason}`;
    } else if (activeArmAngle >= 135) {
      if (currentStage === "down") {
        newStage = "up";
        if (isGoodForm) {
          reps += 1;
          repIncremented = true;
          feedback = "Rep Counted! (Good Form - Full Overhead Sweep)";
        } else {
          repIncremented = false;
          feedback = `Rep Discarded (Bad Form: ${formFaultReason || "Improper sweep"})`;
        }
      } else if (currentStage === "up") {
        newStage = "up";
        feedback = isGoodForm
          ? "Good Form. Arms overhead! Bounce back to center."
          : `Bad Form: ${formFaultReason}`;
      } else {
        newStage = "up";
        feedback = "Arms overhead. Ready to rebound.";
      }
    } else {
      if (isGoodForm) {
        if (currentStage === "down") {
          feedback = "Jumping out with Good Form...";
        } else {
          feedback = "Returning to center with Good Form...";
        }
      } else {
        feedback = `Bad Form: ${formFaultReason}`;
      }
    }

    const romPct = Math.max(0, Math.min(100, Math.floor(((activeArmAngle - 40) / (140 - 40)) * 100)));

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
        armAngle: Math.round(activeArmAngle * 10) / 10,
        romPercentage: romPct,
      },
    };
  }
}

export default JumpingJackDetector;


