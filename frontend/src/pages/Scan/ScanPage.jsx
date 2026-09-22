import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, VideoOff, Upload, ScanLine } from "lucide-react";

import api from "../../services/api";
import ocrService from "../../services/ocrService";
import useAuth from "../../hooks/useAuth";

export default function ScanPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("");
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWorkouts = async () => {
    try {
      const response = await api.get("/workouts");
      setWorkouts(response.data);
    } catch {
      /* workouts list is optional for scanning */
    }
  };

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch (err) {
      setError(
        "Could not access the webcam. Check browser permissions or upload an image instead."
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  const analyzeBlob = async (blob) => {
    setAnalyzing(true);
    setError(null);
    setResult(null);
    setSaveStatus(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(blob));

    try {
      const data = await ocrService.analyzeWorkoutImage(blob);
      setResult(data);
      if (data.success) loadWorkouts();
    } catch (err) {
      setError(err.message || "Failed to reach the OCR service.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob((blob) => blob && analyzeBlob(blob), "image/png");
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) analyzeBlob(file);
    event.target.value = "";
  };

  /**
   * Sends the detected exercise to Spring Boot.
   * OCR only knows the exercise NAME — the backend owns the IDs,
   * so we match the name against GET /api/exercises here.
   */
  const handleAddToWorkout = async () => {
    if (!result?.success || !selectedWorkoutId || !result.exerciseName) return;

    setSaveStatus(null);
    try {
      const exercisesResponse = await api.get("/exercises");
      const match = exercisesResponse.data.find(
        (exercise) =>
          exercise.name.toLowerCase() === result.exerciseName.toLowerCase()
      );

      if (!match) {
        setSaveStatus({
          ok: false,
          message: `"${result.exerciseName}" is not in the exercise library yet. Ask the backend team to add it.`,
        });
        return;
      }

      await api.post(`/workouts/${selectedWorkoutId}/exercises`, {
        exerciseId: match.id,
        sets: result.sets ?? null,
        reps: result.reps ?? null,
      });

      setSaveStatus({ ok: true, message: `Added "${match.name}" to your workout.` });
      navigate(`/workouts/${selectedWorkoutId}`);
    } catch (err) {
      setSaveStatus({
        ok: false,
        message:
          err.response?.data?.message ||
          "Could not add the exercise to the workout.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-white/10 bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-2xl font-bold text-emerald-400"
          >
            FitLens AI
          </button>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/workouts")}
              className="text-slate-300 transition hover:text-white"
            >
              Workouts
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-500/10 px-4 py-2 text-red-400 transition hover:bg-red-500/20"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-bold">Scan Workout</h1>
        <p className="mt-2 text-slate-400">
          Point your camera at a workout plan or upload an image. FitLens AI
          extracts the exercise, sets and reps automatically.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* ================= Capture ================= */}
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Camera className="h-5 w-5 text-emerald-400" /> Webcam
            </h2>

            <div className="relative mt-4 aspect-video overflow-hidden rounded-xl border border-white/10 bg-black">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`h-full w-full object-cover ${cameraOn ? "" : "hidden"}`}
              />
              {!cameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <VideoOff className="h-8 w-8" />
                  <span>Camera is off</span>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="mt-4 flex flex-wrap gap-3">
              {!cameraOn ? (
                <button
                  onClick={startCamera}
                  className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-emerald-400"
                >
                  Start camera
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCapture}
                    disabled={analyzing}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                  >
                    <ScanLine className="h-4 w-4" />
                    {analyzing ? "Analyzing..." : "Capture & Analyze"}
                  </button>
                  <button
                    onClick={stopCamera}
                    className="rounded-lg border border-white/15 px-4 py-2 text-slate-300 transition hover:bg-white/5"
                  >
                    Stop camera
                  </button>
                </>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzing}
                className="flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" /> Upload image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/bmp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </section>

          {/* ================= Result ================= */}
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">Detected workout</h2>

            {!result && !analyzing && (
              <p className="mt-6 text-slate-500">
                Capture or upload an image to see results here.
              </p>
            )}

            {previewUrl && (
              <img
                src={previewUrl}
                alt="Scanned workout"
                className="mt-4 max-h-48 rounded-xl border border-white/10 object-contain"
              />
            )}

            {analyzing && (
              <p className="mt-6 animate-pulse text-emerald-400">
                Running OCR...
              </p>
            )}

            {result && !analyzing && !result.success && (
              <p className="mt-6 text-slate-400">
                No readable workout text was found. Try better lighting or a
                closer shot.
              </p>
            )}

            {result?.success && (
              <div className="mt-4 space-y-4">
                {(result.exercises || []).map((exercise, index) => (
                  <div
                    key={`${exercise.exerciseName}-${index}`}
                    className="rounded-xl border border-white/10 bg-slate-800/50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        {exercise.exerciseName}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          exercise.confidence >= 0.85
                            ? "bg-emerald-500/15 text-emerald-400"
                            : exercise.confidence >= 0.55
                              ? "bg-yellow-500/15 text-yellow-400"
                              : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {Math.round(exercise.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      {exercise.sets ?? "?"} sets × {exercise.reps ?? "?"} reps
                    </p>
                  </div>
                ))}

                <details className="text-xs text-slate-500">
                  <summary className="cursor-pointer">Raw OCR text</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{result.text}</pre>
                </details>

                <div className="border-t border-white/10 pt-4">
                  <label className="block text-sm text-slate-400">
                    Add first exercise to workout
                  </label>
                  <div className="mt-2 flex gap-2">
                    <select
                      value={selectedWorkoutId}
                      onChange={(event) =>
                        setSelectedWorkoutId(event.target.value)
                      }
                      className="flex-1 rounded-lg border border-white/15 bg-slate-800 px-3 py-2 text-sm"
                    >
                      <option value="">Select a workout...</option>
                      {workouts.map((workout) => (
                        <option key={workout.id} value={workout.id}>
                          {workout.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddToWorkout}
                      disabled={!selectedWorkoutId}
                      className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                  {saveStatus && (
                    <p
                      className={`mt-2 text-sm ${saveStatus.ok ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {saveStatus.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
