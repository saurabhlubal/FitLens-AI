import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Dumbbell,
  TrendingUp,
  User,
  Sparkles,
  Camera,
  Activity,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Zap,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import AuthenticatedNavbar from "../../components/layout/AuthenticatedNavbar";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const athleteName = user?.name ? user.name : "Athlete";

  // Formatted current date string
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-[#060608] text-[#F5F5F0]">
      {/* =========================
          AUTHENTICATED NAVBAR
      ========================= */}
      <AuthenticatedNavbar />

      {/* =========================
          MAIN COMMAND CENTER
      ========================= */}
      <main className="mx-auto max-w-7xl px-6 py-10 sm:py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          {/* =========================================================
              1. ATHLETE COMMAND HEADER & STATUS STRIP
          ========================================================= */}
          <motion.section
            variants={itemVariants}
            className="flex flex-col justify-between gap-6 border-b border-white/[0.08] pb-10 md:flex-row md:items-end"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#B8F23A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B8F23A] animate-pulse" />
                  Command Center
                </span>

                <div className="flex items-center gap-1.5 text-xs text-[#8E8E92] font-mono">
                  <Calendar size={13} />
                  <span>{currentDate}</span>
                </div>
              </div>

              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F5F5F0]">
                Welcome back, {athleteName}
              </h1>

              <p className="mt-2.5 max-w-2xl text-sm sm:text-base text-[#A8A8A2] leading-relaxed">
                Track your workouts, monitor your progress, and improve your
                exercise form with FitLens AI.
              </p>
            </div>

            {/* System Telemetry Beacon */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0c0c0e] px-5 py-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#16161a] text-[#B8F23A]">
                <Activity size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8E8E92]">
                  System Status
                </p>
                <p className="text-xs font-mono font-bold text-[#F5F5F0]">
                  AI VISION ENGINE ACTIVE
                </p>
              </div>
            </div>
          </motion.section>

          {/* =========================================================
              2. PRIMARY "TODAY'S TRAINING" FEATURE AREA
          ========================================================= */}
          <motion.section variants={itemVariants}>
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0c0e] p-8 sm:p-10 transition-all duration-300 hover:border-white/20">
              {/* Subtle ambient light */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#B8F23A]/[0.03] blur-[100px]" />

              <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                <div className="max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#141418] px-3.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#D2D2CC]">
                    <Zap size={13} className="text-[#B8F23A]" />
                    Today's Training Protocol
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#F5F5F0]">
                    Log Sessions &amp; Biomechanical Tracking
                  </h2>

                  <p className="text-sm text-[#A8A8A2] leading-relaxed">
                    Create custom workouts, log sets, reps, and duration, or engage the computer-vision pose analysis engine to inspect form symmetry in real time.
                  </p>

                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="rounded-xl border border-white/[0.06] bg-[#141418] p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E92]">
                        Exercises
                      </p>
                      <p className="mt-1 text-sm font-mono font-bold text-[#F5F5F0]">
                        Full Library
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-[#141418] p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E92]">
                        Telemetry
                      </p>
                      <p className="mt-1 text-sm font-mono font-bold text-[#B8F23A]">
                        33 Landmarks
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-[#141418] p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E92]">
                        Privacy
                      </p>
                      <p className="mt-1 text-sm font-mono font-bold text-[#F5F5F0]">
                        100% Local
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col sm:flex-row lg:flex-col gap-3">
                  <button
                    onClick={() => navigate("/workouts")}
                    className="flex items-center justify-center gap-2 rounded-full bg-[#B8F23A] px-8 py-4 text-xs font-bold uppercase tracking-wider text-[#060608] transition-all duration-300 hover:bg-[#a6de2e] hover:shadow-[0_0_30px_rgba(184,242,58,0.35)]"
                  >
                    <span>Manage Workouts</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    onClick={() => navigate("/camera")}
                    className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-8 py-4 text-xs font-bold uppercase tracking-wider text-[#F5F5F0] transition hover:border-[#B8F23A]/40 hover:bg-white/[0.08]"
                  >
                    <Camera size={14} className="text-[#B8F23A]" />
                    <span>Launch AI Camera</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* =========================================================
              3. ARCHITECTURAL BENTO COMMAND TILES
          ========================================================= */}
          <motion.section variants={itemVariants}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold uppercase tracking-wider text-[#F5F5F0]">
                Command Modules
              </h3>
              <span className="text-xs font-mono text-[#8E8E92]">
                SELECT MODULE TO PROCEED
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* WORKOUTS BENTO TILE */}
              <button
                onClick={() => navigate("/workouts")}
                className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0c0e] p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#B8F23A]/40 hover:bg-[#111115]"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#16161a] text-[#B8F23A] transition-colors group-hover:border-[#B8F23A]/40 group-hover:bg-[#1a1a1f]">
                    <Dumbbell size={22} />
                  </div>
                  <span className="rounded-lg border border-white/[0.06] bg-[#141418] px-2.5 py-1 text-[10px] font-mono uppercase text-[#8E8E92]">
                    MODULE 01
                  </span>
                </div>

                <h4 className="text-xl font-bold text-[#F5F5F0]">
                  My Workouts
                </h4>

                <p className="mt-2 text-sm text-[#A8A8A2] leading-relaxed">
                  Create workouts, add exercises, and track your sets and reps.
                </p>

                <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#B8F23A] transition-transform group-hover:translate-x-1">
                    Manage workouts →
                  </span>
                  <div className="h-2 w-2 rounded-full bg-[#B8F23A]/30 group-hover:bg-[#B8F23A] transition-colors" />
                </div>
              </button>

              {/* PROGRESS BENTO TILE */}
              <button
                onClick={() => navigate("/progress")}
                className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0c0e] p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#B8F23A]/40 hover:bg-[#111115]"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#16161a] text-[#B8F23A] transition-colors group-hover:border-[#B8F23A]/40 group-hover:bg-[#1a1a1f]">
                    <TrendingUp size={22} />
                  </div>
                  <span className="rounded-lg border border-white/[0.06] bg-[#141418] px-2.5 py-1 text-[10px] font-mono uppercase text-[#8E8E92]">
                    MODULE 02
                  </span>
                </div>

                <h4 className="text-xl font-bold text-[#F5F5F0]">
                  Progress
                </h4>

                <p className="mt-2 text-sm text-[#A8A8A2] leading-relaxed">
                  Monitor your fitness progress and analyze your performance.
                </p>

                <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#B8F23A] transition-transform group-hover:translate-x-1">
                    View progress →
                  </span>
                  <div className="h-2 w-2 rounded-full bg-[#B8F23A]/30 group-hover:bg-[#B8F23A] transition-colors" />
                </div>
              </button>

              {/* PROFILE BENTO TILE */}
              <button
                onClick={() => navigate("/profile")}
                className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0c0e] p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#B8F23A]/40 hover:bg-[#111115]"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#16161a] text-[#B8F23A] transition-colors group-hover:border-[#B8F23A]/40 group-hover:bg-[#1a1a1f]">
                    <User size={22} />
                  </div>
                  <span className="rounded-lg border border-white/[0.06] bg-[#141418] px-2.5 py-1 text-[10px] font-mono uppercase text-[#8E8E92]">
                    MODULE 03
                  </span>
                </div>

                <h4 className="text-xl font-bold text-[#F5F5F0]">
                  My Profile
                </h4>

                <p className="mt-2 text-sm text-[#A8A8A2] leading-relaxed">
                  Manage your personal and fitness information.
                </p>

                <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#B8F23A] transition-transform group-hover:translate-x-1">
                    View profile →
                  </span>
                  <div className="h-2 w-2 rounded-full bg-[#B8F23A]/30 group-hover:bg-[#B8F23A] transition-colors" />
                </div>
              </button>
            </div>
          </motion.section>

          {/* =========================================================
              4. AI FITNESS COACH CTA SHOWCASE
          ========================================================= */}
          <motion.section variants={itemVariants}>
            <div className="relative overflow-hidden rounded-3xl border border-[#B8F23A]/25 bg-gradient-to-b from-[#12160d] via-[#0c0d0a] to-[#070709] p-8 sm:p-12 shadow-2xl">
              {/* Radial lime glow */}
              <div className="pointer-events-none absolute -top-24 right-10 h-56 w-72 rounded-full bg-[#B8F23A]/[0.07] blur-[90px]" />

              <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#B8F23A]">
                    <Sparkles size={12} />
                    AI Fitness Coach
                  </div>

                  <h3 className="mt-4 text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#F5F5F0]">
                    Improve Your Exercise Form
                  </h3>

                  <p className="mt-3 text-sm sm:text-base text-[#A8A8A2] leading-relaxed">
                    FitLens AI will analyze your movement and provide feedback
                    to help you perform exercises with better form and technique.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-mono text-[#D2D2CC]">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[#B8F23A]" />
                      <span>Pose Verification Ready</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#B8F23A]" />
                      <span>Real-time Audio Feedback</span>
                    </div>
                  </div>
                </div>

                {/* CAMERA / AI ANALYSIS BUTTON */}
                <button
                  onClick={() => navigate("/camera")}
                  className="shrink-0 rounded-full bg-[#B8F23A] px-8 py-4 text-xs font-bold uppercase tracking-wider text-[#060608] transition-all duration-300 hover:bg-[#a6de2e] hover:shadow-[0_0_35px_rgba(184,242,58,0.4)] hover:scale-105 active:scale-95"
                >
                  Start AI Analysis
                </button>
              </div>
            </div>
          </motion.section>
        </motion.div>
      </main>
    </div>
  );
}