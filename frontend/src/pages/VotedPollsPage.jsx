import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
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
    if (authLoading) return;
    if (!user) { navigate("/login", { replace: true }); return; }

    api.get("/polls/voted")
      .then((res) => setPolls(res.polls || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  const handleVote = async (pollId, value) => {
    try {
      await api.post(`/polls/${pollId}/vote`, { value });
      const res = await api.get(`/polls/${pollId}`);
      setPolls((prev) => prev.map((p) => (p._id === pollId ? { ...res.poll, myVote: value } : p)));
    } catch {}
  };

  const handleUnvote = async (pollId) => {
    try {
      const res = await api.post(`/polls/${pollId}/unvote`);
      setPolls((prev) => prev.map((p) => (p._id === pollId ? res.poll : p)));
    } catch {}
  };

  const toggleBookmark = async (pollId) => {
    try { await api.post(`/polls/${pollId}/bookmark`); } catch {}
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
                <PollCard key={poll._id} poll={poll} vote={handleVote} unvote={handleUnvote} bookmark={toggleBookmark} />
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
