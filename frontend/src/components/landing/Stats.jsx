import CountUp from "react-countup";
import { motion } from "framer-motion";

const stats = [
  {
    number: 33,
    suffix: "+",
    title: "Pose Landmarks",
  },
  {
    number: 98,
    suffix: "%",
    title: "AI Accuracy",
  },
  {
    number: 100,
    suffix: "ms",
    title: "Response Time",
  },
  {
    number: 24,
    suffix: "/7",
    title: "AI Monitoring",
  },
];

export default function Stats() {
  return (
    <section className="py-24">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-4">
        {stats.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: index * 0.1,
            }}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-xl"
          >
            <h2 className="text-5xl font-black text-emerald-400">
              <CountUp
                end={item.number}
                duration={2}
                enableScrollSpy
              />
              {item.suffix}
            </h2>

            <p className="mt-4 text-slate-400">
              {item.title}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}