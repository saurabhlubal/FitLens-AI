import {
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

let poseLandmarker = null;

export async function createPoseLandmarker() {
  if (poseLandmarker) {
    return poseLandmarker;
  }

  try {
    console.log("Loading MediaPipe WASM runtime from CDN...");

    // Fast global edge CDN with local fallback
    let vision;
    try {
      vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
      );
    } catch {
      vision = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
    }

    console.log("MediaPipe WASM initialized.");

    console.log("Loading Pose Landmarker model...");

    poseLandmarker = await PoseLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputSegmentationMasks: false,
      }
    );

    console.log("Pose Landmarker model ready.");
    return poseLandmarker;
  } catch (error) {
    console.error("Failed to initialize PoseLandmarker:", error);
    throw error;
  }
}