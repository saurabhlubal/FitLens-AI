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

        if (
          window.scrollY >= top &&
          window.scrollY < bottom
        ) {
          current = item.id;
        }

      });

      setActive(current);

    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () =>
      window.removeEventListener("scroll", handleScroll);

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
        transition={{ duration: 0.6 }}
        className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

          {/* Logo */}

          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
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
          </Link>

          {/* Desktop Navigation */}

          <nav className="hidden items-center gap-10 lg:flex">

            {navItems.map((item) => (

              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`group relative text-sm font-medium transition-colors ${
                  active === item.id
                    ? "text-emerald-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {item.name}

                <span
                  className={`absolute -bottom-2 left-0 h-[2px] bg-emerald-400 transition-all duration-300 ${
                    active === item.id
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                />

              </button>

            ))}

          </nav>

          {/* Right Side */}

          <div className="hidden items-center gap-4 lg:flex">

            <Link to="/login">
              <button className="text-sm font-medium text-slate-300 transition hover:text-white">
                Login
              </button>
            </Link>

            <Link to="/register">
              <Button className="rounded-xl bg-emerald-500 px-6 text-black hover:bg-emerald-400">
                Get Started
              </Button>
            </Link>

          </div>

          {/* Mobile Menu Button */}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white lg:hidden"
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

        </div>
      </motion.header>

      {/* Mobile Menu */}

      <AnimatePresence>

        {mobileOpen && (

          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-20 left-0 z-40 w-full border-b border-white/10 bg-slate-950/95 backdrop-blur-xl lg:hidden"
          >

            <div className="flex flex-col gap-6 p-6">

              {navItems.map((item) => (

                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left text-lg text-slate-300 hover:text-emerald-400"
                >
                  {item.name}
                </button>

              ))}

              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
              >
                <button className="text-left text-lg text-slate-300 hover:text-emerald-400">
                  Login
                </button>
              </Link>

              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
              >
                <Button className="w-full rounded-xl bg-emerald-500 text-black hover:bg-emerald-400">
                  Get Started
                </Button>
              </Link>

            </div>

          </motion.div>

        )}

      </AnimatePresence>
    </>
  );
}