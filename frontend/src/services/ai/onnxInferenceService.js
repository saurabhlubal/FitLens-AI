import * as ort from "onnxruntime-web";

// Canonical MediaPipe anatomical partition ground-truth mapping
export const CANONICAL_BODY_PARTS = {
  // Face / Head (0-10)
  0: "face", 1: "face", 2: "face", 3: "face", 4: "face",
  5: "face", 6: "face", 7: "face", 8: "face", 9: "face", 10: "face",
  
  // Shoulders (11, 12)
  11: "shoulders", 12: "shoulders",
  
  // Arms & Forearms & Hands (13-22)
  13: "arms", 14: "arms", 15: "arms", 16: "arms",
  17: "arms", 18: "arms", 19: "arms", 20: "arms", 21: "arms", 22: "arms",
  
  // Torso & Hips (23, 24)
  23: "torso", 24: "torso",
  
  // Legs, Knees & Feet (25-32)
  25: "legs", 26: "legs", 27: "legs", 28: "legs",
  29: "legs", 30: "legs", 31: "legs", 32: "legs",
};

export const CLASS_NAME_MAP = {
  0: "face",
  1: "shoulders",
  2: "arms",
  3: "torso",
  4: "legs",
};

class OnnxInferenceService {
  constructor() {
    this.session = null;
    this.activeProvider = null;
    this.isLoading = false;
    this.initPromise = null;
  }

  /**
   * Probe client environment for WebGPU support.
   */
  async checkWebGpuSupport() {
    if (typeof navigator !== "undefined" && "gpu" in navigator && navigator.gpu) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
          return true;
        }
      } catch (err) {
        console.warn("WebGPU adapter request failed:", err);
      }
    }
    return false;
  }

  /**
   * Initialize ONNX Runtime Web session with WebGPU -> WASM fallback.
   */
  async initialize() {
    if (this.session) return this.session;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      this.isLoading = true;
      const modelPath = "/models/fitlens.onnx";

      // Configure WASM worker paths
      ort.env.wasm.numThreads = Math.min(4, typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 2 : 2);
      ort.env.wasm.simd = true;

      const hasWebGPU = await this.checkWebGpuSupport();
      const providersToTry = hasWebGPU ? ["webgpu", "wasm"] : ["wasm"];

      console.log(`[FitLens AI] Initializing In-Browser ONNX Engine (WebGPU available: ${hasWebGPU})...`);

      for (const ep of providersToTry) {
        try {
          console.log(`[FitLens AI] Attempting ONNX session with Execution Provider: '${ep}'...`);
          let session;
          try {
            session = await ort.InferenceSession.create(modelPath, {
              executionProviders: [ep],
              graphOptimizationLevel: "all",
            });
          } catch {
            session = await ort.InferenceSession.create("/models/body_part_classifier.onnx", {
              executionProviders: [ep],
              graphOptimizationLevel: "all",
            });
          }
          this.session = session;
          this.activeProvider = ep;
          console.log(`[FitLens AI] ✅ ONNX Inference Engine Ready on '${ep.toUpperCase()}'!`);
          this.isLoading = false;
          return session;
        } catch (epError) {
          console.warn(`[FitLens AI] Failed to initialize provider '${ep}':`, epError);
        }
      }

      // Final CPU fallback
      try {
        console.log("[FitLens AI] Falling back to CPU/WASM baseline session...");
        const session = await ort.InferenceSession.create(modelPath);
        this.session = session;
        this.activeProvider = "wasm-cpu";
        this.isLoading = false;
        return session;
      } catch (err) {
        console.error("[FitLens AI] Critical Error: Unable to initialize ONNX Runtime Web session:", err);
        this.isLoading = false;
        return null;
      }
    })();

    return this.initPromise;
  }

  /**
   * Runs ResNet landmark classification in the browser.
   * @param {Array} landmarks Array of 33 MediaPipe pose landmarks {x, y, z, visibility}
   * @returns {Promise<Object>} Segmented regions and class probabilities
   */
  async segmentLandmarks(landmarks) {
    if (!landmarks || landmarks.length === 0) {
      return {
        summary: { face: 0, shoulders: 0, arms: 0, torso: 0, legs: 0 },
        regions: { face: [], shoulders: [], arms: [], torso: [], legs: [] },
        landmarks: [],
        provider: this.activeProvider || "offline",
      };
    }

    // Default segmentation mapping
    const segmented = {
      face: [],
      shoulders: [],
      arms: [],
      torso: [],
      legs: [],
    };
    const landmarkCategories = [];

    const numPoints = landmarks.length;
    const inputData = new Float32Array(numPoints * 4);

    for (let i = 0; i < numPoints; i++) {
      const lm = landmarks[i];
      inputData[i * 4 + 0] = lm.x ?? 0.0;
      inputData[i * 4 + 1] = lm.y ?? 0.0;
      inputData[i * 4 + 2] = lm.z ?? 0.0;
      inputData[i * 4 + 3] = lm.visibility ?? 1.0;

      const defaultCategory = CANONICAL_BODY_PARTS[i] || "torso";
      segmented[defaultCategory].push(i);
      landmarkCategories.push({
        index: i,
        category: defaultCategory,
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility,
      });
    }

    try {
      const session = await this.initialize();
      if (session) {
        const inputTensor = new ort.Tensor("float32", inputData, [numPoints, 4]);
        const results = await session.run({ landmarks_input: inputTensor });
        const outputTensor = results.class_probabilities;

        if (outputTensor && outputTensor.data) {
          const probs = outputTensor.data;
          for (let i = 0; i < numPoints; i++) {
            let maxClass = 0;
            let maxProb = -1;
            for (let c = 0; c < 5; c++) {
              const prob = probs[i * 5 + c];
              if (prob > maxProb) {
                maxProb = prob;
                maxClass = c;
              }
            }
            landmarkCategories[i].predictedClass = CLASS_NAME_MAP[maxClass] || "torso";
            landmarkCategories[i].confidence = maxProb;
          }
        }
      }
    } catch (inferError) {
      console.warn("[FitLens AI] In-browser ONNX inference warning (fallback used):", inferError);
    }

    return {
      summary: {
        face: segmented.face.length,
        shoulders: segmented.shoulders.length,
        arms: segmented.arms.length,
        torso: segmented.torso.length,
        legs: segmented.legs.length,
      },
      regions: segmented,
      landmarks: landmarkCategories,
      provider: this.activeProvider || "wasm",
    };
  }

  getActiveProvider() {
    return this.activeProvider || "wasm";
  }
}

export const onnxInferenceService = new OnnxInferenceService();
export default onnxInferenceService;
