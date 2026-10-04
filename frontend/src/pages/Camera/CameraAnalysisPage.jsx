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
  Lock,
  Trophy,
  Check,
  FastForward,
  Play,
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
  const { workoutId, exerciseId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthContext();

  const isWorkoutMode = Boolean(workoutId || exerciseId);

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
  const sessionDataRef = useRef({});
  const isTransitioningRef = useRef(false);
  const formScoresRef = useRef([]);

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
  const [aiState, setAiState] = useState("READY");
  const [detectedExercise, setDetectedExercise] = useState(null);
  const [isCorrectForm, setIsCorrectForm] = useState(true);
  const [formStatus, setFormStatus] = useState("Good Form");
  const [feedback, setFeedback] = useState("Start camera to begin AI movement detection.");
  const [jointAngles, setJointAngles] = useState({});
  const [romPercentage, setRomPercentage] = useState(0);

  // Active Workout Protocol State
  const [workout, setWorkout] = useState(null);
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restCountdown, setRestCountdown] = useState(null);
  const [interstitialState, setInterstitialState] = useState(null); // null | 'set_complete' | 'exercise_complete'
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(false);
  const [completedSummary, setCompletedSummary] = useState([]);

  const [savingFeedback, setSavingFeedback] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentWorkoutExercise = workoutExercises[currentExerciseIndex] || null;
  const targetSets = currentWorkoutExercise ? currentWorkoutExercise.sets : 3;
  const targetReps = currentWorkoutExercise ? currentWorkoutExercise.reps : 10;

  const activeGuide = EXERCISE_GUIDES[exercise] || EXERCISE_GUIDES["Bicep Curl"];

  useEffect(() => {
    currentRepsRef.current = reps;
  }, [reps]);

  useEffect(() => {
    currentStageRef.current = stage;
  }, [stage]);

  // ============================================================
  // LOAD WORKOUT DATA (Locked Workout Sequence)
  // ============================================================
  useEffect(() => {
    if (!token || !isWorkoutMode) return;

    const loadWorkoutData = async () => {
      try {
        if (workoutId) {
          const [wRes, exRes] = await Promise.all([
            fetch(`http://localhost:8080/api/workouts/${workoutId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`http://localhost:8080/api/workouts/${workoutId}/exercises`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          if (wRes.ok && exRes.ok) {
            const wData = await wRes.json();
            const exData = await exRes.json();
            setWorkout(wData);
            setWorkoutExercises(exData);

            if (exData.length > 0) {
              setCurrentExerciseIndex(0);
              setExercise(exData[0].exerciseName);
            }
          }
        } else if (exerciseId) {
          const workoutsRes = await fetch("http://localhost:8080/api/workouts", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (workoutsRes.ok) {
            const allWorkouts = await workoutsRes.json();
            for (const w of allWorkouts) {
              const exRes = await fetch(`http://localhost:8080/api/workouts/${w.id}/exercises`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (exRes.ok) {
                const exList = await exRes.json();
                const matchIndex = exList.findIndex((e) => String(e.id) === String(exerciseId));
                if (matchIndex !== -1) {
                  setWorkout(w);
                  setWorkoutExercises(exList);
                  setCurrentExerciseIndex(matchIndex);
                  setExercise(exList[matchIndex].exerciseName);
                  break;
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Could not fetch workout context:", err);
      }
    };

    loadWorkoutData();
  }, [workoutId, exerciseId, token, isWorkoutMode]);

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
    sessionDataRef.current = {};
    formScoresRef.current = [];

    setReps(0);
    setStage("up");
    setAiState("READY");
    setDetectedExercise(null);
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

  // ============================================================
  // SET & EXERCISE AUTO-PROGRESSION ENGINE
  // ============================================================
  const handleSetOrExerciseCompletion = useCallback(async (achievedReps) => {
    if (isTransitioningRef.current || !currentWorkoutExercise) return;
    isTransitioningRef.current = true;

    const currentEx = currentWorkoutExercise;
    const finalSets = currentEx.sets || 3;
    const currentScores = formScoresRef.current;
    const avgScore =
      currentScores.length > 0
        ? Math.round(currentScores.reduce((a, b) => a + b, 0) / currentScores.length)
        : 100;

    // Check if more sets remain for this exercise
    if (currentSet < finalSets) {
      setInterstitialState("set_complete");
      setFeedback(`Set ${currentSet} of ${finalSets} completed! Rest up before the next set.`);

      // Rest countdown: 5 seconds
      let secondsLeft = 5;
      setRestCountdown(secondsLeft);
      const timer = setInterval(() => {
        secondsLeft -= 1;
        if (secondsLeft > 0) {
          setRestCountdown(secondsLeft);
        } else {
          clearInterval(timer);
          startNextSet();
        }
      }, 1000);
    } else {
      // All sets completed for this exercise!
      setInterstitialState("exercise_complete");

      // Auto-save this exercise analysis to backend
      try {
        await aiService.saveWorkoutExerciseAnalysis(
          workout ? workout.id : workoutId,
          currentEx.id,
          {
            reps: achievedReps,
            formScore: avgScore,
            aiFeedback: `Completed ${finalSets} sets of ${achievedReps} reps with ${avgScore}% form accuracy.`,
          }
        );
      } catch (err) {
        console.error("Auto-save exercise error:", err);
      }

      setCompletedSummary((prev) => [
        ...prev,
        {
          exerciseName: currentEx.exerciseName,
          sets: finalSets,
          reps: achievedReps,
          formScore: avgScore,
          aiFeedback: `Completed ${finalSets} sets × ${achievedReps} reps in Good Form.`,
        },
      ]);

      // Check if more exercises remain in the workout sequence
      const nextIndex = currentExerciseIndex + 1;
      if (nextIndex < workoutExercises.length) {
        // More exercises in sequence: 5-second transition
        let secondsLeft = 5;
        setRestCountdown(secondsLeft);
        const timer = setInterval(() => {
          secondsLeft -= 1;
          if (secondsLeft > 0) {
            setRestCountdown(secondsLeft);
          } else {
            clearInterval(timer);
            advanceToNextExercise(nextIndex);
          }
        }, 1000);
      } else {
        // WORKOUT FINISHED!
        setIsWorkoutCompleted(true);
        setInterstitialState(null);
        isTransitioningRef.current = false;
        stopDetection();
      }
    }
  }, [currentWorkoutExercise, currentSet, currentExerciseIndex, workoutExercises, workout, workoutId]);

  const startNextSet = () => {
    setRestCountdown(null);
    setInterstitialState(null);
    setCurrentSet((prev) => prev + 1);

    // Reset detector state for next set
    sessionIdRef.current += 1;
    currentRepsRef.current = 0;
    currentStageRef.current = "up";
    sessionDataRef.current = {};
    formScoresRef.current = [];

    setReps(0);
    setStage("up");
    setRomPercentage(0);
    isTransitioningRef.current = false;
    setFeedback(`Set ${currentSet + 1} started! Step into frame and perform your repetitions.`);
  };

  const advanceToNextExercise = (nextIndex) => {
    setRestCountdown(null);
    setInterstitialState(null);
    setCurrentExerciseIndex(nextIndex);

    const nextExercise = workoutExercises[nextIndex];
    setExercise(nextExercise.exerciseName);
    setCurrentSet(1);

    // Reset detector state for next exercise
    sessionIdRef.current += 1;
    currentRepsRef.current = 0;
    currentStageRef.current = "up";
    sessionDataRef.current = {};
    smoothedLandmarksRef.current = null;
    formScoresRef.current = [];

    setReps(0);
    setStage("up");
    setRomPercentage(0);
    isTransitioningRef.current = false;
    setFeedback(`Next exercise: ${nextExercise.exerciseName}! Align your body to begin.`);
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
        if (now - lastInferenceTimeRef.current >= 80 && !isInferringRef.current && !isTransitioningRef.current) {
          isInferringRef.current = true;
          lastInferenceTimeRef.current = now;
          const capturedSessionId = sessionIdRef.current;

          aiService
            .analyzeMovement(
              exercise,
              smoothLandmarks,
              currentRepsRef.current,
              currentStageRef.current,
              sessionDataRef.current
            )
            .then((res) => {
              if (capturedSessionId !== sessionIdRef.current) {
                return;
              }

              if (res) {
                if (res.sessionData) {
                  sessionDataRef.current = res.sessionData;
                }
                if (res.aiState) {
                  setAiState(res.aiState);
                }
                if (res.detectedExercise !== undefined) {
                  setDetectedExercise(res.detectedExercise);
                }
                if (res.repetitionCount !== undefined) {
                  setReps(res.repetitionCount);
                  currentRepsRef.current = res.repetitionCount;

                  // Check if repetition target reached in workout mode
                  if (isWorkoutMode && currentWorkoutExercise) {
                    const reqReps = currentWorkoutExercise.reps || 10;
                    if (res.repetitionCount >= reqReps && !isTransitioningRef.current) {
                      handleSetOrExerciseCompletion(res.repetitionCount);
                    }
                  }
                }
                if (res.stage) {
                  setStage(res.stage);
                  currentStageRef.current = res.stage;
                }
                if (res.formScore !== null && res.formScore !== undefined && res.isCorrectForm !== undefined) {
                  setIsCorrectForm(res.isCorrectForm);
                  const status = res.isCorrectForm ? "Good Form" : "Bad Form";
                  setFormStatus(status);
                  formStatusHistoryRef.current.push(status);
                  formScoresRef.current.push(res.formScore);
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

                const inFrame =
                  res.metrics?.inBicepFrame ??
                  res.metrics?.inHammerFrame ??
                  res.aiState !== "POSITION_ADJUSTMENT";
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
      setFeedback(`AI Vision active! Step back so your body is visible for ${exercise}.`);

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
  // MANUAL SAVE TO WORKOUT
  // =========================
  const handleSaveToWorkout = async () => {
    if (!currentWorkoutExercise) return;

    try {
      setSavingFeedback(true);
      const avgScore =
        formScoresRef.current.length > 0
          ? Math.round(formScoresRef.current.reduce((a, b) => a + b, 0) / formScoresRef.current.length)
          : 100;

      await aiService.saveWorkoutExerciseAnalysis(
        workout ? workout.id : workoutId,
        currentWorkoutExercise.id,
        {
          reps: reps > 0 ? reps : currentWorkoutExercise.reps,
          formScore: avgScore,
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
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900">
      {/* AUTHENTICATED NAVBAR */}
      <AuthenticatedNavbar />

      <div className="mx-auto max-w-7xl px-6 py-8 sm:py-10">
        {/* TOP BAR / NAVIGATION */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              {workout && (
                <button
                  onClick={() => navigate(`/workouts/${workout.id}`)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700 shadow-xs transition hover:border-slate-300 hover:text-slate-950"
                >
                  <ArrowLeft size={14} />
                  Back to Routine
                </button>
              )}
              {isWorkoutMode ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-300/80 bg-lime-100/60 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-900">
                  <Lock size={12} className="text-lime-700" />
                  Locked Active Workout
                </span>
              ) : (
                <span className="inline-block rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-700">
                  Standalone AI Sandbox
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-950">
              {isWorkoutMode && workout
                ? `${workout.name}: ${exercise}`
                : `${exercise} AI Coach`}
            </h1>

            <p className="mt-1 text-sm sm:text-base text-slate-600 leading-relaxed">
              {isWorkoutMode
                ? `Exercise ${currentExerciseIndex + 1} of ${workoutExercises.length} • Set ${currentSet} of ${targetSets} • Goal: ${targetReps} Reps`
                : "Real-time computer vision movement detection, anti-jitter skeletal landmark tracking & full-cycle repetition counting."}
            </p>
          </div>

          {/* TAB SWITCHER & ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
              <button
                onClick={() => setActiveTab("vision")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "vision"
                    ? "bg-[#B8F23A] text-slate-950 shadow-xs"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <Camera size={14} />
                <span>Live Vision</span>
              </button>
              <button
                onClick={() => setActiveTab("guide")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "guide"
                    ? "bg-[#B8F23A] text-slate-950 shadow-xs"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <BookOpen size={14} />
                <span>How-To Guide</span>
              </button>
            </div>

            <button
              onClick={resetSession}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-xs transition hover:border-slate-300 hover:text-slate-950"
            >
              <RefreshCw size={14} />
              Reset Reps
            </button>

            {isWorkoutMode && (
              <button
                onClick={handleSaveToWorkout}
                disabled={savingFeedback}
                className="inline-flex items-center gap-2 rounded-xl bg-[#B8F23A] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all hover:bg-[#a6de2e] shadow-xs disabled:opacity-50"
              >
                <Save size={14} />
                {savingFeedback ? "Saving..." : saveSuccess ? "Saved to Workout!" : "Save Progress"}
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* WORKOUT COMPLETION CELEBRATION MODAL */}
        {/* ============================================================ */}
        {isWorkoutCompleted && (
          <div className="mb-8 rounded-3xl border border-lime-300 bg-gradient-to-br from-lime-50 to-white p-8 sm:p-10 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#B8F23A] text-slate-950 shadow-md mb-4">
                <Trophy size={40} />
              </div>

              <span className="rounded-full border border-lime-300 bg-lime-100 px-4 py-1 text-xs font-mono font-bold uppercase text-slate-900">
                Protocol Complete
              </span>

              <h2 className="mt-3 text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-950">
                Workout Finished!
              </h2>

              <p className="mt-2 max-w-lg text-sm text-slate-600 leading-relaxed">
                Outstanding execution! All exercises in {workout ? workout.name : "your workout"} have been completed with validated biomechanical form tracking.
              </p>

              {/* SUMMARY TABLE */}
              <div className="mt-6 w-full max-w-2xl divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white text-left shadow-xs">
                {completedSummary.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-100 text-xs font-bold font-mono text-lime-800">
                        ✓
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{item.exerciseName}</h4>
                        <p className="text-xs text-slate-500 font-mono">
                          {item.sets} sets × {item.reps} reps
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="rounded-md border border-lime-300 bg-lime-50 px-2.5 py-1 text-xs font-mono font-bold text-slate-950">
                        Form Score: {item.formScore} / 100
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate(workout ? `/workouts/${workout.id}` : "/workouts")}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#B8F23A] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md hover:bg-[#a6de2e] transition"
              >
                <span>Return to Workout Routine</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 1: LIVE VISION & MOVEMENT DETECTION */}
        {/* ============================================================ */}
        {activeTab === "vision" && !isWorkoutCompleted && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* CAMERA STAGE (2 COLS) */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 lg:col-span-2 shadow-xs">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Dumbbell size={18} className="text-slate-900" />
                  <h2 className="text-lg font-bold uppercase tracking-wider text-slate-950">
                    Live Optical Stream
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider ${
                      cameraOn
                        ? "border border-lime-300 bg-lime-100 text-slate-900"
                        : "border border-slate-200 bg-slate-100 text-slate-600"
                    }`}
                  >
                    {cameraOn ? "Camera Active" : "Camera Idle"}
                  </span>

                  {detecting && (
                    <span className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-sky-700 animate-pulse">
                      ML 12 FPS
                    </span>
                  )}
                </div>
              </div>

              {/* VIDEO & SKELETON CANVAS */}
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-900 bg-[#040406] shadow-xl">
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

                {/* OVERLAY: SET COMPLETE / REST BREAK INTERSTITIAL */}
                {interstitialState === "set_complete" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-center p-6 z-20">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#B8F23A] text-slate-950 mb-3 shadow-lg">
                      <Check size={28} />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                      Set {currentSet} Complete!
                    </h3>
                    <p className="mt-1 text-xs text-slate-300">
                      Take a quick rest. Next set starting soon...
                    </p>
                    {restCountdown !== null && (
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-3xl font-black font-mono text-[#B8F23A]">
                          0{restCountdown}s
                        </span>
                      </div>
                    )}
                    <button
                      onClick={startNextSet}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#B8F23A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md hover:bg-[#a6de2e]"
                    >
                      <Play size={13} fill="currentColor" />
                      <span>Start Set {currentSet + 1} Now</span>
                    </button>
                  </div>
                )}

                {/* OVERLAY: EXERCISE COMPLETE INTERSTITIAL */}
                {interstitialState === "exercise_complete" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm text-center p-6 z-20">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-400 text-slate-950 mb-3 shadow-lg">
                      <Trophy size={28} />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                      {exercise} Completed!
                    </h3>
                    <p className="mt-1 text-xs text-slate-300">
                      All {targetSets} sets finished in Good Form. Saving telemetry...
                    </p>
                    {currentExerciseIndex + 1 < workoutExercises.length && (
                      <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                        Next Up: <strong className="text-white">{workoutExercises[currentExerciseIndex + 1].exerciseName}</strong>
                      </div>
                    )}
                    {restCountdown !== null && (
                      <span className="mt-3 text-2xl font-black font-mono text-[#B8F23A]">
                        Next in 0{restCountdown}s
                      </span>
                    )}
                    {currentExerciseIndex + 1 < workoutExercises.length && (
                      <button
                        onClick={() => advanceToNextExercise(currentExerciseIndex + 1)}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#B8F23A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md hover:bg-[#a6de2e]"
                      >
                        <FastForward size={14} />
                        <span>Continue Now</span>
                      </button>
                    )}
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
                        <p className="text-2xl font-black font-mono text-[#B8F23A]">
                          {reps}
                          {isWorkoutMode && (
                            <span className="text-sm font-normal text-slate-400">/{targetReps}</span>
                          )}
                        </p>
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
                      {isWorkoutMode && (
                        <>
                          <div className="h-8 w-px bg-white/10" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E92]">
                              Set
                            </p>
                            <p className="text-xs font-mono font-bold uppercase text-[#B8F23A]">
                              {currentSet}/{targetSets}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* TOP CENTER: AI STATUS BADGE */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-4 flex items-center gap-2 rounded-2xl border border-white/15 bg-[#060608]/90 backdrop-blur-md px-3.5 py-1.5 shadow-xl z-10">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          aiState === "EXERCISE_MISMATCH"
                            ? "bg-rose-500 animate-ping"
                            : aiState === "POSITION_ADJUSTMENT"
                            ? "bg-amber-400 animate-pulse"
                            : aiState === "REP_COUNTING"
                            ? "bg-[#B8F23A] animate-pulse"
                            : "bg-emerald-400"
                        }`}
                      />
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#F5F5F0]">
                        {aiState === "POSITION_ADJUSTMENT"
                          ? "Position Adjustment"
                          : aiState === "EXERCISE_MISMATCH"
                          ? "Exercise Mismatch"
                          : aiState === "REP_COUNTING"
                          ? "Rep Counting"
                          : aiState === "FORM_FEEDBACK"
                          ? "Form Coaching"
                          : "AI Tracking"}
                      </span>
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
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
                  ResNet Landmarks:
                </span>
                {Object.entries(ANATOMICAL_PALETTE).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-700">
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
                    className="rounded-full bg-[#B8F23A] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-300 hover:bg-[#a6de2e] shadow-xs"
                  >
                    Start Camera
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="rounded-full border border-red-200 bg-red-50 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-red-600 transition hover:bg-red-100"
                  >
                    Stop Camera
                  </button>
                )}

                {!detecting ? (
                  <button
                    onClick={startDetection}
                    disabled={!cameraOn}
                    className="rounded-full bg-slate-950 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-slate-800 shadow-xs disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Start AI Form Tracking
                  </button>
                ) : (
                  <button
                    onClick={stopDetection}
                    className="rounded-full border border-amber-300 bg-amber-50 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-amber-800 transition hover:bg-amber-100"
                  >
                    Pause AI Detection
                  </button>
                )}
              </div>

              {/* LIVE FEEDBACK CUE / MISMATCH WARNING */}
              <div
                className={`mt-4 rounded-xl border p-4 transition-all duration-300 ${
                  aiState === "EXERCISE_MISMATCH"
                    ? "border-rose-400 bg-rose-100 text-rose-950 shadow-md"
                    : aiState === "POSITION_ADJUSTMENT"
                    ? "border-amber-300 bg-amber-50/90 text-amber-950"
                    : !isCorrectForm
                    ? "border-red-200 bg-red-50/80 text-red-900"
                    : "border-slate-200 bg-slate-50 text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity
                    size={16}
                    className={
                      aiState === "EXERCISE_MISMATCH"
                        ? "text-rose-700 animate-bounce"
                        : aiState === "POSITION_ADJUSTMENT"
                        ? "text-amber-600"
                        : !isCorrectForm
                        ? "text-red-500"
                        : "text-emerald-600"
                    }
                  />
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                    {aiState === "EXERCISE_MISMATCH"
                      ? "Exercise Validation Alert — Rep Discarded"
                      : aiState === "POSITION_ADJUSTMENT"
                      ? "Position & Framing Guidance"
                      : "Live Coaching Cue"}
                  </p>
                </div>
                <p
                  className={`mt-1.5 text-sm font-semibold ${
                    aiState === "EXERCISE_MISMATCH"
                      ? "text-rose-950"
                      : aiState === "POSITION_ADJUSTMENT"
                      ? "text-amber-950"
                      : !isCorrectForm
                      ? "text-red-900"
                      : "text-slate-900"
                  }`}
                >
                  {aiState === "EXERCISE_MISMATCH" && detectedExercise
                    ? `Exercise Mismatch: Expected ${exercise}, but detected ${detectedExercise}. Please perform ${exercise} to count reps.`
                    : feedback}
                </p>
              </div>
            </div>

            {/* TELEMETRY & CONTROLS SIDEBAR (1 COL) */}
            <div className="space-y-6">
              {/* EXERCISE SELECTOR OR LOCKED SEQUENCE HUD */}
              {isWorkoutMode ? (
                /* LOCKED WORKOUT SEQUENCE HUD (No dropdown, strictly follows protocol) */
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-[#65A30D]" />
                      <h2 className="text-base font-bold uppercase tracking-wider text-slate-950">
                        Locked Sequence
                      </h2>
                    </div>
                    <span className="rounded-full border border-lime-300 bg-lime-100 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase text-slate-950">
                      Step {currentExerciseIndex + 1}/{workoutExercises.length}
                    </span>
                  </div>

                  <div className="rounded-xl border border-lime-200 bg-lime-50/60 p-4 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#65A30D]">
                      Current Target
                    </span>
                    <h3 className="text-lg font-black text-slate-950 mt-0.5">
                      {exercise}
                    </h3>
                    <div className="mt-2 flex items-center justify-between text-xs font-mono text-slate-600">
                      <span>Set {currentSet} of {targetSets}</span>
                      <span className="font-bold text-slate-950">{reps} / {targetReps} reps</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-[#84CC16] transition-all duration-200"
                        style={{ width: `${Math.min(100, (reps / (targetReps || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* ROUTINE QUEUE PREVIEW */}
                  <div className="mt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Routine Queue
                    </span>
                    <div className="space-y-2">
                      {workoutExercises.map((ex, idx) => {
                        const isPast = idx < currentExerciseIndex;
                        const isCurrent = idx === currentExerciseIndex;

                        return (
                          <div
                            key={ex.id}
                            className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-mono transition ${
                              isCurrent
                                ? "border border-lime-300 bg-lime-50 font-bold text-slate-950 shadow-xs"
                                : isPast
                                ? "border border-slate-100 bg-slate-50 text-slate-400"
                                : "border border-slate-100 bg-white text-slate-600"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>
                                {isPast ? (
                                  <span className="text-emerald-600 font-bold">✓</span>
                                ) : isCurrent ? (
                                  <span className="text-[#65A30D] font-bold">▶</span>
                                ) : (
                                  <span>{idx + 1}.</span>
                                )}
                              </span>
                              <span>{ex.exerciseName}</span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              {ex.sets}s × {ex.reps}r
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* STANDALONE EXERCISE SELECTOR (Free Testing Mode) */
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold uppercase tracking-wider text-slate-950">
                      Target Exercise
                    </h2>
                    <button
                      onClick={() => setActiveTab("guide")}
                      className="text-xs font-bold text-slate-900 hover:text-lime-700 underline underline-offset-2"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white disabled:opacity-60"
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
              )}

              {/* METRICS HUD */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
                <h2 className="mb-4 text-base font-bold uppercase tracking-wider text-slate-950">
                  Session Telemetry
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Total Reps
                    </p>
                    <p className="mt-1 text-3xl font-black font-mono text-slate-950">{reps}</p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Form Status
                    </p>
                    <p
                      className={`mt-2 text-lg font-black font-mono uppercase tracking-wider ${
                        isCorrectForm ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {formStatus}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">AI State:</span>
                    <span className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                      aiState === "EXERCISE_MISMATCH"
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : aiState === "POSITION_ADJUSTMENT"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : aiState === "REP_COUNTING"
                        ? "bg-lime-100 text-slate-900 border border-lime-300"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}>
                      {aiState}
                    </span>
                  </div>
                </div>

                {/* JOINT ANGLES DETAIL */}
                {jointAngles && Object.keys(jointAngles).some((k) => jointAngles[k] !== null) && (
                  <div className="mt-4 border-t border-slate-100 pt-4 space-y-2 text-xs font-mono text-slate-600">
                    {jointAngles.leftElbow !== null && jointAngles.leftElbow !== undefined && (
                      <div className="flex justify-between">
                        <span>Left Elbow Angle:</span>
                        <span className="font-bold text-slate-900">{jointAngles.leftElbow}°</span>
                      </div>
                    )}
                    {jointAngles.rightElbow !== null && jointAngles.rightElbow !== undefined && (
                      <div className="flex justify-between">
                        <span>Right Elbow Angle:</span>
                        <span className="font-bold text-slate-900">{jointAngles.rightElbow}°</span>
                      </div>
                    )}
                    {jointAngles.leftShoulder !== null && jointAngles.leftShoulder !== undefined && (
                      <div className="flex justify-between">
                        <span>Left Shoulder Angle:</span>
                        <span className="font-bold text-slate-900">{jointAngles.leftShoulder}°</span>
                      </div>
                    )}
                    {jointAngles.rightShoulder !== null && jointAngles.rightShoulder !== undefined && (
                      <div className="flex justify-between">
                        <span>Right Shoulder Angle:</span>
                        <span className="font-bold text-slate-900">{jointAngles.rightShoulder}°</span>
                      </div>
                    )}
                    {jointAngles.leftKnee !== null && jointAngles.leftKnee !== undefined && (
                      <div className="flex justify-between">
                        <span>Left Knee Angle:</span>
                        <span className="font-bold text-slate-900">{jointAngles.leftKnee}°</span>
                      </div>
                    )}
                    {jointAngles.rightKnee !== null && jointAngles.rightKnee !== undefined && (
                      <div className="flex justify-between">
                        <span>Right Knee Angle:</span>
                        <span className="font-bold text-slate-900">{jointAngles.rightKnee}°</span>
                      </div>
                    )}
                    {jointAngles.backAngle !== null && jointAngles.backAngle !== undefined && (
                      <div className="flex justify-between">
                        <span>Torso / Spine Angle:</span>
                        <span className="font-bold text-slate-900">{jointAngles.backAngle}°</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* QUICK BIOMECHANICS SUMMARY */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} className="text-slate-900" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-950">
                    Rep Counting Rules
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Form Verification:</strong> Reps increment ONLY when executed in <strong>Good Form</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Full Cycle:</strong> Complete full range of motion from start extension to contraction.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>No Mismatch:</strong> Must perform the target exercise; different exercises are rejected.</span>
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
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-12 shadow-xs">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="rounded-full border border-lime-300 bg-lime-100 px-3 py-1 text-[11px] font-mono font-bold uppercase text-slate-900">
                      {activeGuide.category}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-mono font-bold uppercase text-slate-700">
                      Difficulty: {activeGuide.difficulty}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-mono font-bold uppercase text-slate-700">
                      Gear: {activeGuide.equipment}
                    </span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-950">
                    {activeGuide.name} Execution Blueprint
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
                    {activeGuide.overview}
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("vision")}
                  className="inline-flex items-center gap-2 self-start rounded-full bg-[#B8F23A] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-xs transition hover:bg-[#a6de2e] md:self-center"
                >
                  <Camera size={16} />
                  Start Live Workout
                </button>
              </div>

              {/* TARGET MUSCLES PILLS */}
              <div className="mt-8 border-t border-slate-100 pt-6 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-slate-500 mr-2">
                  Target Muscle Groups:
                </span>
                {activeGuide.targetMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-mono font-bold text-purple-800"
                  >
                    <Flame size={12} className="text-purple-600" />
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            {/* 4-STEP BIOMECHANICAL FLOW */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <Sparkles size={20} className="text-slate-900" />
                <h3 className="text-xl font-bold uppercase tracking-wider text-slate-950">
                  Step-by-Step Kinematic Execution
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {activeGuide.steps.map((s) => (
                  <div
                    key={s.step}
                    className="relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm"
                  >
                    <div>
                      <span className="text-3xl font-black font-mono text-slate-200">
                        {s.step}
                      </span>
                      <h4 className="mt-2 text-base font-bold text-slate-950">{s.title}</h4>
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900">
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
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
                <div className="mb-5 flex items-center gap-2.5">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <h4 className="text-base font-bold uppercase tracking-wider text-slate-950">
                    AI Form Validation Standards
                  </h4>
                </div>

                <ul className="space-y-3">
                  {activeGuide.keyPoints.map((pt, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs sm:text-sm text-slate-700"
                    >
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* COMMON FAULTS */}
              <div className="rounded-2xl border border-red-200/80 bg-red-50/30 p-6 sm:p-8 shadow-xs">
                <div className="mb-5 flex items-center gap-2.5">
                  <AlertTriangle size={20} className="text-red-500" />
                  <h4 className="text-base font-bold uppercase tracking-wider text-red-950">
                    Common Biomechanical Faults
                  </h4>
                </div>

                <ul className="space-y-3">
                  {activeGuide.commonMistakes.map((mistake, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-red-100 bg-white p-3.5 text-xs sm:text-sm text-red-900 shadow-xs"
                    >
                      <span className="mt-0.5 shrink-0 text-xs font-bold font-mono text-red-500">
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