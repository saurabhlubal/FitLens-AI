import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import AuthenticatedNavbar from "../../components/layout/AuthenticatedNavbar";

export default function FitnessProfilePage() {
  const navigate = useNavigate();
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
      <div className="min-h-screen bg-[#FAFAF8] text-slate-900">
        <AuthenticatedNavbar />
        <div className="flex min-h-[60vh] items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-400">
          Loading fitness profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900">
      {/* AUTHENTICATED NAVBAR */}
      <AuthenticatedNavbar />

      <div className="mx-auto max-w-2xl px-6 py-8 sm:py-10">
        <button
          onClick={() => navigate("/profile")}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-xs transition hover:border-slate-300 hover:text-slate-950"
        >
          <ArrowLeft size={14} />
          Back to Profile
        </button>

        <div className="mb-8">
          <span className="inline-block rounded-full border border-lime-300/80 bg-lime-100/60 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-900">
            Biometric Metrics
          </span>

          <h1 className="mt-3 text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-950">
            Fitness Profile
          </h1>

          <p className="mt-1 text-sm sm:text-base text-slate-600 leading-relaxed">
            Enter your physical details to calibrate AI form detection and workout load calculations.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-7 sm:p-9 shadow-xs"
        >
          {/* Age */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>

          {/* Height */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>

          {/* Fitness Goal */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Fitness Goal
            </label>

            <select
              name="fitnessGoal"
              value={form.fitnessGoal}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
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
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Activity Level
            </label>

            <select
              name="activityLevel"
              value={form.activityLevel}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
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
            <div className="rounded-xl border border-lime-300 bg-lime-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-xs">
              {message}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-[#B8F23A] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-300 hover:bg-[#a6de2e] shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Fitness Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}