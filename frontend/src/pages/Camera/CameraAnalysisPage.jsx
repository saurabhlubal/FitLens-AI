import { useEffect, useRef, useState } from "react";
import { createPoseLandmarker } from "../../utils/pose/poseLandmarker";

export default function CameraAnalysisPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const animationRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [exercise, setExercise] = useState("Bicep Curl");
  const [detecting, setDetecting] = useState(false);

  const [landmarksDetected, setLandmarksDetected] = useState(false);
  const [feedback, setFeedback] = useState("");

  // =========================
  // START CAMERA
  // =========================

  const startCamera = async () => {
    try {
      setFeedback("Starting camera...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 1280,
          height: 720,
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();
      }

      setCameraOn(true);
      setFeedback("Camera started.");
    } catch (error) {
      console.error("Camera error:", error);

      setFeedback(
        "Unable to access camera. Check browser camera permission."
      );
    }
  };

  // =========================
  // STOP CAMERA
  // =========================

  const stopCamera = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    const canvas = canvasRef.current;

    if (canvas) {
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    setCameraOn(false);
    setDetecting(false);
    setLandmarksDetected(false);
    setFeedback("");
  };

  // =========================
  // DRAW LANDMARKS
  // =========================

  const drawLandmarks = (landmarks) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) {
      return;
    }

    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks) {
      return;
    }

    // Draw points

    landmarks.forEach((landmark) => {
      const x = landmark.x * canvas.width;
      const y = landmark.y * canvas.height;

      ctx.beginPath();

      ctx.arc(x, y, 5, 0, Math.PI * 2);

      ctx.fillStyle = "#10b981";

      ctx.fill();
    });

    // Body connections

    const connections = [
      [11, 12],

      [11, 13],
      [13, 15],

      [12, 14],
      [14, 16],

      [11, 23],
      [12, 24],

      [23, 24],

      [23, 25],
      [25, 27],

      [24, 26],
      [26, 28],
    ];

    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;

    connections.forEach(([start, end]) => {
      const pointA = landmarks[start];
      const pointB = landmarks[end];

      if (!pointA || !pointB) {
        return;
      }

      ctx.beginPath();

      ctx.moveTo(
        pointA.x * canvas.width,
        pointA.y * canvas.height
      );

      ctx.lineTo(
        pointB.x * canvas.width,
        pointB.y * canvas.height
      );

      ctx.stroke();
    });
  };

  // =========================
  // POSE DETECTION
  // =========================

  const detectPose = () => {
    const video = videoRef.current;

    if (
      !video ||
      !poseLandmarkerRef.current ||
      video.readyState < 2
    ) {
      animationRef.current = requestAnimationFrame(detectPose);

      return;
    }

    const timestamp = performance.now();

    try {
      const result =
        poseLandmarkerRef.current.detectForVideo(
          video,
          timestamp
        );

      if (
        result.landmarks &&
        result.landmarks.length > 0
      ) {
        const landmarks = result.landmarks[0];

        setLandmarksDetected(true);

        drawLandmarks(landmarks);
      } else {
        setLandmarksDetected(false);

        const canvas = canvasRef.current;

        if (canvas) {
          const ctx = canvas.getContext("2d");

          ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
          );
        }
      }
    } catch (error) {
      console.error("Pose detection error:", error);
    }

    animationRef.current = requestAnimationFrame(detectPose);
  };

  // =========================
  // START AI DETECTION
  // =========================

  const startDetection = async () => {
    if (!cameraOn) {
      setFeedback("Start the camera first.");

      return;
    }

    try {
      setFeedback("Loading AI pose model...");

      poseLandmarkerRef.current =
        await createPoseLandmarker();

      setDetecting(true);

      setFeedback(
        "AI pose detection running. Stand in front of the camera."
      );

      if (!animationRef.current) {
        animationRef.current =
          requestAnimationFrame(detectPose);
      }
    } catch (error) {
  console.error("Pose Landmarker error:", error);

  setFeedback(
    `Unable to load AI model: ${
      error?.message || "Unknown error"
    }`
  );
}
  };

  // =========================
  // STOP AI DETECTION
  // =========================

  const stopDetection = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);

      animationRef.current = null;
    }

    setDetecting(false);

    setLandmarksDetected(false);

    const canvas = canvasRef.current;

    if (canvas) {
      const ctx = canvas.getContext("2d");

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }

    setFeedback("AI pose detection stopped.");
  };

  // =========================
  // CLEANUP
  // =========================

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            AI Form Analysis
          </h1>

          <p className="mt-2 text-slate-400">
            Analyze your exercise form using
            camera-based movement detection.
          </p>

        </div>

        {/* MAIN GRID */}

        <div className="grid gap-8 lg:grid-cols-3">

          {/* CAMERA */}

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 lg:col-span-2">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-2xl font-semibold">
                Camera
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-sm ${
                  cameraOn
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                {cameraOn
                  ? "Camera On"
                  : "Camera Off"}
              </span>

            </div>

            {/* CAMERA */}

            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />

              <canvas
                ref={canvasRef}
                className="pointer-events-none absolute inset-0 h-full w-full"
              />

              {!cameraOn && (
                <div className="absolute inset-0 flex items-center justify-center">

                  <div className="text-center">

                    <div className="mb-3 text-5xl">
                      📷
                    </div>

                    <p className="text-slate-400">
                      Camera is currently off
                    </p>

                  </div>

                </div>
              )}

              {detecting && (
                <div className="absolute left-4 top-4 rounded-lg bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-black">
                  AI DETECTION
                </div>
              )}

              {landmarksDetected && (
                <div className="absolute right-4 top-4 rounded-lg bg-blue-500/90 px-4 py-2 text-sm font-semibold text-white">
                  BODY DETECTED
                </div>
              )}

            </div>

            {/* BUTTONS */}

            <div className="mt-5 flex flex-wrap gap-3">

              {!cameraOn ? (
                <button
                  onClick={startCamera}
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
                >
                  Start Camera
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="rounded-xl bg-red-600 px-6 py-3 font-semibold hover:bg-red-500"
                >
                  Stop Camera
                </button>
              )}

              {!detecting ? (
                <button
                  onClick={startDetection}
                  disabled={!cameraOn}
                  className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Start AI Detection
                </button>
              ) : (
                <button
                  onClick={stopDetection}
                  className="rounded-xl bg-orange-600 px-6 py-3 font-semibold hover:bg-orange-500"
                >
                  Stop AI Detection
                </button>
              )}

            </div>

            {/* STATUS */}

            <div className="mt-4 rounded-xl bg-slate-800 p-4">

              <p className="text-sm text-slate-300">
                {feedback ||
                  "Start the camera to begin."}
              </p>

            </div>

          </div>

          {/* ANALYSIS PANEL */}

          <div className="space-y-6">

            {/* EXERCISE */}

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">

              <h2 className="mb-4 text-xl font-semibold">
                Exercise
              </h2>

              <select
                value={exercise}
                onChange={(e) =>
                  setExercise(e.target.value)
                }
                className="w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
              >

                <option value="Bicep Curl">
                  Bicep Curl
                </option>

                <option value="Squat">
                  Squat
                </option>

                <option value="Push Up">
                  Push Up
                </option>

                <option value="Shoulder Press">
                  Shoulder Press
                </option>

              </select>

            </div>

            {/* DETECTION STATUS */}

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Pose Detection
              </p>

              <p
                className={`mt-2 text-2xl font-bold ${
                  landmarksDetected
                    ? "text-emerald-400"
                    : "text-slate-500"
                }`}
              >
                {landmarksDetected
                  ? "Body Detected"
                  : "Waiting..."}
              </p>

            </div>

            {/* FEEDBACK */}

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">

              <h2 className="mb-3 text-xl font-semibold">
                AI Feedback
              </h2>

              <p className="text-slate-400">
                {feedback ||
                  "Start camera analysis to receive form feedback."}
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}