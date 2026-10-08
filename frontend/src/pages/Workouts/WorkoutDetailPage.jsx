import { API_BASE } from "../../services/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Flame, Play } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import AuthenticatedNavbar from "../../components/layout/AuthenticatedNavbar";

export default function WorkoutDetailPage() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthContext();

  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWorkout = async () => {
    try {
      setError("");

      const response = await fetch(
        `${API_BASE}/workouts/${workoutId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch workout");
      }

      const data = await response.json();
      setWorkout(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchExercises = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/workouts/${workoutId}/exercises`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch workout exercises");
      }

      const data = await response.json();
      setExercises(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchWorkout(), fetchExercises()]);
      setLoading(false);
    };

    if (token) {
      loadData();
    }
  }, [workoutId, token]);

  const handleStartWorkout = () => {
    if (exercises.length > 0) {
      // Start guided session automatically with the first exercise in sequence
      navigate(`/ai-analysis/${exercises[0].id}`);
    } else {
      navigate("/camera");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-slate-900">
        <AuthenticatedNavbar />
        <div className="flex min-h-[60vh] items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-500">
          Loading workout details...
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-slate-900">
        <AuthenticatedNavbar />
        <div className="mx-auto max-w-4xl px-6 py-10">
          <button
            onClick={() => navigate("/workouts")}
            className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft size={14} />
            Back to Workouts
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            {error || "Workout not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900">
      {/* AUTHENTICATED NAVBAR */}
      <AuthenticatedNavbar />

      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-12">
        {/* Back */}
        <button
          onClick={() => navigate("/workouts")}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft size={14} />
          Back to Workouts
        </button>

        {/* Workout Header */}
        <div className="mb-8 rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-9 shadow-sm">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <span className="inline-block rounded-full border border-[#84CC16]/40 bg-[#B8F23A]/15 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-950">
                Workout Protocol
              </span>

              <h1 className="mt-3 text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">
                {workout.name}
              </h1>

              <p className="mt-1.5 text-xs text-slate-500 font-mono">
                Scheduled on {workout.date}
              </p>
            </div>

            {/* Prominent Single START WORKOUT CTA + Telemetry Metrics */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex gap-3">
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Clock size={16} className="text-[#65A30D]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Duration
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-slate-900 font-mono">
                      {workout.duration} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Flame size={16} className="text-[#65A30D]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Calories
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-slate-900 font-mono">
                      {workout.caloriesBurned} kcal
                    </p>
                  </div>
                </div>
              </div>

              {/* SINGLE PROMINENT START WORKOUT CTA */}
              <button
                onClick={handleStartWorkout}
                className="flex items-center gap-2.5 rounded-full bg-[#B8F23A] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-xs hover:bg-[#a3e635] hover:shadow-[0_0_25px_rgba(184,242,58,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <Play size={15} fill="currentColor" />
                <span>Start Workout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-9 shadow-xs">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900">
                Exercise Sequence
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {exercises.length} exercise{exercises.length !== 1 ? "s" : ""} — AI analysis will automatically guide each movement
              </p>
            </div>

            <button
              onClick={() => navigate("/workouts")}
              className="text-xs font-bold uppercase tracking-wider text-[#65A30D] hover:underline"
            >
              Edit Routine →
            </button>
          </div>

          {exercises.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-8 text-center">
              <p className="text-sm text-slate-500">
                No exercises have been added to this workout routine yet.
              </p>

              <button
                onClick={() => navigate("/workouts")}
                className="mt-4 rounded-full bg-[#B8F23A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-[#a3e635] shadow-xs"
              >
                Add Exercises
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-5 transition hover:border-slate-300 hover:bg-white shadow-2xs"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800 shadow-2xs">
                        0{index + 1}
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {exercise.exerciseName}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {exercise.sets} sets × {exercise.reps} reps
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-xs font-mono">
                        {exercise.formScore !== null &&
                        exercise.formScore !== undefined ? (
                          <span className="rounded-md border border-[#84CC16]/30 bg-[#B8F23A]/20 px-2.5 py-1 font-bold text-slate-950">
                            Score: {exercise.formScore} / 100
                          </span>
                        ) : (
                          <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-500">
                            Queued for AI Analysis
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {exercise.aiFeedback && (
                    <div className="mt-4 rounded-xl border border-[#84CC16]/30 bg-[#B8F23A]/10 p-3.5 text-xs text-slate-800">
                      <span className="font-bold text-slate-950">
                        AI Feedback:
                      </span>{" "}
                      {exercise.aiFeedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



