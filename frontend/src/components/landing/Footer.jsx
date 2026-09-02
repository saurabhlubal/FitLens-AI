export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.08] bg-[#040406]">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Logo */}
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[#F5F5F0]">
              FitLens{" "}
              <span className="rounded bg-[#B8F23A]/15 px-1.5 py-0.5 text-xs font-bold uppercase tracking-widest text-[#B8F23A] border border-[#B8F23A]/30">
                AI
              </span>
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-[#8E8E92]">
              AI-powered fitness coaching with real-time posture correction,
              rep counting and intelligent workout analysis.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#F5F5F0]">
              Product
            </h3>

            <ul className="space-y-2.5 text-sm text-[#8E8E92]">
              <li className="hover:text-[#B8F23A] cursor-pointer transition-colors">Features</li>
              <li className="hover:text-[#B8F23A] cursor-pointer transition-colors">How It Works</li>
              <li className="hover:text-[#B8F23A] cursor-pointer transition-colors">Live Demo</li>
              <li className="hover:text-[#B8F23A] cursor-pointer transition-colors">Dashboard</li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#F5F5F0]">
              Resources
            </h3>

            <ul className="space-y-2.5 text-sm text-[#8E8E92]">
              <li className="hover:text-[#B8F23A] cursor-pointer transition-colors">Documentation</li>
              <li className="hover:text-[#B8F23A] cursor-pointer transition-colors">FAQ</li>
              <li className="hover:text-[#B8F23A] cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-[#B8F23A] cursor-pointer transition-colors">Terms of Service</li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#F5F5F0]">
              Connect
            </h3>

            <ul className="space-y-2.5 text-sm text-[#8E8E92]">
              <li className="hover:text-[#B8F23A] cursor-pointer transition-colors">GitHub</li>
              <li className="hover:text-[#B8F23A] cursor-pointer transition-colors">LinkedIn</li>
              <li className="hover:text-[#B8F23A] cursor-pointer transition-colors">Email</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/[0.06] pt-8 flex justify-center items-center">
          <p className="text-xs text-[#55555A]">
            © 2026 FitLens AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}