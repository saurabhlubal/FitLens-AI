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
          "http://localhost:8080/api/workouts",
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
              `http://localhost:8080/api/workouts/${workout.id}/exercises`,
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
      <div className="min-h-screen bg-[#060608] text-[#F5F5F0]">
        <AuthenticatedNavbar />
        <div className="flex min-h-[60vh] items-center justify-center text-xs font-bold uppercase tracking-widest text-[#8E8E92]">
          Loading your progress...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] text-[#F5F5F0]">
      {/* AUTHENTICATED NAVBAR */}
      <AuthenticatedNavbar />

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-6 py-10 sm:py-12">
        {/* Header */}
        <div className="mb-10">
          <span className="inline-block rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#B8F23A]">
            Performance
          </span>

          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F5F5F0]">
            Your Progress
          </h1>

          <p className="mt-2 text-sm sm:text-base text-[#A8A8A2] leading-relaxed">
            Track your training activity and see how consistently you're
            progressing.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* =========================
            STAT CARDS
        ========================= */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Workouts */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 transition-all duration-300 hover:border-[#B8F23A]/30 hover:bg-[#111115]">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#16161a] text-[#B8F23A]">
              <Dumbbell size={20} />
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-[#8E8E92]">
              Total Workouts
            </p>

            <p className="mt-2 text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F5F0]">
              {totalWorkouts}
            </p>
          </div>

          {/* Duration */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 transition-all duration-300 hover:border-[#B8F23A]/30 hover:bg-[#111115]">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#16161a] text-[#B8F23A]">
              <Clock size={20} />
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-[#8E8E92]">
              Training Time
            </p>

            <p className="mt-2 text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F5F0]">
              {totalDuration}
              <span className="ml-1 text-xs font-mono font-normal text-[#8E8E92]">
                min
              </span>
            </p>
          </div>

          {/* Calories */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 transition-all duration-300 hover:border-[#B8F23A]/30 hover:bg-[#111115]">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#16161a] text-[#B8F23A]">
              <Flame size={20} />
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-[#8E8E92]">
              Calories Burned
            </p>

            <p className="mt-2 text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F5F0]">
              {totalCalories}
              <span className="ml-1 text-xs font-mono font-normal text-[#8E8E92]">
                kcal
              </span>
            </p>
          </div>

          {/* Form Score */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 transition-all duration-300 hover:border-[#B8F23A]/30 hover:bg-[#111115]">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#16161a] text-[#B8F23A]">
              <Target size={20} />
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-[#8E8E92]">
              Average Form Score
            </p>

            <p className="mt-2 text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F5F0]">
              {averageFormScore ?? "--"}
              {averageFormScore && (
                <span className="ml-1 text-xs font-mono font-normal text-[#8E8E92]">
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
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-7">
            <h2 className="text-lg font-bold uppercase tracking-wider text-[#F5F5F0]">
              Training Volume
            </h2>

            <p className="mt-1 text-xs text-[#8E8E92]">
              Your total exercise activity so far.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/[0.06] bg-[#141418] p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8E8E92]">
                  Exercises
                </p>

                <p className="mt-2 text-2xl font-black text-[#F5F5F0]">
                  {totalExercises}
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#141418] p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8E8E92]">
                  Total Sets
                </p>

                <p className="mt-2 text-2xl font-black text-[#F5F5F0]">
                  {totalSets}
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#141418] p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8E8E92]">
                  Total Reps
                </p>

                <p className="mt-2 text-2xl font-black text-[#F5F5F0]">
                  {totalReps}
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#141418] p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8E8E92]">
                  Workouts
                </p>

                <p className="mt-2 text-2xl font-black text-[#F5F5F0]">
                  {totalWorkouts}
                </p>
              </div>
            </div>
          </div>

          {/* AI */}
          <div className="relative overflow-hidden rounded-2xl border border-[#B8F23A]/20 bg-gradient-to-b from-[#12150d] via-[#0c0d0a] to-[#070709] p-7 shadow-xl">
            <div className="pointer-events-none absolute -top-20 right-5 h-40 w-52 rounded-full bg-[#B8F23A]/[0.05] blur-[70px]" />

            <div className="inline-flex items-center gap-2 rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#B8F23A]">
              <Sparkles size={12} />
              AI Analysis
            </div>

            <h2 className="mt-4 text-2xl font-black uppercase tracking-tight text-[#F5F5F0]">
              Exercise Form Intelligence
            </h2>

            <p className="mt-2 text-sm text-[#A8A8A2] leading-relaxed">
              Your form score and AI feedback will appear here once FitLens
              AI starts analyzing your exercise movements.
            </p>

            <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#141418] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F5F5F0]">
                  Form Analysis
                </span>

                <span className="rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#B8F23A]">
                  Coming Soon
                </span>
              </div>

              <p className="mt-2.5 text-xs text-[#8E8E92] leading-relaxed">
                Pose detection → movement analysis → form score → personalized
                feedback.
              </p>
            </div>
          </div>
        </div>

        {/* =========================
            WORKOUT HISTORY
        ========================= */}
        <section className="mt-8 rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-[#F5F5F0]">
                Workout History
              </h2>

              <p className="mt-1 text-xs text-[#8E8E92]">
                Your recent training sessions.
              </p>
            </div>

            <button
              onClick={() => navigate("/workouts")}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#F5F5F0] transition hover:border-[#B8F23A]/40 hover:bg-white/[0.08]"
            >
              Manage Workouts
            </button>
          </div>

          <div className="mt-6">
            {workouts.length === 0 ? (
              <div className="rounded-xl border border-white/[0.06] bg-[#141418] p-8 text-center">
                <p className="text-sm text-[#8E8E92]">
                  No workouts recorded yet.
                </p>

                <button
                  onClick={() => navigate("/workouts")}
                  className="mt-3 text-xs font-bold uppercase tracking-wider text-[#B8F23A] hover:underline"
                >
                  Create your first workout →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {workouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-white/[0.06] bg-[#141418] p-5 sm:flex-row sm:items-center transition hover:border-white/15"
                  >
                    <div>
                      <h3 className="text-base font-bold text-[#F5F5F0]">
                        {workout.name}
                      </h3>

                      <p className="mt-1 text-xs text-[#8E8E92] font-mono">
                        {workout.date}
                      </p>
                    </div>

                    <div className="flex gap-4 text-xs font-mono font-bold text-[#D2D2CC]">
                      <span className="rounded-lg border border-white/[0.06] bg-[#1a1a20] px-3 py-1">
                        {workout.duration} min
                      </span>

                      <span className="rounded-lg border border-white/[0.06] bg-[#1a1a20] px-3 py-1">
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