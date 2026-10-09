export default function Footer() {
  return (
    <footer className="relative border-t border-slate-200/80 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Logo */}
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              FitLens{" "}
              <span className="rounded bg-[#B8F23A] px-1.5 py-0.5 text-xs font-bold uppercase tracking-widest text-slate-950 border border-lime-400">
                AI
              </span>
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              AI-powered fitness coaching with real-time posture correction,
              rep counting and intelligent workout analysis.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900">
              Product
            </h3>

            <ul className="space-y-2.5 text-sm text-slate-600">
              <li className="hover:text-slate-950 cursor-pointer transition-colors">Features</li>
              <li className="hover:text-slate-950 cursor-pointer transition-colors">How It Works</li>
              <li className="hover:text-slate-950 cursor-pointer transition-colors">Live Demo</li>
              <li className="hover:text-slate-950 cursor-pointer transition-colors">Dashboard</li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900">
              Resources
            </h3>

            <ul className="space-y-2.5 text-sm text-slate-600">
              <li className="hover:text-slate-950 cursor-pointer transition-colors">Documentation</li>
              <li className="hover:text-slate-950 cursor-pointer transition-colors">FAQ</li>
              <li className="hover:text-slate-950 cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-slate-950 cursor-pointer transition-colors">Terms of Service</li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900">
              Connect
            </h3>

            <ul className="space-y-2.5 text-sm text-slate-600">
              <li className="hover:text-slate-950 cursor-pointer transition-colors">GitHub</li>
              <li className="hover:text-slate-950 cursor-pointer transition-colors">LinkedIn</li>
              <li className="hover:text-slate-950 cursor-pointer transition-colors">Email</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-slate-100 pt-8 flex justify-center items-center">
          <p className="text-xs text-slate-400">
            © 2026 FitLens AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

