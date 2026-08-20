import { useEffect, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";

export default function ProfilePage() {
  const { token, logout } = useAuthContext();

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
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

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
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

      setProfile(updatedProfile);
      setName(updatedProfile.name);
      setEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(profile.name);
    setEditing(false);
    setError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading profile...
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-8">

        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            My Profile
          </h1>

          {!editing && (
            <button
              onClick={() => {
                setEditing(true);
                setError("");
                setSuccess("");
              }}
              className="rounded-xl bg-emerald-500 px-5 py-2 font-semibold text-black transition hover:bg-emerald-400"
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-400">
            {success}
          </div>
        )}

        <div className="space-y-6">

          {/* Name */}
          <div>
            <p className="mb-2 text-sm text-slate-400">
              Name
            </p>

            {editing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              />
            ) : (
              <p className="text-xl font-semibold">
                {profile.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <p className="mb-2 text-sm text-slate-400">
              Email
            </p>

            <p className="text-xl font-semibold">
              {profile.email}
            </p>
          </div>

        </div>

        {/* Edit buttons */}
        {editing && (
          <div className="mt-8 flex gap-3">

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
              className="rounded-xl border border-white/10 bg-slate-800 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
            >
              Cancel
            </button>

          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="mt-8 rounded-xl bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-400"
        >
          Logout
        </button>

      </div>
    </div>
  );
}