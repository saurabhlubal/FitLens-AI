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
    <section className="relative py-28 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-block rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#B8F23A]">
            Workflow
          </span>

          <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#F5F5F0]">
            How FitLens AI Works
          </h2>

          <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#A8A8A2]">
            From camera input to intelligent feedback in just a few milliseconds.
          </p>
        </motion.div>

        <div className="relative mt-20 grid gap-8 md:grid-cols-4">
          {/* Subtle Technical Connection Line */}
          <div className="absolute left-10 right-10 top-9 hidden h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto flex h-18 w-18 items-center justify-center rounded-2xl border border-white/10 bg-[#121216] text-[#B8F23A] transition-all duration-300 hover:border-[#B8F23A]/40 hover:bg-[#18181e]">
                  <Icon size={28} />
                </div>

                <div className="mt-6">
                  <span className="inline-block text-xs font-mono font-bold uppercase tracking-widest text-[#B8F23A]">
                    Step {index + 1}
                  </span>

                  <h3 className="mt-2 text-xl font-bold text-[#F5F5F0]">
                    {step.title}
                  </h3>

                  <p className="mt-3 leading-relaxed text-[#A8A8A2] text-sm">
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