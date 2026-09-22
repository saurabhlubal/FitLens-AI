import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import AuthenticatedNavbar from "../../components/layout/AuthenticatedNavbar";

export default function ProfilePage() {
  const navigate = useNavigate();

  const {
    token,
    logout,
    updateUser,
  } = useAuthContext();

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // Fetch Profile
  // =========================

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:8080/api/user/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();

        setProfile(data);
        setName(data.name);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
      setError("You are not logged in");
    }
  }, [token]);

  // =========================
  // Save Profile
  // =========================

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        "http://localhost:8080/api/user/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedProfile = await response.json();

      // Update local Profile state
      setProfile(updatedProfile);
      setName(updatedProfile.name);

      // IMPORTANT:
      // Update AuthContext + localStorage
      // so Dashboard immediately receives the new name.
      updateUser({
        name: updatedProfile.name,
      });

      setEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Cancel Editing
  // =========================

  const handleCancel = () => {
    if (profile) {
      setName(profile.name);
    }

    setEditing(false);
    setError("");
    setSuccess("");
  };

  // =========================
  // Logout
  // =========================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // =========================
  // Loading State
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-slate-900">
        <AuthenticatedNavbar />
        <div className="flex min-h-[60vh] items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-400">
          Loading profile...
        </div>
      </div>
    );
  }

  // =========================
  // Error State
  // =========================
  if (error && !profile) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-slate-900">
        <AuthenticatedNavbar />
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-xs">
            <h2 className="text-xl font-bold uppercase tracking-tight text-slate-950">
              Unable to load profile
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 rounded-full bg-[#B8F23A] px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-[#a6de2e] shadow-xs"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // Profile Initial
  // =========================
  const profileInitial =
    profile?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-900">
      {/* AUTHENTICATED NAVBAR */}
      <AuthenticatedNavbar />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="mx-auto max-w-5xl px-6 py-8 sm:py-10">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <span className="inline-block rounded-full border border-lime-300/80 bg-lime-100/60 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-900">
            Account Management
          </span>

          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-950">
            My Profile
          </h1>

          <p className="mt-1 text-sm sm:text-base text-slate-600 leading-relaxed">
            Manage your personal profile and linked fitness credentials.
          </p>
        </div>

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="mb-6 rounded-2xl border border-lime-300 bg-lime-50 p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#B8F23A] text-xs font-bold text-slate-950">
                ✓
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && profile && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* PROFILE HEADER CARD */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          {/* Cover */}
          <div className="relative h-28 overflow-hidden bg-gradient-to-r from-lime-100/60 via-emerald-50 to-slate-100 border-b border-slate-200/60">
            <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full bg-[#B8F23A]/20 blur-2xl" />
          </div>

          {/* Profile information */}
          <div className="-mt-10 px-6 sm:px-8 pb-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              {/* Avatar + user information */}
              <div className="flex items-end gap-4">
                {/* Avatar */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-[#B8F23A] text-2xl font-black text-slate-950 shadow-md">
                  {profileInitial}
                </div>

                {/* User info */}
                <div className="pb-1">
                  <h2 className="text-2xl font-bold text-slate-950">
                    {profile?.name}
                  </h2>

                  <p className="mt-0.5 text-xs font-mono text-slate-500">
                    {profile?.email}
                  </p>
                </div>
              </div>

              {/* Edit button */}
              {!editing && (
                <button
                  onClick={() => {
                    setEditing(true);
                    setError("");
                    setSuccess("");
                  }}
                  className="rounded-full bg-[#B8F23A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-[#a6de2e] shadow-xs"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ACCOUNT INFORMATION */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <div className="mb-6">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-950">
              Account Information
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Your primary FitLens AI account identity.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Name */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Full Name
              </p>

              {editing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                />
              ) : (
                <p className="text-base font-bold text-slate-950">
                  {profile?.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Email Address
              </p>

              <p className="text-base font-bold text-slate-950 font-mono">
                {profile?.email}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Email is tied to your account login.
              </p>
            </div>
          </div>

          {/* Save / Cancel */}
          {editing && (
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-[#B8F23A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-[#a6de2e] shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                onClick={handleCancel}
                disabled={saving}
                className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:border-slate-300 hover:text-slate-950 shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </section>

        {/* PROFILE PHOTO */}
        <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-bold uppercase tracking-wider text-slate-950">
                Profile Avatar
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Personalize your presence across FitLens AI.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#B8F23A] text-lg font-bold text-slate-950 shadow-xs">
                {profileInitial}
              </div>

              <button
                disabled
                className="cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-400"
              >
                Upload Photo
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Profile photo uploads will sync with cloud storage in an upcoming release.
            </p>
          </div>
        </section>

        {/* FITNESS PROFILE */}
        <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <div className="mb-5">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-950">
              Fitness Profile
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Manage physical metrics that power AI workout adaptations.
            </p>
          </div>

          <div className="rounded-xl border border-lime-200/80 bg-lime-50/50 p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-950">
                  Biometric & Goal Metrics
                </h3>

                <p className="mt-1 text-xs text-slate-600">
                  Update height, weight, activity frequency, and fitness milestones.
                </p>
              </div>

              <button
                onClick={() => navigate("/fitness-profile")}
                className="shrink-0 rounded-full bg-[#B8F23A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-[#a6de2e] shadow-xs"
              >
                Manage Metrics →
              </button>
            </div>
          </div>
        </section>

        {/* ACCOUNT ACTIONS */}
        <section className="mt-6 rounded-2xl border border-red-200/70 bg-red-50/30 p-6 sm:p-8 shadow-xs">
          <h2 className="text-base font-bold uppercase tracking-wider text-red-950">
            Account Actions
          </h2>

          <p className="mt-1 text-xs text-red-700/80">
            Sign out of your active FitLens AI session on this device.
          </p>

          <button
            onClick={handleLogout}
            className="mt-5 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-red-600 transition hover:bg-red-50 shadow-xs"
          >
            Logout
          </button>
        </section>
      </main>
    </div>
  );
}