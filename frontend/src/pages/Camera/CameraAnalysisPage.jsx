import { useEffect, useRef, useState } from "react";

export default function CameraAnalysisPage() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [exercise, setExercise] = useState("Bicep Curl");
  const [analyzing, setAnalyzing] = useState(false);

  const [formScore, setFormScore] = useState(null);
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState("");

  // =========================
  // START CAMERA
  // =========================
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraOn(true);
      setFeedback("Camera started. Ready for analysis.");
    } catch (error) {
      console.error("Camera error:", error);
      setFeedback(
        "Unable to access camera. Please allow camera permission."
      );
    }
  };

  // =========================
  // STOP CAMERA
  // =========================
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setAnalyzing(false);
    setFeedback("");
  };

  // =========================
  // START / STOP ANALYSIS
  // =========================
  const toggleAnalysis = () => {
    if (!cameraOn) {
      setFeedback("Start the camera first.");
      return;
    }

    if (analyzing) {
      setAnalyzing(false);
      setFeedback("AI analysis stopped.");
      return;
    }

    setAnalyzing(true);
    setFormScore(92);
    setReps(0);
    setFeedback("AI analysis running...");
  };

  // =========================
  // CLEANUP
  // =========================
  useEffect(() => {
    return () => {
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

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            AI Form Analysis
          </h1>

          <p className="mt-2 text-slate-400">
            Analyze your exercise form using camera-based movement detection.
          </p>
        </div>

        {/* =========================
            MAIN GRID
        ========================= */}

        <div className="grid gap-8 lg:grid-cols-3">

          {/* =========================
              CAMERA
          ========================= */}

          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-900 p-6">

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
                {cameraOn ? "Camera On" : "Camera Off"}
              </span>
            </div>

            {/* CAMERA VIEW */}

            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
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

              {analyzing && (
                <div className="absolute left-4 top-4 rounded-lg bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-black">
                  AI ANALYZING
                </div>
              )}

            </div>

            {/* CAMERA BUTTONS */}

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

              <button
                onClick={toggleAnalysis}
                disabled={!cameraOn}
                className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {analyzing
                  ? "Stop AI Analysis"
                  : "Start AI Analysis"}
              </button>

            </div>
          </div>

          {/* =========================
              ANALYSIS PANEL
          ========================= */}

          <div className="space-y-6">

            {/* EXERCISE */}

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">

              <h2 className="mb-4 text-xl font-semibold">
                Exercise
              </h2>

              <select
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
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

            {/* FORM SCORE */}

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Form Score
              </p>

              <p className="mt-2 text-5xl font-bold">
                {formScore !== null
                  ? `${formScore}%`
                  : "--"}
              </p>

            </div>

            {/* REPS */}

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Repetitions
              </p>

              <p className="mt-2 text-5xl font-bold">
                {reps}
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