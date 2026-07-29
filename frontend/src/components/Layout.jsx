// WHY: This component wraps all pages after login
// It provides the navbar (top) and sidebar (left) with navigation links
// The main page content appears in the middle area

import { Link, useNavigate, Outlet, useLocation, Navigate } from "react-router-dom";
import { LayoutDashboard, PlusSquare, User, LogOut, BarChart3, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout() {
    const { user, logout, loading } = useAuth();                     // FIX: added loading
    const navigate = useNavigate();
    const location = useLocation();

    // FIX: redirect to /login if not authenticated
    if (!loading && !user) return <Navigate to="/login" replace />;

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navLinks = [
        { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
        { to: "/create-poll", label: "Create", Icon: PlusSquare },
        { to: "/profile", label: "Profile", Icon: User },
        { to: "/analytics", label: "Analytics", Icon: BarChart3 },
        { to: "/settings", label: "Settings", Icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 font-['Inter']">
            {/* Top navbar */}
            <header className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-3 flex items-center justify-between">
                <Link to="/dashboard" className="text-xl font-bold text-emerald-400 font-['Plus_Jakarta_Sans']">
                    Pollify
                </Link>
                <div className="flex items-center gap-4 text-sm">
                    <span className="text-zinc-500">{user?.name || "User"}</span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 text-zinc-400 hover:text-rose-400 transition-colors"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-56 min-h-[calc(100vh-57px)] border-r border-zinc-800 bg-zinc-900/30 p-4 hidden md:block">
                    <nav className="space-y-1">
                        {navLinks.map(({ to, label, Icon }) => {
                            const isActive = location.pathname === to;
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                                        isActive
                                            ? "bg-emerald-500/10 text-emerald-400 font-medium"
                                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                                    }`}
                                >
                                    <Icon size={18} />
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main content */}
                <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
