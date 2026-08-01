import { Star } from "lucide-react";

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
    <section className="relative py-28 px-6 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute left-1/2 top-0 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[160px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="inline-block rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-400">
            Trusted by Fitness Professionals
          </span>

          <h2 className="mt-6 text-5xl font-bold text-white">
            Loved by Athletes & Trainers
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Join fitness enthusiasts using AI-powered movement analysis to
            improve technique, prevent injuries, and train smarter.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-3 hover:border-emerald-400/40 hover:bg-white/[0.05] hover:shadow-[0_0_45px_rgba(16,185,129,0.15)]"
            >
              {/* Stars */}
              <div className="mb-6 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-emerald-400 text-emerald-400"
                  />
                ))}
              </div>

              {/* Review */}
              <p className="leading-8 text-gray-300">
                "{item.review}"
              </p>

              {/* User */}
              <div className="mt-8 flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-14 w-14 rounded-full border-2 border-emerald-400 object-cover"
                />

                <div>
                  <h4 className="font-semibold text-white">
                    {item.name}
                  </h4>

                  <p className="text-sm text-emerald-400">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}