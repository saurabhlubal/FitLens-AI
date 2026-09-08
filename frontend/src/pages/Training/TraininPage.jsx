import { useNavigate } from "react-router-dom";
import { Camera, Activity, Sparkles } from "lucide-react";
import AuthenticatedNavbar from "../../components/layout/AuthenticatedNavbar";

export default function TrainingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#060608] text-[#F5F5F0]">
      {/* AUTHENTICATED NAVBAR */}
      <AuthenticatedNavbar />

      {/* MAIN */}
      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        <div className="mb-10">
          <span className="inline-block rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#B8F23A]">
            AI Training
          </span>

          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F5F5F0]">
            Exercise Form Analysis
          </h2>

          <p className="mt-2 max-w-2xl text-sm sm:text-base text-[#A8A8A2] leading-relaxed">
            Use your camera to perform an exercise while FitLens AI analyzes
            your movement and provides form feedback.
          </p>
        </div>

        {/* CAMERA AREA */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 sm:p-8">
          <div className="flex min-h-[450px] items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#060608] p-8">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#16161a] text-[#B8F23A]">
                <Camera size={32} />
              </div>

              <h3 className="text-2xl font-bold uppercase tracking-tight text-[#F5F5F0]">
                Camera Training
              </h3>

              <p className="mt-2 max-w-md text-sm text-[#8E8E92]">
                Camera-based exercise detection will appear here.
              </p>

              <button
                onClick={() => navigate("/camera")}
                className="mt-6 rounded-full bg-[#B8F23A] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-[#060608] transition-all duration-300 hover:bg-[#a6de2e] hover:shadow-[0_0_25px_rgba(184,242,58,0.3)]"
              >
                Launch AI Camera
              </button>
            </div>
          </div>
        </section>

        {/* INFO */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 transition hover:border-white/15">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#16161a] text-[#B8F23A]">
              <Activity size={18} />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-[#F5F5F0]">
              Pose Detection
            </h3>
            <p className="mt-2 text-xs text-[#8E8E92] leading-relaxed">
              Detect body movement using the camera.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 transition hover:border-white/15">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#16161a] text-[#B8F23A]">
              <Camera size={18} />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-[#F5F5F0]">
              Form Analysis
            </h3>
            <p className="mt-2 text-xs text-[#8E8E92] leading-relaxed">
              Analyze exercise technique and movement.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 transition hover:border-white/15">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#16161a] text-[#B8F23A]">
              <Sparkles size={18} />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-[#F5F5F0]">
              AI Feedback
            </h3>
            <p className="mt-2 text-xs text-[#8E8E92] leading-relaxed">
              Receive feedback about your exercise form.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}