import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function CTA() {
  const scrollToDemo = () => {
    const section = document.getElementById("live-demo");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section className="relative overflow-hidden py-24 sm:py-32 px-6">
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-lime-50/20 px-8 py-16 sm:px-14 sm:py-20 text-center shadow-lg relative overflow-hidden"
        >
          {/* Subtle Accent Flare */}
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-[#B8F23A]/15 blur-[120px]" />

          <div className="inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-lime-600">
            <Sparkles size={14} />
            Next Generation AI Fitness
          </div>

          <h2 className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-slate-900 leading-tight">
            Ready to Transform
            <br />
            Your Workout?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600">
            Experience real-time pose tracking, AI-powered coaching,
            automatic rep counting, and personalized feedback that
            helps you train smarter every single session.
          </p>

          <div className="mt-10 flex flex-col justify-center items-center gap-4 sm:flex-row">
            {/* Start Training */}
            <Link to="/register">
              <button className="group h-auto rounded-full bg-[#B8F23A] px-9 py-4 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-300 hover:bg-[#a6de2e] hover:shadow-[0_0_25px_rgba(184,242,58,0.4)] hover:scale-105 active:scale-95 cursor-pointer">
                <span className="flex items-center gap-2.5">
                  Start Training
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </button>
            </Link>

            {/* Watch Demo */}
            <button
              onClick={scrollToDemo}
              className="h-auto rounded-full border border-slate-300 bg-white px-9 py-4 text-xs font-bold uppercase tracking-wider text-slate-800 shadow-xs transition-all duration-300 hover:border-slate-400 hover:bg-slate-50 hover:scale-105 active:scale-95 cursor-pointer"
            >
              Watch Demo
            </button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6 sm:gap-8 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-lime-600" />
              Secure Login
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-lime-600" />
              AI Powered
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-lime-600" />
              Free Trial
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

