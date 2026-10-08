import { API_BASE } from "../../services/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import AuthenticatedNavbar from "../../components/layout/AuthenticatedNavbar";

export default function WorkoutsPage() {
  const { token } = useAuthContext();
  const navigate = useNavigate();

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
  // Edit Exercise State
  // =========================
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [editSets, setEditSets] = useState("");
  const [editReps, setEditReps] = useState("");

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
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ============================================================
  // FETCH WORKOUTS
  // ============================================================
  const fetchWorkouts = async () => {
    try {
      setError("");

      const response = await fetch(
        `${API_BASE}/workouts`,
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
        `${API_BASE}/exercises`,
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
    setEditingExerciseId(null);

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
        `${API_BASE}/workouts`,
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
  // ADD EXERCISE
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
        `${API_BASE}/workouts/${selectedWorkout.id}/exercises`,
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
  // START EDIT
  // ============================================================
  const handleStartEdit = (exercise) => {
    setError("");
    setEditingExerciseId(exercise.id);
    setEditSets(String(exercise.sets));
    setEditReps(String(exercise.reps));
  };

  // ============================================================
  // CANCEL EDIT
  // ============================================================
  const handleCancelEdit = () => {
    setEditingExerciseId(null);
    setEditSets("");
    setEditReps("");
  };

  // ============================================================
  // UPDATE EXERCISE
  // ============================================================
  const handleUpdateExercise = async (exercise) => {
    if (!editSets || !editReps) {
      setError("Please enter sets and reps.");
      return;
    }

    try {
      setError("");
      setEditLoading(true);

      const response = await fetch(
        `${API_BASE}/workouts/${selectedWorkout.id}/exercises/${exercise.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            exerciseId: exercise.exerciseId,
            sets: Number(editSets),
            reps: Number(editReps),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update exercise");
      }

      handleCancelEdit();

      await fetchWorkoutExercises(selectedWorkout.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================================
  // DELETE EXERCISE
  // ============================================================
  const handleDeleteExercise = async (exercise) => {
    const confirmed = window.confirm(
      `Delete ${exercise.exerciseName} from this workout?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setDeleteLoading(true);

      const response = await fetch(
        `${API_BASE}/workouts/${selectedWorkout.id}/exercises/${exercise.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete exercise");
      }

      if (editingExerciseId === exercise.id) {
        handleCancelEdit();
      }

      await fetchWorkoutExercises(selectedWorkout.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ============================================================
  // DELETE WORKOUT
  // ============================================================
  const handleDeleteWorkout = async (workout) => {
    const confirmed = window.confirm(
      `Delete workout "${workout.name}"? This will permanently remove the workout.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setDeleteLoading(true);

      const response = await fetch(
        `${API_BASE}/workouts/${workout.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete workout");
      }

      if (selectedWorkout?.id === workout.id) {
        setSelectedWorkout(null);
        setWorkoutExercises([]);
        setEditingExerciseId(null);
      }

      await fetchWorkouts();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ============================================================
  // START AI ANALYSIS
  // ============================================================
  const handleStartAIAnalysis = (exercise) => {
    navigate(`/ai-analysis/${exercise.id}`);
  };

  // ============================================================
  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-slate-900">
        <AuthenticatedNavbar />
        <div className="flex min-h-[60vh] items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-500">
          Loading workouts...
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900">
      {/* AUTHENTICATED NAVBAR */}
      <AuthenticatedNavbar />

      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        {/* HEADER */}
        <div className="mb-10">
          <span className="inline-block rounded-full border border-[#84CC16]/40 bg-[#B8F23A]/15 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-950">
            Workouts
          </span>

          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-900">
            My Workouts
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            Create workouts, manage your exercise routines, and launch guided training sessions.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* CREATE WORKOUT */}
        <div className="mb-10 rounded-2xl border border-slate-200/80 bg-white p-7 sm:p-8 shadow-xs">
          <h2 className="mb-6 text-xl font-bold uppercase tracking-wider text-slate-900">
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
              className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20"
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20"
            />

            <input
              type="number"
              placeholder="Duration (minutes)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              min="1"
              className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20"
            />

            <input
              type="number"
              placeholder="Calories burned"
              value={caloriesBurned}
              onChange={(e) => setCaloriesBurned(e.target.value)}
              required
              min="0"
              className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20"
            />

            <button
              type="submit"
              className="rounded-full bg-[#B8F23A] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-300 hover:bg-[#a3e635] hover:shadow-[0_0_20px_rgba(184,242,58,0.3)] shadow-xs md:col-span-2"
            >
              Add Workout
            </button>
          </form>
        </div>

        {/* WORKOUT LIST */}
        <div className="space-y-4">
          {workouts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center text-sm text-slate-500 shadow-xs">
              No workouts yet. Add your first routine above.
            </div>
          ) : (
            workouts.map((workout) => (
              <div
                key={workout.id}
                className={`rounded-2xl border transition-all duration-300 p-6 sm:p-7 shadow-xs ${
                  selectedWorkout?.id === workout.id
                    ? "border-[#84CC16]/60 bg-white ring-1 ring-[#84CC16]/30 shadow-md"
                    : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                {/* WORKOUT HEADER */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {workout.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500 font-mono">
                      {workout.date}
                    </p>
                  </div>

                  <div className="flex gap-3 text-xs font-mono font-bold text-slate-700">
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1">
                      {workout.duration} min
                    </span>

                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1">
                      {workout.caloriesBurned} kcal
                    </span>
                  </div>
                </div>

                {/* WORKOUT ACTIONS */}
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <button
                    onClick={() => navigate(`/workouts/${workout.id}`)}
                    className="rounded-xl bg-[#B8F23A] px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-[#a3e635] shadow-xs"
                  >
                    Start Workout
                  </button>

                  <button
                    onClick={() => handleSelectWorkout(workout)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                      selectedWorkout?.id === workout.id
                        ? "border border-slate-300 bg-slate-100 text-slate-900"
                        : "border border-slate-200 bg-white text-slate-800 shadow-xs hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {selectedWorkout?.id === workout.id
                      ? "Close Editor"
                      : "Manage Exercises"}
                  </button>

                  <button
                    onClick={() => navigate(`/workouts/${workout.id}`)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => handleDeleteWorkout(workout)}
                    disabled={deleteLoading}
                    className="rounded-xl border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>

                {/* SELECTED WORKOUT */}
                {selectedWorkout?.id === workout.id && (
                  <div className="mt-6 border-t border-slate-100 pt-6">
                    {/* ADD EXERCISE */}
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 sm:p-6">
                      <h4 className="mb-4 text-base font-bold uppercase tracking-wider text-slate-900">
                        Add Exercise to {workout.name}
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
                          className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20"
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
                          className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20"
                        />

                        <input
                          type="number"
                          placeholder="Reps"
                          value={reps}
                          onChange={(e) => setReps(e.target.value)}
                          min="1"
                          className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20"
                        />

                        <button
                          type="submit"
                          disabled={exerciseLoading}
                          className="rounded-full bg-[#B8F23A] px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-[#a3e635] shadow-xs disabled:cursor-not-allowed disabled:opacity-50 md:col-span-3 transition"
                        >
                          {exerciseLoading
                            ? "Adding..."
                            : "Add Exercise"}
                        </button>
                      </form>
                    </div>

                    {/* EXERCISES */}
                    <div className="mt-6">
                      <h4 className="mb-4 text-base font-bold uppercase tracking-wider text-slate-900">
                        Exercise Routine
                      </h4>

                      {workoutExercises.length === 0 ? (
                        <div className="rounded-xl border border-slate-200 bg-white p-5 text-center text-xs text-slate-500 shadow-xs">
                          No exercises added yet. Select an exercise above to build this routine.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {workoutExercises.map((exercise) => (
                            <div
                              key={exercise.id}
                              className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:border-slate-300"
                            >
                              {/* EDIT MODE */}
                              {editingExerciseId === exercise.id ? (
                                <div>
                                  <h5 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
                                    Edit {exercise.exerciseName}
                                  </h5>

                                  <div className="grid gap-4 md:grid-cols-2">
                                    <input
                                      type="number"
                                      min="1"
                                      value={editSets}
                                      onChange={(e) =>
                                        setEditSets(e.target.value)
                                      }
                                      placeholder="Sets"
                                      className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-[#84CC16]"
                                    />

                                    <input
                                      type="number"
                                      min="1"
                                      value={editReps}
                                      onChange={(e) =>
                                        setEditReps(e.target.value)
                                      }
                                      placeholder="Reps"
                                      className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-[#84CC16]"
                                    />
                                  </div>

                                  <div className="mt-4 flex gap-3">
                                    <button
                                      onClick={() =>
                                        handleUpdateExercise(exercise)
                                      }
                                      disabled={editLoading}
                                      className="rounded-lg bg-[#B8F23A] px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-[#a3e635] shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {editLoading
                                        ? "Saving..."
                                        : "Save"}
                                    </button>

                                    <button
                                      onClick={handleCancelEdit}
                                      disabled={editLoading}
                                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* NORMAL MODE */
                                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                  <div>
                                    <h5 className="text-base font-bold text-slate-900">
                                      {exercise.exerciseName}
                                    </h5>

                                    <p className="mt-1 text-xs text-slate-500">
                                      {exercise.sets} sets ×{" "}
                                      {exercise.reps} reps
                                    </p>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2.5">
                                    <div className="mr-2 text-xs font-mono text-slate-500">
                                      {exercise.formScore !== null &&
                                      exercise.formScore !== undefined ? (
                                        <span className="rounded-md border border-[#84CC16]/30 bg-[#B8F23A]/15 px-2 py-0.5 font-bold text-slate-950">
                                          Form Score: {exercise.formScore}
                                        </span>
                                      ) : (
                                        <span className="text-slate-400">
                                          Auto-analyzed on start
                                        </span>
                                      )}
                                    </div>

                                    <button
                                      onClick={() =>
                                        handleStartEdit(exercise)
                                      }
                                      className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50"
                                    >
                                      Edit
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleDeleteExercise(exercise)
                                      }
                                      disabled={deleteLoading}
                                      className="rounded-lg border border-transparent px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* AI FEEDBACK */}
                              {exercise.aiFeedback && (
                                <div className="mt-3 rounded-xl border border-[#84CC16]/30 bg-[#B8F23A]/10 p-3 text-xs text-slate-800">
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
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}



