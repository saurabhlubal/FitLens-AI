import MouseGlow from "./components/effects/MouseGlow";

import Navbar from "./components/landing/Navbar";
import Hero from "./components/landing/Hero";
import PoweredBy from "./components/landing/PoweredBy";
import Stats from "./components/landing/Stats";
import Features from "./components/landing/Features";
import HowItWorks from "./components/landing/HowItWorks";
import LiveDemo from "./components/landing/LiveDemo";
import Testimonials from "./components/landing/Testimonials";
import CTA from "./components/landing/CTA";
import FAQ from "./components/landing/FAQ";
import Footer from "./components/landing/Footer";

import FadeInSection from "./components/common/FadeInSection";

function App() {
  return (
    <>
      <MouseGlow />

      <Navbar />

      <main className="overflow-x-hidden bg-[#030712] text-white">

        <Hero />

        <FadeInSection>
          <PoweredBy />
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <Stats />
        </FadeInSection>

        <FadeInSection delay={0.2}>
          <Features />
        </FadeInSection>

        <FadeInSection delay={0.3}>
          <HowItWorks />
        </FadeInSection>

        <FadeInSection delay={0.4}>
          <LiveDemo />
        </FadeInSection>

        <FadeInSection delay={0.5}>
          <Testimonials />
        </FadeInSection>

        <FadeInSection delay={0.6}>
          <CTA />
        </FadeInSection>

        <FadeInSection delay={0.7}>
          <FAQ />
        </FadeInSection>

        <Footer />

      </main>
    </>
  );
}

export default App;