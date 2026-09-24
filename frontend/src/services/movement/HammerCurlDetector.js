import { BaseExerciseDetector } from "./BaseExerciseDetector.js";

/**
 * Hammer Curl Movement & Repetition Detector
 * Full Cycle Rep Counting with Form Validation (Good Form vs Bad Form).
 */
export class HammerCurlDetector extends BaseExerciseDetector {
  constructor() {
    super("Hammer Curl");
  }

  analyze(landmarks, currentReps = 0, currentStage = "down", sessionData = {}) {
    const lShoulder = BaseExerciseDetector.getLandmark(landmarks, 11);
    const lElbow = BaseExerciseDetector.getLandmark(landmarks, 13);
    const lWrist = BaseExerciseDetector.getLandmark(landmarks, 15);
    const lHip = BaseExerciseDetector.getLandmark(landmarks, 23);

    const rShoulder = BaseExerciseDetector.getLandmark(landmarks, 12);
    const rElbow = BaseExerciseDetector.getLandmark(landmarks, 14);
    const rWrist = BaseExerciseDetector.getLandmark(landmarks, 16);
    const rHip = BaseExerciseDetector.getLandmark(landmarks, 24);

    const leftElbowAngle = BaseExerciseDetector.calculateAngle(lShoulder, lElbow, lWrist);
    const rightElbowAngle = BaseExerciseDetector.calculateAngle(rShoulder, rElbow, rWrist);

    const leftShoulderAngle =
      lHip && lShoulder && lElbow
        ? BaseExerciseDetector.calculateAngle(lHip, lShoulder, lElbow)
        : null;
    const rightShoulderAngle =
      rHip && rShoulder && rElbow
        ? BaseExerciseDetector.calculateAngle(rHip, rShoulder, rElbow)
        : null;

    const leftArmValid = leftElbowAngle !== null;
    const rightArmValid = rightElbowAngle !== null;

    if (!leftArmValid && !rightArmValid) {
      return {
        success: false,
        exerciseName: this.name,
        stage: currentStage,
        repetitionCount: currentReps,
        repIncremented: false,
        formScore: 0.0,
        isCorrectForm: false,
        feedback: "Step into the camera frame so your arms are visible.",
      };
    }

    let activeAngle = null;
    let activeShoulderAngle = null;
    let side = "both";

    if (leftArmValid && rightArmValid) {
      if (leftElbowAngle <= rightElbowAngle) {
        activeAngle = leftElbowAngle;
        activeShoulderAngle = leftShoulderAngle;
        side = "left";
      } else {
        activeAngle = rightElbowAngle;
        activeShoulderAngle = rightShoulderAngle;
        side = "right";
      }
    } else if (leftArmValid) {
      activeAngle = leftElbowAngle;
      activeShoulderAngle = leftShoulderAngle;
      side = "left";
    } else {
      activeAngle = rightElbowAngle;
      activeShoulderAngle = rightShoulderAngle;
      side = "right";
    }

    const shoulder = side === "left" ? lShoulder : rShoulder;
    const elbow = side === "left" ? lElbow : rElbow;

    let inHammerFrame = true;
    let isGoodForm = true;
    let formFaultReason = null;

    if (shoulder && elbow && elbow.y < shoulder.y - 0.05) {
      inHammerFrame = false;
      isGoodForm = false;
      formFaultReason = "Elbow raised too high! Keep elbows pinned at your ribs.";
    }

    if (activeShoulderAngle !== null && activeShoulderAngle > 45) {
      isGoodForm = false;
      formFaultReason = "Avoid swinging upper arms. Pin elbows tight.";
    }

    let newStage = currentStage;
    let repIncremented = false;
    let reps = currentReps;
    let feedback = isGoodForm
      ? "Good Form. Neutral hammer grip."
      : formFaultReason;

    if (inHammerFrame) {
      if (activeAngle >= 140) {
        newStage = "down";
        feedback = isGoodForm
          ? "Good Form. Arms fully extended. Ready to curl."
          : `Bad Form: ${formFaultReason}`;
      } else if (activeAngle <= 50) {
        if (currentStage === "down") {
          newStage = "up";
          if (isGoodForm) {
            reps += 1;
            repIncremented = true;
            feedback = "Rep Counted! (Good Form)";
          } else {
            repIncremented = false;
            feedback = `Rep Discarded (Bad Form: ${formFaultReason || "Improper form"})`;
          }
        } else if (currentStage === "up") {
          newStage = "up";
          feedback = isGoodForm
            ? "Holding peak contraction. Lower down for next rep."
            : `Bad Form: ${formFaultReason}`;
        } else {
          newStage = "up";
          feedback = "Extend arms down to begin next rep.";
        }
      } else {
        if (isGoodForm) {
          if (currentStage === "down") {
            feedback = "Curling up with Good Form...";
          } else {
            feedback = "Lowering arms down to full extension...";
          }
        } else {
          feedback = `Bad Form: ${formFaultReason}`;
        }
      }
    } else {
      feedback = `Bad Form: ${formFaultReason || "Align arms into neutral hammer curl frame."}`;
    }

    const romPct = Math.max(0, Math.min(100, Math.floor(((150 - activeAngle) / (150 - 45)) * 100)));

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
        leftElbow: leftElbowAngle,
        rightElbow: rightElbowAngle,
        leftShoulder: leftShoulderAngle,
        rightShoulder: rightShoulderAngle,
      },
      metrics: {
        formStatus: isGoodForm ? "Good Form" : "Bad Form",
        flexionAngle: Math.round(activeAngle * 10) / 10,
        detectedSide: side,
        inHammerFrame: inHammerFrame,
        romPercentage: romPct,
      },
    };
  }
}

export default HammerCurlDetector;
