import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    name: "Features",
    id: "features",
  },
  {
    name: "How It Works",
    id: "how-it-works",
  },
  {
    name: "Live Demo",
    id: "live-demo",
  },
  {
    name: "FAQ",
    id: "faq",
  },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      let current = "";

      navItems.forEach((item) => {
        const section = document.getElementById(item.id);

        if (!section) return;

        const top = section.offsetTop - 120;
        const bottom = top + section.offsetHeight;

        if (window.scrollY >= top && window.scrollY < bottom) {
          current = item.id;
        }
      });

      setActive(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileOpen(false);

    if (location.pathname !== "/") {
      navigate("/");

      setTimeout(() => {
        const section = document.getElementById(id);

        if (section) {
          section.scrollIntoView({
            behavior: "smooth",
          });
        }
      }, 150);

      return;
    }

    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const handleLogoClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    setMobileOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -70 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-xs text-slate-900"
            : "bg-transparent border-b border-transparent text-[#F5F5F0]"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="group flex items-center gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3"
            >
              <div className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                scrolled
                  ? "border-slate-200 bg-slate-950 text-[#B8F23A]"
                  : "border-white/10 bg-[#121216] text-[#B8F23A]"
              }`}>
                <Activity size={18} />
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`text-lg font-black tracking-tight ${scrolled ? "text-slate-950" : "text-[#F5F5F0]"}`}>
                  FitLens
                </span>
                <span className="rounded bg-[#B8F23A] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-950">
                  AI
                </span>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className={`hidden items-center gap-1 rounded-full px-3 py-1.5 backdrop-blur-md lg:flex transition-all ${
            scrolled
              ? "border border-slate-200 bg-slate-100/70"
              : "border border-white/[0.08] bg-[#0c0c0e]/60"
          }`}>
            {navItems.map((item) => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 rounded-full ${
                    isActive
                      ? scrolled
                        ? "text-slate-950 bg-[#B8F23A]"
                        : "text-[#B8F23A] bg-[#B8F23A]/10"
                      : scrolled
                        ? "text-slate-600 hover:text-slate-950 hover:bg-white"
                        : "text-[#8E8E92] hover:text-[#F5F5F0] hover:bg-white/[0.04]"
                  }`}
                >
                  {item.name}

                  {isActive && !scrolled && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 rounded-full border border-[#B8F23A]/35 shadow-[0_0_15px_rgba(184,242,58,0.2)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden items-center gap-4 lg:flex">
            <Link to="/login">
              <button className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                scrolled
                  ? "text-slate-600 hover:text-slate-950"
                  : "text-[#8E8E92] hover:text-[#F5F5F0]"
              }`}>
                Login
              </button>
            </Link>

            <Link to="/register">
              <Button className="rounded-full bg-[#B8F23A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-300 hover:bg-[#a6de2e] shadow-xs">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition lg:hidden ${
              scrolled
                ? "border-slate-200 bg-white text-slate-950 shadow-xs"
                : "border-white/10 bg-[#0c0c0e] text-[#F5F5F0]"
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-20 left-0 z-40 w-full border-b border-slate-200 bg-white/95 p-6 backdrop-blur-2xl shadow-xl text-slate-900 lg:hidden"
          >
            <div className="flex flex-col gap-2.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`rounded-xl px-4 py-3 text-left text-xs font-bold uppercase tracking-wider transition ${
                    active === item.id
                      ? "bg-[#B8F23A] text-slate-950 font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {item.name}
                </button>
              ))}

              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                >
                  <button className="w-full rounded-xl border border-slate-200 bg-white py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition shadow-xs">
                    Login
                  </button>
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                >
                  <Button className="w-full rounded-full bg-[#B8F23A] py-3 text-xs font-bold uppercase tracking-wider text-slate-950 hover:bg-[#a6de2e] shadow-xs">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

