import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF8] px-6 text-center text-slate-900">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-xs">
        <Compass size={40} className="text-lime-600" />
      </div>

      <span className="mt-6 inline-block rounded-full border border-lime-500/30 bg-lime-400/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-lime-600">
        Error 404
      </span>

      <h1 className="mt-4 text-4xl sm:text-5xl font-black uppercase tracking-tight text-slate-900">
        Page Not Found
      </h1>

      <p className="mt-3 max-w-md text-sm sm:text-base text-slate-600 leading-relaxed">
        The workout routine or page you're searching for doesn't exist or has been moved.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-[#B8F23A] px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-[#a6de2e] hover:shadow-[0_0_20px_rgba(184,242,58,0.3)] cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
        >
          Home
        </Link>
      </div>
    </div>
  );
}