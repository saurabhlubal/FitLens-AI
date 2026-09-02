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
          <span className="inline-block rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#B8F23A]">
            Features
          </span>

          <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#F5F5F0]">
            Built for Smarter Training
          </h2>

          <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#A8A8A2]">
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
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-8 sm:p-10 transition-all duration-300 hover:border-[#B8F23A]/30 hover:bg-[#111115]"
              >
                {/* Index Watermark */}
                <div className="absolute top-6 right-8 text-xs font-mono font-bold tracking-widest text-[#38383e] select-none">
                  0{index + 1}
                </div>

                <div className="relative z-10">
                  <div className="flex h-13 w-13 items-center justify-center rounded-xl border border-white/10 bg-[#16161a] text-[#B8F23A] transition-colors group-hover:border-[#B8F23A]/40 group-hover:bg-[#1a1a1f]">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-7 text-xl sm:text-2xl font-bold text-[#F5F5F0]">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-relaxed text-[#A8A8A2] text-sm sm:text-base">
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