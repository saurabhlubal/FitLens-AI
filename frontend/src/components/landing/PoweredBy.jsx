import { motion } from "framer-motion";

const technologies = [
  "React",
  "Vite",
  "Tailwind CSS",
  "Spring Boot",
  "MediaPipe",
  "TensorFlow",
  "OpenCV",
  "PostgreSQL",
];

export default function PoweredBy() {
  return (
    <section className="relative py-16 overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6">

        <p className="mb-10 text-center text-sm uppercase tracking-[0.35em] text-slate-500">
          Powered By Modern Technologies
        </p>

        <motion.div
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "linear",
          }}
          className="flex w-max gap-6"
        >
          {[...technologies, ...technologies].map((tech, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-4 backdrop-blur-xl"
            >
              <span className="text-lg font-semibold text-slate-200">
                {tech}
              </span>
            </div>
          ))}
        </motion.div>

      </div>

    </section>
  );
}