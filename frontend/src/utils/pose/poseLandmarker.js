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
    console.log("Loading local MediaPipe WASM...");

    const vision = await FilesetResolver.forVisionTasks(
      "/mediapipe/wasm"
    );

    console.log("MediaPipe WASM loaded.");

    console.log("Loading local Pose Landmarker model...");

    poseLandmarker = await PoseLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath:
            "/models/pose_landmarker_lite.task",

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

    console.log(
      "Pose Landmarker loaded successfully."
    );

    return poseLandmarker;
  } catch (error) {
    console.error(
      "Pose Landmarker initialization failed:",
      error
    );

    poseLandmarker = null;

    throw error;
  }
}