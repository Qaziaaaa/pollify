// WHY: Login page with two sections
// Left side: Brand info (Pollify logo, description)
// Right side: Email + password form

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await api.post("/auth/login", form);
            login(res.token, res.user);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex font-['Inter']">
            {/* Left panel */}
            <div className="hidden lg:flex w-1/2 bg-zinc-900/50 flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
                <div>
                    <div className="text-3xl font-bold text-emerald-400 font-['Plus_Jakarta_Sans']">Pollify</div>
                </div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-xs text-emerald-400 mb-6">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> LIVE
                    </div>
                    <h1 className="text-4xl font-bold text-white leading-tight font-['Plus_Jakarta_Sans']">
                        Create <span className="text-emerald-400">Polls</span><br />That Matter
                    </h1>
                    <p className="text-zinc-400 mt-4 text-sm max-w-md">
                        Gather opinions, make decisions, and discover what people really think.
                    </p>
                    <div className="flex gap-8 mt-10">
                        {[
                            { v: "50K+", l: "Members" },
                            { v: "2M+", l: "Votes" },
                            { v: "500K+", l: "Polls" },
                        ].map((s) => (
                            <div key={s.l}>
                                <div className="text-2xl font-bold text-white">{s.v}</div>
                                <div className="text-xs text-zinc-500">{s.l}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="text-xs text-zinc-600 relative z-10">Pollify</div>
            </div>

            {/* Right panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden text-2xl font-bold text-emerald-400 mb-8 font-['Plus_Jakarta_Sans']">Pollify</div>

                    <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
                    <p className="text-zinc-400 mt-1 text-sm">Sign in to continue to Pollify</p>

                    {error && (
                        <div className="mt-4 flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3 text-sm text-rose-400">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div>
                            <label className="text-sm text-zinc-400 mb-1.5 block">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/50 pl-10 pr-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/60 text-sm"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1.5">
                                <label className="text-sm text-zinc-400">Password</label>
                                <Link to="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPw ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/50 pl-10 pr-11 py-3 text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/60 text-sm"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl px-4 py-3 text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/25"
                        >
                            {loading ? "Signing in…" : "Sign In"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-zinc-500">
                        Don't have an account?{" "}
                        <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
