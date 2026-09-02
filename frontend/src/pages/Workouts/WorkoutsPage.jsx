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
        `http://localhost:8080/api/workouts/${selectedWorkout.id}/exercises/${exercise.id}`,
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
        `http://localhost:8080/api/workouts/${selectedWorkout.id}/exercises/${exercise.id}`,
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
        `http://localhost:8080/api/workouts/${workout.id}`,
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
      <div className="min-h-screen bg-[#060608] text-[#F5F5F0]">
        <AuthenticatedNavbar />
        <div className="flex min-h-[60vh] items-center justify-center text-xs font-bold uppercase tracking-widest text-[#8E8E92]">
          Loading workouts...
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="min-h-screen bg-[#060608] text-[#F5F5F0]">
      {/* AUTHENTICATED NAVBAR */}
      <AuthenticatedNavbar />

      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        {/* HEADER */}
        <div className="mb-10">
          <span className="inline-block rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#B8F23A]">
            Workouts
          </span>

          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F5F5F0]">
            My Workouts
          </h1>

          <p className="mt-2 text-sm sm:text-base text-[#A8A8A2] leading-relaxed">
            Create workouts, add exercises, and track your sets and reps.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* CREATE WORKOUT */}
        <div className="mb-10 rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-7 sm:p-8">
          <h2 className="mb-6 text-xl font-bold uppercase tracking-wider text-[#F5F5F0]">
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
              className="rounded-xl border border-white/[0.08] bg-[#141418] p-3 text-sm text-[#F5F5F0] placeholder-[#55555A] outline-none transition focus:border-[#B8F23A]/50 focus:ring-1 focus:ring-[#B8F23A]/30"
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="rounded-xl border border-white/[0.08] bg-[#141418] p-3 text-sm text-[#F5F5F0] placeholder-[#55555A] outline-none transition focus:border-[#B8F23A]/50 focus:ring-1 focus:ring-[#B8F23A]/30"
            />

            <input
              type="number"
              placeholder="Duration (minutes)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              min="1"
              className="rounded-xl border border-white/[0.08] bg-[#141418] p-3 text-sm text-[#F5F5F0] placeholder-[#55555A] outline-none transition focus:border-[#B8F23A]/50 focus:ring-1 focus:ring-[#B8F23A]/30"
            />

            <input
              type="number"
              placeholder="Calories burned"
              value={caloriesBurned}
              onChange={(e) => setCaloriesBurned(e.target.value)}
              required
              min="0"
              className="rounded-xl border border-white/[0.08] bg-[#141418] p-3 text-sm text-[#F5F5F0] placeholder-[#55555A] outline-none transition focus:border-[#B8F23A]/50 focus:ring-1 focus:ring-[#B8F23A]/30"
            />

            <button
              type="submit"
              className="rounded-full bg-[#B8F23A] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-[#060608] transition-all duration-300 hover:bg-[#a6de2e] hover:shadow-[0_0_25px_rgba(184,242,58,0.3)] md:col-span-2"
            >
              Add Workout
            </button>
          </form>
        </div>

        {/* WORKOUT LIST */}
        <div className="space-y-4">
          {workouts.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-10 text-center text-sm text-[#8E8E92]">
              No workouts yet.
            </div>
          ) : (
            workouts.map((workout) => (
              <div
                key={workout.id}
                className={`rounded-2xl border transition-all duration-300 p-6 sm:p-7 ${
                  selectedWorkout?.id === workout.id
                    ? "border-[#B8F23A]/40 bg-[#0e110a]"
                    : "border-white/[0.08] bg-[#0c0c0e] hover:border-white/20"
                }`}
              >
                {/* WORKOUT HEADER */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#F5F5F0]">
                      {workout.name}
                    </h3>

                    <p className="mt-1 text-xs text-[#8E8E92] font-mono">
                      {workout.date}
                    </p>
                  </div>

                  <div className="flex gap-4 text-xs font-mono font-bold text-[#D2D2CC]">
                    <span className="rounded-lg border border-white/[0.06] bg-[#141418] px-3 py-1">
                      {workout.duration} min
                    </span>

                    <span className="rounded-lg border border-white/[0.06] bg-[#141418] px-3 py-1">
                      {workout.caloriesBurned} kcal
                    </span>
                  </div>
                </div>

                {/* WORKOUT ACTIONS */}
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <button
                    onClick={() => handleSelectWorkout(workout)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                      selectedWorkout?.id === workout.id
                        ? "bg-[#B8F23A] text-[#060608]"
                        : "border border-white/10 bg-white/[0.04] text-[#F5F5F0] hover:border-[#B8F23A]/40 hover:bg-white/[0.08]"
                    }`}
                  >
                    {selectedWorkout?.id === workout.id
                      ? "Selected"
                      : "Manage Exercises"}
                  </button>

                  <button
                    onClick={() => navigate(`/workouts/${workout.id}`)}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#F5F5F0] transition hover:border-[#B8F23A]/40 hover:bg-white/[0.08]"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => handleDeleteWorkout(workout)}
                    disabled={deleteLoading}
                    className="rounded-xl border border-transparent px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#8E8E92] transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Delete Workout
                  </button>
                </div>

                {/* SELECTED WORKOUT */}
                {selectedWorkout?.id === workout.id && (
                  <div className="mt-6 border-t border-white/[0.08] pt-6">
                    {/* ADD EXERCISE */}
                    <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-6">
                      <h4 className="mb-4 text-base font-bold uppercase tracking-wider text-[#F5F5F0]">
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
                          className="rounded-xl border border-white/[0.08] bg-[#18181e] p-3 text-sm text-[#F5F5F0] outline-none transition focus:border-[#B8F23A]/50"
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
                          className="rounded-xl border border-white/[0.08] bg-[#18181e] p-3 text-sm text-[#F5F5F0] outline-none transition focus:border-[#B8F23A]/50"
                        />

                        <input
                          type="number"
                          placeholder="Reps"
                          value={reps}
                          onChange={(e) => setReps(e.target.value)}
                          min="1"
                          className="rounded-xl border border-white/[0.08] bg-[#18181e] p-3 text-sm text-[#F5F5F0] outline-none transition focus:border-[#B8F23A]/50"
                        />

                        <button
                          type="submit"
                          disabled={exerciseLoading}
                          className="rounded-full bg-[#B8F23A] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#060608] hover:bg-[#a6de2e] disabled:cursor-not-allowed disabled:opacity-50 md:col-span-3 transition"
                        >
                          {exerciseLoading
                            ? "Adding..."
                            : "Add Exercise"}
                        </button>
                      </form>
                    </div>

                    {/* EXERCISES */}
                    <div className="mt-6">
                      <h4 className="mb-4 text-base font-bold uppercase tracking-wider text-[#F5F5F0]">
                        Exercises
                      </h4>

                      {workoutExercises.length === 0 ? (
                        <div className="rounded-xl border border-white/[0.06] bg-[#121216] p-5 text-center text-xs text-[#8E8E92]">
                          No exercises added yet.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {workoutExercises.map((exercise) => (
                            <div
                              key={exercise.id}
                              className="rounded-xl border border-white/[0.06] bg-[#141418] p-4 sm:p-5 transition hover:border-white/15"
                            >
                              {/* EDIT MODE */}
                              {editingExerciseId === exercise.id ? (
                                <div>
                                  <h5 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#F5F5F0]">
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
                                      className="rounded-xl border border-white/[0.08] bg-[#1a1a20] p-3 text-sm text-[#F5F5F0] outline-none focus:border-[#B8F23A]/50"
                                    />

                                    <input
                                      type="number"
                                      min="1"
                                      value={editReps}
                                      onChange={(e) =>
                                        setEditReps(e.target.value)
                                      }
                                      placeholder="Reps"
                                      className="rounded-xl border border-white/[0.08] bg-[#1a1a20] p-3 text-sm text-[#F5F5F0] outline-none focus:border-[#B8F23A]/50"
                                    />
                                  </div>

                                  <div className="mt-4 flex gap-3">
                                    <button
                                      onClick={() =>
                                        handleUpdateExercise(exercise)
                                      }
                                      disabled={editLoading}
                                      className="rounded-lg bg-[#B8F23A] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#060608] hover:bg-[#a6de2e] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {editLoading
                                        ? "Saving..."
                                        : "Save"}
                                    </button>

                                    <button
                                      onClick={handleCancelEdit}
                                      disabled={editLoading}
                                      className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-[#D2D2CC] hover:bg-white/[0.08]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* NORMAL MODE */
                                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                  <div>
                                    <h5 className="text-base font-bold text-[#F5F5F0]">
                                      {exercise.exerciseName}
                                    </h5>

                                    <p className="mt-1 text-xs text-[#A8A8A2]">
                                      {exercise.sets} sets ×{" "}
                                      {exercise.reps} reps
                                    </p>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2.5">
                                    <div className="mr-2 text-xs font-mono text-[#8E8E92]">
                                      {exercise.formScore !== null &&
                                      exercise.formScore !== undefined ? (
                                        <span className="text-[#B8F23A] font-bold">
                                          Form Score: {exercise.formScore}
                                        </span>
                                      ) : (
                                        <span>
                                          AI analysis pending
                                        </span>
                                      )}
                                    </div>

                                    {/* AI ANALYSIS BUTTON */}
                                    <button
                                      onClick={() =>
                                        handleStartAIAnalysis(exercise)
                                      }
                                      className="rounded-lg border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#B8F23A] transition hover:bg-[#B8F23A]/20"
                                    >
                                      Start AI Analysis
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleStartEdit(exercise)
                                      }
                                      className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#D2D2CC] transition hover:border-white/25 hover:text-white"
                                    >
                                      Edit
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleDeleteExercise(exercise)
                                      }
                                      disabled={deleteLoading}
                                      className="rounded-lg border border-transparent px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#8E8E92] transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* AI FEEDBACK */}
                              {exercise.aiFeedback && (
                                <div className="mt-3 rounded-xl border border-[#B8F23A]/20 bg-[#0e1208] p-3 text-xs text-[#D2D2CC]">
                                  <span className="font-bold text-[#B8F23A]">
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