import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ThumbsUp, Eye, MessageSquare, Send } from "lucide-react";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import PollCard from "../components/PollCard.jsx";

export default function PollDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [poll, setPoll] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get(`/polls/${id}`),
            api.get(`/polls/${id}/comments`),
        ])
            .then(([pollRes, commentRes]) => {
                setPoll(pollRes.poll);
                setComments(commentRes.comments || []);
            })
            .catch((err) => console.error("Poll detail fetch failed:", err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const res = await api.post(`/polls/${id}/comments`, { text: newComment });
            setComments((prev) => [res.comment, ...prev]);
            setNewComment("");
        } catch { /* silent */ }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-4 bg-zinc-800 rounded w-24" />
                <div className="h-40 bg-zinc-800/50 rounded-2xl" />
            </div>
        );
    }

    if (!poll) {
        return <p className="text-zinc-500 text-sm">Poll not found</p>;
    }

    return (
        <div className="space-y-6">
            <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                <ArrowLeft size={15} /> Back
            </Link>

            <PollCard poll={poll} />

            {/* Comments */}
            <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                    <MessageSquare size={15} /> Comments ({comments.length})
                </h3>

                {user && (
                    <form onSubmit={handleComment} className="flex gap-2 mb-4">
                        <input
                            placeholder="Add a comment…"
                            className="flex-1 rounded-xl border border-zinc-700/80 bg-zinc-800/50 px-4 py-2.5 text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 text-sm"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim()}
                            className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white disabled:opacity-40 transition-all"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                )}

                <div className="space-y-3">
                    {comments.map((c) => (
                        <div key={c._id} className="flex gap-3">
                            {c.user?.avatar ? (
                                <img src={c.user.avatar} alt="" className="w-7 h-7 rounded-full mt-0.5" />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-zinc-700 mt-0.5" />
                            )}
                            <div>
                                <p className="text-xs text-zinc-500">{c.user?.name || "Anonymous"}</p>
                                <p className="text-sm text-zinc-300">{c.text}</p>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <p className="text-zinc-600 text-sm text-center py-4">No comments yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}
