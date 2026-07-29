import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
    const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await api.post("/auth/register", form);
            login(res.token, res.user);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const strength = Math.min(4, Math.floor(form.password.length / 3));

    return (
        <div className="min-h-screen bg-zinc-950 flex font-['Inter']">
            <div className="hidden lg:flex w-1/2 bg-zinc-900/50 flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
                <div>
                    <div className="text-3xl font-bold text-emerald-400 font-['Plus_Jakarta_Sans']">Pollify</div>
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold text-white leading-tight font-['Plus_Jakarta_Sans']">
                        Join <span className="text-emerald-400">Pollify</span> Today
                    </h1>
                    <p className="text-zinc-400 mt-4 text-sm max-w-md">
                        Create an account and start making your voice heard.
                    </p>
                </div>
                <div className="text-xs text-zinc-600 relative z-10">Pollify</div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden text-2xl font-bold text-emerald-400 mb-8 font-['Plus_Jakarta_Sans']">Pollify</div>

                    <h2 className="text-2xl font-bold text-white tracking-tight">Create account</h2>
                    <p className="text-zinc-400 mt-1 text-sm">Get started with Pollify</p>

                    {error && (
                        <div className="mt-4 flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3 text-sm text-rose-400">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="mt-6 space-y-4">
                        <div>
                            <label className="text-sm text-zinc-400 mb-1.5 block">Name</label>
                            <input
                                type="text"
                                placeholder="Your name"
                                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 text-sm"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-zinc-400 mb-1.5 block">Username</label>
                            <input
                                type="text"
                                placeholder="username"
                                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 text-sm"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-zinc-400 mb-1.5 block">Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 text-sm"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-zinc-400 mb-1.5 block">Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/50 px-4 py-3 pr-11 text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 text-sm"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {form.password.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-colors ${
                                                strength >= i
                                                    ? i <= 1 ? "bg-rose-500" : i <= 2 ? "bg-amber-500" : i <= 3 ? "bg-lime-500" : "bg-emerald-500"
                                                    : "bg-zinc-700"
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl px-4 py-3 text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/25"
                        >
                            {loading ? "Creating account…" : "Create Account"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-zinc-500">
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
