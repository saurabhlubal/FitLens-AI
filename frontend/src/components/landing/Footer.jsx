export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#020617]">
      <div className="mx-auto max-w-7xl px-6 py-20">

        <div className="grid gap-12 md:grid-cols-4">

          {/* Logo */}
          <div>
            <h2 className="text-3xl font-black text-white">
              FitLens
              <span className="text-emerald-400">AI</span>
            </h2>

            <p className="mt-5 text-gray-400 leading-7">
              AI-powered fitness coaching with real-time posture correction,
              rep counting and intelligent workout analysis.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              Product
            </h3>

            <ul className="space-y-3 text-gray-400">
              <li className="hover:text-emerald-400 cursor-pointer">Features</li>
              <li className="hover:text-emerald-400 cursor-pointer">How It Works</li>
              <li className="hover:text-emerald-400 cursor-pointer">Live Demo</li>
              <li className="hover:text-emerald-400 cursor-pointer">Dashboard</li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              Resources
            </h3>

            <ul className="space-y-3 text-gray-400">
              <li className="hover:text-emerald-400 cursor-pointer">Documentation</li>
              <li className="hover:text-emerald-400 cursor-pointer">FAQ</li>
              <li className="hover:text-emerald-400 cursor-pointer">Privacy Policy</li>
              <li className="hover:text-emerald-400 cursor-pointer">Terms of Service</li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="mb-5 text-lg font-semibold text-white">
              Connect
            </h3>

            <ul className="space-y-3 text-gray-400">
              <li className="hover:text-emerald-400 cursor-pointer">GitHub</li>
              <li className="hover:text-emerald-400 cursor-pointer">LinkedIn</li>
              <li className="hover:text-emerald-400 cursor-pointer">Email</li>
            </ul>
          </div>

        </div>

      <div className="mt-12 border-t border-white/10 pt-8 flex justify-center items-center">
  <p className="text-gray-500">
    © 2026 FitLens AI. All rights reserved.
  </p>
</div>

      </div>
    </footer>
  );
}