import { motion } from "framer-motion";
import {
  Camera,
  Activity,
  CheckCircle2,
  Dumbbell,
} from "lucide-react";

import PoseFigure from "./PoseFigure";

export default function HeroCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-emerald-500/20 bg-white/5 backdrop-blur-2xl shadow-[0_0_80px_rgba(16,185,129,0.18)]"
    >
      {/* Glow */}
      <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Animated Scan Line */}
      <motion.div
        animate={{
          y: [-250, 340, -250],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="pointer-events-none absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-emerald-400/15 to-transparent"
     