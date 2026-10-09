import { API_BASE } from "../../services/api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Activity, ShieldCheck, Sparkles } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGuestDemo = () => {
    const guestUser = {
      id: 999,
      name: "Guest Athlete",
      email: email.trim() || "guest@fitlens.ai",
    };
    login(guestUser, "mock-demo-jwt-token");
    navigate("/camera");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await response.json();

      const userData = {
        id: data.userId,
        name: data.name,
        email: data.email,
      };

      // Save user + JWT in AuthContext/localStorage
      login(userData, data.token);

      // Go to dashboard
      navigate("/dashboard");

    } catch (error) {
      console.warn("Backend login failed:", error);
      setError("Backend server is offline or invalid credentials. You can click 'Instant Demo Mode' below to test the AI camera directly!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900 flex">
      {/* =========================================================
          LEFT SHOWCASE PANEL (Desktop only)
      ========================================================= */}
      <div className="relative hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between overflow-hidden border-r border-white/[0.08] bg-[#09090d] p-12 lg:p-16">
        {/* Background Image with Cinematic Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center brightness-[0.4] contrast-[1.1] scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')`,
          }}
        />

        {/* Ambient Dark Gradients */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060608] via-transparent to-[#060608]/70" />
        <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-transparent via-[#060608]/40 to-[#060608]" />

        {/* Top Brand Tag */}
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 transition hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#060608]/80 text-[#B8F23A]">
              <Activity size={16} />
            </div>
            <span className="text-lg font-black tracking-tight text-[#F5F5F0]">
              FitLens
            </span>
            <span className="rounded bg-[#B8F23A]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#B8F23A] border border-[#B8F23A]/30">
              AI
            </span>
          </Link>
        </div>

        {/* Center Editorial Quote & Telemetry */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#B8F23A]">
            <Sparkles size={12} />
            Precision Training Platform
          </div>

          <h2 className="text-3xl xl:text-4xl font-black uppercase tracking-tight text-[#F5F5F0] leading-tight">
            Autonomous Biomechanical Intelligence for Athletes
          </h2>

          <p className="text-sm text-[#A8A8A2] leading-relaxed">
            Real-time 33-landmark skeleton tracking, millisecond angle telemetry, and immediate form correction without specialized hardware.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0c0c0e]/80 backdrop-blur-md px-3.5 py-2">
              <div className="h-2 w-2 rounded-full bg-[#B8F23A] animate-pulse" />
              <span className="text-xs font-mono text-[#D2D2CC]">
                VISION PIPELINE: 60 FPS
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0c0c0e]/80 backdrop-blur-md px-3.5 py-2">
              <ShieldCheck size={14} className="text-[#B8F23A]" />
              <span className="text-xs font-mono text-[#D2D2CC]">
                100% PRIVATE & ON-DEVICE
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Athlete Credit */}
        <div className="relative z-10 border-t border-white/[0.08] pt-6">
          <p className="text-xs text-[#8E8E92]">
            "The closest thing to having an Olympic strength coach observing every single repetition in real time."
          </p>
        </div>
      </div>

      {/* =========================================================
          RIGHT FORM PANEL
      ========================================================= */}
      <div className="w-full lg:w-7/12 xl:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-[#FAFAF8] text-slate-900">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:text-slate-950"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>

          {/* Brand mark on mobile */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <span className="text-base font-black tracking-tight text-slate-950">
              FitLens
            </span>
            <span className="rounded bg-lime-100 px-1 py-0.5 text-[9px] font-bold uppercase text-slate-900 border border-lime-300">
              AI
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="mx-auto w-full max-w-md py-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Heading */}
            <div className="mb-8">
              <span className="inline-block rounded-full border border-lime-300/80 bg-lime-100/60 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-900">
                Athlete Login
              </span>

              <h1 className="mt-3 text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-950">
                Welcome Back
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                Sign in to continue your fitness and form intelligence journey.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="athlete@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Notification */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
                  {error}
                </div>
              )}

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-[#B8F23A] py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-300 hover:bg-[#a6de2e] shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Registration Prompt */}
            <p className="mt-8 text-center text-xs text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold uppercase tracking-wider text-slate-900 underline underline-offset-4 hover:text-lime-700"
              >
                Register
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400">
          FitLens AI &copy; {new Date().getFullYear()} &bull; Autonomous Athletic Intelligence
        </div>
      </div>
    </div>
  );
}



