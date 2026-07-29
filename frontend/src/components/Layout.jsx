import { Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusSquare, PenLine, CheckCircle2, Bookmark, LogOut, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationBell from "../assets/helpers component/NotificationBell.jsx";
import RightRail from "./Sidebar.jsx";
import { Avatar } from "./UIElements.jsx";
import { layoutStyles as ls } from "../assets/dummyStyles";

const NAV = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/create-poll", label: "Create", Icon: PlusSquare },
  { to: "/my-polls", label: "My Polls", Icon: PenLine },
  { to: "/voted-polls", label: "Voted", Icon: CheckCircle2 },
  { to: "/bookmarked-polls", label: "Saved", Icon: Bookmark },
];

const BOTTOM_NAV = [
  { to: "/dashboard", label: "Home", Icon: LayoutDashboard },
  { to: "/create-poll", label: "Create", Icon: PlusSquare },
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
      <header className={ls.header}>
        <div className={ls.headerInner}>
          <Link to="/dashboard" className={ls.logoLink}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 grid place-items-center text-white text-xs font-bold shadow-lg shadow-emerald-500/30">
              P
            </div>
            <span className={ls.logoSpan}>Pollify</span>
          </Link>

          <div className={ls.searchDesktop}>
            <Search size={14} className={ls.searchIcon} />
            <input className={ls.searchInput} placeholder="Search polls..." type="text" />
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

      <nav className={ls.bottomNav}>
        {BOTTOM_NAV.map(({ to, label, Icon }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`${ls.bottomLinkBase} ${isActive ? ls.bottomLinkActive : ls.bottomLinkInactive}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
