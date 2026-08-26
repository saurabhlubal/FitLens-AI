import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Play, Square } from "lucide-react";

import useAuth from "../../hooks/useAuth";

const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

/*
 * MediaPipe BlazePose landmark indices (33 landmarks):
 *   11/12 shoulders, 13/14 elbows, 15/16 wrists,
 *   23/24 hips, 25/26 knees, 27/28 ankles
 */
const EXERCISES = {
  "Bicep Curl": {
    joints: [
      [11, 13, 15],
      [12, 14, 16],
    ],
    downThreshold: 55,
    upThreshold: 145,
    cue: "Curl your hands toward your shoulders, then lower fully.",
  },
  Squat: {
    joints: [
      [23, 25, 27],
      [24, 26, 28],
    ],
    downThreshold: 100,
    upThreshold: 160,
    cue: "Lower until knees are bent past 90°, then stand tall.",
  },
  "Push-up": {
    joints: [
      [11, 13, 15],
      [12, 14, 16],
    ],
    downThreshold: 95,
    upThreshold: 155,
    cue: "Lower your chest between your hands, then press back up.",
  },
};

function calculateAngle(a, b, c) {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

export default function TrainPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  const rafRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  // Rep counting state kept in refs so the render loop never re-renders React.
  const stageRef = useRef("up");
  const repsRef = useRef(0);
  const exerciseRef = useRef(EXERCISES["Bicep Curl"]);

  const [exerciseName, setExerciseName] = useState("Bicep Curl");
  const [running, setRunning] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);
  const [error, setError] = useState(null);
  const [hud, setHud] = useState({ reps: 0, stage: "up", angle: null });

  useEffect(() => {
    exerciseRef.current = EXERCISES[exerciseName];
    stageRef.current = "up";
    repsRef.current = 0;
    setHud({ reps: 0, stage: "up", angle: null });
  }, [exerciseName]);

  useEffect(() => {
    return () => stopTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTracking = async () => {
    setError(null);
    try {
      setLoadingModel(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const vision = await import("@mediapipe/tasks-vision");
      const fileset = await vision.FilesetResolver.forVisionTasks(WASM_BASE);
      landmarkerRef.current = await vision.PoseLandmarker.createFromOptions(
        fileset,
        {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO",
          numPoses: 1,
        }
      );

      setLoadingModel(false);
      setRunning(true);
      renderLoop();
    } catch (err) {
      setLoadingModel(false);
      setError(
        err?.message?.includes("getUserMedia")
          ? "Could not access the webcam. Check browser permissions."
          : `Failed to load the pose model: ${err.message}`
      );
      stopCameraOnly();
    }
  };

  const stopCameraOnly = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setRunning(false);
  };

  const stopTracking = () => {
    cancelAnimationFrame(rafRef.current);
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    stopCameraOnly();
  };

  const updateRepCounter = (landmarks) => {
    const { joints, downThreshold, upThreshold } = exerciseRef.current;

    const angles = joints
      .map(([a, b, c]) => {
        const pa = landmarks[a];
        const pb = landmarks[b];
        const pc = landmarks[c];
        if (!pa || !pb || !pc) return null;
        if (
          (pa.visibility ?? 1) < 0.5 ||
          (pb.visibility ?? 1) < 0.5 ||
          (pc.visibility ?? 1) < 0.5
        ) {
          return null;
        }
        return calculateAngle(pa, pb, pc);
      })
      .filter((angle) => angle !== null);

    if (angles.length === 0) return null;
    const angle = angles.reduce((sum, value) => sum + value, 0) / angles.length;

    if (angle < downThreshold && stageRef.current === "up") {
      stageRef.current = "down";
    } else if (angle > upThreshold && stageRef.current === "down") {
      stageRef.current = "up";
      repsRef.current += 1;
    }

    return angle;
  };

  const renderLoop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !canvas || !landmarker) return;

    const loop = async () => {
      if (!landmarkerRef.current) return;

      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;

        const result = landmarker.detectForVideo(video, performance.now());
        const pose = result.landmarks?.[0];

        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (pose) {
          const { DrawingUtils, PoseLandmarker: PL } =
            await import("@mediapipe/tasks-vision");
          const utils = new DrawingUtils(ctx);
          utils.drawConnectors(
            pose,
            PL.POSE_CONNECTIONS,
            { color: "#34d399", lineWidth: 3 }
          );
          utils.drawLandmarks(pose, {
            color: "#f8fafc",
            fillColor: "#10b981",
            radius: 4,
          });

          const angle = updateRepCounter(pose);
          setHud({
            reps: repsRef.current,
            stage: stageRef.current,
            angle: angle !== null ? Math.round(angle) : null,
          });
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  };

  const resetReps = () => {
    repsRef.current = 0;
    stageRef.current = "up";
    setHud((prev) => ({ ...prev, reps: 0, stage: "up" }));
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
        <h1 className="text-3xl font-bold">Movement Trainer</h1>
        <p className="mt-2 text-slate-400">
          Live pose tracking with MediaPipe. Pick an exercise, start the camera
          and count your reps automatically.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`h-full w-full object-cover ${running ? "" : "hidden"}`}
              />
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 h-full w-full ${running ? "" : "hidden"}`}
              />
              {!running && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Activity className="h-8 w-8" />
                  <span>
                    {loadingModel ? "Loading pose model..." : "Camera is off"}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {!running ? (
                <button
                  onClick={startTracking}
                  disabled={loadingModel}
                  className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  {loadingModel ? "Starting..." : "Start tracking"}
                </button>
              ) : (
                <button
                  onClick={stopTracking}
                  className="flex items-center gap-2 rounded-lg bg-red-500/80 px-4 py-2 font-medium text-white transition hover:bg-red-500"
                >
                  <Square className="h-4 w-4" /> Stop tracking
                </button>
              )}
              <button
                onClick={resetReps}
                className="rounded-lg border border-white/15 px-4 py-2 text-slate-300 transition hover:bg-white/5"
              >
                Reset counter
              </button>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <label className="block text-sm text-slate-400">Exercise</label>
              <select
                value={exerciseName}
                onChange={(event) => setExerciseName(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/15 bg-slate-800 px-3 py-2"
              >
                {Object.keys(EXERCISES).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <p className="mt-3 text-sm text-slate-400">
                {EXERCISES[exerciseName].cue}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-6 text-center">
              <p className="text-sm uppercase tracking-wide text-slate-400">
                Reps
              </p>
              <p className="text-6xl font-bold text-emerald-400">{hud.reps}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg bg-slate-800/60 px-3 py-2">
                  <span className="block text-slate-500">Stage</span>
                  <span className="font-semibold capitalize">{hud.stage}</span>
                </div>
                <div className="rounded-lg bg-slate-800/60 px-3 py-2">
                  <span className="block text-slate-500">Joint angle</span>
                  <span className="font-semibold">
                    {hud.angle !== null ? `${hud.angle}°` : "--"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
