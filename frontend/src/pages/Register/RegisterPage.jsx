import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import Divider from "../../components/auth/Divider";

import { useAuthContext } from "../../context/AuthContext";
import authService from "../../services/authService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGuestDemo = () => {
    const guestUser = {
      id: 999,
      name: name.trim() || "Guest Athlete",
      email: email.trim() || "guest@fitlens.ai",
    };
    login(guestUser, "mock-demo-jwt-token");
    navigate("/camera");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      // Register user in backend
      await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      // Automatically login after registration
      const response = await authService.login({
        email: email.trim(),
        password,
      });

      const userData = {
        id: response.userId,
        name: response.name,
        email: response.email,
      };

      // Store user + JWT
      login(userData, response.token);

      // Go to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.warn("Backend registration unavailable:", error);

      const isNetworkError =
        error.code === "ERR_NETWORK" ||
        error.message?.includes("Network Error") ||
        !error.response;

      if (isNetworkError) {
        setError(
          "Backend server is offline. You can test the In-Browser AI Camera directly via Demo Mode below!"
        );
      } else {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Registration failed. Please try again or use Demo Mode.";
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Create Account"
        subtitle="Start your AI fitness journey today."
      >
        <form onSubmit={handleSubmit}>
          <AuthInput
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <AuthInput
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PasswordInput
            label="Password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-900">
              <p>{error}</p>
              <button
                type="button"
                onClick={handleGuestDemo}
                className="mt-2 inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-900 underline underline-offset-4 hover:text-lime-700"
              >
                <Sparkles size={13} className="text-lime-600" />
                Proceed to Camera in Demo Mode <ArrowRight size={13} />
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-[#B8F23A] py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-300 hover:bg-[#a6de2e] shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <Divider text="OR TEST IMMEDIATELY" />

        <button
          type="button"
          onClick={handleGuestDemo}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-100 py-3 text-xs font-bold uppercase tracking-wider text-slate-800 transition hover:bg-slate-200 shadow-xs"
        >
          <Sparkles size={14} className="text-lime-600" />
          ⚡ Instant Demo Mode (No Server Needed)
        </button>

        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold uppercase tracking-wider text-slate-900 underline underline-offset-4 hover:text-lime-700"
          >
            Login
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
