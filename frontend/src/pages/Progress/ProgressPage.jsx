import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />

          <p className="text-slate-400">
            Loading your progress...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =========================
          NAVBAR
      ========================= */}

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
              onClick={() => navigate("/dashboard")}
              className="text-slate-400 transition hover:text-white"
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate("/workouts")}
              className="text-slate-400 transition hover:text-white"
            >
              Workouts
            </button>

            <button
              className="font-medium text-emerald-400"
            >
              Progress
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="text-slate-400 transition hover:text-white"
            >
              Profile
            </button>

          </div>

        </div>

      </nav>

      {/* =========================
          MAIN
      ========================= */}

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}

        <div className="mb-10">

          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Performance
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Your Progress
          </h1>

          <p className="mt-2 text-slate-400">
            Track your training activity and see how consistently you're
            progressing.
          </p>

        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* =========================
            STAT CARDS
        ========================= */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Workouts */}

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">

            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-xl">
              🏋️
            </div>

            <p className="text-sm text-slate-400">
              Total Workouts
            </p>

            <p className="mt-1 text-3xl font-bold">
              {totalWorkouts}
            </p>

          </div>

          {/* Duration */}

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">

            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
              ⏱️
            </div>

            <p className="text-sm text-slate-400">
              Training Time
            </p>

            <p className="mt-1 text-3xl font-bold">
              {totalDuration}
              <span className="ml-1 text-base font-medium text-slate-400">
                min
              </span>
            </p>

          </div>

          {/* Calories */}

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">

            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-xl">
              🔥
            </div>

            <p className="text-sm text-slate-400">
              Calories Burned
            </p>

            <p className="mt-1 text-3xl font-bold">
              {totalCalories}
              <span className="ml-1 text-base font-medium text-slate-400">
                kcal
              </span>
            </p>

          </div>

          {/* Form Score */}

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">

            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-xl">
              🎯
            </div>

            <p className="text-sm text-slate-400">
              Average Form Score
            </p>

            <p className="mt-1 text-3xl font-bold">
              {averageFormScore ?? "--"}

              {averageFormScore && (
                <span className="ml-1 text-base font-medium text-slate-400">
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

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">

            <h2 className="text-xl font-semibold">
              Training Volume
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Your total exercise activity so far.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">

              <div className="rounded-xl bg-slate-800 p-5">

                <p className="text-sm text-slate-400">
                  Exercises
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {totalExercises}
                </p>

              </div>

              <div className="rounded-xl bg-slate-800 p-5">

                <p className="text-sm text-slate-400">
                  Total Sets
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {totalSets}
                </p>

              </div>

              <div className="rounded-xl bg-slate-800 p-5">

                <p className="text-sm text-slate-400">
                  Total Reps
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {totalReps}
                </p>

              </div>

              <div className="rounded-xl bg-slate-800 p-5">

                <p className="text-sm text-slate-400">
                  Workouts
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {totalWorkouts}
                </p>

              </div>

            </div>

          </div>

          {/* AI */}

          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-6">

            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
              AI Analysis
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Exercise Form Intelligence
            </h2>

            <p className="mt-3 text-slate-400">
              Your form score and AI feedback will appear here once FitLens
              AI starts analyzing your exercise movements.
            </p>

            <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/60 p-5">

              <div className="flex items-center justify-between">

                <span className="text-slate-400">
                  Form Analysis
                </span>

                <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                  Coming Soon
                </span>

              </div>

              <p className="mt-3 text-sm text-slate-500">
                Pose detection → movement analysis → form score → personalized
                feedback.
              </p>

            </div>

          </div>

        </div>

        {/* =========================
            WORKOUT HISTORY
        ========================= */}

        <section className="mt-8 rounded-2xl border border-white/10 bg-slate-900 p-6">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <h2 className="text-xl font-semibold">
                Workout History
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Your recent training sessions.
              </p>

            </div>

            <button
              onClick={() => navigate("/workouts")}
              className="rounded-xl border border-white/10 bg-slate-800 px-5 py-2.5 text-sm font-semibold transition hover:bg-slate-700"
            >
              Manage Workouts
            </button>

          </div>

          <div className="mt-6">

            {workouts.length === 0 ? (

              <div className="rounded-xl border border-white/10 bg-slate-800 p-8 text-center">

                <p className="text-slate-400">
                  No workouts recorded yet.
                </p>

                <button
                  onClick={() => navigate("/workouts")}
                  className="mt-4 font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  Create your first workout →
                </button>

              </div>

            ) : (

              <div className="space-y-3">

                {workouts.map((workout) => (

                  <div
                    key={workout.id}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-slate-800 p-5 sm:flex-row sm:items-center"
                  >

                    <div>

                      <h3 className="font-semibold">
                        {workout.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {workout.date}
                      </p>

                    </div>

                    <div className="flex gap-5 text-sm text-slate-400">

                      <span>
                        {workout.duration} min
                      </span>

                      <span>
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