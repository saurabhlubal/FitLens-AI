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
      <div className="min-h-screen bg-[#060608] text-[#F5F5F0]">
        <AuthenticatedNavbar />
        <div className="flex min-h-[60vh] items-center justify-center text-xs font-bold uppercase tracking-widest text-[#8E8E92]">
          Loading fitness profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] text-[#F5F5F0]">
      {/* AUTHENTICATED NAVBAR */}
      <AuthenticatedNavbar />

      <div className="mx-auto max-w-2xl px-6 py-10 sm:py-12">
        <button
          onClick={() => navigate("/profile")}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0c0c0e] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#D2D2CC] transition hover:border-[#B8F23A]/40 hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Profile
        </button>

        <div className="mb-8">
          <span className="inline-block rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#B8F23A]">
            Metrics
          </span>

          <h1 className="mt-3 text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F5F0]">
            Fitness Profile
          </h1>

          <p className="mt-2 text-sm sm:text-base text-[#A8A8A2] leading-relaxed">
            Enter your information to personalize your FitLens AI experience.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-7 sm:p-9"
        >
          {/* Age */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#8E8E92]">
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
              className="w-full rounded-xl border border-white/[0.08] bg-[#141418] px-4 py-3 text-sm text-[#F5F5F0] placeholder-[#55555A] outline-none transition focus:border-[#B8F23A]/50 focus:ring-1 focus:ring-[#B8F23A]/30"
            />
          </div>

          {/* Height */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#8E8E92]">
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
              className="w-full rounded-xl border border-white/[0.08] bg-[#141418] px-4 py-3 text-sm text-[#F5F5F0] placeholder-[#55555A] outline-none transition focus:border-[#B8F23A]/50 focus:ring-1 focus:ring-[#B8F23A]/30"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#8E8E92]">
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
              className="w-full rounded-xl border border-white/[0.08] bg-[#141418] px-4 py-3 text-sm text-[#F5F5F0] placeholder-[#55555A] outline-none transition focus:border-[#B8F23A]/50 focus:ring-1 focus:ring-[#B8F23A]/30"
            />
          </div>

          {/* Fitness Goal */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#8E8E92]">
              Fitness Goal
            </label>

            <select
              name="fitnessGoal"
              value={form.fitnessGoal}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/[0.08] bg-[#141418] px-4 py-3 text-sm text-[#F5F5F0] outline-none transition focus:border-[#B8F23A]/50 focus:ring-1 focus:ring-[#B8F23A]/30"
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
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#8E8E92]">
              Activity Level
            </label>

            <select
              name="activityLevel"
              value={form.activityLevel}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/[0.08] bg-[#141418] px-4 py-3 text-sm text-[#F5F5F0] outline-none transition focus:border-[#B8F23A]/50 focus:ring-1 focus:ring-[#B8F23A]/30"
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
            <div className="rounded-xl border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#B8F23A]">
              {message}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-[#B8F23A] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#060608] transition-all duration-300 hover:bg-[#a6de2e] hover:shadow-[0_0_25px_rgba(184,242,58,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Fitness Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}