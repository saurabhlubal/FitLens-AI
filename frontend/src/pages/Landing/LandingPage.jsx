import Navbar from "../../components/landing/Navbar";
import Hero from "../../components/landing/Hero";
import PoweredBy from "../../components/landing/PoweredBy";
import Features from "../../components/landing/Features";
import HowItWorks from "../../components/landing/HowItWorks";
import LiveDemo from "../../components/landing/LiveDemo";
import Stats from "../../components/landing/Stats";
import Testimonials from "../../components/landing/Testimonials";
import FAQ from "../../components/landing/FAQ";
import CTA from "../../components/landing/CTA";
import Footer from "../../components/landing/Footer";

import MouseGlow from "../../components/effects/MouseGlow";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#FAFAF8] text-slate-900">
      <MouseGlow />

      <Navbar />

      <main>
        <Hero />

        <PoweredBy />

        <section id="features">
          <Features />
        </section>

        <section id="how-it-works">
          <HowItWorks />
        </section>

        <section id="live-demo">
          <LiveDemo />
        </section>

        <Stats />

        <section id="testimonials">
          <Testimonials />
        </section>

        <section id="faq">
          <FAQ />
        </section>

        <section id="cta">
          <CTA />
        </section>
      </main>

      <Footer />
    </div>
  );
}


