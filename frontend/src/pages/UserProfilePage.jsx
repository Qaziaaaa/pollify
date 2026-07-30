// ===== USER PROFILE PAGE =====
// View another user's profile (or own), follow/unfollow, see their polls.
// Supports all poll interaction callbacks if the viewer is the owner.

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { optimisticVoteUpdate } from "../utils/optimisticVote.js";
import { useAuth } from "../context/AuthContext.jsx";
import Layout from "../components/Layout.jsx";
import PollCard from "../assets/helpers component/PollCard.jsx";
import { Avatar, PollSkeleton } from "../components/UIElements.jsx";
import { userProfileStyles as s } from "../assets/dummyStyles";

export default function UserProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyFollow, setBusyFollow] = useState(false);

  const fetchProfile = useCallback(() => {
    // Load user profile + their polls from /users/:id
    const targetId = id || currentUser?._id;
    if (!targetId) {
      setLoading(false);
      setError("No user specified");
      return;
    }
    setLoading(true);
    api.get(`/users/${targetId}`)
      .then((res) => setProfile(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, currentUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFollow = async () => {
    // Toggle follow/unfollow and update local follower count
    if (!profile || busyFollow) return;
    setBusyFollow(true);
    try {
      if (profile.isFollowing) {
        await api.post(`/users/${profile.user._id}/unfollow`);
        setProfile((prev) => ({ ...prev, isFollowing: false, stats: { ...prev.stats, followers: prev.stats.followers - 1 } }));
      } else {
        await api.post(`/users/${profile.user._id}/follow`);
        setProfile((prev) => ({ ...prev, isFollowing: true, stats: { ...prev.stats, followers: prev.stats.followers + 1 } }));
      }
    } catch (err) { console.error("Follow/unfollow failed:", err); }
    setBusyFollow(false);
  };

  const handleVote = useCallback(async (pollId, value) => {
    // Optimistic: immediately show correct results to prevent animation flash
    setProfile((prev) => prev ? { ...prev, polls: prev.polls.map((p) =>
      p._id === pollId ? { ...p, ...optimisticVoteUpdate(p, value) } : p
    )} : prev);
    try {
      const res = await api.post(`/polls/${pollId}/vote`, { value });
      // Reconcile with real server data, preserve saves
      setProfile((prev) => prev ? { ...prev, polls: prev.polls.map((p) =>
        p._id === pollId ? { ...res.poll, saves: p.saves || 0 } : p
      )} : prev);
    } catch (err) {
      console.error("Vote failed:", err);
      // Rollback
      setProfile((prev) => prev ? { ...prev, polls: prev.polls.map((p) =>
        p._id === pollId ? { ...p, myVote: null } : p
      )} : prev);
    }
  }, []);

  const handleUnvote = useCallback(async (pollId) => {
    // Optimistic: immediately unmark in UI
    setProfile((prev) => prev ? { ...prev, polls: prev.polls.map((p) =>
      p._id === pollId ? { ...p, myVote: null } : p
    )} : prev);
    try {
      const res = await api.post(`/polls/${pollId}/unvote`);
      if (res.poll) {
        setProfile((prev) => prev ? { ...prev, polls: prev.polls.map((p) =>
          p._id === pollId ? { ...res.poll, saves: p.saves || 0 } : p
        )} : prev);
      }
    } catch (err) {
      console.error("Unvote failed:", err);
      // Rollback by refetching profile
      fetchProfile();
    }
  }, [fetchProfile]);

  const toggleBookmark = useCallback(async (pollId) => {
    // Optimistic: immediately toggle bookmark in UI
    setProfile((prev) => prev ? { ...prev, polls: prev.polls.map((p) =>
      p._id === pollId ? { ...p, isBookmarked: !p.isBookmarked, saves: (p.saves || 0) + (p.isBookmarked ? -1 : 1) } : p
    )} : prev);
    try {
      await api.post(`/polls/${pollId}/bookmark`);
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
      // Rollback: refetch profile to reset state
      fetchProfile();
    }
  }, [fetchProfile]);

  const handleEdit = useCallback(async (pollId, data) => {
    try {
      await api.put(`/polls/${pollId}`, data);
      setProfile((prev) => prev ? { ...prev, polls: prev.polls.map((p) => p._id === pollId ? { ...p, ...data } : p) } : prev);
    } catch (err) { console.error("Edit poll failed:", err); }
  }, []);

  const handleClose = useCallback(async (pollId) => {
    try {
      const res = await api.patch(`/polls/${pollId}/close`);
      setProfile((prev) => prev ? { ...prev, polls: prev.polls.map((p) => p._id === pollId ? { ...p, closed: res.poll.closed } : p) } : prev);
    } catch (err) { console.error("Close/reopen poll failed:", err); }
  }, []);

  const handleDelete = useCallback(async (pollId) => {
    try {
      await api.delete(`/polls/${pollId}`);
      setProfile((prev) => prev ? { ...prev, polls: prev.polls.filter((p) => p._id !== pollId) } : prev);
    } catch (err) { console.error("Delete poll failed:", err); }
  }, []);

  if (loading) return <Layout><PollSkeleton /></Layout>;
  if (error) return <Layout><div className="text-center py-16 text-zinc-600 text-sm">{error}</div></Layout>;
  if (!profile || !profile.user) return <Layout><div className="text-center py-16 text-zinc-600 text-sm">User not found</div></Layout>;

  const u = profile.user;
  const stats = profile.stats || {};
  const polls = profile.polls || [];

  return (
    <Layout>
      <div className={s.profileCard}>
        <div className={s.bannerContainer}>
          <div className={s.bannerGlow} />
        </div>
        <div className={s.profileBody}>
          <div className={s.avatarRow}>
            <Avatar user={u} className={s.avatarClass} />
          </div>
          <div className={s.userInfo}>
            <h1 className={s.userName}>{u.name}</h1>
            <p className={s.userUsername}>@{u.username}</p>
            {u.bio && <p className={s.userBio}>{u.bio}</p>}
          </div>

          <div className={s.statsRow}>
            <div>
              <span className={s.statNumber}>{stats.created || 0}</span>
              <span className={s.statLabel}> polls</span>
            </div>
            <div>
              <span className={s.statNumber}>{stats.voted || 0}</span>
              <span className={s.statLabel}> voted</span>
            </div>
            <div>
              <span className={s.statNumber}>{stats.followers || 0}</span>
              <span className={s.statLabel}> followers</span>
            </div>
            <div>
              <span className={s.statNumber}>{stats.following || 0}</span>
              <span className={s.statLabel}> following</span>
            </div>
          </div>

          {!profile.isMe && (
            <div className="mt-4">
              <button
                onClick={handleFollow}
                disabled={busyFollow}
                className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  profile.isFollowing
                    ? "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400"
                    : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/25"
                }`}
              >
                {busyFollow ? "..." : profile.isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          )}
        </div>
      </div>

      <p className={s.pollsHeading}>Polls</p>
      {polls.length > 0 ? (
        <div className="space-y-3">
          {polls.map((poll) => (
            <PollCard key={poll._id} poll={poll} vote={handleVote} unvote={handleUnvote} bookmark={toggleBookmark} owner={String(poll.creator?._id || poll.creator) === String(currentUser?._id)} edit={handleEdit} close={handleClose} remove={handleDelete} />
          ))}
        </div>
      ) : (
        <p className={s.emptyPolls}>No polls yet.</p>
      )}
    </Layout>
  );
}
