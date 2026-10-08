import { API_BASE } from "../../services/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Clock, Flame, Target, Sparkles } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import AuthenticatedNavbar from "../../components/layout/AuthenticatedNavbar";

export default function ProgressPage() {
  const navigate = useNavigate();
  const { token } = useAuthContext();

  const [workouts, setWorkouts] = useState([]);
  const [workoutExercises, setWorkoutExercises] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        setError("");

        const workoutResponse = await fetch(
          `${API_BASE}/workouts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!workoutResponse.ok) {
          throw new Error("Failed to fetch workouts");
        }

        const workoutData = await workoutResponse.json();

        setWorkouts(workoutData);

        // Fetch exercises for every workout
        const exerciseResults = await Promise.all(
          workoutData.map(async (workout) => {
            const response = await fetch(
              `${API_BASE}/workouts/${workout.id}/exercises`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!response.ok) {
              return [];
            }

            const data = await response.json();

            return data.map((exercise) => ({
              ...exercise,
              workoutName: workout.name,
              workoutDate: workout.date,
            }));
          })
        );

        setWorkoutExercises(exerciseResults.flat());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadProgress();
    } else {
      setLoading(false);
      setError("You are not logged in");
    }
  }, [token]);

  // =========================
  // Statistics
  // =========================

  const totalWorkouts = workouts.length;

  const totalDuration = workouts.reduce(
    (total, workout) =>
      total + (Number(workout.duration) || 0),
    0
  );

  const totalCalories = workouts.reduce(
    (total, workout) =>
      total + (Number(workout.caloriesBurned) || 0),
    0
  );

  const totalExercises = workoutExercises.length;

  const totalSets = workoutExercises.reduce(
    (total, exercise) =>
      total + (Number(exercise.sets) || 0),
    0
  );

  const totalReps = workoutExercises.reduce(
    (total, exercise) =>
      total +
      (Number(exercise.sets) || 0) *
      (Number(exercise.reps) || 0),
    0
  );

  const scores = workoutExercises
    .map((exercise) => Number(exercise.formScore))
    .filter((score) => !Number.isNaN(score));

  const averageFormScore =
    scores.length > 0
      ? (
          scores.reduce((sum, score) => sum + score, 0) /
          scores.length
        ).toFixed(1)
      : null;

  // =========================
  // Loading
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-slate-900">
        <AuthenticatedNavbar />
        <div className="flex min-h-[60vh] items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-400">
          Loading your progress...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900">
      {/* AUTHENTICATED NAVBAR */}
      <AuthenticatedNavbar />

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-6 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <span className="inline-block rounded-full border border-lime-300/80 bg-lime-100/60 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-900">
            Performance Metrics
          </span>

          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-950">
            Your Progress
          </h1>

          <p className="mt-1 text-sm sm:text-base text-slate-600 leading-relaxed">
            Track your training volume, consistency, and AI biometric analysis scores over time.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =========================
            STAT CARDS
        ========================= */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Workouts */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:border-slate-300 hover:shadow-sm">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-[#B8F23A] shadow-xs">
              <Dumbbell size={20} />
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Workouts
            </p>

            <p className="mt-2 text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-950 font-mono">
              {totalWorkouts}
            </p>
          </div>

          {/* Duration */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:border-slate-300 hover:shadow-sm">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-[#B8F23A] shadow-xs">
              <Clock size={20} />
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Training Time
            </p>

            <p className="mt-2 text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-950 font-mono">
              {totalDuration}
              <span className="ml-1 text-xs font-mono font-normal text-slate-400">
                min
              </span>
            </p>
          </div>

          {/* Calories */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:border-slate-300 hover:shadow-sm">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-[#B8F23A] shadow-xs">
              <Flame size={20} />
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Calories Burned
            </p>

            <p className="mt-2 text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-950 font-mono">
              {totalCalories}
              <span className="ml-1 text-xs font-mono font-normal text-slate-400">
                kcal
              </span>
            </p>
          </div>

          {/* Form Score */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:border-slate-300 hover:shadow-sm">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-[#B8F23A] shadow-xs">
              <Target size={20} />
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Average Form Score
            </p>

            <p className="mt-2 text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-950 font-mono">
              {averageFormScore ?? "--"}
              {averageFormScore && (
                <span className="ml-1 text-xs font-mono font-normal text-slate-400">
                  /100
                </span>
              )}
            </p>
          </div>
        </div>

        {/* =========================
            TRAINING OVERVIEW
        ========================= */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Volume */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xs">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-950">
              Training Volume
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Aggregated exercise activity and movement volume.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Exercises
                </p>

                <p className="mt-2 text-2xl font-black text-slate-950 font-mono">
                  {totalExercises}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Sets
                </p>

                <p className="mt-2 text-2xl font-black text-slate-950 font-mono">
                  {totalSets}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Reps
                </p>

                <p className="mt-2 text-2xl font-black text-slate-950 font-mono">
                  {totalReps}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Workouts
                </p>

                <p className="mt-2 text-2xl font-black text-slate-950 font-mono">
                  {totalWorkouts}
                </p>
              </div>
            </div>
          </div>

          {/* AI */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-lime-50/20 to-white p-7 shadow-xs">
            <div className="pointer-events-none absolute -top-20 right-5 h-40 w-52 rounded-full bg-[#B8F23A]/10 blur-[60px]" />

            <div className="inline-flex items-center gap-2 rounded-full border border-lime-300 bg-lime-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-900">
              <Sparkles size={12} />
              AI Form Intelligence
            </div>

            <h2 className="mt-4 text-2xl font-black uppercase tracking-tight text-slate-950">
              Kinematic Posture Analytics
            </h2>

            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Real-time biomechanics feedback and rep accuracy scores automatically update when you train in camera session mode.
            </p>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-950">
                  ResNet Skeleton Tracking
                </span>

                <span className="rounded-full border border-lime-300 bg-lime-100 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-900">
                  Live & Ready
                </span>
              </div>

              <p className="mt-2.5 text-xs text-slate-500 leading-relaxed">
                Pose landmark extraction → joint angle validation → real-time coaching cue audio & visual telemetry.
              </p>
            </div>
          </div>
        </div>

        {/* =========================
            WORKOUT HISTORY
        ========================= */}
        <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xs">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-slate-950">
                Workout History
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Log of your completed training sessions.
              </p>
            </div>

            <button
              onClick={() => navigate("/workouts")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:border-slate-300 hover:text-slate-950 shadow-xs"
            >
              Manage Workouts
            </button>
          </div>

          <div className="mt-6">
            {workouts.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-500">
                  No workouts recorded yet.
                </p>

                <button
                  onClick={() => navigate("/workouts")}
                  className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-900 underline underline-offset-4 hover:text-lime-700"
                >
                  Create your first workout →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {workouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center transition hover:border-slate-300 hover:bg-white shadow-xs"
                  >
                    <div>
                      <h3 className="text-base font-bold text-slate-950">
                        {workout.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500 font-mono">
                        {workout.date}
                      </p>
                    </div>

                    <div className="flex gap-3 text-xs font-mono font-bold text-slate-700">
                      <span className="rounded-lg border border-slate-200 bg-white px-3 py-1 shadow-xs">
                        {workout.duration} min
                      </span>

                      <span className="rounded-lg border border-slate-200 bg-white px-3 py-1 shadow-xs">
                        {workout.caloriesBurned} kcal
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}



