import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Alex Carter",
    role: "Certified Fitness Coach",
    image: "https://i.pravatar.cc/150?img=11",
    review:
      "FitLens AI completely changed how I coach clients. The real-time posture feedback is incredibly accurate.",
  },
  {
    name: "Sophia Kim",
    role: "Gym Enthusiast",
    image: "https://i.pravatar.cc/150?img=32",
    review:
      "Rep counting, posture correction, and instant feedback—all without wearing any sensors. Amazing experience.",
  },
  {
    name: "Daniel Brown",
    role: "Personal Trainer",
    image: "https://i.pravatar.cc/150?img=15",
    review:
      "The interface is beautiful, and the AI feels like having another trainer beside me during every workout.",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-28 sm:py-32 px-6">
      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block rounded-full border border-lime-500/30 bg-lime-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-lime-600">
            Trusted by Fitness Professionals
          </span>

          <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-slate-900">
            Loved by Athletes & Trainers
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600">
            Join fitness enthusiasts using AI-powered movement analysis to
            improve technique, prevent injuries, and train smarter.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs transition-all duration-300 hover:border-slate-300 hover:shadow-sm"
            >
              {/* Stars */}
              <div className="mb-6 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    className="fill-lime-500 text-lime-500"
                  />
                ))}
              </div>

              {/* Review */}
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base italic">
                "{item.review}"
              </p>

              {/* User */}
              <div className="mt-8 flex items-center gap-4 border-t border-slate-100 pt-6">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                />

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {item.name}
                  </h4>

                  <p className="text-xs font-semibold uppercase tracking-wider text-lime-700">
                    {item.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

