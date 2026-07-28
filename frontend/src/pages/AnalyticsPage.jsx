import { useState, useEffect } from "react";
import { BarChart3, Vote, Users, TrendingUp } from "lucide-react";
import api from "../utils/api.js";

export default function AnalyticsPage() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get("/polls/stats")
            .then((res) => setStats(res))
            .catch(() => {});
    }, []);

    const cards = [
        { label: "Total Polls", value: stats?.totalPolls ?? 0, Icon: BarChart3 },
        { label: "Total Votes", value: stats?.totalVotes ?? 0, Icon: Vote },
        { label: "Active Users", value: stats?.activeUsers ?? 0, Icon: Users },
        { label: "Avg Votes / Poll", value: stats?.avgVotes ?? 0, Icon: TrendingUp },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">Analytics</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cards.map(({ label, value, Icon }) => (
                    <div
                        key={label}
                        className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 flex items-center gap-4"
                    >
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <Icon size={20} className="text-emerald-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{value}</div>
                            <div className="text-xs text-zinc-500">{label}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
