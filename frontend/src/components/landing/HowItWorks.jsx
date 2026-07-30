import { motion } from "framer-motion";
import {
  Camera,
  ScanSearch,
  BrainCircuit,
  MessageSquareText,
} from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Capture Movement",
    description:
      "Open the camera and let FitLens AI detect your body instantly.",
  },
  {
    icon: ScanSearch,
    title: "Track Pose",
    description:
      "MediaPipe detects 33 body landmarks in real time.",
  },
  {
    icon: BrainCircuit,
    title: "AI Analysis",
    description:
      "Joint angles and posture are analyzed continuously.",
  },
  {
    icon: MessageSquareText,
    title: "Instant Feedback",
    description:
      "Receive corrections, rep counting, and performance insights instantly.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-32">

      <div className="mx-auto max-w-7xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .7 }}
          className="mx-auto max-w-3xl text-center"
        >

          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-2 text-sm text-cyan-400">
            Workflow
          </span>

          <h2 className="mt-6 text-5xl font-black text-white">
            How FitLens AI Works
          </h2>

          <p className="mt-6 text-lg text-slate-400">
            From camera input to intelligent feedback in just a few milliseconds.
          </p>

        </motion.div>

        <div className="relative mt-24 grid gap-10 md:grid-cols-4">

          {/* Connection Line */}

          <div className="absolute left-0 right-0 top-10 hidden h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 md:block" />

          {steps.map((step, index) => {

            const Icon = step.icon;

            return (

              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: .6,
                  delay: index * .15,
                }}
                className="relative text-center"
              >

                <div className="relative z-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/20 bg-slate-900 shadow-[0_0_30px_rgba(16,185,129,.25)]">

                  <Icon
                    size={34}
                    className="text-emerald-400"
                  />

                </div>

                <div className="mt-8">

                  <span className="text-sm font-medium text-emerald-400">
                    Step {index + 1}
                  </span>

                  <h3 className="mt-3 text-2xl font-bold text-white">
                    {step.title}
                  </h3>

                  <p className="mt-4 leading-8 text-slate-400">
                    {step.description}
                  </p>

                </div>

              </motion.div>

            );

          })}

        </div>

      </div>

    </section>
  );
}