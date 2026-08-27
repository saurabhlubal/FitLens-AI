import { useNavigate } from "react-router-dom";

export default function TrainingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* NAVBAR */}
      <nav className="border-b border-white/10 bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-emerald-400">
            FitLens AI
          </h1>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-slate-300 transition hover:text-white"
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate("/workouts")}
              className="text-slate-300 transition hover:text-white"
            >
              Workouts
            </button>

            <button
              onClick={() => navigate("/progress")}
              className="text-slate-300 transition hover:text-white"
            >
              Progress
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="text-slate-300 transition hover:text-white"
            >
              Profile
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-400">
            AI Training
          </p>

          <h2 className="text-4xl font-bold">
            Exercise Form Analysis
          </h2>

          <p className="mt-3 max-w-2xl text-slate-400">
            Use your camera to perform an exercise while FitLens AI analyzes
            your movement and provides form feedback.
          </p>
        </div>

        {/* CAMERA AREA */}
        <section className="rounded-2xl border border-white/10 bg-slate-900 p-6">
          <div className="flex min-h-[450px] items-center justify-center rounded-2xl border border-dashed border-white/20 bg-slate-950">
            <div className="text-center">
              <div className="mb-4 text-6xl">
                📷
              </div>

              <h3 className="text-2xl font-semibold">
                Camera Training
              </h3>

              <p className="mt-2 max-w-md text-slate-400">
                Camera-based exercise detection will appear here.
              </p>

              <button
                className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:bg-emerald-400"
              >
                Start Camera
              </button>
            </div>
          </div>
        </section>

        {/* INFO */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <h3 className="font-semibold">Pose Detection</h3>
            <p className="mt-2 text-sm text-slate-400">
              Detect body movement using the camera.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <h3 className="font-semibold">Form Analysis</h3>
            <p className="mt-2 text-sm text-slate-400">
              Analyze exercise technique and movement.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <h3 className="font-semibold">AI Feedback</h3>
            <p className="mt-2 text-sm text-slate-400">
              Receive feedback about your exercise form.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}