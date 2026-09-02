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
          className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#121217] via-[#0c0c0f] to-[#070709] px-8 py-16 sm:px-14 sm:py-20 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Accent Flare */}
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-[#B8F23A]/[0.07] blur-[120px]" />

          <div className="inline-flex items-center gap-2 rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#B8F23A]">
            <Sparkles size={14} />
            Next Generation AI Fitness
          </div>

          <h2 className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#F5F5F0] leading-tight">
            Ready to Transform
            <br />
            Your Workout?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[#A8A8A2]">
            Experience real-time pose tracking, AI-powered coaching,
            automatic rep counting, and personalized feedback that
            helps you train smarter every single session.
          </p>

          <div className="mt-10 flex flex-col justify-center items-center gap-4 sm:flex-row">
            {/* Start Training */}
            <Link to="/register">
              <button className="group h-auto rounded-full bg-[#B8F23A] px-9 py-4 text-xs font-bold uppercase tracking-wider text-[#060608] transition-all duration-300 hover:bg-[#a6de2e] hover:shadow-[0_0_35px_rgba(184,242,58,0.4)] hover:scale-105 active:scale-95">
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
              className="h-auto rounded-full border border-white/20 bg-white/[0.06] px-9 py-4 text-xs font-bold uppercase tracking-wider text-[#F5F5F0] backdrop-blur-xl transition-all duration-300 hover:border-[#B8F23A]/60 hover:bg-white/[0.12] hover:scale-105 active:scale-95"
            >
              Watch Demo
            </button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6 sm:gap-8 text-xs font-semibold uppercase tracking-wider text-[#8E8E92]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#B8F23A]" />
              Secure Login
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#B8F23A]" />
              AI Powered
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#B8F23A]" />
              Free Trial
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}