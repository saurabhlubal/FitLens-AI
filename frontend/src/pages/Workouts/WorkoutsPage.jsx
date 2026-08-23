import { useEffect, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";

export default function WorkoutsPage() {
  const { token } = useAuthContext();

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");

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

  useEffect(() => {
    if (token) {
      fetchWorkouts();
    }
  }, [token]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading workouts...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-5xl">

        <h1 className="mb-8 text-4xl font-bold">
          My Workouts
        </h1>

        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Create Workout */}
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

        {/* Workout List */}
        <div className="space-y-4">
          {workouts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">
              No workouts yet.
            </div>
          ) : (
            workouts.map((workout) => (
              <div
                key={workout.id}
                className="rounded-2xl border border-white/10 bg-slate-900 p-6"
              >
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
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}