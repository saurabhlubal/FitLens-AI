import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, Camera } from "lucide-react";
import useAuth from "../../hooks/useAuth";

export default function AuthenticatedNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Workouts", path: "/workouts" },
    { label: "Progress", path: "/progress" },
    { label: "Profile", path: "/profile" },
    { label: "AI Camera", path: "/camera", icon: Camera },
  ];

  const isActive = (path) => {
    if (path === "/workouts") {
      return location.pathname.startsWith("/workouts");
    }
    if (path === "/profile") {
      return location.pathname === "/profile" || location.pathname === "/fitness-profile";
    }
    return location.pathname === path;
  };

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#060608]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        {/* Brand */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-xl font-black tracking-tight text-[#F5F5F0] transition hover:opacity-90"
        >
          <span>FitLens</span>
          <span className="rounded bg-[#B8F23A]/15 px-1.5 py-0.5 text-xs font-bold uppercase tracking-widest text-[#B8F23A] border border-[#B8F23A]/30">
            AI
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-1.5 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;

            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  active
                    ? "border border-[#B8F23A]/30 bg-[#B8F23A]/10 text-[#B8F23A]"
                    : "text-[#8E8E92] hover:text-[#F5F5F0] hover:bg-white/[0.04]"
                }`}
              >
                {Icon && <Icon size={14} />}
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop User & Logout */}
        <div className="hidden items-center gap-3 md:flex">
          {/* User badge */}
          <div
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#0c0c0e] px-3 py-1.5 cursor-pointer transition hover:border-white/20 hover:bg-[#111115]"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#B8F23A]/20 text-[11px] font-bold text-[#B8F23A]">
              {userInitial}
            </div>
            <span className="max-w-[120px] truncate text-xs font-medium text-[#D2D2CC]">
              {user?.name || "Athlete"}
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-transparent px-3.5 py-1.5 text-xs font-semibold text-[#8E8E92] transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl border border-white/10 bg-[#0c0c0e] p-2 text-[#F5F5F0]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-white/[0.08] bg-[#08080a] px-6 py-5 md:hidden">
          <div className="space-y-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;

              return (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-sm font-bold uppercase tracking-wider text-left transition-all ${
                    active
                      ? "border border-[#B8F23A]/30 bg-[#B8F23A]/10 text-[#B8F23A]"
                      : "text-[#8E8E92] hover:text-[#F5F5F0] hover:bg-white/[0.04]"
                  }`}
                >
                  {Icon && <Icon size={16} />}
                  <span>{link.label}</span>
                </button>
              );
            })}

            <div className="border-t border-white/[0.08] pt-3 mt-3 flex items-center justify-between">
              <div
                onClick={() => {
                  navigate("/profile");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#B8F23A]/20 text-xs font-bold text-[#B8F23A]">
                  {userInitial}
                </div>
                <span className="text-xs font-medium text-[#D2D2CC]">
                  {user?.name || "Athlete"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-400"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
