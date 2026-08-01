import { motion } from "framer-motion";
import {
  Camera,
  Dumbbell,
  Activity,
  CheckCircle2,
  Timer,
  Flame,
} from "lucide-react";

import PoseSkeleton from "./PoseSkeleton";

export default function AILiveDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="relative w-full max-w-xl overflow-hidden rounded-[34px] border border-emerald-500/20 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-800/95 backdrop-blur-2xl shadow-[0_0_70px_rgba(16,185,129,.18)]"
    >
      {/* Background Glow */}
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-6">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-emerald-500/10 p-3">
            <Camera className="text-emerald-400" size={22} />
          </div>

          <div>

            <h3 className="font-bold tracking-wide text-white">
              LIVE AI ANALYSIS
            </h3>

            <p className="text-xs text-slate-400">
              Camera Connected
            </p>

          </div>

        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">

          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>

          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            LIVE
          </span>

        </div>

      </div>

      {/* Pose Area */}
      <div className="relative flex h-[380px] items-center justify-center overflow-hidden">

        <PoseSkeleton />

        {/* Animated Scan Line */}
        <motion.div
          animate={{
            y: [-170, 170, -170],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "linear",
          }}
          className="absolute h-1 w-72 bg-gradient-to-r from-transparent via-emerald-400 to-transparent blur-sm"
        />

      </div>

      {/* Confidence */}
      <div className="px-6 pb-2">

        <div className="mb-2 flex items-center justify-between">

          <span className="text-sm text-slate-400">
            Pose Confidence
          </span>

          <span className="font-semibold text-emerald-400">
            98%
          </span>

        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-700">

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "98%" }}
            transition={{ duration: 2 }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-400 to-cyan-400"
          />

        </div>

      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 p-6">

        <Metric
          icon={<Dumbbell size={18} />}
          title="Exercise"
          value="Squat"
        />

        <Metric
          icon={<Activity size={18} />}
          title="FPS"
          value="30"
        />

        <Metric
          icon={<Timer size={18} />}
          title="Rep Count"
          value="12"
        />

        <Metric
          icon={<Flame size={18} />}
          title="Calories"
          value="145"
        />

      </div>

      {/* AI Feedback */}
      <div className="border-t border-white/10 px-6 py-5">

        <div className="mb-4 flex items-center gap-2">

          <CheckCircle2
            className="text-emerald-400"
            size={20}
          />

          <h4 className="font-semibold text-white">
            AI Feedback
          </h4>

        </div>

        <div className="space-y-3">

          <Feedback text="Excellent squat depth" />

          <Feedback text="Keep your back straight" />

          <Feedback text="Knees aligned correctly" />

        </div>

      </div>

    </motion.div>
  );
}

function Metric({ icon, title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.06]">

      <div className="flex items-center gap-2 text-emerald-400">
        {icon}
      </div>

      <p className="mt-4 text-sm text-slate-400">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-bold text-white">
        {value}
      </h3>

    </div>
  );
}

function Feedback({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3">

      <div className="h-2 w-2 rounded-full bg-emerald-400"></div>

      <span className="text-sm text-slate-300">
        {text}
      </span>

    </div>
  );
}