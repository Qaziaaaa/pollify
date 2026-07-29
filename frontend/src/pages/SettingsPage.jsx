import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { inputCls } from "../components/UIElements.jsx";
import Layout from "../components/Layout.jsx";
import api from "../utils/api.js";
import { settingsStyles as s } from "../assets/dummyStyles";

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      await api.put("/auth/profile", { name, bio });
      setMsg("Profile updated");
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      await api.put("/auth/password", { currentPassword, newPassword });
      setMsg("Password updated");
      setCurrentPassword("");
      setNewPassword("");
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <Layout>
    <div className={s.container}>
      <h1 className={s.heading}>Settings</h1>

      {msg && <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">{msg}</div>}
      {err && <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">{err}</div>}

      <div className={s.section}>
        <h2 className={s.sectionTitle}>Profile</h2>
        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div>
            <label className={s.label}>Name</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={s.label}>Bio</label>
            <textarea className={`${inputCls} min-h-16 resize-y`} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <button type="submit" className={`${inputCls} w-auto bg-emerald-500 text-white font-semibold hover:bg-emerald-400 py-2.5 px-6`}>
            Save Changes
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
          </div>
          <button type="submit" className={`${inputCls} w-auto bg-emerald-500 text-white font-semibold hover:bg-emerald-400 py-2.5 px-6`}>
            Update Password
          </button>
        </form>
      </div>
    </div>
    </Layout>
  );
}
