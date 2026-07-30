// ===== SETTINGS PAGE =====
// Profile editing (name, username, bio, avatar) + password change.
// Username availability is checked on keystroke with debounce.

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { inputCls } from "../components/UIElements.jsx";
import Layout from "../components/Layout.jsx";
import api from "../utils/api.js";
import { settingsStyles as s } from "../assets/dummyStyles";
import { Camera, Loader2, Check, X } from "lucide-react";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const fileRef = useRef(null);
  const usernameTimer = useRef(null);

  useEffect(() => {
    // Sync form fields when user data changes (e.g. after save)
    setName(user?.name || "");
    setUsername(user?.username || "");
    setBio(user?.bio || "");
    setAvatarPreview(user?.avatar || null);
  }, [user]);

  const checkUsername = (val) => {
    // Debounced username availability check via /users/check-username
    if (!val || val === user?.username) { setUsernameStatus(null); return; }
    setUsernameStatus("checking");
    clearTimeout(usernameTimer.current);
    usernameTimer.current = setTimeout(async () => {
      try {
        const res = await api.get(`/users/check-username?username=${encodeURIComponent(val)}`);
        setUsernameStatus(res.available ? "available" : "taken");
      } catch { setUsernameStatus(null); }
    }, 500);
  };

  const handleAvatarChange = (e) => {
    // Preview selected avatar image before saving
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  const handleSaveProfile = async (e) => {
    // Submit profile form (name, username, bio, optional avatar) via FormData
    e.preventDefault();
    setErr(""); setMsg(""); setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("username", username);
      fd.append("bio", bio);
      if (avatarFile) fd.append("avatar", avatarFile);
      const res = await api.put("/auth/profile", fd);
      updateUser(res.user);
      setAvatarFile(null);
      setMsg("Profile saved");
    } catch (ex) {
      setErr(ex.message);
    } finally { setSaving(false); }
  };

  const handleUpdatePassword = async (e) => {
    // Validate then submit current + new password
    e.preventDefault();
    if (!currentPassword || !newPassword) { setErr("Fill both password fields"); return; }
    if (newPassword.length < 8) { setErr("New password must be at least 8 characters"); return; }
    setErr(""); setMsg(""); setPwSaving(true);
    try {
      await api.put("/auth/password", { currentPassword, newPassword });
      setMsg("Password updated");
      setCurrentPassword(""); setNewPassword("");
    } catch (ex) {
      setErr(ex.message);
    } finally { setPwSaving(false); }
  };

  const statusColor = usernameStatus === "available" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
    usernameStatus === "taken" ? "bg-rose-500/10 text-rose-400 border-rose-500/30" :
    "bg-zinc-800 text-zinc-500 border-zinc-700";

  const statusIcon = usernameStatus === "available" ? <Check size={12} /> :
    usernameStatus === "taken" ? <X size={12} /> :
    usernameStatus === "checking" ? <Loader2 size={12} className="animate-spin" /> : null;

  return (
    <Layout>
      <div className={s.container}>
        <h1 className={s.heading}>Settings</h1>

        {msg && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            <Check size={14} /> {msg}
          </div>
        )}
        {err && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
            <X size={14} /> {err}
          </div>
        )}

        <div className={s.section}>
          <h2 className={s.sectionTitle}>Profile</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className={s.avatarWrap}>
              <div className="relative group">
                <img
                  src={avatarPreview || `https://ui-avatars.com/api/?name=${user?.name || "U"}&background=18181b&color=fff`}
                  alt=""
                  className={s.avatarImg}
                />
                <div className={s.avatarOverlay} onClick={() => fileRef.current?.click()}>
                  <Camera size={16} className="text-white" />
                </div>
              </div>
              <div className="text-xs text-zinc-500">
                <p className="text-zinc-300 text-sm font-medium">{user?.name}</p>
                <p>@{user?.username}</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div>
              <label className={s.label}>Name</label>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className={s.label}>Username</label>
              <div className={s.usernameRow}>
                <input
                  className={`${inputCls} ${s.usernameInput}`}
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); checkUsername(e.target.value); }}
                />
                {usernameStatus && (
                  <span className={`${s.usernameCheck} inline-flex items-center gap-1 border ${statusColor}`}>
                    {statusIcon}
                    {usernameStatus === "available" ? "Available" : usernameStatus === "taken" ? "Taken" : ""}
                  </span>
                )}
              </div>
              <p className={s.inputHint}>alphanumeric, 3-20 characters</p>
            </div>

            <div>
              <label className={s.label}>Bio</label>
              <textarea className={`${inputCls} min-h-20 resize-y`} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" />
            </div>

            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-white px-6 py-2.5 text-sm font-semibold hover:bg-emerald-400 transition-all disabled:opacity-40">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>

        <div className={s.section}>
          <h2 className={s.sectionTitle}>Change Password</h2>
          <form onSubmit={handleUpdatePassword} className={s.passwordForm}>
            <div>
              <label className={s.label}>Current Password</label>
              <input type="password" className={inputCls} placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <label className={s.label}>New Password</label>
              <input type="password" className={inputCls} placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <p className={s.inputHint}>At least 8 characters</p>
            </div>
            <button type="submit" disabled={pwSaving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-white px-6 py-2.5 text-sm font-semibold hover:bg-emerald-400 transition-all disabled:opacity-40">
              {pwSaving && <Loader2 size={14} className="animate-spin" />}
              {pwSaving ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}