import { useState, useRef } from "react";
import { Bell } from "lucide-react";
import useClickOutside from "../../hooks/useClickOutside.js";
import { notificationStyles as s } from "../dummyStyles";

const VERBS = {
  vote: "voted on your poll",
  comment: "commented on your poll",
  follow: "started following you",
};

const MOCK = [
  { id: 1, type: "vote", user: "alice", poll: "What's your favorite?", time: "2m", read: false },
  { id: 2, type: "comment", user: "bob", poll: "Rate this design", time: "15m", read: false },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className={s.bellButton}>
        <Bell size={16} />
        <span className={s.unreadDot} />
      </button>

      {open && (
        <div className={s.dropdown}>
          <p className={s.dropdownHeader}>Notifications</p>
          {MOCK.length === 0 ? (
            <p className={s.emptyText}>All caught up!</p>
          ) : (
            MOCK.map((n) => (
              <div key={n.id} className={s.notifItem}>
                <div className={s.notifIconContainer}>
                  <Bell size={12} />
                </div>
                <div className={s.notifContent}>
                  <p className={s.notifText}>
                    <strong>{n.user}</strong> {VERBS[n.type] || "interacted with your poll"}
                  </p>
                  <p className={s.notifTime}>{n.time} ago</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
