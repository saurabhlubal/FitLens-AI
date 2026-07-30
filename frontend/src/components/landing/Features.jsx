import { motion } from "framer-motion";
import {
  Camera,
  BrainCircuit,
  Activity,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Real-Time Pose Detection",
    description:
      "Capture every body movement instantly using advanced computer vision.",
  },
  {
    icon: BrainCircuit,
    title: "AI Form Correction",
    description:
      "Receive intelligent feedback to improve posture and reduce injuries.",
  },
  {
    icon: Activity,
    title: "Movement Tracking",
    description:
      "Track every repetition with high precision and smooth landmark detection.",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description:
      "Visualize your improvement with detailed AI-powered workout insights.",
  },
];

export default function Features() {
  return (
    <section className="relative py-32">

      <div className="mx-auto max-w-7xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-sm text-emerald-400">
            Features
          </span>

          <h2 className="mt-6 text-5xl font-black text-white">
            Built for Smarter Training
          </h2>

          <p className="mt-6 text-lg text-slate-400">
            FitLens AI combines computer vision, artificial intelligence,
            and real-time analytics to transform the way you train.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-8 md:grid-cols-2">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                viewport={{ once: true }}
                whileHover={{
                  y: -8,
                }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_50px_rgba(16,185,129,.15)]"
              >
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">

                    <Icon size={30} className="text-white" />

                  </div>

                  <h3 className="mt-8 text-2xl font-bold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-4 leading-8 text-slate-400">
                    {feature.description}
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