import { motion } from "framer-motion";
import {
  Camera,
  Dumbbell,
  Activity,
  CheckCircle2,
  Timer,
} from "lucide-react";

import PoseSkeleton from "./PoseSkeleton";

export default function AILiveDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: .8 }}
      className="relative w-full max-w-xl overflow-hidden rounded-[36px] border border-emerald-500/20 bg-slate-900/60 backdrop-blur-2xl shadow-[0_0_80px_rgba(16,185,129,.20)]"
    >
      {/* Background Glow */}

      <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="absolute -right-32 -bottom-32 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Header */}

      <div className="flex items-center justify-between border-b border-white/10 p-6">

        <div className="flex items-center gap-3">

          <Camera className="text-emerald-400"/>

          <div>

            <h3 className="font-semibold text-white">
              LIVE AI ANALYSIS
            </h3>

            <p className="text-xs text-slate-400">
              Camera Connected
            </p>

          </div>

        </div>

        <div className="flex items-center gap-2">

          <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse"/>

          <span className="text-emerald-400 text-sm">
            Tracking
          </span>

        </div>

      </div>

      {/* Body */}

      <div className="relative flex h-[430px] items-center justify-center">

        <PoseSkeleton/>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-2 gap-4 p-6">

        <Card
          icon={<Dumbbell size={20}/>}
          title="Exercise"
          value="Squat"
        />

        <Card
          icon={<Activity size={20}/>}
          title="Confidence"
          value="98%"
        />

        <Card
          icon={<Timer size={20}/>}
          title="Rep Count"
          value="12"
        />

        <Card
          icon={<CheckCircle2 size={20}/>}
          title="Status"
          value="Excellent"
        />

      </div>

    </motion.div>
  );
}

function Card({ icon, title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

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