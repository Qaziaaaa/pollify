import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Mail, ArrowLeft, Lock, KeyRound } from "lucide-react";
import api from "../utils/api.js";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1); // 1 = email, 2 = otp + new password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const sendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await api.post("/auth/forgot-password", { email });
            setStep(2);
        } catch (err) {
            setError(err.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await api.post("/auth/reset-password", { email, otp, newPassword });
            navigate("/login");
        } catch (err) {
            setError(err.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8 font-['Inter']">
            <div className="w-full max-w-sm">
                <div className="text-2xl font-bold text-emerald-400 text-center mb-8 font-['Plus_Jakarta_Sans']">Pollify</div>

                {/* Steps indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2].map((s) => (
                        <div key={s} className={`w-2.5 h-2.5 rounded-full ${step >= s ? "bg-emerald-500" : "bg-zinc-700"}`} />
                    ))}
                </div>

                {error && (
                    <div className="mb-4 flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3 text-sm text-rose-400">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Step 1: Enter email */}
                {step === 1 && (
                    <>
                        <h2 className="text-2xl font-bold text-white text-center">Forgot password?</h2>
                        <p className="text-zinc-400 text-sm text-center mt-2">Enter your email to receive a reset code</p>
                        <form onSubmit={sendOtp} className="mt-6 space-y-4">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/50 pl-10 pr-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl px-4 py-3 text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/25"
                            >
                                {loading ? "Sending…" : "Send Reset Code"}
                            </button>
                        </form>
                    </>
                )}

                {/* Step 2: Enter OTP + New Password */}
                {step === 2 && (
                    <>
                        <h2 className="text-2xl font-bold text-white text-center">Reset password</h2>
                        <p className="text-zinc-400 text-sm text-center mt-2">Enter the code sent to {email} and your new password</p>
                        <form onSubmit={resetPassword} className="mt-6 space-y-4">
                            <input
                                type="text"
                                placeholder="Reset code"
                                maxLength={6}
                                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/50 pl-10 pr-4 py-3 text-center text-xl tracking-[6px] text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 text-sm"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                required
                            />
                            <KeyRound size={15} className="absolute left-3.5 top-[78px] text-zinc-500" />
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="New password"
                                    className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/50 pl-10 pr-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 text-sm"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    minLength={8}
                                    required
                                />
                                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6 || newPassword.length < 8}
                                className="w-full rounded-xl px-4 py-3 text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/25"
                            >
                                {loading ? "Resetting…" : "Reset Password"}
                            </button>
                        </form>
                    </>
                )}

                <p className="mt-6 text-center text-sm text-zinc-500">
                    <Link to="/login" className="flex items-center justify-center gap-1 text-emerald-400 hover:text-emerald-300">
                        <ArrowLeft size={14} /> Back to login
                    </Link>
                </p>
            </div>
        </div>
    );
}
