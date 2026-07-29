import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Layout from "../components/Layout.jsx";
import PollCard from "../assets/helpers component/PollCard.jsx";
import { PollSkeleton } from "../components/UIElements.jsx";
import { singlePollPageStyles as s } from "../assets/dummyStyles";

export default function SinglePollPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const handleDelete = async (pollId) => {
    try {
      await api.delete(`/polls/${pollId}`);
      navigate("/dashboard");
    } catch {}
  };

  const handleEdit = async (pollId, data) => {
    try {
      await api.put(`/polls/${pollId}`, data);
      setPoll((prev) => prev ? { ...prev, ...data } : prev);
    } catch {}
  };

  const handleClose = async (pollId) => {
    try {
      const res = await api.patch(`/polls/${pollId}/close`);
      setPoll((prev) => prev ? { ...prev, closed: res.poll.closed } : prev);
    } catch {}
  };

  if (loading) return <Layout><PollSkeleton /></Layout>;

  const isOwner = poll && user && (poll.creator?._id === user._id || poll.creator === user._id);

  return (
    <Layout>
      <Link to="/dashboard" className={s.backButton}>
        <ArrowLeft size={14} /> Back
      </Link>
      {error ? (
        <div className="text-center py-16 text-zinc-600 text-sm">{error}</div>
      ) : poll ? (
        <PollCard
          poll={poll}
          vote={handleVote}
          unvote={handleUnvote}
          bookmark={toggleBookmark}
          owner={isOwner}
          edit={isOwner ? handleEdit : undefined}
          close={isOwner ? handleClose : undefined}
          remove={isOwner ? handleDelete : undefined}
        />
      ) : null}
    </Layout>
  );
}
