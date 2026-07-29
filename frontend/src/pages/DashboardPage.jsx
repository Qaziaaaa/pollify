import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusSquare, BarChart3, Sparkles } from "lucide-react";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Layout from "../components/Layout.jsx";
import PollCard from "../assets/helpers component/PollCard.jsx";
import FilterBar from "../components/FilterBar.jsx";
import { PollSkeleton } from "../components/UIElements.jsx";
import { dashboardStyles as s } from "../assets/dummyStyles";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login", { replace: true }); return; }

    Promise.all([
      api.get("/polls"),
      api.get("/polls/stats"),
      api.get("/auth/bookmarks"),
    ])
      .then(([pollsRes, statsRes, bookmarksRes]) => {
        setPolls(pollsRes.polls || []);
        setStats(statsRes);
        setBookmarks(new Set((bookmarksRes.bookmarks || []).map((b) => b._id || b)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  const handleVote = async (pollId, value) => {
    try {
      await api.post(`/polls/${pollId}/vote`, { value });
      setPolls((prev) =>
        prev.map((p) => {
          if (p._id !== pollId) return p;
          const already = p.myVote;
          return {
            ...p,
            myVote: value,
            totalVotes: (p.totalVotes || 0) + (already ? 0 : 1),
            results: p.results
              ? p.results.map((r) =>
                  r.value === value ? { ...r, count: r.count + 1 } : r.value === already ? { ...r, count: r.count - 1 } : r
                )
              : undefined,
          };
        })
      );
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

  const filtered = filter === "all" ? polls : polls.filter((p) => p.type === filter);

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

          {stats && (
            <div className={s.statsGrid}>
              {[
                { label: "Total Polls", value: stats.totalPolls || 0 },
                { label: "Total Votes", value: stats.totalVotes || 0 },
                { label: "Active Users", value: stats.activeUsers || 0 },
              ].map((item) => (
                <div key={item.label} className={s.statCard}>
                  <div className={s.statIconWrap}>
                    <BarChart3 size={14} className={s.statIcon} />
                    <span className={s.statLabel}>{item.label}</span>
                  </div>
                  <div className={s.statValue}>{item.value}</div>
                </div>
              ))}
            </div>
          )}

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
