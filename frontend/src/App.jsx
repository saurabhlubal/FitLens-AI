import Navbar from "./components/layout/Navbar";
import MouseGlow from "./components/effects/MouseGlow";
import PoweredBy from "./components/landing/PoweredBy";

import Hero from "./components/landing/Hero";
import Stats from "./components/landing/Stats";
import Features from "./components/landing/Features";
import HowItWorks from "./components/landing/HowItWorks";
import LiveDemo from "./components/landing/LiveDemo";

function App() {
  return (
    <>
      <MouseGlow />
      <Navbar />

      <main className="relative overflow-x-hidden bg-[#030712] text-white">
       <Hero />

<PoweredBy />

<Stats />

<Features />

<HowItWorks />

<LiveDemo />
      </main>
    </>
  );
}

export default App;