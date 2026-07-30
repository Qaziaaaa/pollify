// ===== SINGLE POLL PAGE =====
// Shows one full poll by ID with vote, bookmark, edit, close, delete controls.

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
  // Fetch poll on mount and provide all interaction callbacks

  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load the single poll from /polls/:id
    api.get(`/polls/${id}`)
      .then((res) => setPoll(res.poll || res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVote = async (pollId, value) => {
    // Cast vote then refresh poll data
    try {
      await api.post(`/polls/${pollId}/vote`, { value });
      const res = await api.get(`/polls/${pollId}`);
      setPoll(res.poll || res);
    } catch {}
  };

  const handleUnvote = async (pollId) => {
    // Remove vote then refresh poll data
    try {
      const res = await api.post(`/polls/${pollId}/unvote`);
      setPoll(res.poll || res);
    } catch {}
  };

  const toggleBookmark = async (pollId) => {
    // Toggle bookmark state (no local state update needed — bookmark is server-side)
    try { await api.post(`/polls/${pollId}/bookmark`); } catch {}
  };

  const handleDelete = async (pollId) => {
    // Delete poll and go back to dashboard
    try {
      await api.delete(`/polls/${pollId}`);
      navigate("/dashboard");
    } catch {}
  };

  const handleEdit = async (pollId, data) => {
    // Save edited poll data locally
    try {
      await api.put(`/polls/${pollId}`, data);
      setPoll((prev) => prev ? { ...prev, ...data } : prev);
    } catch {}
  };

  const handleClose = async (pollId) => {
    // Close poll so no more votes accepted
    try {
      const res = await api.patch(`/polls/${pollId}/close`);
      setPoll((prev) => prev ? { ...prev, closed: res.poll.closed } : prev);
    } catch {}
  };

  if (loading) return <Layout><PollSkeleton /></Layout>;

  // Compare creator IDs using String() to handle mixed ObjectId / populated-user types
  const isOwner = poll && user && (String(poll.creator?._id || poll.creator) === String(user._id));

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
