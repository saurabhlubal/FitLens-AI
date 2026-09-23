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
    <section className="relative py-16 overflow-hidden border-y border-slate-200/80 bg-slate-50">
      {/* Edge Shadow Fades */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10" />

      <div className="relative mx-auto max-w-7xl px-6">
        <p className="mb-8 text-center text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
          Powered By Modern Technologies
        </p>

        <motion.div
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            repeat: Infinity,
            duration: 25,
            ease: "linear",
          }}
          className="flex w-max gap-5"
        >
          {[...technologies, ...technologies].map((tech, index) => (
            <div
              key={index}
              className="group rounded-xl border border-slate-200/80 bg-white px-7 py-3.5 shadow-xs transition-all duration-300 hover:border-slate-300 hover:shadow-sm"
            >
              <span className="text-sm font-semibold tracking-wide text-slate-700 transition-colors group-hover:text-slate-950">
                {tech}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}