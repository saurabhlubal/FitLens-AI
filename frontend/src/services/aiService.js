import api from "./api";
import detectorFactory from "./movement/DetectorFactory";
import onnxInferenceService from "./ai/onnxInferenceService";

const aiService = {
  /**
   * In-Browser Real-Time AI Biomechanical Movement & Kinematic Repetition Analysis.
   * Runs 100% on the client device via WebGPU / WASM with ZERO server GPU/CPU dependency
   * and ZERO video egress. Offline-capable.
   *
   * @param {string} exerciseName Name of the exercise
   * @param {Array} landmarks MediaPipe 33 landmark points {x, y, z, visibility}
   * @param {number} currentReps Current repetition or hold count
   * @param {string} currentStage Current movement stage ("up" | "down" | "holding" | "paused")
   * @param {Object} sessionData Persistent state for hold timers & session history
   * @returns {Promise<Object>} Movement analysis response with form scoring & joint metrics
   */
  analyzeMovement: async (
    exerciseName,
    landmarks,
    currentReps = 0,
    currentStage = "up",
    sessionData = {}
  ) => {
    if (!landmarks || landmarks.length === 0) {
      return {
        success: false,
        exerciseName,
        stage: currentStage,
        repetitionCount: currentReps,
        repIncremented: false,
        formScore: 0.0,
        isCorrectForm: false,
        feedback: "No landmarks detected. Step into the camera frame.",
        jointAngles: {},
        metrics: {
          formStatus: "Adjust Position",
          acceleration: onnxInferenceService.getActiveProvider(),
        },
      };
    }

    const normalizedLandmarks = landmarks.map((l) => ({
      x: l.x,
      y: l.y,
      z: l.z ?? 0,
      visibility: l.visibility ?? 1.0,
    }));

    // 1. Get detector and execute client-side state machine
    const detector = detectorFactory.getDetector(exerciseName);
    const analysis = detector.analyze(
      normalizedLandmarks,
      currentReps,
      currentStage,
      sessionData
    );

    // 2. Run ONNX ResNet body part classification in browser
    const onnxSeg = await onnxInferenceService.segmentLandmarks(normalizedLandmarks);

    // 3. Enrich response with execution provider and segmentation
    const activeProvider = onnxInferenceService.getActiveProvider();
    const enrichedMetrics = {
      ...(analysis.metrics || {}),
      acceleration: activeProvider,
      isOfflineReady: true,
      onnxClassification: onnxSeg?.summary,
    };

    return {
      ...analysis,
      metrics: enrichedMetrics,
      acceleration: activeProvider,
    };
  },

  /**
   * Check active ONNX Runtime Web acceleration provider (WebGPU / WASM / CPU).
   */
  getAccelerationProvider: () => {
    return onnxInferenceService.getActiveProvider();
  },

  /**
   * Pre-warm the browser ONNX engine and WebGPU adapter.
   */
  initInferenceEngine: async () => {
    return await onnxInferenceService.initialize();
  },

  /**
   * Persist final workout analysis (reps, form score, feedback) to backend database.
   * Keeps FastAPI/Spring backend exclusively for auth, users, and workout logging.
   */
  saveWorkoutExerciseAnalysis: async (
    workoutId,
    workoutExerciseId,
    { reps, formScore, aiFeedback }
  ) => {
    const response = await api.post(
      `/ai/movement/workouts/${workoutId}/exercises/${workoutExerciseId}/save-analysis`,
      {
        reps,
        formScore,
        aiFeedback,
      }
    );
    return response.data;
  },
};

export default aiService;


