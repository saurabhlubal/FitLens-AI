import { BaseExerciseDetector } from "./BaseExerciseDetector.js";

/**
 * Plank Hold Duration & Form Stability Detector (Timer-Based).
 * Client-Side In-Browser Execution.
 * 
 * Features:
 * 1. Dual Frame Compatibility:
 *    - Full-Body Mode: Spine angle (155° - 195°) via Shoulders -> Hips -> Ankles.
 *    - Shoulder / Upper-Body Mode (Webcam close-up): Tracks horizontal shoulder level,
 *      shoulder-to-elbow stack, and shoulder-to-hip alignment.
 * 2. Real-Time Timer Accumulation:
 *    - Increments hold timer ONLY when form is "Good Form" & stable.
 *    - Automatically pauses hold timer and alerts user when form degrades.
 */
export class PlankDetector extends BaseExerciseDetector {
  constructor() {
    super("Plank");
  }

  analyze(landmarks, currentReps = 0, currentStage = "paused", sessionData = {}) {
    const now = Date.now() / 1000; // seconds

    // 1. Extract Keypoints with confidence filtering
    const lShoulder = BaseExerciseDetector.getLandmark(landmarks, 11, 0.45);
    const rShoulder = BaseExerciseDetector.getLandmark(landmarks, 12, 0.45);
    const lElbow = BaseExerciseDetector.getLandmark(landmarks, 13, 0.40);
    const rElbow = BaseExerciseDetector.getLandmark(landmarks, 14, 0.40);
    const lHip = BaseExerciseDetector.getLandmark(landmarks, 23, 0.40);
    const rHip = BaseExerciseDetector.getLandmark(landmarks, 24, 0.40);
    const lAnkle = BaseExerciseDetector.getLandmark(landmarks, 27, 0.35);
    const rAnkle = BaseExerciseDetector.getLandmark(landmarks, 28, 0.35);

    // Baseline: At least shoulders must be clearly visible
    if (!lShoulder && !rShoulder) {
      return {
        success: false,
        exerciseName: this.name,
        stage: "paused",
        repetitionCount: currentReps,
        repIncremented: false,
        formScore: 0.0,
        isCorrectForm: false,
        feedback: "Shoulders not detected. Adjust camera to face your upper body or side profile.",
        metrics: {
          isTimerExercise: true,
          holdDurationSec: currentReps,
          formStatus: "Adjust Position",
          mode: "undetected",
        },
      };
    }

    // 2. Determine Detection Mode: Full-Body vs Upper-Body / Shoulder Mode
    const hasAnkles = lAnkle !== null || rAnkle !== null;
    const hasHips = lHip !== null || rHip !== null;
    let isGoodForm = true;
    let formFaultReason = null;
    let spineAngle = null;
    const mode = hasHips && hasAnkles ? "full_body" : hasHips ? "upper_body" : "shoulder_only";

    // --- A. FULL BODY EVALUATION ---
    if (mode === "full_body") {
      const leftSpine = BaseExerciseDetector.calculateAngle(lShoulder, lHip, lAnkle);
      const rightSpine = BaseExerciseDetector.calculateAngle(rShoulder, rHip, rAnkle);

      if (leftSpine !== null && rightSpine !== null) {
        spineAngle = (leftSpine + rightSpine) / 2.0;
      } else if (leftSpine !== null) {
        spineAngle = leftSpine;
      } else if (rightSpine !== null) {
        spineAngle = rightSpine;
      }

      if (spineAngle !== null) {
        if (spineAngle < 155) {
          isGoodForm = false;
          formFaultReason = "Hips sagging! Engage core and glutes to lift hips.";
        } else if (spineAngle > 195) {
          isGoodForm = false;
          formFaultReason = "Hips piked too high! Lower hips into a flat neutral line.";
        }
      }
    }
    // --- B. UPPER BODY / SHOULDER-TO-HIP EVALUATION ---
    else if (mode === "upper_body") {
      if (lShoulder && rShoulder) {
        const shoulderTilt = Math.abs(lShoulder.y - rShoulder.y);
        if (shoulderTilt > 0.15) {
          isGoodForm = false;
          formFaultReason = "Shoulders uneven! Keep shoulders squared and level.";
        }
      }

      const hip = lHip || rHip;
      const shoulder = lShoulder || rShoulder;
      if (shoulder && hip) {
        const torsoYDiff = Math.abs(shoulder.y - hip.y);
        if (torsoYDiff > 0.30) {
          isGoodForm = false;
          formFaultReason = "Torso out of alignment! Keep shoulders and hips at equal height.";
        }
      }
    }
    // --- C. SHOULDER ONLY WEBCAM VIEW ---
    else {
      if (lShoulder && rShoulder) {
        const shoulderTilt = Math.abs(lShoulder.y - rShoulder.y);
        if (shoulderTilt > 0.12) {
          isGoodForm = false;
          formFaultReason = "Shoulders tilting! Maintain firm, symmetrical shoulder engagement.";
        }
      }

      if ((lShoulder && lElbow) || (rShoulder && rElbow)) {
        const s = lShoulder || rShoulder;
        const e = lElbow || rElbow;
        if (e.y < s.y) {
          isGoodForm = false;
          formFaultReason = "Elbows raised above shoulders! Plant forearms firmly under shoulders.";
        }
      }
    }

    // 3. Time-Based Hold Accumulator (Seconds)
    const lastHoldTime = sessionData.lastHoldTime ?? now;
    let holdAccumulator = sessionData.holdAccumulator ?? Number(currentReps);
    const dt = Math.min(now - lastHoldTime, 0.25); // Cap max dt to avoid jumps
    sessionData.lastHoldTime = now;

    let repIncremented = false;
    let reps = currentReps;
    if (isGoodForm) {
      holdAccumulator += dt;
      sessionData.holdAccumulator = holdAccumulator;
      const newSeconds = Math.floor(holdAccumulator);
      if (newSeconds > currentReps) {
        repIncremented = true;
        reps = newSeconds;
      }
    }

    // 4. Form Cues & Feedback
    let feedback;
    if (isGoodForm) {
      feedback = `Hold active! ${reps}s locked in with Good Form.`;
    } else {
      feedback = `Timer Paused: ${formFaultReason}`;
    }

    const minutes = Math.floor(reps / 60);
    const seconds = reps % 60;
    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    return {
      success: true,
      exerciseName: this.name,
      stage: isGoodForm ? "holding" : "paused",
      repetitionCount: reps,
      repIncremented: repIncremented,
      formScore: isGoodForm ? 100.0 : 0.0,
      isCorrectForm: isGoodForm,
      feedback: feedback,
      jointAngles: {
        backAngle: spineAngle !== null ? Math.round(spineAngle * 10) / 10 : null,
      },
      metrics: {
        isTimerExercise: true,
        formStatus: isGoodForm ? "Good Form" : "Bad Form",
        holdDurationSec: reps,
        formattedTime: formattedTime,
        spineAlignmentAngle: spineAngle !== null ? Math.round(spineAngle * 10) / 10 : null,
        detectionMode: mode,
        romPercentage: isGoodForm ? 100 : 30,
      },
    };
  }
}

export default PlankDetector;
