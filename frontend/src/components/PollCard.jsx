// WHY: Reusable component that shows a poll's question, options, and vote/results
// Used in Dashboard, Profile, and SinglePollPage
// Avoids duplicating the same UI code in multiple pages

import { useState } from "react";
import { Link } from "react-router-dom";
import { ThumbsUp, Eye, MessageSquare } from "lucide-react";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function PollCard({ poll, showResults = false, onVote }) {
    const { user } = useAuth();
    const [localPoll, setLocalPoll] = useState(poll);
    const [voting, setVoting] = useState(false);

    const totalVotes = localPoll.votes?.length || 0;
    const userVote = localPoll.votes?.find((v) => v.user === user?._id);

    const handleVote = async (value) => {
        if (!user || voting) return;
        setVoting(true);
        try {
            const res = await api.post(`/polls/${localPoll._id}/vote`, { value });
            setLocalPoll(res.poll);
            if (onVote) onVote(res.poll);
        } catch {
            /* silent */
        } finally {
            setVoting(false);
        }
    };

    const getPercentage = (value) => {
        if (totalVotes === 0) return 0;
        const count = localPoll.votes?.filter((v) => v.value === value).length || 0;
        return Math.round((count / totalVotes) * 100);
    };

    return (
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/60 transition-colors">
            {/* Header */}
            <Link to={`/poll/${localPoll._id}`} className="flex items-start gap-3 mb-3">
                {localPoll.creator?.avatar && (
                    <img src={localPoll.creator.avatar} alt="" className="w-8 h-8 rounded-full mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-zinc-100">{localPoll.question}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                        by {localPoll.creator?.name || "Anonymous"} · {localPoll.type}
                    </p>
                </div>
            </Link>

            {/* Options / Results */}
            {localPoll.type === "yesno" && (
                <div className="space-y-2 mt-3">
                    {["Yes", "No"].map((opt) => {
                        const pct = getPercentage(opt);
                        const selected = userVote?.value === opt;
                        return (
                            <button
                                key={opt}
                                onClick={() => handleVote(opt)}
                                disabled={voting}
                                className={`relative w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-all overflow-hidden ${
                                    selected
                                        ? "border-emerald-500/50 bg-emerald-500/10"
                                        : "border-zinc-700/60 bg-zinc-800/40 hover:border-zinc-600"
                                }`}
                            >
                                <span className="relative z-10 flex justify-between">
                                    <span className={selected ? "text-emerald-400 font-medium" : "text-zinc-300"}>{opt}</span>
                                    {totalVotes > 0 && <span className="text-zinc-500">{pct}%</span>}
                                </span>
                                {totalVotes > 0 && (
                                    <span
                                        className="absolute inset-y-0 left-0 bg-emerald-500/10 rounded-xl transition-all"
                                        style={{ width: `${pct}%` }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {localPoll.type === "single" && (
                <div className="space-y-2 mt-3">
                    {localPoll.options?.map((opt, i) => {
                        const pct = getPercentage(opt.text);
                        const selected = userVote?.value === opt.text;
                        return (
                            <button
                                key={i}
                                onClick={() => handleVote(opt.text)}
                                disabled={voting}
                                className={`relative w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-all overflow-hidden ${
                                    selected
                                        ? "border-emerald-500/50 bg-emerald-500/10"
                                        : "border-zinc-700/60 bg-zinc-800/40 hover:border-zinc-600"
                                }`}
                            >
                                <span className="relative z-10 flex justify-between">
                                    <span className={selected ? "text-emerald-400 font-medium" : "text-zinc-300"}>{opt.text}</span>
                                    {totalVotes > 0 && <span className="text-zinc-500">{pct}%</span>}
                                </span>
                                {totalVotes > 0 && (
                                    <span
                                        className="absolute inset-y-0 left-0 bg-emerald-500/10 rounded-xl transition-all"
                                        style={{ width: `${pct}%` }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {localPoll.type === "rating" && (
                <div className="flex gap-2 mt-3">
                    {[1, 2, 3, 4, 5].map((star) => {
                        const selected = userVote?.value >= star;
                        const allVotes = localPoll.votes?.length || 0;
                        const starVotes = localPoll.votes?.filter((v) => v.value >= star).length || 0;
                        return (
                            <button
                                key={star}
                                onClick={() => handleVote(star)}
                                disabled={voting}
                                className={`flex-1 py-2 rounded-xl text-center text-sm border transition-all ${
                                    selected
                                        ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                                        : "border-zinc-700/60 bg-zinc-800/40 text-zinc-500 hover:border-zinc-600"
                                }`}
                            >
                                {star}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mt-4 text-zinc-500 text-xs">
                <span className="flex items-center gap-1"><ThumbsUp size={12} /> {totalVotes}</span>
                <span className="flex items-center gap-1"><Eye size={12} /> {localPoll.views || 0}</span>
                <Link to={`/poll/${localPoll._id}`} className="flex items-center gap-1 ml-auto text-emerald-400 hover:text-emerald-300">
                    <MessageSquare size={12} /> Details
                </Link>
            </div>
        </div>
    );
}
