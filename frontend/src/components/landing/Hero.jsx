import AuroraBackground from "./AuroraBackground";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Play, ChevronDown, Activity } from "lucide-react";

export default function Hero() {
  const scrollToDemo = () => {
    const section = document.getElementById("live-demo");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 26 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden">
      {/* Edge-to-Edge Real-Life Fitness Video Background */}
      <AuroraBackground />

      {/* Main Centered Content */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pt-36 sm:pt-40 md:pt-44 flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Status Beacon Tag (Electric Lime Accent) */}
          <motion.div variants={itemVariants} className="flex items-center">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-4 py-1.5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B8F23A] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#B8F23A]" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#B8F23A]">
                AI Powered Fitness Coach
              </span>
            </div>
          </motion.div>

          {/* Majestic Editorial Headline (Warm Off-White + Subtle Lime Highlight) */}
          <motion.h1
            variants={itemVariants}
            className="mt-8 text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight text-[#F5F5F0] leading-[0.92]"
          >
            Train Smarter.
            <br />
            <span className="bg-gradient-to-r from-[#F5F5F0] via-white to-[#B8F23A] bg-clip-text text-transparent">
              Perfect Every Rep.
            </span>
          </motion.h1>

          {/* Description Paragraph (Warm Neutral White, Crisp Contrast) */}
          <motion.p
            variants={itemVariants}
            className="mt-8 max-w-2xl text-base sm:text-xl font-normal leading-relaxed text-[#D2D2CC] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
          >
            FitLens AI uses computer vision and artificial intelligence to
            analyze your form in real time, count repetitions, and provide
            instant coaching feedback.
          </motion.p>

          {/* Action Buttons (Electric Lime Primary + Translucent Frosted Secondary) */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/register">
              <Button className="group h-auto rounded-full bg-[#B8F23A] px-9 py-4 text-xs font-bold uppercase tracking-wider text-[#060608] transition-all duration-300 hover:bg-[#a6de2e] hover:shadow-[0_0_35px_rgba(184,242,58,0.4)] hover:scale-105 active:scale-95">
                <span className="flex items-center gap-2.5">
                  Get Started
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={scrollToDemo}
              className="group h-auto rounded-full border-white/20 bg-white/[0.06] px-9 py-4 text-xs font-bold uppercase tracking-wider text-[#F5F5F0] backdrop-blur-xl transition-all duration-300 hover:border-[#B8F23A]/60 hover:bg-white/[0.12] hover:scale-105 active:scale-95"
            >
              <span className="flex items-center gap-2.5">
                <Play
                  size={14}
                  className="fill-[#B8F23A] text-[#B8F23A] transition-transform duration-300 group-hover:scale-110"
                />
                Live Demo
              </span>
            </Button>
          </motion.div>

          {/* Floating Subtle Telemetry Badges (Neutral Glass + Lime Micro Indicators) */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs text-[#9E9EA0]"
          >
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#060608]/70 px-4 py-1.5 backdrop-blur-md shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B8F23A] animate-pulse" />
              <span className="text-[#E2E2DC] font-semibold tracking-wider uppercase text-[11px]">
                33-Point Pose Tracking
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#060608]/70 px-4 py-1.5 backdrop-blur-md shadow-lg">
              <Activity size={13} className="text-[#B8F23A]" />
              <span className="text-[#E2E2DC] font-semibold tracking-wider uppercase text-[11px]">
                Real-Time 60 FPS Analysis
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-[#060608]/70 px-4 py-1.5 backdrop-blur-md shadow-lg">
              <span className="text-[#B8F23A] font-bold text-[11px]">98.4%</span>
              <span className="text-[#E2E2DC] font-semibold tracking-wider uppercase text-[11px]">
                Form Precision
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Tasteful Minimalist Scroll Indicator at Bottom */}
      <div className="relative z-10 pb-6 pt-4 flex flex-col items-center gap-1.5 pointer-events-none">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#7A7A80]">
          Scroll to Explore
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={18} className="text-[#B8F23A]/80" />
        </motion.div>
      </div>
    </section>
  );
}

