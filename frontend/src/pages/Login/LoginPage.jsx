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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/login",
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
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] text-[#F5F5F0] flex">
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
      <div className="w-full lg:w-7/12 xl:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8E8E92] transition hover:text-[#F5F5F0]"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>

          {/* Brand mark on mobile */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <span className="text-base font-black tracking-tight text-[#F5F5F0]">
              FitLens
            </span>
            <span className="rounded bg-[#B8F23A]/15 px-1 py-0.5 text-[9px] font-bold uppercase text-[#B8F23A] border border-[#B8F23A]/30">
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
              <span className="inline-block rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#B8F23A]">
                Athlete Login
              </span>

              <h1 className="mt-3 text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F5F0]">
                Welcome Back
              </h1>

              <p className="mt-2 text-sm text-[#A8A8A2]">
                Sign in to continue your fitness and form intelligence journey.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#8E8E92]">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="athlete@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/[0.08] bg-[#121216] px-4 py-3 text-sm text-[#F5F5F0] placeholder-[#55555A] outline-none transition focus:border-[#B8F23A]/50 focus:ring-1 focus:ring-[#B8F23A]/30"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#8E8E92]">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/[0.08] bg-[#121216] px-4 py-3 pr-12 text-sm text-[#F5F5F0] placeholder-[#55555A] outline-none transition focus:border-[#B8F23A]/50 focus:ring-1 focus:ring-[#B8F23A]/30"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8E92] transition hover:text-[#F5F5F0]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Notification */}
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-400">
                  {error}
                </div>
              )}

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-[#B8F23A] py-3.5 text-xs font-bold uppercase tracking-wider text-[#060608] transition-all duration-300 hover:bg-[#a6de2e] hover:shadow-[0_0_25px_rgba(184,242,58,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="h-px flex-1 bg-white/[0.08]" />
              <span className="px-4 text-[11px] font-bold uppercase tracking-widest text-[#55555A]">
                OR CONTINUE WITH
              </span>
              <div className="h-px flex-1 bg-white/[0.08]" />
            </div>

            {/* Google continue */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-[#121216] py-3 text-xs font-bold uppercase tracking-wider text-[#D2D2CC] transition hover:border-white/20 hover:bg-[#16161c]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Registration Prompt */}
            <p className="mt-8 text-center text-xs text-[#8E8E92]">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold uppercase tracking-wider text-[#B8F23A] hover:underline"
              >
                Register
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-[#55555A]">
          FitLens AI &copy; {new Date().getFullYear()} &bull; Autonomous Athletic Intelligence
        </div>
      </div>
    </div>
  );
}