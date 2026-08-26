import { useEffect, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";

export default function FitnessProfilePage() {
  const { token } = useAuthContext();

  const [form, setForm] = useState({
    age: "",
    height: "",
    weight: "",
    fitnessGoal: "",
    activityLevel: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load existing fitness profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:8080/api/fitness-profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          const data = await response.json();

          if (data) {
            setForm({
              age: data.age ?? "",
              height: data.height ?? "",
              weight: data.weight ?? "",
              fitnessGoal: data.fitnessGoal ?? "",
              activityLevel: data.activityLevel ?? "",
            });
          }
        }
      } catch (err) {
        setError("Could not load fitness profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "http://localhost:8080/api/fitness-profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            age: Number(form.age),
            height: Number(form.height),
            weight: Number(form.weight),
            fitnessGoal: form.fitnessGoal,
            activityLevel: form.activityLevel,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save fitness profile");
      }

      const data = await response.json();

      setForm({
        age: data.age ?? "",
        height: data.height ?? "",
        weight: data.weight ?? "",
        fitnessGoal: data.fitnessGoal ?? "",
        activityLevel: data.activityLevel ?? "",
      });

      setMessage("Fitness profile saved successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading fitness profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="mx-auto max-w-2xl">

        <h1 className="mb-2 text-4xl font-bold">
          Fitness Profile
        </h1>

        <p className="mb-8 text-slate-400">
          Enter your information to personalize your FitLens AI experience.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-white/10 bg-slate-900 p-8"
        >

          {/* Age */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Age
            </label>

            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              required
              min="1"
              max="120"
              placeholder="Enter your age"
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* Height */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Height (cm)
            </label>

            <input
              type="number"
              name="height"
              value={form.height}
              onChange={handleChange}
              required
              min="50"
              max="250"
              placeholder="Enter your height"
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Weight (kg)
            </label>

            <input
              type="number"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              required
              min="20"
              max="300"
              step="0.1"
              placeholder="Enter your weight"
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* Fitness Goal */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Fitness Goal
            </label>

            <select
              name="fitnessGoal"
              value={form.fitnessGoal}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              <option value="">Select your goal</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Muscle Gain">Muscle Gain</option>
              <option value="General Fitness">General Fitness</option>
              <option value="Strength">Strength</option>
              <option value="Endurance">Endurance</option>
            </select>
          </div>

          {/* Activity Level */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Activity Level
            </label>

            <select
              name="activityLevel"
              value={form.activityLevel}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              <option value="">Select activity level</option>
              <option value="Sedentary">Sedentary</option>
              <option value="Light">Light</option>
              <option value="Moderate">Moderate</option>
              <option value="Active">Active</option>
              <option value="Very Active">Very Active</option>
            </select>
          </div>

          {/* Success */}
          {message && (
            <div className="rounded-xl bg-green-500/10 px-4 py-3 text-green-400">
              {message}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-500/10 px-4 py-3 text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Fitness Profile"}
          </button>

        </form>
      </div>
    </div>
  );
}