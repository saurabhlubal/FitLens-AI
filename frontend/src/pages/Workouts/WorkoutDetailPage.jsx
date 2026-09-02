import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Flame } from "lucide-react";
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
      <div className="min-h-screen bg-[#060608] text-[#F5F5F0]">
        <AuthenticatedNavbar />
        <div className="flex min-h-[60vh] items-center justify-center text-xs font-bold uppercase tracking-widest text-[#8E8E92]">
          Loading workout...
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen bg-[#060608] text-[#F5F5F0]">
        <AuthenticatedNavbar />
        <div className="mx-auto max-w-4xl px-6 py-10">
          <button
            onClick={() => navigate("/workouts")}
            className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0c0c0e] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#D2D2CC] transition hover:border-[#B8F23A]/40 hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to Workouts
          </button>

          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-400">
            {error || "Workout not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] text-[#F5F5F0]">
      {/* AUTHENTICATED NAVBAR */}
      <AuthenticatedNavbar />

      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-12">
        {/* Back */}
        <button
          onClick={() => navigate("/workouts")}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0c0c0e] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#D2D2CC] transition hover:border-[#B8F23A]/40 hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Workouts
        </button>

        {/* Workout Header */}
        <div className="mb-8 rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-7 sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <span className="inline-block rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#B8F23A]">
                Workout
              </span>

              <h1 className="mt-3 text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F5F0]">
                {workout.name}
              </h1>

              <p className="mt-1.5 text-xs text-[#8E8E92] font-mono">
                {workout.date}
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-[#141418] px-4 py-3">
                <Clock size={16} className="text-[#B8F23A]" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E92]">
                    Duration
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-[#F5F5F0] font-mono">
                    {workout.duration} min
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-[#141418] px-4 py-3">
                <Flame size={16} className="text-[#B8F23A]" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E92]">
                    Calories
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-[#F5F5F0] font-mono">
                    {workout.caloriesBurned} kcal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-7 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-[#F5F5F0]">
                Exercises
              </h2>

              <p className="mt-1 text-xs text-[#8E8E92]">
                {exercises.length} exercise
                {exercises.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {exercises.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-[#121216] p-8 text-center">
              <p className="text-sm text-[#8E8E92]">
                No exercises have been added to this workout yet.
              </p>

              <button
                onClick={() => navigate("/workouts")}
                className="mt-4 rounded-full bg-[#B8F23A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#060608] transition hover:bg-[#a6de2e]"
              >
                Add Exercises
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="rounded-xl border border-white/[0.06] bg-[#141418] p-5 transition hover:border-white/15"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#B8F23A]/30 bg-[#B8F23A]/15 text-xs font-mono font-bold text-[#B8F23A]">
                        0{index + 1}
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-[#F5F5F0]">
                          {exercise.exerciseName}
                        </h3>

                        <p className="mt-1 text-xs text-[#A8A8A2]">
                          {exercise.sets} sets × {exercise.reps} reps
                        </p>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-[#8E8E92]">
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
                  </div>

                  {exercise.aiFeedback && (
                    <div className="mt-4 rounded-xl border border-[#B8F23A]/20 bg-[#0e1208] p-3.5 text-xs text-[#D2D2CC]">
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
    </div>
  );
}