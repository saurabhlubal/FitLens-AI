import AILiveDashboard from "./AILiveDashboard";
import AuroraBackground from "./AuroraBackground";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

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

  return (
    <section className="relative min-h-screen overflow-hidden">

      <AuroraBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 pt-24">

        <div className="grid w-full items-center gap-16 lg:grid-cols-2">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >

            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
              AI Powered Fitness Coach
            </span>

            <h1 className="mt-8 text-6xl font-black leading-tight text-white">
              Train Smarter.
              <br />
              Perfect Every Rep.
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-slate-400">
              FitLens AI uses computer vision and artificial intelligence to
              analyze your form in real time, count repetitions, and provide
              instant coaching feedback.
            </p>

            <div className="mt-10 flex gap-4">

              <Link to="/register">
                <Button className="rounded-xl bg-emerald-500 px-8 py-6 text-black hover:bg-emerald-400">
                  Get Started
                </Button>
              </Link>

              <Button
                variant="outline"
                onClick={scrollToDemo}
                className="rounded-xl border-white/20 px-8 py-6"
              >
                Live Demo
              </Button>

            </div>

          </motion.div>

          <AILiveDashboard />

        </div>

      </div>

    </section>
  );
}