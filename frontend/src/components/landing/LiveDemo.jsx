import { motion } from "framer-motion";
import {
  Camera,
  Activity,
  Timer,
  Dumbbell,
  CheckCircle2,
} from "lucide-react";

import PoseSkeleton from "./PoseSkeleton";

export default function LiveDemo() {
  return (
    <section className="relative py-28 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-lime-500/30 bg-lime-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-lime-600">
            Live Demo
          </span>

          <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-slate-900">
            See AI In Action
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg leading-relaxed text-slate-600">
            Watch how FitLens AI detects body landmarks, tracks movement,
            counts repetitions, and provides intelligent feedback in real time.
          </p>
        </motion.div>

        <div className="mt-20 grid items-center gap-10 lg:grid-cols-2">
          {/* Camera Preview */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <Camera className="text-slate-800" size={18} />
                <span className="text-sm font-bold tracking-wide text-slate-900">
                  Live Camera
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-400/15 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-900">
                  Tracking
                </span>
              </div>
            </div>

            <div className="relative flex h-[480px] items-center justify-center bg-[#040406]">
              <PoseSkeleton />
            </div>
          </motion.div>

          {/* Telemetry Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            {/* Exercise Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:border-slate-300">
              <div className="flex items-center gap-2.5 text-lime-600">
                <Dumbbell size={18} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Exercise
                </h3>
              </div>

              <p className="mt-3 text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">
                Squat
              </p>
            </div>

            {/* Metrics Dual Grid */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:border-slate-300">
                <div className="flex items-center gap-2 text-lime-600">
                  <Activity size={18} />
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Confidence
                  </p>
                </div>

                <h3 className="mt-3 text-3xl font-extrabold text-slate-900">
                  98%
                </h3>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:border-slate-300">
                <div className="flex items-center gap-2 text-lime-600">
                  <Timer size={18} />
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Repetitions
                  </p>
                </div>

                <h3 className="mt-3 text-3xl font-extrabold text-slate-900">
                  12
                </h3>
              </div>
            </div>

            {/* AI Feedback Card */}
            <div className="rounded-2xl border border-lime-500/30 bg-lime-50/60 p-6 shadow-xs transition-all">
              <div className="flex items-center gap-2.5 text-lime-600">
                <CheckCircle2 size={18} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  AI Feedback
                </h3>
              </div>

              <p className="mt-3 text-base font-bold text-slate-950">
                Excellent posture detected.
              </p>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Knees aligned correctly, back remains neutral, and squat depth is optimal.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}