import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../utils/api.js";
import Layout from "../components/Layout.jsx";
import PollCard from "../assets/helpers component/PollCard.jsx";
import { PollSkeleton } from "../components/UIElements.jsx";
import { singlePollPageStyles as s } from "../assets/dummyStyles";

export default function SinglePollPage() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/polls/${id}`)
      .then((res) => setPoll(res.poll || res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVote = async (pollId, value) => {
    try {
      await api.post(`/polls/${pollId}/vote`, { value });
      const res = await api.get(`/polls/${pollId}`);
      setPoll(res.poll || res);
    } catch {}
  };

  const handleUnvote = async (pollId) => {
    try {
      const res = await api.post(`/polls/${pollId}/unvote`);
      setPoll(res.poll || res);
    } catch {}
  };

  const toggleBookmark = async (pollId) => {
    try { await api.post(`/polls/${pollId}/bookmark`); } catch {}
  };

  if (loading) return <Layout><PollSkeleton /></Layout>;

  return (
    <Layout>
      <Link to="/dashboard" className={s.backButton}>
        <ArrowLeft size={14} /> Back
      </Link>
      {error ? (
        <div className="text-center py-16 text-zinc-600 text-sm">{error}</div>
      ) : poll ? (
        <PollCard poll={poll} vote={handleVote} unvote={handleUnvote} bookmark={toggleBookmark} />
      ) : null}
    </Layout>
  );
}
