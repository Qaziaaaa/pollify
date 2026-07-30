// ===== FORGOT PASSWORD PAGE =====
// Multi-step flow: enter email → verify OTP → set new password → done.
// Reuses the OtpStep component for code entry.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import api from "../utils/api.js";
import OtpStep from "../assets/helpers component/OtpStep.jsx";
import { authLayoutStyles as ls, forgotPasswordStyles as s } from "../assets/dummyStyles";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("email"); // email | otp | reset | done
  const [showPw, setShowPw] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setStep("otp");
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (otp) => {
    setError("");
    await api.post("/auth/verify-reset-otp", { email, otp });
    setVerifiedOtp(otp);
    setStep("reset");
  };

  const handleOtpResend = async () => {
    await api.post("/auth/forgot-password", { email });
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, otp: verifiedOtp, newPassword });
      setStep("done");
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={ls.container}>
      <div className={ls.leftPanel}>
        <div className={ls.glowTop} />
        <div className={ls.glowBottom} />
          <div className={ls.logoContainer}>
            <img src="/logo.svg" alt="OpinionHub" className="h-9 object-contain" />
          </div>
        <div className={ls.mainCopyContainer}>
          <div className={ls.mainCopyInner}>
            <h1 className={ls.heading}>
              Reset Your <span className={ls.emeraldText}>Password</span>
            </h1>
            <p className={ls.description}>
              No worries, we'll send you reset instructions.
            </p>
          </div>
        </div>
        <div className={ls.footer}>OpinionHub</div>
      </div>

      <div className={ls.rightPanel}>
        <div className="w-full max-w-sm">

          {step === "email" && (
            <>
              <div className="mb-8">
                <h2 className="text-[28px] font-bold text-white tracking-tight">Forgot password?</h2>
                <p className="text-zinc-400 mt-2 text-sm">Enter your email to receive a reset code</p>
              </div>
              {error && (
                <div className={s.errorBox}>
                  <AlertCircle size={14} className={s.errorIcon} />
                  <span className={s.errorText}>{error}</span>
                </div>
              )}
              <form onSubmit={handleSendOtp}>
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide block">Email</label>
                  <input type="email" placeholder="you@example.com" className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/60 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-lg shadow-emerald-500/25">
                  {loading ? "Sending…" : "Send Reset Code"}
                </button>
              </form>
              <div className="mt-7 text-sm text-center text-zinc-500">
                <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">Back to sign in</Link>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="mb-8">
                <h2 className="text-[28px] font-bold text-white tracking-tight">Check your email</h2>
                <p className="text-zinc-400 mt-2 text-sm">Enter the code sent to your email</p>
              </div>
              {error && (
                <div className={s.errorBox}>
                  <AlertCircle size={14} className={s.errorIcon} />
                  <span className={s.errorText}>{error}</span>
                </div>
              )}
              <OtpStep email={email} onSubmit={handleOtpSubmit} onResend={handleOtpResend} submitText="Verify" />
            </>
          )}

          {step === "reset" && (
            <>
              <div className="mb-8">
                <h2 className="text-[28px] font-bold text-white tracking-tight">Set new password</h2>
                <p className="text-zinc-400 mt-2 text-sm">Must be at least 8 characters</p>
              </div>
              {error && (
                <div className={s.errorBox}>
                  <AlertCircle size={14} className={s.errorIcon} />
                  <span className={s.errorText}>{error}</span>
                </div>
              )}
              <form onSubmit={handleReset}>
                <div className="space-y-1.5 mb-6">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide block">New Password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} placeholder="••••••••" className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/50 px-4 py-3 pr-11 text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/60 text-sm" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-lg shadow-emerald-500/25">
                  {loading ? "Resetting…" : "Reset Password"}
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-[22px] font-bold text-white tracking-tight mb-2">Password reset!</h2>
              <p className="text-zinc-400 text-sm mb-8">Your password has been updated successfully.</p>
              <button onClick={() => navigate("/login")} className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25">Sign in</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
