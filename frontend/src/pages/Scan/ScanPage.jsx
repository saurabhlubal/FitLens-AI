import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, VideoOff, Upload, ScanLine, FileText } from "lucide-react";

import api from "../../services/api";
import ocrService from "../../services/ocrService";
import AuthenticatedNavbar from "../../components/layout/AuthenticatedNavbar";

export default function ScanPage() {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900">
      <AuthenticatedNavbar />

      <main className="mx-auto max-w-7xl px-6 py-8 sm:py-10">
        <div>
          <span className="inline-block rounded-full border border-lime-300/80 bg-lime-100/60 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-900">
            AI OCR Document Scanner
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-950">
            Scan Workout Plan
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Point your camera at a physical workout sheet or upload a picture. FitLens AI extracts exercise routines, sets, and rep counts automatically.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* ================= Capture ================= */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
            <h2 className="flex items-center gap-2 text-base font-bold uppercase tracking-wider text-slate-950">
              <Camera className="h-5 w-5 text-slate-900" /> Webcam & Camera Feed
            </h2>

            <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl border border-slate-900 bg-[#040406] shadow-xl">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`h-full w-full object-cover ${cameraOn ? "" : "hidden"}`}
              />
              {!cameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <VideoOff className="h-8 w-8" />
                  <span className="text-sm font-medium">Camera is inactive</span>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="mt-5 flex flex-wrap gap-3">
              {!cameraOn ? (
                <button
                  onClick={startCamera}
                  className="rounded-full bg-[#B8F23A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-[#a6de2e] shadow-xs"
                >
                  Start camera
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCapture}
                    disabled={analyzing}
                    className="flex items-center gap-2 rounded-full bg-[#B8F23A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-[#a6de2e] shadow-xs disabled:opacity-50"
                  >
                    <ScanLine className="h-4 w-4" />
                    {analyzing ? "Analyzing..." : "Capture & Analyze"}
                  </button>
                  <button
                    onClick={stopCamera}
                    className="rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-red-600 transition hover:bg-red-100"
                  >
                    Stop camera
                  </button>
                </>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzing}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:border-slate-300 hover:text-slate-950 shadow-xs disabled:opacity-50"
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
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-950">
              Detected Workout Data
            </h2>

            {!result && !analyzing && (
              <p className="mt-6 text-sm text-slate-500">
                Capture a photo or upload an image above to extract workout routines.
              </p>
            )}

            {previewUrl && (
              <img
                src={previewUrl}
                alt="Scanned workout"
                className="mt-4 max-h-48 rounded-xl border border-slate-200 object-contain shadow-xs"
              />
            )}

            {analyzing && (
              <p className="mt-6 animate-pulse text-sm font-semibold text-slate-900">
                Running neural OCR extraction...
              </p>
            )}

            {result && !analyzing && !result.success && (
              <p className="mt-6 text-sm text-slate-500">
                No readable workout text was found. Try better lighting or a closer shot.
              </p>
            )}

            {result?.success && (
              <div className="mt-4 space-y-4">
                {(result.exercises || []).map((exercise, index) => (
                  <div
                    key={`${exercise.exerciseName}-${index}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-950">
                        {exercise.exerciseName}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          exercise.confidence >= 0.85
                            ? "border border-lime-300 bg-lime-100 text-slate-900"
                            : exercise.confidence >= 0.55
                              ? "border border-amber-300 bg-amber-100 text-amber-900"
                              : "border border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {Math.round(exercise.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-slate-600">
                      {exercise.sets ?? "?"} sets × {exercise.reps ?? "?"} reps
                    </p>
                  </div>
                ))}

                <details className="text-xs text-slate-500">
                  <summary className="cursor-pointer font-medium hover:text-slate-800">Raw OCR text</summary>
                  <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-100 p-3 font-mono text-[11px] text-slate-700">{result.text}</pre>
                </details>

                <div className="border-t border-slate-100 pt-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Add first exercise to workout
                  </label>
                  <div className="mt-2 flex gap-2">
                    <select
                      value={selectedWorkoutId}
                      onChange={(event) =>
                        setSelectedWorkoutId(event.target.value)
                      }
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
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
                      className="rounded-xl bg-[#B8F23A] px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-[#a6de2e] shadow-xs disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                  {saveStatus && (
                    <p
                      className={`mt-2 text-xs font-semibold ${saveStatus.ok ? "text-emerald-600" : "text-red-600"}`}
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



