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
      <div className="min-h-screen bg-[#060608] text-[#F5F5F0]">
        <AuthenticatedNavbar />
        <div className="flex min-h-[60vh] items-center justify-center text-xs font-bold uppercase tracking-widest text-[#8E8E92]">
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
      <div className="min-h-screen bg-[#060608] text-[#F5F5F0]">
        <AuthenticatedNavbar />
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="max-w-md rounded-2xl border border-red-500/30 bg-[#0c0c0e] p-8 text-center">
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#F5F5F0]">
              Unable to load profile
            </h2>

            <p className="mt-2 text-sm text-red-400">
              {error}
            </p>

            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 rounded-full bg-[#B8F23A] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#060608] transition hover:bg-[#a6de2e]"
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
    <div className="min-h-screen bg-[#060608] text-[#F5F5F0]">
      {/* AUTHENTICATED NAVBAR */}
      <AuthenticatedNavbar />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="mx-auto max-w-5xl px-6 py-10 sm:py-12">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <span className="inline-block rounded-full border border-[#B8F23A]/30 bg-[#B8F23A]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-[#B8F23A]">
            Account
          </span>

          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F5F5F0]">
            My Profile
          </h1>

          <p className="mt-2 text-sm sm:text-base text-[#A8A8A2] leading-relaxed">
            Manage your account and fitness information.
          </p>
        </div>

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="mb-6 rounded-2xl border border-[#B8F23A]/30 bg-[#B8F23A]/10 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#B8F23A]/20 text-xs font-bold text-[#B8F23A]">
                ✓
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-[#B8F23A]">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && profile && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* PROFILE HEADER CARD */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0e]">
          {/* Cover */}
          <div className="relative h-32 overflow-hidden bg-gradient-to-r from-[#14180d] via-[#101014] to-[#08080a]">
            <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full bg-[#B8F23A]/[0.05] blur-3xl" />
          </div>

          {/* Profile information */}
          <div className="-mt-10 px-6 sm:px-8 pb-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              {/* Avatar + user information */}
              <div className="flex items-end gap-4">
                {/* Avatar */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-[#0c0c0e] bg-[#B8F23A] text-2xl font-black text-[#060608] shadow-lg">
                  {profileInitial}
                </div>

                {/* User info */}
                <div className="pb-1">
                  <h2 className="text-2xl font-bold text-[#F5F5F0]">
                    {profile?.name}
                  </h2>

                  <p className="mt-1 text-xs font-mono text-[#8E8E92]">
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
                  className="rounded-full bg-[#B8F23A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#060608] transition hover:bg-[#a6de2e]"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ACCOUNT INFORMATION */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-[#F5F5F0]">
              Account Information
            </h2>

            <p className="mt-1 text-xs text-[#8E8E92]">
              Your basic FitLens AI account details.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Name */}
            <div className="rounded-xl border border-white/[0.06] bg-[#141418] p-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8E8E92]">
                Full Name
              </p>

              {editing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-white/[0.08] bg-[#18181e] px-4 py-2.5 text-sm text-[#F5F5F0] outline-none transition placeholder:text-[#55555A] focus:border-[#B8F23A]/50 focus:ring-1 focus:ring-[#B8F23A]/30"
                />
              ) : (
                <p className="text-base font-bold text-[#F5F5F0]">
                  {profile?.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="rounded-xl border border-white/[0.06] bg-[#141418] p-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8E8E92]">
                Email Address
              </p>

              <p className="text-base font-bold text-[#F5F5F0] font-mono">
                {profile?.email}
              </p>

              <p className="mt-1 text-[11px] text-[#55555A]">
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
                className="rounded-full bg-[#B8F23A] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#060608] transition hover:bg-[#a6de2e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                onClick={handleCancel}
                disabled={saving}
                className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#D2D2CC] transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </section>

        {/* PROFILE PHOTO */}
        <section className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-[#F5F5F0]">
                Profile Picture
              </h2>

              <p className="mt-1 text-xs text-[#8E8E92]">
                Personalize your FitLens AI profile.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#B8F23A] text-lg font-bold text-[#060608]">
                {profileInitial}
              </div>

              <button
                disabled
                className="cursor-not-allowed rounded-xl border border-white/[0.06] bg-[#141418] px-4 py-2 text-xs font-semibold text-[#55555A]"
              >
                Upload Photo
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#121216] p-4">
            <p className="text-xs text-[#8E8E92]">
              Profile photo upload will be available after we connect the
              image-upload backend.
            </p>
          </div>
        </section>

        {/* FITNESS PROFILE */}
        <section className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 sm:p-8">
          <div className="mb-5">
            <h2 className="text-lg font-bold uppercase tracking-wider text-[#F5F5F0]">
              Fitness Profile
            </h2>

            <p className="mt-1 text-xs text-[#8E8E92]">
              Manage information that can help FitLens AI personalize your
              fitness experience.
            </p>
          </div>

          <div className="rounded-xl border border-[#B8F23A]/20 bg-[#0e1208] p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5F5F0]">
                  Fitness Information
                </h3>

                <p className="mt-1 text-xs text-[#A8A8A2]">
                  Manage your fitness goals, body information, and training
                  preferences.
                </p>
              </div>

              <button
                onClick={() => navigate("/fitness-profile")}
                className="shrink-0 rounded-full bg-[#B8F23A] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#060608] transition hover:bg-[#a6de2e]"
              >
                Manage →
              </button>
            </div>
          </div>
        </section>

        {/* ACCOUNT ACTIONS */}
        <section className="mt-6 rounded-2xl border border-red-500/10 bg-[#0c0c0e] p-6 sm:p-8">
          <h2 className="text-lg font-bold uppercase tracking-wider text-[#F5F5F0]">
            Account Actions
          </h2>

          <p className="mt-1 text-xs text-[#8E8E92]">
            Sign out of your FitLens AI account.
          </p>

          <button
            onClick={handleLogout}
            className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-red-400 transition hover:bg-red-500/20"
          >
            Logout
          </button>
        </section>
      </main>
    </div>
  );
}