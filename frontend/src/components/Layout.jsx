// ===== MAIN APP LAYOUT =====
// Renders the persistent shell: top header, left sidebar nav, main content area, right rail, and bottom mobile nav.

import { Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusSquare, PenLine, CheckCircle2, Bookmark, LogOut, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationBell from "../assets/helpers component/NotificationBell.jsx";
import RightRail from "./Sidebar.jsx";
import { Avatar } from "./UIElements.jsx";
import { layoutStyles as ls } from "../assets/dummyStyles";

// Left sidebar navigation items
const NAV = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/create-poll", label: "Create", Icon: PlusSquare },
  { to: "/my-polls", label: "My Polls", Icon: PenLine },
  { to: "/voted-polls", label: "Voted", Icon: CheckCircle2 },
  { to: "/bookmarked-polls", label: "Saved", Icon: Bookmark },
  { to: "/settings", label: "Settings", Icon: Settings },
];

// Bottom nav (mobile) — abbreviated set
const BOTTOM_NAV = [
  { to: "/dashboard", label: "Home", Icon: LayoutDashboard },
  { to: "/create-poll", label: "Create", Icon: PlusSquare },
  { to: "/voted-polls", label: "Voted", Icon: CheckCircle2 },
  { to: "/my-polls", label: "Polls", Icon: PenLine },
  { to: "/bookmarked-polls", label: "Saved", Icon: Bookmark },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={ls.container}>
      {/* Top header bar */}
      <header className={ls.header}>
        <div className={ls.headerInner}>
          <Link to="/dashboard" className={ls.logoLink}>
            <img src="/logo-icon.svg" alt="OpinionHub" className="w-7 h-7" />
            <span className={ls.logoSpan}>OpinionHub</span>
          </Link>

          <div className={ls.searchDesktop}>
          </div>

          <div className={ls.rightCluster}>
            <Link to="/create-poll" className={ls.createButton}>
              <PlusSquare size={14} /> Create Poll
            </Link>
            <NotificationBell />
            <Avatar user={user || {}} className={ls.avatarClass} />
          </div>
        </div>
      </header>

      {/* Three-column layout: sidebar | main | right rail */}
      <div className={ls.bodyContainer}>
        <aside className={ls.leftSidebar}>
          <nav className={ls.navContainer}>
            {NAV.map(({ to, label, Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`${ls.sideLinkBase} ${isActive ? ls.sideLinkActive : ls.sideLinkInactive}`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className={ls.sidebarBottom}>
            <button onClick={handleLogout} className={ls.logoutButton}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        <main className={ls.mainContent}>{children}</main>

        <aside className={ls.rightRail}>
          <RightRail />
        </aside>
      </div>

      {/* Bottom tab bar (mobile) */}
      <nav className={ls.bottomNav}>
        {BOTTOM_NAV.map(({ to, label, Icon }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`${ls.bottomLinkBase} ${isActive ? ls.bottomLinkActive : ls.bottomLinkInactive}`}
            >
              <Icon size={20} />
              {label}
              {isActive && <span className={ls.bottomLinkDot} />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
