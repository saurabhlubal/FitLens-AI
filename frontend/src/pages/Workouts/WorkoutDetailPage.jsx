import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

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
        `http://localhost:8080/api/workouts/${workoutId}`,
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
        `http://localhost:8080/api/workouts/${workoutId}/exercises`,
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
    if (!token || !workoutId) return;

    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchWorkout(),
        fetchExercises(),
      ]);

      setLoading(false);
    };

    loadData();
  }, [token, workoutId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading workout...
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => navigate("/workouts")}
            className="mb-6 rounded-xl bg-slate-800 px-5 py-2 text-sm font-semibold transition hover:bg-slate-700"
          >
            ← Back to Workouts
          </button>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
            {error || "Workout not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <button
          onClick={() => navigate("/workouts")}
          className="mb-6 rounded-xl bg-slate-800 px-5 py-2 text-sm font-semibold transition hover:bg-slate-700"
        >
          ← Back to Workouts
        </button>

        {/* Workout Header */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-slate-900 p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>
              <p className="mb-2 text-sm font-medium text-emerald-400">
                WORKOUT
              </p>

              <h1 className="text-4xl font-bold">
                {workout.name}
              </h1>

              <p className="mt-3 text-slate-400">
                {workout.date}
              </p>
            </div>

            <div className="flex gap-8">

              <div>
                <p className="text-sm text-slate-400">
                  Duration
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {workout.duration} min
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Calories
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {workout.caloriesBurned} kcal
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* Exercises */}
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-8">

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Exercises
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {exercises.length} exercise
                {exercises.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {exercises.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-slate-800 p-8 text-center">
              <p className="text-slate-400">
                No exercises have been added to this workout yet.
              </p>

              <button
                onClick={() => navigate("/workouts")}
                className="mt-4 rounded-xl bg-emerald-600 px-5 py-2 font-semibold transition hover:bg-emerald-500"
              >
                Add Exercises
              </button>
            </div>
          ) : (
            <div className="space-y-4">

              {exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="rounded-xl border border-white/10 bg-slate-800 p-5"
                >

                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                    <div className="flex items-center gap-4">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-bold text-emerald-400">
                        {index + 1}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold">
                          {exercise.exerciseName}
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          {exercise.sets} sets × {exercise.reps} reps
                        </p>
                      </div>

                    </div>

                    <div className="text-sm text-slate-400">
                      {exercise.formScore !== null &&
                      exercise.formScore !== undefined ? (
                        <span>
                          Form Score: {exercise.formScore}
                        </span>
                      ) : (
                        <span>
                          AI analysis pending
                        </span>
                      )}
                    </div>

                  </div>

                  {exercise.aiFeedback && (
                    <div className="mt-4 rounded-lg bg-slate-700 p-4 text-sm text-slate-300">
                      <span className="font-semibold text-white">
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