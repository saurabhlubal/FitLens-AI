import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Dumbbell,
  Activity,
  Save,
  RefreshCw,
  BookOpen,
  Sparkles,
  Info,
  ShieldCheck,
  Zap,
  Target,
  ChevronRight,
  Flame,
} from "lucide-react";
import { createPoseLandmarker } from "../../utils/pose/poseLandmarker";
import AuthenticatedNavbar from "../../components/layout/AuthenticatedNavbar";
import { useAuthContext } from "../../context/AuthContext";
import aiService from "../../services/aiService";
import { EXERCISE_GUIDES } from "../../constants/exerciseGuides";

// Anatomical Segment Color Scheme (MediaPipe Landmark Nodes)
const ANATOMICAL_PALETTE = {
  face: { color: "#38BDF8", label: "Face / Head", glow: "rgba(56, 189, 248, 0.6)" },
  shoulders: { color: "#F59E0B", label: "Shoulders", glow: "rgba(245, 158, 11, 0.6)" },
  arms: { color: "#A855F7", label: "Arms & Forearms", glow: "rgba(168, 85, 247, 0.6)" },
  torso: { color: "#10B981", label: "Torso & Core", glow: "rgba(16, 185, 129, 0.6)" },
  legs: { color: "#EC4899", label: "Legs & Lower Body", glow: "rgba(236, 72, 153, 0.6)" },
};

function getLandmarkCategory(index) {
  if (index <= 10) return "face";
  if (index === 11 || index === 12) return "shoulders";
  if (index >= 13 && index <= 22) return "arms";
  if (index === 23 || index === 24) return "torso";
  return "legs";
}

// MediaPipe Landmark Connections
const SKELETON_CONNECTIONS = [
  // Face
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10],
  // Shoulders & Torso
  [11, 12], [11, 23], [12, 24], [23, 24],
  // Left Arm
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  // Right Arm
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  // Left Leg
  [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
  // Right Leg
  [24, 26], [26, 28], [28, 30], [28, 32], [30, 32],
];

