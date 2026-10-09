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
    <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/75 backdrop-blur-2xl shadow-[0_0_80px_rgba(16,185,129,0.14),0_25px_50px_rgba(0,0,0,0.7)]">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />

      {/* Top HUD Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5 bg-white/[0.02]">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Camera size={18} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black tracking-widest text-white uppercase">
                Live AI Analysis
              </h3>
              <span className="hidden sm:inline-block rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">
                CAM_01
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Camera Connected
            </p>
          </div>
        </div>

        {/* Live Pill Indicator */}
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
            LIVE
          </span>
        </div>
      </div>

      {/* Pose Area */}
      <div className="relative flex h-[360px] items-center justify-center overflow-hidden bg-gradient-to-b from-black/40 via-transparent to-black/40">
        {/* Subtle Tech Grid inside viewport */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Skeleton Render */}
        <PoseSkeleton />

        {/* Animated HUD Scanning Laser Line */}
        <motion.div
          animate={{
            y: [-160, 160, -160],
          }}
          transition={{
            repeat: Infinity,
            duration: 4.5,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute h-[2px] w-64 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.8)]"
        />

        {/* Corner HUD Markers */}
        <div className="pointer-events-none absolute top-3 left-3 text-[9px] font-mono text-slate-500">
          TRACKING: 33 PTS
        </div>
        <div className="pointer-events-none absolute top-3 right-3 text-[9px] font-mono text-emerald-400/80">
          60.0 FPS
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="px-6 py-3 border-t border-white/[0.06] bg-white/[0.01]">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Pose Confidence
          </span>
          <span className="text-xs font-black tracking-wider text-emerald-400">
            98%
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "98%" }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 p-6 pt-3">
        <Metric
          icon={<Dumbbell size={16} />}
          title="Exercise"
          value="Squat"
        />

        <Metric
          icon={<Activity size={16} />}
          title="FPS"
          value="30"
        />

        <Metric
          icon={<Timer size={16} />}
          title="Rep Count"
          value="12"
        />

        <Metric
          icon={<Flame size={16} />}
          title="Calories"
          value="145"
        />
      </div>

      {/* AI Feedback Box */}
      <div className="border-t border-white/[0.08] px-6 py-5 bg-white/[0.02]">
        <div className="mb-3.5 flex items-center gap-2">
          <CheckCircle2
            className="text-emerald-400"
            size={18}
          />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            AI Feedback
          </h4>
        </div>

        <div className="space-y-2">
          <Feedback text="Excellent squat depth" />
          <Feedback text="Keep your back straight" />
          <Feedback text="Knees aligned correctly" />
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, title, value }) {
  return (
    <div className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/[0.05] hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
        {icon}
        <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
          {title}
        </span>
      </div>

      <h3 className="mt-2 text-xl font-extrabold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
        {value}
      </h3>
    </div>
  );
}

function Feedback({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] px-3.5 py-2.5 transition-colors hover:bg-emerald-500/[0.08]">
      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
      <span className="text-xs font-medium text-slate-300">
        {text}
      </span>
    </div>
  );
}

