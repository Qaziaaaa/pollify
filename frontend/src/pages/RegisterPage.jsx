// ===== REGISTER PAGE =====
// Multi-step registration: form → OTP verification → success screen.
// Submits account details, sends OTP email, then verifies the code.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import api from "../utils/api.js";
import OtpStep from "../assets/helpers component/OtpStep.jsx";
import { authLayoutStyles as ls, signupStyles as s } from "../assets/dummyStyles";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form"); // form | otp | done
  const [regEmail, setRegEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      setRegEmail(res.email || form.email);
      setStep("otp");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (otp) => {
    await api.post("/auth/verify", { email: regEmail, otp });
    setStep("done");
  };

  const handleOtpResend = async () => {
    await api.post("/auth/register", form);
  };

  const strength = Math.min(4, Math.floor(form.password.length / 3));

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
              Join <span className={ls.emeraldText}>OpinionHub</span> Today
            </h1>
            <p className={ls.description}>
              Create an account and start making your voice heard.
            </p>
          </div>
        </div>
        <div className={ls.footer}>OpinionHub</div>
      </div>

      <div className={ls.rightPanel}>
        <div className="w-full max-w-sm">

          {step === "form" && (
            <>
              <div className="mb-8">
                <h2 className="text-[28px] font-bold text-white tracking-tight">Create account</h2>
                <p className="text-zinc-400 mt-2 text-sm">Get started with OpinionHub</p>
              </div>

              {error && (
                <div className={s.errorBox}>
                  <AlertCircle size={14} className={s.errorIcon} />
                  <span className={s.errorText}>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className={s.form}>
                <div className={s.field}>
                  <label className={s.label}>Name</label>
                  <input type="text" placeholder="Your name" className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/60 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className={s.field}>
                  <label className={s.label}>Username</label>
                  <input type="text" placeholder="username" className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/60 text-sm" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                </div>
                <div className={s.field}>
                  <label className={s.label}>Email</label>
                  <input type="email" placeholder="you@example.com" className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/50 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/60 text-sm" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className={s.field}>
                  <label className={s.label}>Password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} placeholder="••••••••" className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/50 px-4 py-3 pr-11 text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/60 text-sm" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                    <button type="button" onClick={() => setShowPw(!showPw)} className={s.toggleButton}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {form.password.length > 0 && (
                    <div className={s.strengthContainer}>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`${s.strengthBarBase} ${strength >= i ? i <= 1 ? s.strengthWeak : i <= 2 ? s.strengthMedium : i <= 3 ? s.strengthStrong : s.strengthVeryStrong : s.strengthInactive}`} />
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all shadow-lg shadow-emerald-500/25">
                  {loading ? "Creating account…" : "Create Account"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-zinc-500">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                  Sign in
                </Link>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="mb-8">
                <h2 className="text-[28px] font-bold text-white tracking-tight">Verify your email</h2>
                <p className="text-zinc-400 mt-2 text-sm">Enter the code sent to your email</p>
              </div>
              {error && (
                <div className={s.errorBox}>
                  <AlertCircle size={14} className={s.errorIcon} />
                  <span className={s.errorText}>{error}</span>
                </div>
              )}
              <OtpStep email={regEmail} onSubmit={handleOtpSubmit} onResend={handleOtpResend} />
            </>
          )}

          {step === "done" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-[22px] font-bold text-white tracking-tight mb-2">Email verified!</h2>
              <p className="text-zinc-400 text-sm mb-8">Your account is ready. Sign in to get started.</p>
              <button onClick={() => navigate("/login")} className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25">
                Sign in
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
