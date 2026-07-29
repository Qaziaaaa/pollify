import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Info } from "lucide-react";
import api from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { AuthButton } from "../components/UIElements.jsx";
import { authLayoutStyles as ls, loginStyles as s } from "../assets/dummyStyles";

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
    <div className={ls.container}>
      <div className={ls.leftPanel}>
        <div className={ls.glowTop} />
        <div className={ls.glowBottom} />
        <div className={ls.logoContainer}>
          <div className={ls.logoText}>Pollify</div>
        </div>
        <div className={ls.mainCopyContainer}>
          <div className={ls.liveBadge}>
            <span className={ls.dot} /> LIVE
          </div>
          <div className={ls.mainCopyInner}>
            <h1 className={ls.heading}>
              Create <span className={ls.emeraldText}>Polls</span> That Matter
            </h1>
            <p className={ls.description}>
              Gather opinions, make decisions, and discover what people really think.
            </p>
          </div>
          <div className={ls.statsGrid}>
            {[
              { v: "50K+", l: "Members" },
              { v: "2M+", l: "Votes" },
              { v: "500K+", l: "Polls" },
            ].map((s) => (
              <div key={s.l} className={ls.statCard}>
                <div className={ls.statValue}>{s.v}</div>
                <div className={ls.statLabel}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={ls.footer}>Pollify</div>
      </div>

      <div className={ls.rightPanel}>
        <div className="w-full max-w-sm">
          <div className={ls.mobileLogoContainer}>
            <div className={ls.mobileLogoText}>Pollify</div>
          </div>
          <div className="mb-8">
            <h2 className="text-[28px] font-bold text-white tracking-tight leading-tight">Welcome back</h2>
            <p className="text-zinc-400 mt-2 text-sm">Sign in to continue to Pollify</p>
          </div>

          {error && (
            <div className={s.error}>
              <AlertCircle size={14} className={s.errorIcon} />
              <span className={s.errorText}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={s.form}>
            <div className={s.field}>
              <label className={s.label}>Email</label>
              <div className={s.inputWrapper}>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={`${s.input} ${s.inputWithIcon}`}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <Mail size={14} className={s.icon} />
              </div>
            </div>
            <div className={s.field}>
              <div className={s.passwordRow}>
                <label className={s.label}>Password</label>
                <Link to="/forgot-password" className={s.forgotLink}>Forgot?</Link>
              </div>
              <div className={s.inputWrapper}>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  className={`${s.input} ${s.inputWithIcon}`}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className={s.toggleButton}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className={s.submitButton}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
