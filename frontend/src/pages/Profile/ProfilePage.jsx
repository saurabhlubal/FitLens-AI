import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />

          <p className="text-slate-400">
            Loading profile...
          </p>

        </div>
      </div>
    );
  }

  // =========================
  // Error State
  // =========================

  if (error && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">

        <div className="max-w-md rounded-2xl border border-red-500/20 bg-slate-900 p-8 text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
            ⚠️
          </div>

          <h2 className="text-xl font-semibold">
            Unable to load profile
          </h2>

          <p className="mt-2 text-sm text-red-400">
            {error}
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black transition hover:bg-emerald-400"
          >
            Back to Dashboard
          </button>

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
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="border-b border-white/10 bg-slate-900/80">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Logo */}

          <button
            onClick={() => navigate("/dashboard")}
            className="text-2xl font-bold text-emerald-400 transition hover:text-emerald-300"
          >
            FitLens AI
          </button>

          {/* Navigation */}

          <div className="hidden items-center gap-6 md:flex">

            <button
              onClick={() => navigate("/dashboard")}
              className="text-slate-400 transition hover:text-white"
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate("/workouts")}
              className="text-slate-400 transition hover:text-white"
            >
              Workouts
            </button>

            <button
              onClick={() => navigate("/progress")}
              className="text-slate-400 transition hover:text-white"
            >
              Progress
            </button>

            <button
              className="font-medium text-emerald-400"
            >
              Profile
            </button>

          </div>

        </div>

      </nav>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Account
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            My Profile
          </h1>

          <p className="mt-2 text-slate-400">
            Manage your account and fitness information.
          </p>

        </div>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">

            <div className="flex items-center gap-3">

              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                ✓
              </span>

              <p className="text-sm text-emerald-400">
                {success}
              </p>

            </div>

          </div>
        )}

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && profile && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* =================================================
            PROFILE HEADER CARD
        ================================================= */}

        <section className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">

          {/* Cover */}

          <div className="relative h-32 overflow-hidden bg-gradient-to-r from-emerald-500/20 via-blue-500/10 to-purple-500/20">

            <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="absolute -left-10 -bottom-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

          </div>

          {/* Profile information */}

          <div className="-mt-10 px-6 pb-7">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

              {/* Avatar + user information */}

              <div className="flex items-end gap-4">

                {/* Avatar */}

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-slate-900 bg-emerald-500 text-3xl font-bold text-slate-950 shadow-lg">

                  {profileInitial}

                </div>

                {/* User info */}

                <div className="pb-1">

                  <h2 className="text-2xl font-bold">
                    {profile?.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
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
                  className="rounded-xl bg-emerald-500 px-5 py-2.5 font-semibold text-black transition hover:bg-emerald-400"
                >
                  Edit Profile
                </button>
              )}

            </div>

          </div>

        </section>

        {/* =================================================
            ACCOUNT INFORMATION
        ================================================= */}

        <section className="rounded-2xl border border-white/10 bg-slate-900 p-6">

          <div className="mb-6">

            <h2 className="text-xl font-semibold">
              Account Information
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Your basic FitLens AI account details.
            </p>

          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {/* Name */}

            <div className="rounded-xl border border-white/10 bg-slate-800/60 p-5">

              <p className="mb-3 text-sm text-slate-400">
                Full Name
              </p>

              {editing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              ) : (
                <p className="text-lg font-semibold">
                  {profile?.name}
                </p>
              )}

            </div>

            {/* Email */}

            <div className="rounded-xl border border-white/10 bg-slate-800/60 p-5">

              <p className="mb-3 text-sm text-slate-400">
                Email Address
              </p>

              <p className="text-lg font-semibold">
                {profile?.email}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Email cannot currently be changed.
              </p>

            </div>

          </div>

          {/* Save / Cancel */}

          {editing && (
            <div className="mt-6 flex flex-wrap gap-3">

              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                onClick={handleCancel}
                disabled={saving}
                className="rounded-xl border border-white/10 bg-slate-800 px-6 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

            </div>
          )}

        </section>

        {/* =================================================
            PROFILE PHOTO
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-6">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

            <div>

              <h2 className="text-xl font-semibold">
                Profile Picture
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Personalize your FitLens AI profile.
              </p>

            </div>

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-xl font-bold text-slate-950">
                {profileInitial}
              </div>

              <button
                disabled
                className="cursor-not-allowed rounded-xl border border-white/10 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-500"
              >
                Upload Photo
              </button>

            </div>

          </div>

          <div className="mt-4 rounded-xl border border-yellow-500/10 bg-yellow-500/5 p-4">

            <p className="text-sm text-yellow-400">
              Profile photo upload will be available after we connect the
              image-upload backend.
            </p>

          </div>

        </section>

        {/* =================================================
            FITNESS PROFILE
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-6">

          <div className="mb-5">

            <h2 className="text-xl font-semibold">
              Fitness Profile
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Manage information that can help FitLens AI personalize your
              fitness experience.
            </p>

          </div>

          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-5">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>

                <h3 className="font-semibold">
                  Fitness Information
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Manage your fitness goals, body information, and training
                  preferences.
                </p>

              </div>

              <button
                onClick={() => navigate("/fitness-profile")}
                className="shrink-0 rounded-xl bg-emerald-500 px-5 py-2.5 font-semibold text-black transition hover:bg-emerald-400"
              >
                Manage →
              </button>

            </div>

          </div>

        </section>

        {/* =================================================
            ACCOUNT ACTIONS
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-red-500/10 bg-slate-900 p-6">

          <h2 className="text-lg font-semibold">
            Account Actions
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Sign out of your FitLens AI account.
          </p>

          <button
            onClick={handleLogout}
            className="mt-5 rounded-xl bg-red-500/10 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/20"
          >
            Logout
          </button>

        </section>

      </main>

    </div>
  );
}