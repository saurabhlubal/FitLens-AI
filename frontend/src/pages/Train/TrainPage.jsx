import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Play, Square } from "lucide-react";

import useAuth from "../../hooks/useAuth";
import AuthenticatedNavbar from "../../components/layout/AuthenticatedNavbar";

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
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900">
      <AuthenticatedNavbar />

      <main className="mx-auto max-w-7xl px-6 py-10 sm:py-12">
        <div className="mb-8">
          <span className="inline-block rounded-full border border-lime-500/30 bg-lime-400/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-lime-600">
            Movement Trainer
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">
            Live Movement Trainer
          </h1>
          <p className="mt-2 text-slate-600 leading-relaxed max-w-2xl text-sm sm:text-base">
            Live pose tracking with MediaPipe. Pick an exercise, start the camera
            and count your reps automatically with real-time joint angle feedback.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Activity className="h-8 w-8 text-slate-500" />
                  <span className="text-sm font-medium">
                    {loadingModel ? "Loading pose model..." : "Camera is off"}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {!running ? (
                <button
                  onClick={startTracking}
                  disabled={loadingModel}
                  className="flex items-center gap-2 rounded-xl bg-[#B8F23A] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-[#a6de2e] hover:shadow-[0_0_20px_rgba(184,242,58,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-slate-950" />
                  {loadingModel ? "Starting..." : "Start Tracking"}
                </button>
              ) : (
                <button
                  onClick={stopTracking}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-red-700 cursor-pointer"
                >
                  <Square className="h-4 w-4 fill-white" /> Stop Tracking
                </button>
              )}
              <button
                onClick={resetReps}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
              >
                Reset Counter
              </button>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Exercise Target
              </label>
              <select
                value={exerciseName}
                onChange={(event) => setExerciseName(event.target.value)}
                className="mt-2.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-slate-400 focus:outline-none"
              >
                {Object.keys(EXERCISES).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                {EXERCISES[exerciseName].cue}
              </p>
            </div>

            <div className="rounded-2xl border border-lime-500/30 bg-lime-50/40 p-6 text-center shadow-xs">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Total Reps
              </p>
              <p className="mt-2 text-6xl font-black tracking-tight text-slate-900">{hud.reps}</p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-slate-200/60 bg-white p-3 shadow-2xs">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Stage</span>
                  <span className="mt-1 block font-bold capitalize text-slate-900">{hud.stage}</span>
                </div>
                <div className="rounded-xl border border-slate-200/60 bg-white p-3 shadow-2xs">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Joint Angle</span>
                  <span className="mt-1 block font-bold text-slate-900">
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
