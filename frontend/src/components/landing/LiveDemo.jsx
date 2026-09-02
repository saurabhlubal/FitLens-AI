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
          <span className="inline-block rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#B8F23A]">
            Live Demo
          </span>

          <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#F5F5F0]">
            See AI In Action
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg leading-relaxed text-[#A8A8A2]">
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
            className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0e] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#121216] px-6 py-4">
              <div className="flex items-center gap-3">
                <Camera className="text-[#B8F23A]" size={18} />
                <span className="text-sm font-bold tracking-wide text-[#F5F5F0]">
                  Live Camera
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-[#B8F23A]/25 bg-[#B8F23A]/10 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-[#B8F23A] animate-pulse" />
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#B8F23A]">
                  Tracking
                </span>
              </div>
            </div>

            <div className="relative flex h-[480px] items-center justify-center bg-gradient-to-b from-[#08080a] via-[#040406] to-[#08080a]">
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
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 transition-all duration-300 hover:border-[#B8F23A]/30">
              <div className="flex items-center gap-2.5 text-[#B8F23A]">
                <Dumbbell size={18} />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8E8E92]">
                  Exercise
                </h3>
              </div>

              <p className="mt-3 text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F5F0]">
                Squat
              </p>
            </div>

            {/* Metrics Dual Grid */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 transition-all duration-300 hover:border-[#B8F23A]/30">
                <div className="flex items-center gap-2 text-[#B8F23A]">
                  <Activity size={18} />
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#8E8E92]">
                    Confidence
                  </p>
                </div>

                <h3 className="mt-3 text-3xl font-extrabold text-[#F5F5F0]">
                  98%
                </h3>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 transition-all duration-300 hover:border-[#B8F23A]/30">
                <div className="flex items-center gap-2 text-[#B8F23A]">
                  <Timer size={18} />
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#8E8E92]">
                    Repetitions
                  </p>
                </div>

                <h3 className="mt-3 text-3xl font-extrabold text-[#F5F5F0]">
                  12
                </h3>
              </div>
            </div>

            {/* AI Feedback Card */}
            <div className="rounded-2xl border border-[#B8F23A]/20 bg-[#0e1208] p-6 transition-all">
              <div className="flex items-center gap-2.5 text-[#B8F23A]">
                <CheckCircle2 size={18} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F0]">
                  AI Feedback
                </h3>
              </div>

              <p className="mt-3 text-base font-bold text-[#B8F23A]">
                Excellent posture detected.
              </p>

              <p className="mt-2 text-sm leading-relaxed text-[#D2D2CC]">
                Knees aligned correctly, back remains neutral, and squat depth is optimal.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}