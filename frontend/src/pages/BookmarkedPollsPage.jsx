// ===== BOOKMARKED POLLS PAGE =====
// Lists polls the current user has bookmarked. Un-bookmarking removes from list.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { optimisticVoteUpdate } from "../utils/optimisticVote.js";
import { useAuth } from "../context/AuthContext.jsx";
import Layout from "../components/Layout.jsx";
import PollCard from "../assets/helpers component/PollCard.jsx";
import { PollSkeleton } from "../components/UIElements.jsx";

export default function BookmarkedPollsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch /auth/bookmarks once auth is ready
    if (authLoading) return;
    if (!user) { navigate("/login", { replace: true }); return; }

    api.get("/auth/bookmarks")
      .then((res) => setPolls(res.bookmarks || []))
      .catch((err) => console.error("Failed to load bookmarked polls:", err))
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  const handleVote = async (pollId, value) => {
    // Optimistic: immediately show correct results to prevent animation flash
    setPolls((prev) => prev.map((p) =>
      p._id === pollId ? { ...p, ...optimisticVoteUpdate(p, value) } : p
    ));
    try {
      const res = await api.post(`/polls/${pollId}/vote`, { value });
      // Reconcile with real server data, preserving bookmarked status + saves
      setPolls((prev) => prev.map((p) =>
        p._id === pollId ? { ...res.poll, isBookmarked: true, saves: p.saves || 0 } : p
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
        p._id === pollId ? { ...p, myVote: null } : p
      );
    });
    try {
      const res = await api.post(`/polls/${pollId}/unvote`);
      if (res.poll) {
        setPolls((prev) => prev.map((p) =>
          p._id === pollId ? { ...res.poll, isBookmarked: true, saves: p.saves || 0 } : p
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
    let removed = null;
    setPolls((prev) => {
      const idx = prev.findIndex((p) => p._id === pollId);
      if (idx !== -1) removed = prev[idx];
      return prev.filter((p) => p._id !== pollId);
    });
    try {
      await api.post(`/polls/${pollId}/bookmark`);
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
      // Rollback: restore the poll (no stale array snapshot)
      if (removed) {
        setPolls((prev) => {
          if (prev.some((p) => p._id === pollId)) return prev; // already restored
          return [...prev, removed].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
      }
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
          <h1 className="text-base font-bold text-zinc-200 mb-5">Bookmarked Polls</h1>
          {polls.length > 0 ? (
            <div className="space-y-3">
              {polls.map((poll) => (
                <PollCard
                  key={poll._id}
                  poll={{ ...poll, isBookmarked: true }}
                  vote={handleVote}
                  unvote={handleUnvote}
                  bookmark={toggleBookmark}
                  owner={String(poll.creator?._id || poll.creator) === String(user._id)}
                  edit={handleEdit}
                  close={handleClose}
                  remove={handleDelete}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-zinc-600 py-16 text-sm">No bookmarked polls yet.</p>
          )}
        </div>
      )}
    </Layout>
  );
}
