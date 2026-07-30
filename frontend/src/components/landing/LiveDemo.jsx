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
    <section className="relative py-32">

      <div className="mx-auto max-w-7xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-sm text-emerald-400">
            Live Demo
          </span>

          <h2 className="mt-6 text-5xl font-black text-white">
            See AI In Action
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Watch how FitLens AI detects body landmarks, tracks movement,
            counts repetitions, and provides intelligent feedback in real time.
          </p>
        </motion.div>

        <div className="mt-20 grid items-center gap-12 lg:grid-cols-2">

          {/* Camera Preview */}

          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .8 }}
            className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">

              <div className="flex items-center gap-3">

                <Camera className="text-emerald-400" />

                <span className="font-medium text-white">
                  Live Camera
                </span>

              </div>

              <div className="flex items-center gap-2">

                <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />

                <span className="text-sm text-emerald-400">
                  Tracking
                </span>

              </div>

            </div>

            <div className="relative flex h-[500px] items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black">

              <PoseSkeleton />

            </div>

          </motion.div>

          {/* Dashboard */}

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .8 }}
            className="space-y-6"
          >

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">

              <div className="flex items-center gap-3">

                <Dumbbell className="text-emerald-400" />

                <h3 className="text-xl font-semibold text-white">
                  Exercise
                </h3>

              </div>

              <p className="mt-4 text-4xl font-black text-emerald-400">
                Squat
              </p>

            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">

                <Activity className="text-cyan-400" />

                <h3 className="mt-5 text-3xl font-bold text-white">
                  98%
                </h3>

                <p className="mt-2 text-slate-400">
                  Confidence
                </p>

              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">

                <Timer className="text-emerald-400" />

                <h3 className="mt-5 text-3xl font-bold text-white">
                  12
                </h3>

                <p className="mt-2 text-slate-400">
                  Repetitions
                </p>

              </div>

            </div>

            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">

              <div className="flex items-center gap-3">

                <CheckCircle2 className="text-emerald-400" />

                <h3 className="text-xl font-semibold text-white">
                  AI Feedback
                </h3>

              </div>

              <p className="mt-4 text-lg text-emerald-300">
                Excellent posture detected.
              </p>

              <p className="mt-2 text-slate-300">
                Knees aligned correctly, back remains neutral, and squat depth is optimal.
              </p>

            </div>

          </motion.div>

        </div>

      </div>

    </section>
  );
}