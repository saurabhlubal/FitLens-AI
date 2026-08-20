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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
      <h1 className="mb-4 text-4xl font-bold">
        Welcome to FitLens AI
      </h1>

      {user && (
        <p className="mb-8 text-slate-400">
          Logged in as {user.email}
        </p>
      )}

      <button
        onClick={handleLogout}
        className="rounded-xl bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-400"
      >
        Logout
      </button>
    </div>
  );
}