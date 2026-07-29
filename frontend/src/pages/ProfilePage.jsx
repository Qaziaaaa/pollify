import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, BarChart3, Bookmark, LogOut } from "lucide-react";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import PollCard from "../components/PollCard.jsx";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [tab, setTab] = useState("created");

    useEffect(() => {
        api.get("/auth/profile")
            .then((res) => setProfile(res.user))
            .catch((err) => console.error("Profile fetch failed:", err));
        api.get("/auth/bookmarks")
            .then((res) => setBookmarks(res.bookmarks || []))
            .catch((err) => console.error("Bookmarks fetch failed:", err));
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="space-y-6">
            {/* Profile header */}
            <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 text-center">
                {profile?.avatar ? (
                    <img src={profile.avatar} alt="" className="w-16 h-16 rounded-full mx-auto" />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-zinc-800 mx-auto flex items-center justify-center">
                        <User size={28} className="text-zinc-500" />
                    </div>
                )}
                <h2 className="text-lg font-bold text-white mt-3">{profile?.name || user?.name}</h2>
                <p className="text-sm text-zinc-500">@{profile?.username || user?.username}</p>
                {profile?.bio && <p className="text-sm text-zinc-400 mt-2 max-w-xs mx-auto">{profile.bio}</p>}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-1">
                {[
                    { key: "created", label: "Created", Icon: BarChart3 },
                    { key: "bookmarks", label: "Bookmarks", Icon: Bookmark },
                ].map(({ key, label, Icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all ${
                            tab === key
                                ? "bg-zinc-800 text-white font-medium"
                                : "text-zinc-500 hover:text-zinc-300"
                        }`}
                    >
                        <Icon size={15} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-4">
                {tab === "created" && profile?.created?.map((p) => (
                    <PollCard key={p._id} poll={p} />
                ))}
                {tab === "created" && (!profile?.created || profile.created.length === 0) && (
                    <p className="text-zinc-500 text-sm text-center py-8">You haven't created any polls yet</p>
                )}
                {tab === "bookmarks" && bookmarks.map((p) => (
                    <PollCard key={p._id} poll={p} />
                ))}
                {tab === "bookmarks" && bookmarks.length === 0 && (
                    <p className="text-zinc-500 text-sm text-center py-8">No bookmarked polls</p>
                )}
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-700/60 px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 transition-all"
            >
                <LogOut size={16} /> Logout
            </button>
        </div>
    );
}
