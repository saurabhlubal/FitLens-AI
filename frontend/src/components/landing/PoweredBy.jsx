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
    <section className="relative py-16 overflow-hidden border-y border-white/[0.06] bg-[#070709]">
      {/* Edge Shadow Fades */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#070709] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#070709] to-transparent z-10" />

      <div className="relative mx-auto max-w-7xl px-6">
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.3em] text-[#7A7A80]">
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
              className="group rounded-xl border border-white/[0.08] bg-[#0c0c0e] px-7 py-3.5 transition-all duration-300 hover:border-[#B8F23A]/40 hover:bg-[#111114]"
            >
              <span className="text-sm font-semibold tracking-wide text-[#D2D2CC] transition-colors group-hover:text-[#B8F23A]">
                {tech}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}