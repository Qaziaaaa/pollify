import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import api from "../utils/api.js";
import PollCard from "../components/PollCard.jsx";

export default function Dashboard() {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/polls")
            .then((res) => setPolls(res.polls || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-4 mt-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 animate-pulse">
                        <div className="h-4 bg-zinc-800 rounded w-3/4 mb-3" />
                        <div className="h-3 bg-zinc-800 rounded w-1/4" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-lg font-bold text-white mb-6 font-['Plus_Jakarta_Sans']">Dashboard</h1>
            <div className="space-y-4">
                {polls.map((poll) => (
                    <PollCard key={poll._id} poll={poll} />
                ))}
                {polls.length === 0 && (
                    <p className="text-zinc-500 text-sm text-center py-12">
                        No polls yet. <Link to="/create-poll" className="text-emerald-400">Create one</Link>
                    </p>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 md:hidden bg-zinc-900 border-t border-zinc-800 flex justify-around py-3 px-4">
                {[
                    { to: "/dashboard", label: "Home" },
                    { to: "/create-poll", label: "Create" },
                    { to: "/profile", label: "Profile" },
                ].map(({ to, label }) => (
                    <Link key={to} to={to} className="flex flex-col items-center text-zinc-500 text-[10px]">
                        <BarChart3 size={18} />
                        {label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
