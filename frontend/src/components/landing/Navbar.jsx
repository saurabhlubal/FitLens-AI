import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  "Features",
  "How it Works",
  "Pricing",
  "About",
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -70 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex cursor-pointer items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/20">
            <Activity className="text-slate-950" size={22} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">
              FitLens
            </h1>

            <p className="-mt-1 text-xs tracking-widest text-emerald-400">
              AI
            </p>
          </div>
        </motion.div>

        {/* Desktop Navigation */}

        <nav className="hidden items-center gap-10 lg:flex">
          {navItems.map((item) => (
            <motion.a
              key={item}
              href="#"
              whileHover={{ y: -2 }}
              className="group relative text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {item}

              <span className="absolute -bottom-2 left-0 h-[2px] w-0 bg-emerald-400 transition-all duration-300 group-hover:w-full" />
            </motion.a>
          ))}
        </nav>

        {/* CTA */}

        <motion.div whileHover={{ scale: 1.04 }}>
          <Button
            className="rounded-xl bg-emerald-500 px-6 text-black hover:bg-emerald-400"
          >
            Get Started
          </Button>
        </motion.div>

      </div>
    </motion.header>
  );
}