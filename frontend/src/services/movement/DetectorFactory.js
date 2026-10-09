import { BicepCurlDetector } from "./BicepCurlDetector.js";
import { SquatDetector } from "./SquatDetector.js";
import { PushUpDetector } from "./PushUpDetector.js";
import { ShoulderPressDetector } from "./ShoulderPressDetector.js";
import { LateralRaiseDetector } from "./LateralRaiseDetector.js";
import { LungeDetector } from "./LungeDetector.js";
import { JumpingJackDetector } from "./JumpingJackDetector.js";
import { PlankDetector } from "./PlankDetector.js";
import { HammerCurlDetector } from "./HammerCurlDetector.js";

/**
 * Modular Factory & Registry for Client-Side Exercise Movement Detectors.
 * Provides 100% offline, zero-latency kinematic evaluation for all 9 exercises.
 */
class DetectorFactory {
  constructor() {
    this.detectors = {
      // 1. Bicep Curl
      "bicep curl": new BicepCurlDetector(),
      "bicep curls": new BicepCurlDetector(),

      // 2. Squat
      "squat": new SquatDetector(),
      "squats": new SquatDetector(),

      // 3. Push-up
      "push up": new PushUpDetector(),
      "push-up": new PushUpDetector(),
      "pushups": new PushUpDetector(),

      // 4. Shoulder Press
      "shoulder press": new ShoulderPressDetector(),
      "overhead press": new ShoulderPressDetector(),

      // 5. Lateral Raise
      "lateral raise": new LateralRaiseDetector(),
      "lateral raises": new LateralRaiseDetector(),
      "side lateral raise": new LateralRaiseDetector(),

      // 6. Lunge
      "lunge": new LungeDetector(),
      "lunges": new LungeDetector(),
      "forward lunge": new LungeDetector(),

      // 7. Jumping Jacks
      "jumping jack": new JumpingJackDetector(),
      "jumping jacks": new JumpingJackDetector(),

      // 8. Plank
      "plank": new PlankDetector(),
      "plank hold": new PlankDetector(),

      // 9. Hammer Curl
      "hammer curl": new HammerCurlDetector(),
      "hammer curls": new HammerCurlDetector(),
    };
  }

  /**
   * Retrieves the corresponding exercise detector instance.
   * @param {string} exerciseName
   * @returns {BaseExerciseDetector}
   */
  getDetector(exerciseName = "") {
    const normalized = String(exerciseName).trim().toLowerCase();
    if (this.detectors[normalized]) {
      return this.detectors[normalized];
    }
    // Partial match fallback
    for (const [key, detector] of Object.entries(this.detectors)) {
      if (key.includes(normalized) || normalized.includes(key)) {
        return detector;
      }
    }
    // Default fallback
    return this.detectors["bicep curl"];
  }

  /**
   * Registers or overrides a detector.
   */
  registerDetector(key, detector) {
    this.detectors[key.trim().toLowerCase()] = detector;
  }
}

export const detectorFactory = new DetectorFactory();
export default detectorFactory;


