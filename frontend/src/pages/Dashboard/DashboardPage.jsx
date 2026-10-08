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
  FileScan,
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
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900">
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
            className="flex flex-col justify-between gap-6 border-b border-slate-200/80 pb-10 md:flex-row md:items-end"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#84CC16]/40 bg-[#B8F23A]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-950">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#84CC16] animate-pulse" />
                  Command Center
                </span>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <Calendar size={13} />
                  <span>{currentDate}</span>
                </div>
              </div>

              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-900">
                Welcome back, {athleteName}
              </h1>

              <p className="mt-2.5 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
                Track your workouts, monitor your progress, and improve your
                exercise form with FitLens AI.
              </p>
            </div>

            {/* System Telemetry Beacon */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3.5 shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[#65A30D]">
                <Activity size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  System Status
                </p>
                <p className="text-xs font-mono font-bold text-slate-900">
                  AI VISION ENGINE ACTIVE
                </p>
              </div>
            </div>
          </motion.section>

          {/* =========================================================
              2. PRIMARY "TODAY'S TRAINING" FEATURE AREA
          ========================================================= */}
          <motion.section variants={itemVariants}>
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-sm transition-all duration-300 hover:shadow-md">
              {/* Subtle ambient light */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#B8F23A]/10 blur-[100px]" />

              <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                <div className="max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                    <Zap size={13} className="text-[#65A30D]" />
                    Today's Training Protocol
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
                    Log Sessions &amp; Biomechanical Tracking
                  </h2>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Create custom workouts, log sets, reps, and duration, or engage the computer-vision pose analysis engine to inspect form symmetry in real time.
                  </p>

                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Exercises
                      </p>
                      <p className="mt-1 text-sm font-mono font-bold text-slate-900">
                        Full Library
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Telemetry
                      </p>
                      <p className="mt-1 text-sm font-mono font-bold text-[#65A30D]">
                        33 Landmarks
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Privacy
                      </p>
                      <p className="mt-1 text-sm font-mono font-bold text-slate-900">
                        100% Local
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col sm:flex-row lg:flex-col gap-3">
                  <button
                    onClick={() => navigate("/workouts")}
                    className="flex items-center justify-center gap-2 rounded-full bg-[#B8F23A] px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-300 hover:bg-[#a3e635] hover:shadow-[0_0_25px_rgba(184,242,58,0.4)] shadow-xs"
                  >
                    <span>Manage Workouts</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    onClick={() => navigate("/scan")}
                    className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-800 shadow-xs transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <FileScan size={14} className="text-[#65A30D]" />
                    <span>Scan Workout Plan</span>
                  </button>

                  <button
                    onClick={() => navigate("/camera")}
                    className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-800 shadow-xs transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <Camera size={14} className="text-[#65A30D]" />
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
              <h3 className="text-xl font-bold uppercase tracking-wider text-slate-900">
                Command Modules
              </h3>
              <span className="text-xs font-mono text-slate-500">
                SELECT MODULE TO PROCEED
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* WORKOUTS BENTO TILE */}
              <button
                onClick={() => navigate("/workouts")}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 text-left shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#84CC16]/50 hover:shadow-md"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 transition-colors group-hover:border-[#84CC16]/40 group-hover:bg-[#B8F23A]/20">
                    <Dumbbell size={22} />
                  </div>
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-mono uppercase text-slate-500">
                    MODULE 01
                  </span>
                </div>

                <h4 className="text-xl font-bold text-slate-900">
                  My Workouts
                </h4>

                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Create workouts, add exercises, and track your sets and reps.
                </p>

                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#65A30D] group-hover:text-slate-950 transition-colors">
                    Manage workouts →
                  </span>
                  <div className="h-2 w-2 rounded-full bg-slate-300 group-hover:bg-[#84CC16] transition-colors" />
                </div>
              </button>

              {/* PROGRESS BENTO TILE */}
              <button
                onClick={() => navigate("/progress")}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 text-left shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#84CC16]/50 hover:shadow-md"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 transition-colors group-hover:border-[#84CC16]/40 group-hover:bg-[#B8F23A]/20">
                    <TrendingUp size={22} />
                  </div>
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-mono uppercase text-slate-500">
                    MODULE 02
                  </span>
                </div>

                <h4 className="text-xl font-bold text-slate-900">
                  Progress
                </h4>

                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Monitor your fitness progress and analyze your performance.
                </p>

                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#65A30D] group-hover:text-slate-950 transition-colors">
                    View progress →
                  </span>
                  <div className="h-2 w-2 rounded-full bg-slate-300 group-hover:bg-[#84CC16] transition-colors" />
                </div>
              </button>

              {/* SCAN BENTO TILE */}
              <button
                onClick={() => navigate("/scan")}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 text-left shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#84CC16]/50 hover:shadow-md"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 transition-colors group-hover:border-[#84CC16]/40 group-hover:bg-[#B8F23A]/20">
                    <FileScan size={22} />
                  </div>
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-mono uppercase text-slate-500">
                    MODULE 03
                  </span>
                </div>

                <h4 className="text-xl font-bold text-slate-900">
                  Scan Plan
                </h4>

                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Extract routines and exercises automatically from workout images.
                </p>

                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#65A30D] group-hover:text-slate-950 transition-colors">
                    Scan routine →
                  </span>
                  <div className="h-2 w-2 rounded-full bg-slate-300 group-hover:bg-[#84CC16] transition-colors" />
                </div>
              </button>

              {/* PROFILE BENTO TILE */}
              <button
                onClick={() => navigate("/profile")}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 text-left shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#84CC16]/50 hover:shadow-md"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 transition-colors group-hover:border-[#84CC16]/40 group-hover:bg-[#B8F23A]/20">
                    <User size={22} />
                  </div>
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-mono uppercase text-slate-500">
                    MODULE 04
                  </span>
                </div>

                <h4 className="text-xl font-bold text-slate-900">
                  My Profile
                </h4>

                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Manage your personal and fitness information.
                </p>

                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#65A30D] group-hover:text-slate-950 transition-colors">
                    View profile →
                  </span>
                  <div className="h-2 w-2 rounded-full bg-slate-300 group-hover:bg-[#84CC16] transition-colors" />
                </div>
              </button>
            </div>
          </motion.section>

          {/* =========================================================
              4. AI FITNESS COACH CTA SHOWCASE
          ========================================================= */}
          <motion.section variants={itemVariants}>
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-[#B8F23A]/15 p-8 sm:p-12 shadow-sm">
              {/* Radial lime glow */}
              <div className="pointer-events-none absolute -top-24 right-10 h-56 w-72 rounded-full bg-[#B8F23A]/15 blur-[90px]" />

              <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#84CC16]/40 bg-[#B8F23A]/20 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-950">
                    <Sparkles size={12} />
                    AI Fitness Coach
                  </div>

                  <h3 className="mt-4 text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
                    Improve Your Exercise Form
                  </h3>

                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                    FitLens AI will analyze your movement and provide feedback
                    to help you perform exercises with better form and technique.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[#65A30D]" />
                      <span>Pose Verification Ready</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#84CC16]" />
                      <span>Real-time Audio Feedback</span>
                    </div>
                  </div>
                </div>

                {/* CAMERA / AI ANALYSIS BUTTON */}
                <button
                  onClick={() => navigate("/camera")}
                  className="shrink-0 rounded-full bg-[#B8F23A] px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-xs hover:bg-[#a3e635] hover:shadow-[0_0_30px_rgba(184,242,58,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                >
                  Launch AI Camera
                </button>
              </div>
            </div>
          </motion.section>
        </motion.div>
      </main>
    </div>
  );
}


