import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative overflow-hidden py-28 px-6">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent" />

      {/* Glow */}
      <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[180px]" />

      <div className="relative mx-auto max-w-6xl">

        <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl px-10 py-20 text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-emerald-300">

            <Sparkles size={18} />

            Next Generation AI Fitness

          </div>

          <h2 className="mt-8 text-5xl font-extrabold leading-tight md:text-6xl">

            Ready to Transform

            <br />

            Your Workout?

          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-xl text-gray-400 leading-9">

            Experience real-time pose tracking, AI-powered coaching,
            automatic rep counting, and personalized feedback that
            helps you train smarter every single session.

          </p>

          <div className="mt-12 flex flex-col justify-center gap-6 sm:flex-row">

            <button className="group rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-10 py-5 text-lg font-bold text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.45)]">

              <span className="flex items-center gap-3">

                Start Training

                <ArrowRight
                  size={20}
                  className="transition-transform group-hover:translate-x-2"
                />

              </span>

            </button>

            <button className="rounded-full border border-white/20 px-10 py-5 text-lg font-semibold text-white transition-all duration-300 hover:border-emerald-400 hover:bg-white/5">

              Watch Demo

            </button>

          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-gray-400">

            <div className="flex items-center gap-2">

              <ShieldCheck
                size={20}
                className="text-emerald-400"
              />

              Secure Login

            </div>

            <div className="flex items-center gap-2">

              <ShieldCheck
                size={20}
                className="text-emerald-400"
              />

              AI Powered

            </div>

            <div className="flex items-center gap-2">

              <ShieldCheck
                size={20}
                className="text-emerald-400"
              />

              Free Trial

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}