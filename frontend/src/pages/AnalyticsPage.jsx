import { useEffect, useState } from "react";
import api from "../utils/api.js";
import { PollSkeleton } from "../components/UIElements.jsx";
import Layout from "../components/Layout.jsx";
import { analyticsStyles as s } from "../assets/dummyStyles";

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/polls/stats")
      .then((res) => setStats(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><PollSkeleton /></Layout>;

  return (
    <Layout>
      <h1 className={s.heading}>Analytics</h1>
      <div className={s.statsGrid}>
        {[
          { label: "Total Polls", value: stats?.totalPolls || 0 },
          { label: "Total Votes", value: stats?.totalVotes || 0 },
          { label: "Active Users", value: stats?.activeUsers || 0 },
          { label: "Avg Votes/Poll", value: stats?.avgVotes || 0 },
        ].map((item) => (
          <div key={item.label} className={s.statCard}>
            <div className={s.statValue}>{item.value}</div>
            <div className={s.statLabel}>{item.label}</div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
