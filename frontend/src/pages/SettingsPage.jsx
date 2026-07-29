import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { inputCls } from "../components/UIElements.jsx";
import Layout from "../components/Layout.jsx";
import { settingsStyles as s } from "../assets/dummyStyles";

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");

  return (
    <Layout>
    <div className={s.container}>
      <h1 className={s.heading}>Settings</h1>

      <div className={s.section}>
        <h2 className={s.sectionTitle}>Profile</h2>
        <div className="space-y-3">
          <div>
            <label className={s.label}>Name</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={s.label}>Bio</label>
            <textarea className={`${inputCls} min-h-16 resize-y`} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <button className={`${inputCls} w-auto bg-emerald-500 text-white font-semibold hover:bg-emerald-400 py-2.5 px-6`}>
            Save Changes
          </button>
        </div>
      </div>

      <div className={s.section}>
        <h2 className={s.sectionTitle}>Change Password</h2>
        <div className={s.passwordForm}>
          <div>
            <label className={s.label}>Current Password</label>
            <input type="password" className={inputCls} placeholder="••••••••" />
          </div>
          <div>
            <label className={s.label}>New Password</label>
            <input type="password" className={inputCls} placeholder="••••••••" />
          </div>
          <button className={`${inputCls} w-auto bg-emerald-500 text-white font-semibold hover:bg-emerald-400 py-2.5 px-6`}>
            Update Password
          </button>
        </div>
      </div>
    </div>
    </Layout>
  );
}
