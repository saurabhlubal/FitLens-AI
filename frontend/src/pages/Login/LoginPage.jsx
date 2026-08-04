import { Link } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import AuthCard from "../../components/auth/AuthCard";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import Divider from "../../components/auth/Divider";
import SocialButton from "../../components/auth/SocialButton";

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthCard
        title="Welcome Back"
        subtitle="Login to continue your fitness journey."
      >
        <form>
          <AuthInput
            label="Email"
            type="email"
            placeholder="john@example.com"
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
          />

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-emerald-500 py-3 font-semibold text-black transition hover:bg-emerald-400"
          >
            Login
          </button>
        </form>

        <Divider text="OR CONTINUE WITH" />

        <SocialButton text="Continue with Google" />

        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-emerald-400 hover:underline"
          >
            Register
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}