export default function CameraAnalysisPage() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthContext();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const animationRef = useRef(null);

  // Landmark smoothing filter state (Exponential Moving Average)
  const smoothedLandmarksRef = useRef(null);

  // Throttling and inference state refs
  const lastInferenceTimeRef = useRef(0);
  const isInferringRef = useRef(false);
  const currentRepsRef = useRef(0);
  const currentStageRef = useRef("up");
  const formStatusHistoryRef = useRef([]);

  // Session ID to discard in-flight async responses after a reset
  const sessionIdRef = useRef(0);

  const [cameraOn, setCameraOn] = useState(false);
  const [exercise, setExercise] = useState("Bicep Curl");
  const [detecting, setDetecting] = useState(false);
  const [landmarksDetected, setLandmarksDetected] = useState(false);
  const [activeTab, setActiveTab] = useState("vision"); // "vision" | "guide"

  // Real-time AI Telemetry State
  const [reps, setReps] = useState(0);
  const [stage, setStage] = useState("up");
  const [isCorrectForm, setIsCorrectForm] = useState(true);
  const [formStatus, setFormStatus] = useState("Good Form"); // "Good Form" | "Bad Form"
  const [feedback, setFeedback] = useState("Start camera to begin AI movement detection.");
  const [jointAngles, setJointAngles] = useState({});
  const [romPercentage, setRomPercentage] = useState(0);

  // Workout Session Context (if navigated from workouts)
  const [workoutContext, setWorkoutContext] = useState(null);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeGuide = EXERCISE_GUIDES[exercise] || EXERCISE_GUIDES["Bicep Curl"];

  useEffect(() => {
    currentRepsRef.current = reps;
  }, [reps]);

  useEffect(() => {
    currentStageRef.current = stage;
  }, [stage]);

  // Load workout exercise details if exerciseId param present
  useEffect(() => {
    if (!exerciseId || !token) return;

    const fetchWorkoutContext = async () => {
      try {
        const workoutsRes = await fetch("http://localhost:8080/api/workouts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!workoutsRes.ok) return;
        const workouts = await workoutsRes.json();

        for (const w of workouts) {
          const exRes = await fetch(`http://localhost:8080/api/workouts/${w.id}/exercises`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (exRes.ok) {
            const exList = await exRes.json();
            const match = exList.find((e) => String(e.id) === String(exerciseId));
            if (match) {
              setWorkoutContext({ workoutId: w.id, exercise: match });
              setExercise(match.exerciseName);
              break;
            }
          }
        }
      } catch (err) {
        console.error("Could not fetch workout context:", err);
      }
    };

    fetchWorkoutContext();
  }, [exerciseId, token]);

  // =========================
  // START CAMERA
  // =========================
  const startCamera = async () => {
    try {
      setFeedback("Starting camera...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
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
      setFeedback("Camera connected. Ready for AI detection.");
    } catch (error) {
      console.error("Camera error:", error);
      setFeedback("Unable to access camera. Check browser camera permissions.");
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
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    smoothedLandmarksRef.current = null;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    setCameraOn(false);
    setDetecting(false);
    setLandmarksDetected(false);
    setFeedback("Camera stopped.");
  };

  // =========================
  // RESET SESSION
  // =========================
  const resetSession = () => {
    sessionIdRef.current += 1;
    isInferringRef.current = false;
    currentRepsRef.current = 0;
    currentStageRef.current = "up";
    formStatusHistoryRef.current = [];
    smoothedLandmarksRef.current = null;

    setReps(0);
    setStage("up");
    setIsCorrectForm(true);
    setFormStatus("Good Form");
    setRomPercentage(0);
    setSaveSuccess(false);
    setFeedback("Session reset! Step into frame and perform your rep.");
  };

  // ==========================================
  // LANDMARK SMOOTHING (Anti-Jitter Filter)
  // ==========================================
  const applySmoothingFilter = (rawLandmarks) => {
    if (!rawLandmarks || rawLandmarks.length === 0) return rawLandmarks;

    if (!smoothedLandmarksRef.current || smoothedLandmarksRef.current.length !== rawLandmarks.length) {
      smoothedLandmarksRef.current = rawLandmarks.map((lm) => ({ ...lm }));
      return rawLandmarks;
    }

    const alpha = 0.65;
    const smoothed = rawLandmarks.map((curr, idx) => {
      const prev = smoothedLandmarksRef.current[idx];
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const dynamicAlpha = dist < 0.006 ? 0.35 : dist > 0.04 ? 0.85 : alpha;

      const smoothX = prev.x + dynamicAlpha * (curr.x - prev.x);
      const smoothY = prev.y + dynamicAlpha * (curr.y - prev.y);
      const smoothZ = (prev.z || 0) + dynamicAlpha * ((curr.z || 0) - (prev.z || 0));

      return {
        x: smoothX,
        y: smoothY,
        z: smoothZ,
        visibility: curr.visibility,
      };
    });

    smoothedLandmarksRef.current = smoothed;
    return smoothed;
  };

  // ==========================================
  // DRAW EXERCISE TARGET SKELETON / FRAME GUIDE
  // ==========================================
  const drawTargetSkeletonOverlay = (ctx, width, height, currentExercise, inFrame) => {
    ctx.save();
    if (currentExercise === "Bicep Curl" || currentExercise === "Hammer Curl") {
      const guideColor = inFrame ? "rgba(184, 242, 58, 0.25)" : "rgba(255, 255, 255, 0.15)";
      ctx.strokeStyle = guideColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);

      const shoulderLeft = { x: width * 0.38, y: height * 0.35 };
      const elbowLeft = { x: width * 0.38, y: height * 0.58 };
      const wristDownLeft = { x: width * 0.38, y: height * 0.80 };

      const shoulderRight = { x: width * 0.62, y: height * 0.35 };
      const elbowRight = { x: width * 0.62, y: height * 0.58 };
      const wristDownRight = { x: width * 0.62, y: height * 0.80 };

      ctx.beginPath();
      ctx.moveTo(shoulderLeft.x, shoulderLeft.y);
      ctx.lineTo(elbowLeft.x, elbowLeft.y);
      ctx.lineTo(wristDownLeft.x, wristDownLeft.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(shoulderRight.x, shoulderRight.y);
      ctx.lineTo(elbowRight.x, elbowRight.y);
      ctx.lineTo(wristDownRight.x, wristDownRight.y);
      ctx.stroke();

      ctx.fillStyle = guideColor;
      ctx.beginPath();
      ctx.arc(elbowLeft.x, elbowLeft.y, 6, 0, Math.PI * 2);
      ctx.arc(elbowRight.x, elbowRight.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "bold 11px monospace";
      ctx.fillStyle = inFrame ? "rgba(184, 242, 58, 0.7)" : "rgba(255, 255, 255, 0.4)";
      ctx.textAlign = "center";
      ctx.fillText("PIN ELBOWS TO RIBS", width * 0.5, height * 0.95);
    }
    ctx.restore();
  };

  // ==========================================
  // DRAW LANDMARKS WITH ANATOMICAL COLOR SCHEME
  // ==========================================
  const drawLandmarks = (landmarks, formValid, inFrame = true) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawTargetSkeletonOverlay(ctx, canvas.width, canvas.height, exercise, inFrame);

    if (!landmarks) return;

    const boneColor = formValid ? "rgba(184, 242, 58, 0.75)" : "rgba(239, 68, 68, 0.75)";
    ctx.strokeStyle = boneColor;
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    SKELETON_CONNECTIONS.forEach(([start, end]) => {
      const pointA = landmarks[start];
      const pointB = landmarks[end];

      if (!pointA || !pointB) return;
      if (pointA.visibility !== undefined && pointA.visibility < 0.35) return;
      if (pointB.visibility !== undefined && pointB.visibility < 0.35) return;

      ctx.beginPath();
      ctx.moveTo(pointA.x * canvas.width, pointA.y * canvas.height);
      ctx.lineTo(pointB.x * canvas.width, pointB.y * canvas.height);
      ctx.stroke();
    });

    landmarks.forEach((landmark, index) => {
      if (landmark.visibility !== undefined && landmark.visibility < 0.35) return;

      const x = landmark.x * canvas.width;
      const y = landmark.y * canvas.height;

      const category = getLandmarkCategory(index);
      const palette = ANATOMICAL_PALETTE[category] || ANATOMICAL_PALETTE.torso;

      ctx.beginPath();
      ctx.arc(x, y, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = palette.color;
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  };

  // =========================
  // REAL-TIME POSE DETECTION LOOP
  // =========================
  const detectPose = async () => {
    const video = videoRef.current;

    if (!video || !poseLandmarkerRef.current || video.readyState < 2) {
      animationRef.current = requestAnimationFrame(detectPose);
      return;
    }

    const timestamp = performance.now();

    try {
      const result = poseLandmarkerRef.current.detectForVideo(video, timestamp);

      if (result.landmarks && result.landmarks.length > 0) {
        const rawLandmarks = result.landmarks[0];
        setLandmarksDetected(true);

        const smoothLandmarks = applySmoothingFilter(rawLandmarks);

        const now = Date.now();
        if (now - lastInferenceTimeRef.current >= 80 && !isInferringRef.current) {
          isInferringRef.current = true;
          lastInferenceTimeRef.current = now;
          const capturedSessionId = sessionIdRef.current;

          aiService
            .analyzeMovement(
              exercise,
              smoothLandmarks,
              currentRepsRef.current,
              currentStageRef.current
            )
            .then((res) => {
              if (capturedSessionId !== sessionIdRef.current) {
                return;
              }

              if (res) {
                if (res.repetitionCount !== undefined) {
                  setReps(res.repetitionCount);
                  currentRepsRef.current = res.repetitionCount;
                }
                if (res.stage) {
                  setStage(res.stage);
                  currentStageRef.current = res.stage;
                }
                if (res.isCorrectForm !== undefined) {
                  setIsCorrectForm(res.isCorrectForm);
                  const status = res.isCorrectForm ? "Good Form" : "Bad Form";
                  setFormStatus(status);
                  formStatusHistoryRef.current.push(status);
                }
                if (res.feedback) {
                  setFeedback(res.feedback);
                }
                if (res.jointAngles) {
                  setJointAngles(res.jointAngles);
                }
                if (res.metrics?.romPercentage !== undefined) {
                  setRomPercentage(res.metrics.romPercentage);
                }
                
                const inFrame = res.metrics?.inBicepFrame ?? res.metrics?.inHammerFrame ?? true;
                drawLandmarks(smoothLandmarks, res.isCorrectForm, inFrame);
              }
            })
            .catch((err) => {
              console.error("AI Movement inference error:", err);
              drawLandmarks(smoothLandmarks, true);
            })
            .finally(() => {
              isInferringRef.current = false;
            });
        } else {
          drawLandmarks(smoothLandmarks, isCorrectForm);
        }
      } else {
        setLandmarksDetected(false);
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    } catch (error) {
      console.error("Pose detection frame loop error:", error);
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
      setFeedback("Initializing AI Vision & Kinematic Engine...");
      poseLandmarkerRef.current = await createPoseLandmarker();
      setDetecting(true);
      setFeedback("AI Vision active! Step back so your shoulders and arms are visible.");

      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(detectPose);
      }
    } catch (error) {
      console.error("Pose Landmarker error:", error);
      setFeedback(`Unable to load AI model: ${error?.message || "Unknown error"}`);
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
    smoothedLandmarksRef.current = null;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    setFeedback("AI movement detection paused.");
  };

  // =========================
  // SAVE FORM ANALYSIS TO WORKOUT
  // =========================
  const handleSaveToWorkout = async () => {
    if (!workoutContext) return;

    try {
      setSavingFeedback(true);
      await aiService.saveWorkoutExerciseAnalysis(
        workoutContext.workoutId,
        workoutContext.exercise.id,
        {
          reps: reps > 0 ? reps : workoutContext.exercise.reps,
          formScore: isCorrectForm ? 100 : 0,
          aiFeedback: feedback,
        }
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to save workout form analysis:", err);
      alert("Failed to save analysis to workout: " + err.message);
    } finally {
      setSavingFeedback(false);
    }
  };

  // =========================
  // CLEANUP
  // =========================
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#060608] text-[#F5F5F0]">
      {/* AUTHENTICATED NAVBAR */}
      <AuthenticatedNavbar />

      <div className="mx-auto max-w-7xl px-6 py-8 sm:py-10">
        {/* TOP BAR / NAVIGATION */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              {workoutContext && (
                <button
                  onClick={() => navigate(`/workouts/${workoutContext.workoutId}`)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0c0c0e] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#D2D2CC] transition hover:border-[#B8F23A]/40 hover:text-white"
                >
                  <ArrowLeft size={14} />
                  Back to Workout
                </button>
              )}
              <span className="inline-block rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#B8F23A]">
                AI Biomechanics Engine
              </span>
            </div>

            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F5F5F0]">
              {workoutContext ? `${workoutContext.exercise.exerciseName} Analysis` : `${exercise} AI Coach`}
            </h1>

            <p className="mt-1 text-sm sm:text-base text-[#A8A8A2] leading-relaxed">
              Real-time computer vision movement detection, anti-jitter skeletal landmark tracking &amp; full-cycle repetition counting.
            </p>
          </div>

          {/* TAB SWITCHER & ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex rounded-xl border border-white/10 bg-[#121216] p-1">
              <button
                onClick={() => setActiveTab("vision")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "vision"
                    ? "bg-[#B8F23A] text-[#060608] shadow-[0_0_15px_rgba(184,242,58,0.3)]"
                    : "text-[#8E8E92] hover:text-white"
                }`}
              >
                <Camera size={14} />
                <span>Live Vision</span>
              </button>
              <button
                onClick={() => setActiveTab("guide")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "guide"
                    ? "bg-[#B8F23A] text-[#060608] shadow-[0_0_15px_rgba(184,242,58,0.3)]"
                    : "text-[#8E8E92] hover:text-white"
                }`}
              >
                <BookOpen size={14} />
                <span>How-To Guide</span>
              </button>
            </div>

            <button
              onClick={resetSession}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#141418] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#D2D2CC] transition hover:border-white/20 hover:text-white"
            >
              <RefreshCw size={14} />
              Reset Reps
            </button>

            {workoutContext && (
              <button
                onClick={handleSaveToWorkout}
                disabled={savingFeedback}
                className="inline-flex items-center gap-2 rounded-xl bg-[#B8F23A] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#060608] transition-all hover:bg-[#a6de2e] hover:shadow-[0_0_25px_rgba(184,242,58,0.3)] disabled:opacity-50"
              >
                <Save size={14} />
                {savingFeedback ? "Saving..." : saveSuccess ? "Saved to Workout!" : "Save to Workout"}
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: LIVE VISION & MOVEMENT DETECTION */}
        {/* ============================================================ */}
        {activeTab === "vision" && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* CAMERA STAGE (2 COLS) */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 sm:p-8 lg:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Dumbbell size={18} className="text-[#B8F23A]" />
                  <h2 className="text-lg font-bold uppercase tracking-wider text-[#F5F5F0]">
                    Live Visual Stream
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider ${
                      cameraOn
                        ? "border border-[#B8F23A]/30 bg-[#B8F23A]/10 text-[#B8F23A]"
                        : "border border-white/10 bg-[#141418] text-[#8E8E92]"
                    }`}
                  >
                    {cameraOn ? "Camera Active" : "Camera Idle"}
                  </span>

                  {detecting && (
                    <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-sky-400 animate-pulse">
                      ML 12 FPS
                    </span>
                  )}
                </div>
              </div>

              {/* VIDEO & SKELETON CANVAS */}
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[#040406] shadow-2xl">
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
                      <p className="text-sm font-semibold text-[#F5F5F0]">Camera Inactive</p>
                      <p className="mt-1 text-xs text-[#8E8E92]">
                        Click "Start Camera" to initialize the optical feed.
                      </p>
                    </div>
                  </div>
                )}

                {/* OVERLAY TELEMETRY HUDS */}
                {detecting && (
                  <>
                    {/* TOP LEFT: REP HUD */}
                    <div className="absolute left-4 top-4 flex items-center gap-3 rounded-2xl border border-white/15 bg-[#060608]/90 backdrop-blur-md px-4 py-2.5 shadow-xl">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E92]">
                          Reps
                        </p>
                        <p className="text-2xl font-black font-mono text-[#B8F23A]">{reps}</p>
                      </div>
                      <div className="h-8 w-px bg-white/10" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E92]">
                          Stage
                        </p>
                        <p className="text-xs font-mono font-bold uppercase text-[#F5F5F0]">
                          {stage}
                        </p>
                      </div>
                    </div>

                    {/* TOP RIGHT: FORM QUALITY STATUS (GOOD FORM vs BAD FORM) */}
                    <div className="absolute right-4 top-4 flex items-center gap-3 rounded-2xl border border-white/15 bg-[#060608]/90 backdrop-blur-md px-4 py-2.5 shadow-xl">
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E92]">
                          Form Quality
                        </p>
                        <p
                          className={`text-sm font-black font-mono uppercase tracking-wider ${
                            isCorrectForm ? "text-[#B8F23A]" : "text-red-400"
                          }`}
                        >
                          {formStatus}
                        </p>
                      </div>
                      <div>
                        {isCorrectForm ? (
                          <CheckCircle2 size={24} className="text-[#B8F23A]" />
                        ) : (
                          <AlertTriangle size={24} className="text-red-400 animate-bounce" />
                        )}
                      </div>
                    </div>

                    {/* BOTTOM OVERLAY: ROM PROGRESS BAR */}
                    <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-[#060608]/85 backdrop-blur-md p-2.5">
                      <div className="flex justify-between text-[11px] font-mono font-bold text-[#D2D2CC] mb-1.5">
                        <span>Range of Motion (ROM)</span>
                        <span className="text-[#B8F23A]">{romPercentage}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-lime-500 to-[#B8F23A] transition-all duration-150"
                          style={{ width: `${romPercentage}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ANATOMICAL COLOR LEGEND */}
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.06] bg-[#121216] px-4 py-2.5">
                <span className="text-[10px] font-mono font-bold uppercase text-[#8E8E92]">
                  ResNet Landmarks:
                </span>
                {Object.entries(ANATOMICAL_PALETTE).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-1.5 text-xs font-mono text-[#D2D2CC]">
                    <span
                      className="h-2.5 w-2.5 rounded-full shadow-[0_0_8px]"
                      style={{ backgroundColor: val.color, boxShadow: `0 0 8px ${val.color}` }}
                    />
                    <span>{val.label}</span>
                  </div>
                ))}
              </div>

              {/* CONTROLS */}
              <div className="mt-6 flex flex-wrap gap-3">
                {!cameraOn ? (
                  <button
                    onClick={startCamera}
                    className="rounded-full bg-[#B8F23A] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-[#060608] transition-all duration-300 hover:bg-[#a6de2e] hover:shadow-[0_0_25px_rgba(184,242,58,0.3)]"
                  >
                    Start Camera
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="rounded-full border border-red-500/30 bg-red-500/10 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-red-400 transition hover:bg-red-500/20"
                  >
                    Stop Camera
                  </button>
                )}

                {!detecting ? (
                  <button
                    onClick={startDetection}
                    disabled={!cameraOn}
                    className="rounded-full bg-[#B8F23A] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-[#060608] transition-all duration-300 hover:bg-[#a6de2e] hover:shadow-[0_0_25px_rgba(184,242,58,0.3)] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Start AI Form Tracking
                  </button>
                ) : (
                  <button
                    onClick={stopDetection}
                    className="rounded-full border border-orange-500/30 bg-orange-500/10 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-orange-400 transition hover:bg-orange-500/20"
                  >
                    Pause AI Detection
                  </button>
                )}
              </div>

              {/* LIVE FEEDBACK CUE */}
              <div
                className={`mt-4 rounded-xl border p-4 transition-all duration-300 ${
                  !isCorrectForm
                    ? "border-red-500/40 bg-red-950/20"
                    : "border-white/[0.06] bg-[#141418]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity
                    size={16}
                    className={!isCorrectForm ? "text-red-400" : "text-[#B8F23A]"}
                  />
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#8E8E92]">
                    Live Coaching Cue
                  </p>
                </div>
                <p
                  className={`mt-1.5 text-sm font-semibold ${
                    !isCorrectForm ? "text-red-300" : "text-[#F5F5F0]"
                  }`}
                >
                  {feedback}
                </p>
              </div>
            </div>

            {/* TELEMETRY & CONTROLS SIDEBAR (1 COL) */}
            <div className="space-y-6">
              {/* EXERCISE SELECTOR */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 sm:p-7">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold uppercase tracking-wider text-[#F5F5F0]">
                    Target Exercise
                  </h2>
                  <button
                    onClick={() => setActiveTab("guide")}
                    className="text-xs font-mono font-bold text-[#B8F23A] hover:underline"
                  >
                    View Guide →
                  </button>
                </div>

                <select
                  value={exercise}
                  onChange={(e) => {
                    setExercise(e.target.value);
                    resetSession();
                  }}
                  disabled={detecting}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#141418] p-3 text-sm text-[#F5F5F0] outline-none transition focus:border-[#B8F23A]/50 focus:ring-1 focus:ring-[#B8F23A]/30 disabled:opacity-60"
                >
                  <option value="Bicep Curl">Bicep Curl</option>
                  <option value="Squat">Squat</option>
                  <option value="Push-up">Push-up</option>
                  <option value="Shoulder Press">Shoulder Press</option>
                  <option value="Lateral Raise">Lateral Raise</option>
                  <option value="Lunge">Lunge</option>
                  <option value="Jumping Jacks">Jumping Jacks</option>
                  <option value="Plank">Plank</option>
                  <option value="Hammer Curl">Hammer Curl</option>
                </select>
              </div>

              {/* METRICS HUD */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 sm:p-7">
                <h2 className="mb-4 text-base font-bold uppercase tracking-wider text-[#F5F5F0]">
                  Session Telemetry
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/[0.06] bg-[#141418] p-4 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E92]">
                      Total Reps
                    </p>
                    <p className="mt-1 text-3xl font-black font-mono text-[#B8F23A]">{reps}</p>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-[#141418] p-4 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E92]">
                      Form Status
                    </p>
                    <p
                      className={`mt-2 text-lg font-black font-mono uppercase tracking-wider ${
                        isCorrectForm ? "text-[#B8F23A]" : "text-red-400"
                      }`}
                    >
                      {formStatus}
                    </p>
                  </div>
                </div>

                {/* JOINT ANGLES DETAIL */}
                {jointAngles && Object.keys(jointAngles).some((k) => jointAngles[k] !== null) && (
                  <div className="mt-4 border-t border-white/[0.06] pt-4 space-y-2 text-xs font-mono text-[#A8A8A2]">
                    {jointAngles.leftElbow !== null && jointAngles.leftElbow !== undefined && (
                      <div className="flex justify-between">
                        <span>Left Elbow Angle:</span>
                        <span className="font-bold text-[#F5F5F0]">{jointAngles.leftElbow}°</span>
                      </div>
                    )}
                    {jointAngles.rightElbow !== null && jointAngles.rightElbow !== undefined && (
                      <div className="flex justify-between">
                        <span>Right Elbow Angle:</span>
                        <span className="font-bold text-[#F5F5F0]">{jointAngles.rightElbow}°</span>
                      </div>
                    )}
                    {jointAngles.leftShoulder !== null && jointAngles.leftShoulder !== undefined && (
                      <div className="flex justify-between">
                        <span>Left Shoulder Angle:</span>
                        <span className="font-bold text-[#F5F5F0]">{jointAngles.leftShoulder}°</span>
                      </div>
                    )}
                    {jointAngles.rightShoulder !== null && jointAngles.rightShoulder !== undefined && (
                      <div className="flex justify-between">
                        <span>Right Shoulder Angle:</span>
                        <span className="font-bold text-[#F5F5F0]">{jointAngles.rightShoulder}°</span>
                      </div>
                    )}
                    {jointAngles.leftKnee !== null && jointAngles.leftKnee !== undefined && (
                      <div className="flex justify-between">
                        <span>Left Knee Angle:</span>
                        <span className="font-bold text-[#F5F5F0]">{jointAngles.leftKnee}°</span>
                      </div>
                    )}
                    {jointAngles.rightKnee !== null && jointAngles.rightKnee !== undefined && (
                      <div className="flex justify-between">
                        <span>Right Knee Angle:</span>
                        <span className="font-bold text-[#F5F5F0]">{jointAngles.rightKnee}°</span>
                      </div>
                    )}
                    {jointAngles.backAngle !== null && jointAngles.backAngle !== undefined && (
                      <div className="flex justify-between">
                        <span>Torso / Spine Angle:</span>
                        <span className="font-bold text-[#F5F5F0]">{jointAngles.backAngle}°</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* QUICK BIOMECHANICS SUMMARY */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 sm:p-7">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} className="text-[#B8F23A]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F0]">
                    Rep Counting Rules
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-[#A8A8A2] leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-[#B8F23A] font-bold">✓</span>
                    <span><strong>Form Verification:</strong> Reps increment ONLY when executed in <strong>Good Form</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B8F23A] font-bold">✓</span>
                    <span><strong>1 Full Cycle:</strong> Must start from extended bottom (&gt;150°) then curl up to contraction (&lt;45°).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#B8F23A] font-bold">✓</span>
                    <span><strong>Elbow Anchor:</strong> Pinned to ribs throughout. Swinging arms triggers <strong>Bad Form</strong> and discards rep.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: INTERACTIVE HOW-TO EXECUTION GUIDE */}
        {/* ============================================================ */}
        {activeTab === "guide" && (
          <div className="space-y-8">
            {/* GUIDE HERO BANNER */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0c0c10] via-[#14141c] to-[#0c0c10] p-8 sm:p-12 shadow-2xl">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-3 py-1 text-[11px] font-mono font-bold uppercase text-[#B8F23A]">
                      {activeGuide.category}
                    </span>
                    <span className="rounded-full border border-white/10 bg-[#1a1a20] px-3 py-1 text-[11px] font-mono font-bold uppercase text-[#D2D2CC]">
                      Difficulty: {activeGuide.difficulty}
                    </span>
                    <span className="rounded-full border border-white/10 bg-[#1a1a20] px-3 py-1 text-[11px] font-mono font-bold uppercase text-[#D2D2CC]">
                      Gear: {activeGuide.equipment}
                    </span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F5F0]">
                    {activeGuide.name} Execution Blueprint
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm sm:text-base text-[#A8A8A2] leading-relaxed">
                    {activeGuide.overview}
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("vision")}
                  className="inline-flex items-center gap-2 self-start rounded-full bg-[#B8F23A] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-[#060608] shadow-[0_0_20px_rgba(184,242,58,0.3)] transition hover:bg-[#a6de2e] md:self-center"
                >
                  <Camera size={16} />
                  Start Live Workout
                </button>
              </div>

              {/* TARGET MUSCLES PILLS */}
              <div className="mt-8 border-t border-white/[0.08] pt-6 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-[#8E8E92] mr-2">
                  Target Muscle Groups:
                </span>
                {activeGuide.targetMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-mono font-bold text-purple-300"
                  >
                    <Flame size={12} className="text-purple-400" />
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            {/* 4-STEP BIOMECHANICAL FLOW */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <Sparkles size={20} className="text-[#B8F23A]" />
                <h3 className="text-xl font-bold uppercase tracking-wider text-[#F5F5F0]">
                  Step-by-Step Kinematic Execution
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {activeGuide.steps.map((s) => (
                  <div
                    key={s.step}
                    className="relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 transition-all hover:border-[#B8F23A]/40 hover:shadow-lg"
                  >
                    <div>
                      <span className="text-3xl font-black font-mono text-[#B8F23A]/30">
                        {s.step}
                      </span>
                      <h4 className="mt-2 text-base font-bold text-[#F5F5F0]">{s.title}</h4>
                      <p className="mt-2 text-xs sm:text-sm text-[#A8A8A2] leading-relaxed">
                        {s.desc}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#B8F23A]">
                      <span>Phase {s.step}</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TWO-COLUMN FORM RULES & MISTAKES */}
            <div className="grid gap-8 md:grid-cols-2">
              {/* KEY STANDARDS */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 sm:p-8">
                <div className="mb-5 flex items-center gap-2.5">
                  <ShieldCheck size={20} className="text-[#B8F23A]" />
                  <h4 className="text-base font-bold uppercase tracking-wider text-[#F5F5F0]">
                    AI Form Validation Standards
                  </h4>
                </div>

                <ul className="space-y-3">
                  {activeGuide.keyPoints.map((pt, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-white/[0.04] bg-[#141418] p-3.5 text-xs sm:text-sm text-[#D2D2CC]"
                    >
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#B8F23A]" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* COMMON FAULTS */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 sm:p-8">
                <div className="mb-5 flex items-center gap-2.5">
                  <AlertTriangle size={20} className="text-red-400" />
                  <h4 className="text-base font-bold uppercase tracking-wider text-[#F5F5F0]">
                    Common Biomechanical Faults
                  </h4>
                </div>

                <ul className="space-y-3">
                  {activeGuide.commonMistakes.map((mistake, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-red-500/10 bg-red-950/10 p-3.5 text-xs sm:text-sm text-[#E2C4C4]"
                    >
                      <span className="mt-0.5 shrink-0 text-xs font-bold font-mono text-red-400">
                        [!]
                      </span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}