import AILiveDashboard from "./AILiveDashboard";
import AuroraBackground from "./AuroraBackground";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <AuroraBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 pt-24">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-400">
              🚀 AI Powered Fitness Coach
            </span>

            <h1 className="mt-8 text-5xl font-black leading-tight text-white md:text-7xl">
              Train Smarter.
              <br />
              Perfect Every Rep.
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-slate-400">
              FitLens AI uses advanced computer vision and artificial
              intelligence to analyze your posture, count repetitions,
              detect incorrect form, and provide real-time coaching
              feedback.
            </p>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <Button className="rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-8 py-6 text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(16,185,129,0.45)]">
                Start Training
              </Button>

              <Button
                variant="outline"
                className="rounded-xl border-white/20 px-8 py-6 transition-all duration-300 hover:border-emerald-400 hover:bg-white/5"
              >
                Live Demo
              </Button>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-8">
              <div>
                <h2 className="text-3xl font-bold text-emerald-400">
                  50K+
                </h2>
                <p className="mt-2 text-slate-400">
                  Workouts
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-emerald-400">
                  98%
                </h2>
                <p className="mt-2 text-slate-400">
                  Accuracy
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-emerald-400">
                  24/7
                </h2>
                <p className="mt-2 text-slate-400">
                  AI Coach
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE */}
          <AILiveDashboard />

        </div>
      </div>
    </section>
  );
}