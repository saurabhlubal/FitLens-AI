import { useNavigate } from "react-router-dom";
import { Camera, Activity, Sparkles } from "lucide-react";
import AuthenticatedNavbar from "../../components/layout/AuthenticatedNavbar";

export default function TrainingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900">
      {/* AUTHENTICATED NAVBAR */}
      <AuthenticatedNavbar />

      {/* MAIN */}
      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        <div className="mb-10">
          <span className="inline-block rounded-full border border-lime-500/30 bg-lime-400/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-lime-600">
            AI Training
          </span>

          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-900">
            Exercise Form Analysis
          </h2>

          <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
            Use your camera to perform an exercise while FitLens AI analyzes
            your movement and provides form feedback.
          </p>
        </div>

        {/* CAMERA AREA */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex min-h-[450px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lime-600 shadow-xs">
                <Camera size={32} />
              </div>

              <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
                Camera Training
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                Camera-based exercise detection will appear here.
              </p>

              <button
                onClick={() => navigate("/camera")}
                className="mt-6 rounded-full bg-[#B8F23A] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-300 hover:bg-[#a6de2e] hover:shadow-[0_0_20px_rgba(184,242,58,0.3)] cursor-pointer"
              >
                Launch AI Camera
              </button>
            </div>
          </div>
        </section>

        {/* INFO */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-slate-300">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/10 text-lime-600">
              <Activity size={18} />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-slate-900">
              Pose Detection
            </h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Detect body movement using the camera.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-slate-300">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/10 text-lime-600">
              <Camera size={18} />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-slate-900">
              Form Analysis
            </h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Analyze exercise technique and movement.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-slate-300">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/10 text-lime-600">
              <Sparkles size={18} />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-slate-900">
              AI Feedback
            </h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Receive feedback about your exercise form.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}


