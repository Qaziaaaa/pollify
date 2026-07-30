// ===== VOTED POLLS PAGE =====
// Lists polls the current user has voted on.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { optimisticVoteUpdate } from "../utils/optimisticVote.js";
import { useAuth } from "../context/AuthContext.jsx";
import Layout from "../components/Layout.jsx";
import PollCard from "../assets/helpers component/PollCard.jsx";
import { PollSkeleton } from "../components/UIElements.jsx";

export default function VotedPollsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch /polls/voted once auth is ready
    if (authLoading) return;
    if (!user) { navigate("/login", { replace: true }); return; }

    api.get("/polls/voted")
      .then((res) => setPolls(res.polls || []))
      .catch((err) => console.error("Failed to load voted polls:", err))
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  const handleVote = async (pollId, value) => {
    // Optimistic: immediately show correct results to prevent animation flash
    setPolls((prev) => prev.map((p) =>
      p._id === pollId ? { ...p, ...optimisticVoteUpdate(p, value) } : p
    ));
    try {
      const res = await api.post(`/polls/${pollId}/vote`, { value });
      // Reconcile with real server data, preserve saves
      setPolls((prev) => prev.map((p) =>
        p._id === pollId ? { ...res.poll, saves: p.saves || 0 } : p
      ));
    } catch (err) {
      console.error("Vote failed:", err);
      // Rollback
      setPolls((prev) => prev.map((p) =>
        p._id === pollId ? { ...p, myVote: null } : p
      ));
    }
  };

  const handleUnvote = async (pollId) => {
    let prevVote, prevTotal;
    setPolls((prev) => {
      const target = prev.find((p) => p._id === pollId);
      if (target) { prevVote = target.myVote; prevTotal = target.totalVotes; }
      return prev.map((p) =>
        p._id === pollId ? { ...p, myVote: null, totalVotes: Math.max(0, (p.totalVotes || 0) - 1) } : p
      );
    });
    try {
      const res = await api.post(`/polls/${pollId}/unvote`);
      if (res.poll) {
        setPolls((prev) => prev.map((p) =>
          p._id === pollId ? { ...res.poll, saves: p.saves || 0 } : p
        ));
      }
    } catch (err) {
      console.error("Unvote failed:", err);
      setPolls((prev) => prev.map((p) =>
        p._id === pollId ? { ...p, myVote: prevVote ?? null, totalVotes: prevTotal ?? 0 } : p
      ));
    }
  };

  const toggleBookmark = async (pollId) => {
    // Optimistic: immediately toggle bookmark in UI
    setPolls((prev) => prev.map((p) =>
      p._id === pollId ? { ...p, isBookmarked: !p.isBookmarked, saves: (p.saves || 0) + (p.isBookmarked ? -1 : 1) } : p
    ));
    try {
      await api.post(`/polls/${pollId}/bookmark`);
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
      // Rollback
      setPolls((prev) => prev.map((p) =>
        p._id === pollId ? { ...p, isBookmarked: !p.isBookmarked, saves: (p.saves || 0) + (p.isBookmarked ? 1 : -1) } : p
      ));
    }
  };

  const handleEdit = async (pollId, data) => {
    try {
      await api.put(`/polls/${pollId}`, data);
      setPolls((prev) => prev.map((p) => (p._id === pollId ? { ...p, ...data } : p)));
    } catch (err) { console.error("Edit poll failed:", err); }
  };

  const handleClose = async (pollId) => {
    try {
      const res = await api.patch(`/polls/${pollId}/close`);
      setPolls((prev) => prev.map((p) => (p._id === pollId ? { ...p, closed: res.poll.closed } : p)));
    } catch (err) { console.error("Close/reopen poll failed:", err); }
  };

  const handleDelete = async (pollId) => {
    try {
      await api.delete(`/polls/${pollId}`);
      setPolls((prev) => prev.filter((p) => p._id !== pollId));
    } catch (err) { console.error("Delete poll failed:", err); }
  };

  if (authLoading || !user) return null;

  return (
    <Layout>
      {loading ? (
        <PollSkeleton count={3} />
      ) : (
        <div>
          <h1 className="text-base font-bold text-zinc-200 mb-5">Voted Polls</h1>
          {polls.length > 0 ? (
            <div className="space-y-3">
              {polls.map((poll) => (
                <PollCard key={poll._id} poll={poll} vote={handleVote} unvote={handleUnvote} bookmark={toggleBookmark} owner={String(poll.creator?._id || poll.creator) === String(user._id)} edit={handleEdit} close={handleClose} remove={handleDelete} />
              ))}
            </div>
          ) : (
            <p className="text-center text-zinc-600 py-16 text-sm">You haven't voted on any polls yet.</p>
          )}
        </div>
      )}
    </Layout>
  );
}
