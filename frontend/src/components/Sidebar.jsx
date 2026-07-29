import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.js";
import { TYPE_META } from "./FilterBar.jsx";
import { Avatar } from "./UIElements.jsx";
import { sidebarStyles as s } from "../assets/dummyStyles";

const COLORS = [
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
];

function ProfileCard() {
  const { user } = useAuth();

  return (
    <div className={s.profileCard}>
      <div className={s.glowBlob} />
      <div className={s.profileInner}>
        <div className={s.avatarWrapper}>
          <div className={s.avatarGlow} />
          <Avatar user={user || {}} className={s.avatarClass} />
        </div>
        <Link to="/profile" className={s.userNameLink}>{user?.name || "User"}</Link>
        <p className={s.usernameText}>@{user?.username || "username"}</p>

        <div className={s.statsContainer}>
          <div className={s.statBox}>
            <div className={s.statNumber}>{user?.pollCount || 0}</div>
            <div className={s.statLabel}>Polls</div>
          </div>
          <div className={s.statBox}>
            <div className={s.statNumber}>{user?.followers || 0}</div>
            <div className={s.statLabel}>Followers</div>
          </div>
          <div className={s.statBox}>
            <div className={s.statNumber}>{user?.following || 0}</div>
            <div className={s.statLabel}>Following</div>
          </div>
        </div>

        <Link to="/profile" className={s.viewProfileLink}>View Profile</Link>
      </div>
    </div>
  );
}

function Trending() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get("/polls/trending")
      .then((res) => {
        const data = res.polls || res.data || res || [];
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, []);
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <div className={s.trendingCard}>
      <h3 className={s.trendingHeading}>
        <TrendingUp size={12} className={s.trendingIcon} /> Poll types
      </h3>
      <ul className={s.trendingList}>
        {items.map((it, idx) => {
          const m = TYPE_META[it.type];
          if (!m) return null;
          const { Icon } = m;
          const pct = Math.round((it.count / max) * 100);
          return (
            <li key={it.type}>
              <div className={s.trendingItemRow}>
                <span className={s.trendingItemLabel}>
                  <Icon size={12} className={s.trendingItemIcon} /> {m.label}
                </span>
                <span className={s.trendingItemCount}>{it.count}</span>
              </div>
              <div className={s.trendingBarTrack}>
                <div className={`${s.trendingBarFillBase} ${COLORS[idx % COLORS.length]}`} style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function RightRail() {
  return (
    <>
      <ProfileCard />
      <Trending />
    </>
  );
}
