import { motion } from "framer-motion";
import { Sparkles, Play, CheckCircle2 } from "lucide-react";

import HeroCard from "./HeroCard";
import AuroraBackground from "./AuroraBackground";
import { Button } from "@/components/ui/button";
import { fadeUp, stagger, floating } from "@/animations/motion";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#030712]">

      {/* Background */}
      <AuroraBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6">

        <div className="grid w-full items-center gap-16 lg:grid-cols-2">

          {/* LEFT */}

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* Badge */}

            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 backdrop-blur-xl">

                <Sparkles
                  size={16}
                  className="text-emerald-400"
                />

                <span className="text-sm font-medium text-emerald-300">
                  AI Powered Movement Intelligence
                </span>

              </div>
            </motion.div>

            {/* Heading */}

            <motion.h1
              variants={fadeUp}
              className="mt-8 text-5xl font-black leading-[1.05] tracking-tight text-white md:text-7xl"
            >
              Train{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Smarter.
              </span>

              <br />

              Perfect Every Rep.
            </motion.h1>

            {/* Description */}

            <motion.p
              variants={fadeUp}
              className="mt-8 max-w-xl text-lg leading-8 text-slate-400"
            >
              FitLens AI uses advanced Computer Vision and Artificial
              Intelligence to analyze body movement in real time,
              improve exercise form, reduce injuries, and deliver
              instant feedback while you train.
            </motion.p>

            {/* Buttons */}

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                className="h-12 rounded-xl bg-emerald-500 px-8 text-black hover:bg-emerald-400"
              >
                Start Training
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-xl border-slate-700 bg-slate-900/40 px-8 text-white hover:bg-slate-800"
              >
                <Play className="mr-2 h-4 w-4" />

                Live Demo
              </Button>
            </motion.div>

            {/* Features */}

            <motion.div
              variants={fadeUp}
              className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              <div className="flex items-center gap-3">

                <CheckCircle2
                  className="text-emerald-400"
                  size={20}
                />

                <span className="text-sm text-slate-300">
                  33 Body Landmarks
                </span>

              </div>

              <div className="flex items-center gap-3">

                <CheckCircle2
                  className="text-emerald-400"
                  size={20}
                />

                <span className="text-sm text-slate-300">
                  AI Feedback
                </span>

              </div>

              <div className="flex items-center gap-3">

                <CheckCircle2
                  className="text-emerald-400"
                  size={20}
                />

                <span className="text-sm text-slate-300">
                  Real-Time Tracking
                </span>

              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT */}

          <motion.div
            variants={floating}
            animate="animate"
            className="flex justify-center lg:justify-end"
          >
            <HeroCard />
          </motion.div>

        </div>

      </div>

    </section>
  );
}