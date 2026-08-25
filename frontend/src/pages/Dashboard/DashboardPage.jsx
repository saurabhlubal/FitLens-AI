import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =========================
          NAVBAR
      ========================= */}
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

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-500/10 px-4 py-2 text-red-400 transition hover:bg-red-500/20"
            >
              Logout
            </button>

          </div>

        </div>
      </nav>

      {/* =========================
          MAIN DASHBOARD
      ========================= */}
      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Welcome */}
        <section className="mb-10">

          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-emerald-400">
            Dashboard
          </p>

          <h2 className="text-4xl font-bold">
            Welcome back{user?.name ? `, ${user.name}` : ""}! 👋
          </h2>

          <p className="mt-3 text-slate-400">
            Track your workouts, monitor your progress, and improve your
            exercise form with FitLens AI.
          </p>

        </section>

        {/* =========================
            QUICK ACTIONS
        ========================= */}
        <section className="mb-10">

          <h3 className="mb-5 text-2xl font-semibold">
            Quick Actions
          </h3>

          <div className="grid gap-6 md:grid-cols-3">

            {/* Workouts */}
            <button
              onClick={() => navigate("/workouts")}
              className="group rounded-2xl border border-white/10 bg-slate-900 p-6 text-left transition hover:-translate-y-1 hover:border-emerald-500/40"
            >

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl">
                🏋️
              </div>

              <h4 className="text-xl font-semibold">
                My Workouts
              </h4>

              <p className="mt-2 text-sm text-slate-400">
                Create workouts, add exercises, and track your sets and reps.
              </p>

              <p className="mt-5 font-medium text-emerald-400">
                Manage workouts →
              </p>

            </button>

            {/* Progress */}
            <button
              onClick={() => navigate("/progress")}
              className="group rounded-2xl border border-white/10 bg-slate-900 p-6 text-left transition hover:-translate-y-1 hover:border-blue-500/40"
            >

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
                📈
              </div>

              <h4 className="text-xl font-semibold">
                Progress
              </h4>

              <p className="mt-2 text-sm text-slate-400">
                Monitor your fitness progress and analyze your performance.
              </p>

              <p className="mt-5 font-medium text-blue-400">
                View progress →
              </p>

            </button>

            {/* Profile */}
            <button
              onClick={() => navigate("/profile")}
              className="group rounded-2xl border border-white/10 bg-slate-900 p-6 text-left transition hover:-translate-y-1 hover:border-purple-500/40"
            >

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-2xl">
                👤
              </div>

              <h4 className="text-xl font-semibold">
                My Profile
              </h4>

              <p className="mt-2 text-sm text-slate-400">
                Manage your personal and fitness information.
              </p>

              <p className="mt-5 font-medium text-purple-400">
                View profile →
              </p>

            </button>

          </div>

        </section>

        {/* =========================
            AI FORM ANALYSIS
        ========================= */}
        <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 p-8">

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>

              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-400">
                AI Fitness Coach
              </p>

              <h3 className="text-2xl font-bold">
                Improve Your Exercise Form
              </h3>

              <p className="mt-2 max-w-2xl text-slate-400">
                FitLens AI will analyze your movement and provide feedback
                to help you perform exercises with better form and technique.
              </p>

            </div>

            <button
              onClick={() => navigate("/workouts")}
              className="shrink-0 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:bg-emerald-400"
            >
              Start Training
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}