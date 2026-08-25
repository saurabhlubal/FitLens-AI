import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

export default function WorkoutsPage() {
  const navigate = useNavigate();
  const { token } = useAuthContext();

  // =========================
  // Workout State
  // =========================
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [workoutExercises, setWorkoutExercises] = useState([]);

  // =========================
  // Exercise State
  // =========================
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");

  // =========================
  // Workout Form State
  // =========================
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");

  // =========================
  // UI State
  // =========================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exerciseLoading, setExerciseLoading] = useState(false);

  // ============================================================
  // FETCH WORKOUTS
  // ============================================================

  const fetchWorkouts = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/workouts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch workouts");
      }

      const data = await response.json();

      setWorkouts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FETCH EXERCISES
  // ============================================================

  const fetchExercises = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/exercises",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exercises");
      }

      const data = await response.json();

      setExercises(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // ============================================================
  // FETCH EXERCISES OF SELECTED WORKOUT
  // ============================================================

  const fetchWorkoutExercises = async (workoutId) => {
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

      setWorkoutExercises(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // ============================================================
  // INITIAL DATA LOAD
  // ============================================================

  useEffect(() => {
    if (!token) return;

    fetchWorkouts();
    fetchExercises();
  }, [token]);

  // ============================================================
  // SELECT WORKOUT
  // ============================================================

  const handleSelectWorkout = async (workout) => {
    setError("");

    setSelectedWorkout(workout);

    await fetchWorkoutExercises(workout.id);
  };

  // ============================================================
  // CREATE WORKOUT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const response = await fetch(
        "http://localhost:8080/api/workouts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            date,
            duration: Number(duration),
            caloriesBurned: Number(caloriesBurned),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create workout");
      }

      setName("");
      setDate("");
      setDuration("");
      setCaloriesBurned("");

      await fetchWorkouts();
    } catch (err) {
      setError(err.message);
    }
  };

  // ============================================================
  // ADD EXERCISE TO WORKOUT
  // ============================================================

  const handleAddExercise = async (e) => {
    e.preventDefault();

    if (!selectedWorkout) {
      setError("Please select a workout first.");
      return;
    }

    if (!selectedExercise) {
      setError("Please select an exercise.");
      return;
    }

    if (!sets || !reps) {
      setError("Please enter sets and reps.");
      return;
    }

    try {
      setError("");
      setExerciseLoading(true);

      const response = await fetch(
        `http://localhost:8080/api/workouts/${selectedWorkout.id}/exercises`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            exerciseId: Number(selectedExercise),
            sets: Number(sets),
            reps: Number(reps),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add exercise");
      }

      setSelectedExercise("");
      setSets("");
      setReps("");

      await fetchWorkoutExercises(selectedWorkout.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setExerciseLoading(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading workouts...
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">

        {/* PAGE TITLE */}

        <h1 className="mb-8 text-4xl font-bold">
          My Workouts
        </h1>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* =====================================================
            CREATE WORKOUT
        ===================================================== */}

        <div className="mb-10 rounded-2xl border border-white/10 bg-slate-900 p-6">

          <h2 className="mb-6 text-2xl font-semibold">
            Add Workout
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-2"
          >

            <input
              type="text"
              placeholder="Workout name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-xl bg-slate-800 p-3 text-white outline-none"
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="rounded-xl bg-slate-800 p-3 text-white outline-none"
            />

            <input
              type="number"
              placeholder="Duration (minutes)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              min="1"
              className="rounded-xl bg-slate-800 p-3 text-white outline-none"
            />

            <input
              type="number"
              placeholder="Calories burned"
              value={caloriesBurned}
              onChange={(e) => setCaloriesBurned(e.target.value)}
              required
              min="0"
              className="rounded-xl bg-slate-800 p-3 text-white outline-none"
            />

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 md:col-span-2"
            >
              Add Workout
            </button>

          </form>
        </div>

        {/* =====================================================
            WORKOUT LIST
        ===================================================== */}

        <div className="space-y-4">

          {workouts.length === 0 ? (

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">
              No workouts yet.
            </div>

          ) : (

            workouts.map((workout) => (

              <div
                key={workout.id}
                className={`rounded-2xl border bg-slate-900 p-6 transition ${
                  selectedWorkout?.id === workout.id
                    ? "border-blue-500"
                    : "border-white/10"
                }`}
              >

                {/* WORKOUT HEADER */}

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                  <div>

                    <h3 className="text-2xl font-semibold">
                      {workout.name}
                    </h3>

                    <p className="mt-2 text-slate-400">
                      {workout.date}
                    </p>

                  </div>

                  <div className="flex gap-6 text-sm text-slate-300">

                    <span>
                      {workout.duration} min
                    </span>

                    <span>
                      {workout.caloriesBurned} kcal
                    </span>

                  </div>

                </div>

                {/* =================================================
                    WORKOUT BUTTONS
                ================================================= */}

                <div className="mt-5 flex flex-wrap gap-3">

                  {/* VIEW WORKOUT */}

                  <button
                    onClick={() =>
                      navigate(`/workouts/${workout.id}`)
                    }
                    className="rounded-xl bg-emerald-600 px-5 py-2 font-semibold transition hover:bg-emerald-500"
                  >
                    View Workout
                  </button>

                  {/* MANAGE EXERCISES */}

                  <button
                    onClick={() => handleSelectWorkout(workout)}
                    className="rounded-xl bg-blue-600 px-5 py-2 font-semibold transition hover:bg-blue-500"
                  >
                    {selectedWorkout?.id === workout.id
                      ? "Selected"
                      : "Manage Exercises"}
                  </button>

                </div>

                {/* =================================================
                    SELECTED WORKOUT CONTENT
                ================================================= */}

                {selectedWorkout?.id === workout.id && (

                  <div className="mt-6 border-t border-white/10 pt-6">

                    {/* ADD EXERCISE */}

                    <div className="rounded-2xl bg-slate-800 p-5">

                      <h4 className="mb-4 text-xl font-semibold">
                        Add Exercise
                      </h4>

                      <form
                        onSubmit={handleAddExercise}
                        className="grid gap-4 md:grid-cols-3"
                      >

                        <select
                          value={selectedExercise}
                          onChange={(e) =>
                            setSelectedExercise(e.target.value)
                          }
                          className="rounded-xl bg-slate-700 p-3 text-white outline-none"
                        >

                          <option value="">
                            Select Exercise
                          </option>

                          {exercises.map((exercise) => (

                            <option
                              key={exercise.id}
                              value={exercise.id}
                            >
                              {exercise.name}
                            </option>

                          ))}

                        </select>

                        <input
                          type="number"
                          placeholder="Sets"
                          value={sets}
                          onChange={(e) => setSets(e.target.value)}
                          min="1"
                          className="rounded-xl bg-slate-700 p-3 text-white outline-none"
                        />

                        <input
                          type="number"
                          placeholder="Reps"
                          value={reps}
                          onChange={(e) => setReps(e.target.value)}
                          min="1"
                          className="rounded-xl bg-slate-700 p-3 text-white outline-none"
                        />

                        <button
                          type="submit"
                          disabled={exerciseLoading}
                          className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 md:col-span-3"
                        >
                          {exerciseLoading
                            ? "Adding..."
                            : "Add Exercise"}
                        </button>

                      </form>

                    </div>

                    {/* =================================================
                        WORKOUT EXERCISES
                    ================================================= */}

                    <div className="mt-6">

                      <h4 className="mb-4 text-xl font-semibold">
                        Exercises
                      </h4>

                      {workoutExercises.length === 0 ? (

                        <div className="rounded-xl border border-white/10 bg-slate-800 p-5 text-slate-400">
                          No exercises added yet.
                        </div>

                      ) : (

                        <div className="space-y-3">

                          {workoutExercises.map((exercise) => (

                            <div
                              key={exercise.id}
                              className="rounded-xl border border-white/10 bg-slate-800 p-4"
                            >

                              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

                                <div>

                                  <h5 className="text-lg font-semibold">
                                    {exercise.exerciseName}
                                  </h5>

                                  <p className="text-sm text-slate-400">
                                    {exercise.sets} sets ×{" "}
                                    {exercise.reps} reps
                                  </p>

                                </div>

                                <div className="text-sm text-slate-400">

                                  {exercise.formScore !== null &&
                                  exercise.formScore !== undefined ? (
                                    <span>
                                      Form Score:{" "}
                                      {exercise.formScore}
                                    </span>
                                  ) : (
                                    <span>
                                      AI analysis pending
                                    </span>
                                  )}

                                </div>

                              </div>

                              {/* AI FEEDBACK */}

                              {exercise.aiFeedback && (

                                <div className="mt-3 rounded-lg bg-slate-700 p-3 text-sm text-slate-300">

                                  <span className="font-semibold">
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

                )}

              </div>

            ))

          )}

        </div>

      </div>
    </div>
  );
}