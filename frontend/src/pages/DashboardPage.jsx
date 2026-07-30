// ===== DASHBOARD PAGE =====
// Main feed: shows all polls with filtering by type, quick create composer,
// and full poll interactions (vote, unvote, bookmark, edit, close, delete).

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusSquare, Sparkles, BarChart3, AlertTriangle, RotateCcw, Image, Star, Type, ListChecks } from "lucide-react";
import api from "../utils/api.js";
import { optimisticVoteUpdate } from "../utils/optimisticVote.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Avatar, PollSkeleton } from "../components/UIElements.jsx";
import Layout from "../components/Layout.jsx";
import PollCard from "../assets/helpers component/PollCard.jsx";
import FilterBar from "../components/FilterBar.jsx";
import { dashboardStyles as s } from "../assets/dummyStyles";

// Quick-create poll type buttons
const QUICK_TYPES = [
  { key: "yesno", label: "Yes/No", Icon: ListChecks },
  { key: "single", label: "Choice", Icon: Type },
  { key: "rating", label: "Rating", Icon: Star },
  { key: "image", label: "Image", Icon: Image },
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [filter, setFilter] = useState("all");
  const [quickText, setQuickText] = useState("");
  const [quickType, setQuickType] = useState("yesno");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login", { replace: true }); return; }

    setError(null);
    setLoading(true);

    api.get("/polls")
      .then((res) => setPolls(res.polls || []))
      .catch((err) => {
        console.error("Failed to load polls:", err);
        setError(err.message || "Failed to load polls");
      })
      .finally(() => setLoading(false));

    api.get("/auth/bookmarks")
      .then((res) => setBookmarks(new Set((res.bookmarks || []).map((b) => b._id || b))))
      .catch(() => {});
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
      // Rollback: unmark the optimistic vote
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
      // Reconcile with real server data, preserve saves
      if (res.poll) {
        setPolls((prev) => prev.map((p) =>
          p._id === pollId ? { ...res.poll, saves: p.saves || 0 } : p
        ));
      }
    } catch (err) {
      console.error("Unvote failed:", err);
      // Rollback only the target poll (no stale array snapshot)
      setPolls((prev) => prev.map((p) =>
        p._id === pollId ? { ...p, myVote: prevVote ?? null, totalVotes: prevTotal ?? 0 } : p
      ));
    }
  };

  const toggleBookmark = async (pollId) => {
    // Optimistic: immediately toggle bookmark
    const wasBookmarked = bookmarks.has(pollId);
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (wasBookmarked) next.delete(pollId);
      else next.add(pollId);
      return next;
    });
    setPolls((prev) =>
      prev.map((p) =>
        p._id === pollId
          ? { ...p, isBookmarked: !p.isBookmarked, saves: (p.saves || 0) + (p.isBookmarked ? -1 : 1) }
          : p
      )
    );
    try {
      await api.post(`/polls/${pollId}/bookmark`);
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
      // Rollback bookmark state
      setBookmarks((prev) => {
        const next = new Set(prev);
        if (wasBookmarked) next.add(pollId);
        else next.delete(pollId);
        return next;
      });
      setPolls((prev) =>
        prev.map((p) =>
          p._id === pollId
            ? { ...p, isBookmarked: wasBookmarked, saves: (p.saves || 0) + (wasBookmarked ? 1 : -1) }
            : p
        )
      );
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

  const filtered = filter === "all" ? polls : polls.filter((p) => p.type === filter);

  const handleQuickCreate = () => {
    if (!quickText.trim()) return;
    navigate(`/create-poll?question=${encodeURIComponent(quickText.trim())}&type=${quickType}`);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (authLoading || !user) return null;

  return (
    <Layout>
      {loading ? (
        <PollSkeleton count={3} />
      ) : (
        <div className={s.container}>
          <div className={s.pageHeader}>
            <div>
              <h1 className={s.greetingText}>{greeting()}, {user.name?.split(" ")[0] || "there"}</h1>
              <p className={s.greetingSubtext}>Here's what's happening today</p>
            </div>
            <Link to="/create-poll" className={s.createButton}>
              <PlusSquare size={16} /> Create Poll
            </Link>
          </div>

          <div className={s.composer}>
            <Avatar user={user} className={s.composerAvatar} />
            <div className={s.composerBody}>
              <input
                className={s.composerInput}
                placeholder="What do you want to ask?"
                value={quickText}
                onChange={(e) => setQuickText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuickCreate()}
              />
              <div className={s.composerFooter}>
                <div className={s.composerTypes}>
                  {QUICK_TYPES.map(({ key, Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setQuickType(key)}
                      title={key}
                      className={`${s.composerTypeBtn} ${quickType === key ? s.composerTypeActive : s.composerTypeInactive}`}
                    >
                      <Icon size={14} />
                    </button>
                  ))}
                </div>
                <button onClick={handleQuickCreate} disabled={!quickText.trim()} className={s.composerSubmit}>
                  Poll
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              <Sparkles size={14} className="text-emerald-400" />
              <h2 className="text-sm font-semibold text-zinc-400">Explore</h2>
            </div>
            <FilterBar active={filter} onChange={setFilter} />
          </div>

          {error ? (
            <div className={s.emptyState}>
              <AlertTriangle size={40} className="mx-auto text-rose-500/60 mb-4" />
              <p className="text-rose-400/80 text-sm mb-1">Failed to load polls</p>
              <p className="text-zinc-600 text-xs mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25">
                <RotateCcw size={14} /> Retry
              </button>
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((poll) => (
                <PollCard
                  key={poll._id}
                  poll={{ ...poll, isBookmarked: bookmarks.has(poll._id) }}
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
            <div className={s.emptyState}>
              <BarChart3 size={40} className={s.emptyIcon} />
              <p className={s.emptyText}>No polls yet</p>
              <Link to="/create-poll" className={s.emptyCreateButton}>
                Create your first poll
              </Link>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
