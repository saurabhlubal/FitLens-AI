import { motion } from "framer-motion";

const stats = [
  {
    number: "33+",
    title: "Pose Landmarks",
  },
  {
    number: "98%",
    title: "AI Accuracy",
  },
  {
    number: "100ms",
    title: "Response Time",
  },
  {
    number: "24/7",
    title: "AI Monitoring",
  },
];

export default function Stats() {
  return (
    <section className="relative py-20 border-y border-white/[0.06] bg-[#070709]">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: index * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="group rounded-2xl border border-white/[0.06] bg-[#0c0c0e] p-8 text-center transition-all duration-300 hover:border-[#B8F23A]/30 hover:bg-[#111115]"
          >
            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-[#F5F5F0] transition-colors group-hover:text-[#B8F23A]">
              {item.number}
            </h2>

            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[#8E8E92]">
              {item.title}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}