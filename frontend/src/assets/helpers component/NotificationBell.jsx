import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../utils/api.js";
import useClickOutside from "../../hooks/useClickOutside.js";
import { notificationStyles as s } from "../dummyStyles";

const VERBS = {
  vote: "voted on your poll",
  comment: "commented on your poll",
  follow: "started following you",
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const handleOpen = () => {
    setOpen(!open);
    if (!open && unreadCount > 0) fetchNotifications();
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={handleOpen} className={s.bellButton}>
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className={s.unreadDot}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={s.dropdown}>
          <div className={s.dropdownHeader}>
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className={s.markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          {loading ? (
            <p className={s.emptyText}>Loading...</p>
          ) : notifications.length === 0 ? (
            <p className={s.emptyText}>All caught up!</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`${s.notifItem} ${!n.read ? s.notifUnread : ""}`}
                onClick={() => !n.read && markAsRead(n._id)}
              >
                <div className={`${s.notifIconContainer} ${!n.read ? s.notifIconUnread : ""}`}>
                  <Bell size={12} />
                </div>
                <div className={s.notifContent}>
                  <p className={s.notifText}>
                    <strong>{n.actor?.name || "Someone"}</strong>{" "}
                    {VERBS[n.type] || "interacted with your poll"}
                    {n.poll?.question && (
                      <>
                        {" "}
                        <span className={s.notifPollText}>
                          "{n.poll.question.slice(0, 40)}
                          {n.poll.question.length > 40 ? "..." : ""}"
                        </span>
                      </>
                    )}
                  </p>
                  <p className={s.notifTime}>
                    {timeAgo(n.createdAt)}
                    {!n.read && <span className={s.unreadIndicator} />}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  for (const [n, sec] of [["d", 86400], ["h", 3600], ["m", 60]]) {
    const v = Math.floor(s / sec);
    if (v >= 1) return `${v}${n} ago`;
  }
  return "just now";
}
