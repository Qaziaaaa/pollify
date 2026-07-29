import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Layout from "../components/Layout.jsx";
import { Avatar, PollSkeleton } from "../components/UIElements.jsx";
import { userProfileStyles as s } from "../assets/dummyStyles";

export default function UserProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const targetId = id || currentUser?._id;
    if (!targetId) {
      setLoading(false);
      setError("No user specified");
      return;
    }
    api.get(`/users/${targetId}`)
      .then((res) => setProfile(res.user || res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, currentUser]);

  if (loading) return <Layout><PollSkeleton /></Layout>;
  if (error) return <Layout><div className="text-center py-16 text-zinc-600 text-sm">{error}</div></Layout>;
  if (!profile) return <Layout><div className="text-center py-16 text-zinc-600 text-sm">User not found</div></Layout>;

  return (
    <Layout>
      <div className={s.profileCard}>
        <div className={s.bannerContainer}>
          <div className={s.bannerGlow} />
        </div>
        <div className={s.profileBody}>
          <div className={s.avatarRow}>
            <Avatar user={profile} className={s.avatarClass} />
          </div>
          <div className={s.userInfo}>
            <h1 className={s.userName}>{profile.name}</h1>
            <p className={s.userUsername}>@{profile.username}</p>
            {profile.bio && <p className={s.userBio}>{profile.bio}</p>}
          </div>
          <div className={s.statsRow}>
            <div>
              <span className={s.statNumber}>{profile.pollCount || 0}</span>
              <span className={s.statLabel}> polls</span>
            </div>
            <div>
              <span className={s.statNumber}>{profile.followers || 0}</span>
              <span className={s.statLabel}> followers</span>
            </div>
          </div>
        </div>
      </div>
      <p className={s.pollsHeading}>Polls</p>
      <p className={s.emptyPolls}>No polls yet.</p>
    </Layout>
  );
}
