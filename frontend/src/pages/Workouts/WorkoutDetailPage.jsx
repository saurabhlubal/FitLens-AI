import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Flame,
  Play,
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  Plus,
  Check,
  X,
  Dumbbell,
} from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import AuthenticatedNavbar from "../../components/layout/AuthenticatedNavbar";

export default function WorkoutDetailPage() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthContext();

  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit Exercise State
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [editSets, setEditSets] = useState("");
  const [editReps, setEditReps] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Add Exercise State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExerciseId, setNewExerciseId] = useState("");
  const [newSets, setNewSets] = useState("3");
  const [newReps, setNewReps] = useState("10");

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

  const fetchAvailableExercises = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/exercises", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableExercises(data);
        if (data.length > 0 && !newExerciseId) {
          setNewExerciseId(String(data[0].id));
        }
      }
    } catch (err) {
      console.error("Failed to fetch available exercises:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchWorkout(), fetchExercises(), fetchAvailableExercises()]);
      setLoading(false);
    };

    if (token) {
      loadData();
    }
  }, [workoutId, token]);

  // ============================================================
  // START WORKOUT - Locks Sequence and navigates to active AI analysis
  // ============================================================
  const handleStartWorkout = () => {
    if (exercises.length > 0) {
      // Navigate to locked active workout session
      navigate(`/workouts/${workoutId}/active`);
    } else {
      navigate("/camera");
    }
  };

  // ============================================================
  // REORDER EXERCISES (Move Up / Down)
  // ============================================================
  const handleMoveExercise = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= exercises.length) return;

    const reordered = [...exercises];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setExercises(reordered);

    try {
      const orderedIds = reordered.map((e) => e.id);
      const res = await fetch(
        `http://localhost:8080/api/workouts/${workoutId}/exercises/reorder`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderedIds),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        setExercises(updated);
      }
    } catch (err) {
      console.error("Failed to reorder exercises:", err);
    }
  };

  // ============================================================
  // EDIT EXERCISE (Sets & Reps)
  // ============================================================
  const handleStartEdit = (exercise) => {
    setEditingExerciseId(exercise.id);
    setEditSets(String(exercise.sets));
    setEditReps(String(exercise.reps));
  };

  const handleCancelEdit = () => {
    setEditingExerciseId(null);
    setEditSets("");
    setEditReps("");
  };

  const handleSaveEdit = async (exercise) => {
    if (!editSets || !editReps) return;

    try {
      setActionLoading(true);
      const res = await fetch(
        `http://localhost:8080/api/workouts/${workoutId}/exercises/${exercise.id}`,
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

      if (res.ok) {
        setEditingExerciseId(null);
        await fetchExercises();
      } else {
        alert("Failed to update exercise");
      }
    } catch (err) {
      console.error("Failed to update exercise:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // DELETE EXERCISE
  // ============================================================
  const handleDeleteExercise = async (exercise) => {
    const confirmed = window.confirm(
      `Remove ${exercise.exerciseName} from this workout routine?`
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      const res = await fetch(
        `http://localhost:8080/api/workouts/${workoutId}/exercises/${exercise.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        await fetchExercises();
      } else {
        alert("Failed to delete exercise");
      }
    } catch (err) {
      console.error("Failed to delete exercise:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // ADD EXERCISE
  // ============================================================
  const handleAddExercise = async (e) => {
    e.preventDefault();
    if (!newExerciseId || !newSets || !newReps) return;

    try {
      setActionLoading(true);
      const res = await fetch(
        `http://localhost:8080/api/workouts/${workoutId}/exercises`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            exerciseId: Number(newExerciseId),
            sets: Number(newSets),
            reps: Number(newReps),
          }),
        }
      );

      if (res.ok) {
        setShowAddForm(false);
        setNewSets("3");
        setNewReps("10");
        await fetchExercises();
      } else {
        alert("Failed to add exercise");
      }
    } catch (err) {
      console.error("Failed to add exercise:", err);
    } finally {
      setActionLoading(false);
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
                disabled={exercises.length === 0}
                className="flex items-center gap-2.5 rounded-full bg-[#B8F23A] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-xs hover:bg-[#a3e635] hover:shadow-[0_0_25px_rgba(184,242,58,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Play size={15} fill="currentColor" />
                <span>Start Workout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Exercises Sequence */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-9 shadow-xs">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900">
                Exercise Sequence
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {exercises.length} exercise{exercises.length !== 1 ? "s" : ""} — Reorder, customize sets & reps, or add exercises before starting. Once started, the sequence is locked.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-slate-800"
              >
                <Plus size={14} />
                <span>Add Exercise</span>
              </button>
            </div>
          </div>

          {/* ADD EXERCISE FORM */}
          {showAddForm && (
            <form
              onSubmit={handleAddExercise}
              className="mb-6 rounded-2xl border border-lime-200 bg-lime-50/50 p-5 shadow-xs transition"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Dumbbell size={14} className="text-[#65A30D]" /> Add New Exercise to Sequence
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Exercise
                  </label>
                  <select
                    value={newExerciseId}
                    onChange={(e) => setNewExerciseId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-900 outline-none focus:border-slate-400"
                  >
                    {availableExercises.map((ae) => (
                      <option key={ae.id} value={ae.id}>
                        {ae.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Target Sets
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newSets}
                    onChange={(e) => setNewSets(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Target Reps
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newReps}
                    onChange={(e) => setNewReps(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-[#B8F23A] px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-xs hover:bg-[#a3e635] disabled:opacity-50"
                >
                  {actionLoading ? "Adding..." : "Add to Sequence"}
                </button>
              </div>
            </form>
          )}

          {exercises.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-8 text-center">
              <p className="text-sm text-slate-500">
                No exercises have been added to this workout routine yet.
              </p>

              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 rounded-full bg-[#B8F23A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-[#a3e635] shadow-xs"
              >
                Add Exercises
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {exercises.map((exercise, index) => {
                const isEditing = editingExerciseId === exercise.id;

                return (
                  <div
                    key={exercise.id}
                    className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 sm:p-5 transition hover:border-slate-300 hover:bg-white shadow-2xs"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* REORDER BUTTONS */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoveExercise(index, "up")}
                            disabled={index === 0 || actionLoading}
                            title="Move Up"
                            className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-20 disabled:hover:bg-transparent"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveExercise(index, "down")}
                            disabled={index === exercises.length - 1 || actionLoading}
                            title="Move Down"
                            className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-20 disabled:hover:bg-transparent"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800 shadow-2xs shrink-0">
                          0{index + 1}
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            {exercise.exerciseName}
                          </h3>

                          {!isEditing ? (
                            <p className="mt-0.5 text-xs text-slate-500 font-mono">
                              {exercise.sets} sets × {exercise.reps} reps
                            </p>
                          ) : (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-mono text-slate-400">Sets:</span>
                                <input
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={editSets}
                                  onChange={(e) => setEditSets(e.target.value)}
                                  className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900"
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-mono text-slate-400">Reps:</span>
                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={editReps}
                                  onChange={(e) => setEditReps(e.target.value)}
                                  className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(exercise)}
                                disabled={actionLoading}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#B8F23A] text-slate-950 hover:bg-[#a3e635]"
                                title="Save"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={actionLoading}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                                title="Cancel"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ACTIONS & SCORES */}
                      <div className="flex items-center gap-2 sm:gap-3 self-end md:self-auto">
                        <div className="text-xs font-mono mr-1">
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

                        {!isEditing && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(exercise)}
                              disabled={actionLoading}
                              title="Edit Sets/Reps"
                              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 shadow-2xs"
                            >
                              <Edit2 size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteExercise(exercise)}
                              disabled={actionLoading}
                              title="Remove Exercise"
                              className="rounded-lg border border-transparent p-2 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}