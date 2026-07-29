import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
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
    if (authLoading) return;
    if (!user) { navigate("/login", { replace: true }); return; }

    api.get("/auth/bookmarks")
      .then((res) => setPolls(res.bookmarks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  const handleVote = async (pollId, value) => {
    try {
      await api.post(`/polls/${pollId}/vote`, { value });
      const res = await api.get(`/polls/${pollId}`);
      setPolls((prev) => prev.map((p) => (p._id === pollId ? { ...res.poll, isBookmarked: true } : p)));
    } catch {}
  };

  const handleUnvote = async (pollId) => {
    try {
      const res = await api.post(`/polls/${pollId}/unvote`);
      setPolls((prev) => prev.map((p) => (p._id === pollId ? { ...res.poll, isBookmarked: true } : p)));
    } catch {}
  };

  const toggleBookmark = async (pollId) => {
    try {
      await api.post(`/polls/${pollId}/bookmark`);
      setPolls((prev) => prev.filter((p) => p._id !== pollId));
    } catch {}
  };

  const handleEdit = async (pollId, data) => {
    try {
      await api.put(`/polls/${pollId}`, data);
      setPolls((prev) => prev.map((p) => (p._id === pollId ? { ...p, ...data } : p)));
    } catch {}
  };

  const handleClose = async (pollId) => {
    try {
      const res = await api.patch(`/polls/${pollId}/close`);
      setPolls((prev) => prev.map((p) => (p._id === pollId ? { ...p, closed: res.poll.closed } : p)));
    } catch {}
  };

  const handleDelete = async (pollId) => {
    try {
      await api.delete(`/polls/${pollId}`);
      setPolls((prev) => prev.filter((p) => p._id !== pollId));
    } catch {}
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
