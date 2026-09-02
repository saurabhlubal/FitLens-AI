import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { createPoseLandmarker } from "../../utils/pose/poseLandmarker";
import AuthenticatedNavbar from "../../components/layout/AuthenticatedNavbar";

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

      ctx.fillStyle = "#B8F23A";

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

    ctx.strokeStyle = "#B8F23A";
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
    <div className="min-h-screen bg-[#060608] text-[#F5F5F0]">
      {/* AUTHENTICATED NAVBAR */}
      <AuthenticatedNavbar />

      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-12">
        {/* HEADER */}
        <div className="mb-10">
          <span className="inline-block rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#B8F23A]">
            AI Vision
          </span>

          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F5F5F0]">
            AI Form Analysis
          </h1>

          <p className="mt-2 text-sm sm:text-base text-[#A8A8A2] leading-relaxed">
            Analyze your exercise form using camera-based movement detection.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* CAMERA */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 sm:p-8 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold uppercase tracking-wider text-[#F5F5F0]">
                Camera
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider ${
                  cameraOn
                    ? "border border-[#B8F23A]/30 bg-[#B8F23A]/10 text-[#B8F23A]"
                    : "border border-white/10 bg-[#141418] text-[#8E8E92]"
                }`}
              >
                {cameraOn ? "Camera On" : "Camera Off"}
              </span>
            </div>

            {/* VIDEO & SKELETON CANVAS */}
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[#040406]">
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
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#16161a] text-[#B8F23A]">
                      <Camera size={28} />
                    </div>

                    <p className="text-sm text-[#8E8E92]">
                      Camera is currently off
                    </p>
                  </div>
                </div>
              )}

              {detecting && (
                <div className="absolute left-4 top-4 rounded-xl border border-[#B8F23A]/40 bg-[#060608]/85 backdrop-blur-md px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#B8F23A]">
                  AI DETECTION ACTIVE
                </div>
              )}

              {landmarksDetected && (
                <div className="absolute right-4 top-4 rounded-xl border border-white/20 bg-[#060608]/85 backdrop-blur-md px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#F5F5F0]">
                  BODY DETECTED
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="mt-6 flex flex-wrap gap-3">
              {!cameraOn ? (
                <button
                  onClick={startCamera}
                  className="rounded-full bg-[#B8F23A] px-7 py-3 text-xs font-bold uppercase tracking-wider text-[#060608] transition-all duration-300 hover:bg-[#a6de2e] hover:shadow-[0_0_25px_rgba(184,242,58,0.3)]"
                >
                  Start Camera
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="rounded-full border border-red-500/30 bg-red-500/10 px-7 py-3 text-xs font-bold uppercase tracking-wider text-red-400 transition hover:bg-red-500/20"
                >
                  Stop Camera
                </button>
              )}

              {!detecting ? (
                <button
                  onClick={startDetection}
                  disabled={!cameraOn}
                  className="rounded-full bg-[#B8F23A] px-7 py-3 text-xs font-bold uppercase tracking-wider text-[#060608] transition-all duration-300 hover:bg-[#a6de2e] hover:shadow-[0_0_25px_rgba(184,242,58,0.3)] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Start AI Detection
                </button>
              ) : (
                <button
                  onClick={stopDetection}
                  className="rounded-full border border-orange-500/30 bg-orange-500/10 px-7 py-3 text-xs font-bold uppercase tracking-wider text-orange-400 transition hover:bg-orange-500/20"
                >
                  Stop AI Detection
                </button>
              )}
            </div>

            {/* STATUS */}
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#141418] p-4">
              <p className="text-xs font-mono text-[#D2D2CC]">
                {feedback || "Start the camera to begin."}
              </p>
            </div>
          </div>

          {/* ANALYSIS PANEL */}
          <div className="space-y-6">
            {/* EXERCISE */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 sm:p-7">
              <h2 className="mb-4 text-base font-bold uppercase tracking-wider text-[#F5F5F0]">
                Exercise
              </h2>

              <select
                value={exercise}
                onChange={(e) =>
                  setExercise(e.target.value)
                }
                className="w-full rounded-xl border border-white/[0.08] bg-[#141418] p-3 text-sm text-[#F5F5F0] outline-none transition focus:border-[#B8F23A]/50 focus:ring-1 focus:ring-[#B8F23A]/30"
              >
                <option value="Bicep Curl">Bicep Curl</option>
                <option value="Squat">Squat</option>
                <option value="Push Up">Push Up</option>
                <option value="Shoulder Press">Shoulder Press</option>
              </select>
            </div>

            {/* DETECTION STATUS */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8E8E92]">
                Pose Detection
              </p>

              <p
                className={`mt-2 text-2xl font-black uppercase tracking-tight ${
                  landmarksDetected
                    ? "text-[#B8F23A]"
                    : "text-[#55555A]"
                }`}
              >
                {landmarksDetected
                  ? "Body Detected"
                  : "Waiting..."}
              </p>
            </div>

            {/* FEEDBACK */}
            <div className="rounded-2xl border border-[#B8F23A]/20 bg-[#0e1208] p-6 sm:p-7">
              <h2 className="mb-3 text-base font-bold uppercase tracking-wider text-[#F5F5F0]">
                AI Feedback
              </h2>

              <p className="text-xs text-[#D2D2CC] leading-relaxed">
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