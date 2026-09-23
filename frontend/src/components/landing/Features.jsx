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
    <section className="relative py-28 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-block rounded-full border border-lime-300/80 bg-lime-100/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-900">
            Features
          </span>

          <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-slate-950">
            Built for Smarter Training
          </h2>

          <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-600">
            FitLens AI combines computer vision, artificial intelligence,
            and real-time analytics to transform the way you train.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-6 md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xs transition-all duration-300 hover:border-slate-300 hover:shadow-sm"
              >
                {/* Index Watermark */}
                <div className="absolute top-6 right-8 text-xs font-mono font-black tracking-widest text-slate-200 select-none">
                  0{index + 1}
                </div>

                <div className="relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-[#B8F23A] shadow-xs transition-colors">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-7 text-xl sm:text-2xl font-bold text-slate-950">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-relaxed text-slate-600 text-sm sm:text-base">
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