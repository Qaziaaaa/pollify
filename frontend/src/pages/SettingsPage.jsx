import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.js";

export default function SettingsPage() {
    const { user } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [profileMsg, setProfileMsg] = useState("");
    const [passMsg, setPassMsg] = useState("");

    const inputCls = "w-full bg-zinc-800/50 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 transition-colors";

    const handleProfileUpdate = async () => {
        setProfileMsg("");
        try {
            await api.put("/auth/profile", { name, bio });
            setProfileMsg("Profile updated");
        } catch {
            setProfileMsg("Failed to update");
        }
    };

    const handlePasswordUpdate = async () => {
        setPassMsg("");
        try {
            await api.put("/auth/password", { currentPassword, newPassword });
            setPassMsg("Password updated");
            setCurrentPassword("");
            setNewPassword("");
        } catch {
            setPassMsg("Failed to update password");
        }
    };

    return (
        <div className="space-y-8 max-w-lg">
            <h1 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">Settings</h1>

            {/* Profile section */}
            <section className="space-y-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Profile</h2>
                <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">Name</label>
                    <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">Bio</label>
                    <textarea
                        className={`${inputCls} min-h-20 resize-y`}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleProfileUpdate}
                    className="rounded-xl bg-emerald-500 text-white font-semibold px-5 py-2.5 text-sm hover:bg-emerald-400 transition-colors"
                >
                    Save Changes
                </button>
                {profileMsg && (
                    <p className={`text-sm ${profileMsg.includes("Failed") ? "text-rose-400" : "text-emerald-400"}`}>
                        {profileMsg}
                    </p>
                )}
            </section>

            {/* Password section */}
            <section className="space-y-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Change Password</h2>
                <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">Current Password</label>
                    <input
                        type="password"
                        className={inputCls}
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">New Password</label>
                    <input
                        type="password"
                        className={inputCls}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>
                <button
                    onClick={handlePasswordUpdate}
                    className="rounded-xl bg-emerald-500 text-white font-semibold px-5 py-2.5 text-sm hover:bg-emerald-400 transition-colors"
                >
                    Update Password
                </button>
                {passMsg && (
                    <p className={`text-sm ${passMsg.includes("Failed") ? "text-rose-400" : "text-emerald-400"}`}>
                        {passMsg}
                    </p>
                )}
            </section>
        </div>
    );
}
