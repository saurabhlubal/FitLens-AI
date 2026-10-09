/**
 * Base Exercise Detector for In-Browser Kinematic Movement & Repetition Detection.
 * Executes on the client device in 0ms with zero network egress.
 */
export class BaseExerciseDetector {
  constructor(name) {
    this.name = name;
  }

  /**
   * Calculates the 2D joint angle between three landmarks: a (start), b (vertex), c (end).
   * @param {Object} a Start landmark {x, y, z, visibility}
   * @param {Object} b Vertex landmark {x, y, z, visibility}
   * @param {Object} c End landmark {x, y, z, visibility}
   * @param {number} minVisibility Minimum confidence threshold
   * @returns {number|null} Angle in degrees [0, 180] or null if not confident
   */
  static calculateAngle(a, b, c, minVisibility = 0.40) {
    if (!a || !b || !c) return null;

    if (
      (a.visibility !== undefined && a.visibility !== null && a.visibility < minVisibility) ||
      (b.visibility !== undefined && b.visibility !== null && b.visibility < minVisibility) ||
      (c.visibility !== undefined && c.visibility !== null && c.visibility < minVisibility)
    ) {
      return null;
    }

    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
      angle = 360.0 - angle;
    }
    return Math.round(angle * 10) / 10;
  }

  /**
   * Retrieve a landmark by index with confidence check.
   */
  static getLandmark(landmarks, index, minVisibility = 0.40) {
    if (landmarks && index >= 0 && index < landmarks.length) {
      const lm = landmarks[index];
      if (lm.visibility !== undefined && lm.visibility !== null && lm.visibility < minVisibility) {
        return null;
      }
      return lm;
    }
    return null;
  }

  /**
   * Check if all required landmarks meet confidence.
   */
  static areLandmarksVisible(landmarks, indices, minVisibility = 0.45) {
    if (!landmarks) return false;
    for (const idx of indices) {
      if (idx < 0 || idx >= landmarks.length) return false;
      const lm = landmarks[idx];
      if (lm.visibility !== undefined && lm.visibility !== null && lm.visibility < minVisibility) {
        return false;
      }
    }
    return true;
  }

  /**
   * Core analysis method to override in subclasses.
   */
  analyze(landmarks, currentReps, currentStage, sessionData = {}) {
    throw new Error("analyze() must be implemented by subclass.");
  }
}

export default BaseExerciseDetector;


