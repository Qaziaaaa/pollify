import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusSquare, Sparkles, BarChart3, Image, Star, Type, ListChecks } from "lucide-react";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Avatar, PollSkeleton } from "../components/UIElements.jsx";
import Layout from "../components/Layout.jsx";
import PollCard from "../assets/helpers component/PollCard.jsx";
import FilterBar from "../components/FilterBar.jsx";
import { dashboardStyles as s } from "../assets/dummyStyles";

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
  const [bookmarks, setBookmarks] = useState(new Set());
  const [filter, setFilter] = useState("all");
  const [quickText, setQuickText] = useState("");
  const [quickType, setQuickType] = useState("yesno");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login", { replace: true }); return; }

    Promise.all([
      api.get("/polls"),
      api.get("/auth/bookmarks"),
    ])
      .then(([pollsRes, bookmarksRes]) => {
        setPolls(pollsRes.polls || []);
        setBookmarks(new Set((bookmarksRes.bookmarks || []).map((b) => b._id || b)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  const handleVote = async (pollId, value) => {
    try {
      await api.post(`/polls/${pollId}/vote`, { value });
      const res = await api.get(`/polls/${pollId}`);
      setPolls((prev) => prev.map((p) => (p._id === pollId ? res.poll : p)));
    } catch {}
  };

  const handleUnvote = async (pollId) => {
    try {
      await api.post(`/polls/${pollId}/unvote`);
      setPolls((prev) =>
        prev.map((p) => {
          if (p._id !== pollId) return p;
          return { ...p, myVote: null, totalVotes: Math.max(0, (p.totalVotes || 0) - 1) };
        })
      );
    } catch {}
  };

  const toggleBookmark = async (pollId) => {
    try {
      await api.post(`/polls/${pollId}/bookmark`);
      setBookmarks((prev) => {
        const next = new Set(prev);
        if (next.has(pollId)) next.delete(pollId);
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

          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((poll) => (
                <PollCard
                  key={poll._id}
                  poll={{ ...poll, isBookmarked: bookmarks.has(poll._id) }}
                  vote={handleVote}
                  unvote={handleUnvote}
                  bookmark={toggleBookmark}
                  owner={poll.creator?._id === user._id || poll.creator === user._id}
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
