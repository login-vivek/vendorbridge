import React, { useState } from "react";
import { useAuth } from "../auth/useAuth";

interface Props {
  onSuccess: () => void;
  onGoSignup: () => void;
}

export default function Login({ onSuccess, onGoSignup }: Props) {
  const { login, error, clearError } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [busy,     setBusy]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    const ok = await login(email.trim().toLowerCase(), password);
    setBusy(false);
    if (ok) onSuccess();
  };

  const fillDemo = (em: string) => {
    setEmail(em);
    setPassword("demo1234");
    clearError();
  };

  return (
    <div style={S.page}>
      <div style={S.card}>

        {/* ── Logo ── */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:30, fontWeight:800, color:"#0f172a", letterSpacing:"-1px" }}>
            Vendor<span style={{ color:"#2563eb" }}>Bridge</span>
          </div>
          <div style={{ fontSize:13, color:"#64748b", marginTop:6 }}>
            Procurement &amp; Vendor Management ERP
          </div>
        </div>

        <div style={{ fontSize:18, fontWeight:700, color:"#0f172a", marginBottom:20 }}>
          Sign in to your account
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={S.errorBox}>
            ⚠ {error}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom:16 }}>
            <label style={S.label}>Email address</label>
            <input
              style={S.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom:20 }}>
            <label style={S.label}>Password</label>
            <div style={{ position:"relative" }}>
              <input
                style={{ ...S.input, paddingRight:44 }}
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPw(v => !v)}
                style={S.eyeBtn}
              >
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={busy}
            style={{ ...S.primaryBtn, opacity: busy ? 0.65 : 1 }}
          >
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* ── Demo accounts ── */}
        <div style={S.demoBox}>
          <div style={{ fontSize:12, fontWeight:700, color:"#0369a1", marginBottom:10 }}>
            🔑 Demo accounts &nbsp;·&nbsp; password:{" "}
            <code style={{ background:"#dbeafe", padding:"1px 6px", borderRadius:4, fontSize:12 }}>
              demo1234
            </code>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
            {([
              ["officer@demo.com",  "👩‍💼 Officer"],
              ["vendor@demo.com",   "🏢 Vendor"],
              ["manager@demo.com",  "👔 Manager"],
              ["admin@demo.com",    "🛡 Admin"],
            ] as [string, string][]).map(([em, label]) => (
              <button
                key={em}
                type="button"
                onClick={() => fillDemo(em)}
                style={{
                  ...S.demoBtn,
                  background: email === em ? "#dbeafe" : "#fff",
                  borderColor: email === em ? "#93c5fd" : "#bfdbfe",
                  fontWeight: email === em ? 700 : 400,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Switch to signup ── */}
        <p style={{ textAlign:"center", fontSize:13, color:"#64748b", marginTop:20 }}>
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => { clearError(); onGoSignup(); }}
            style={S.linkBtn}
          >
            Sign up free
          </button>
        </p>

      </div>
    </div>
  );
}

/* ── styles ── */
const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 60%, #f0fdf4 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 14,
    padding: "36px 40px",
    width: "100%",
    maxWidth: 440,
    boxShadow: "0 4px 32px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #e2e8f0",
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    display: "block",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "10px 13px",
    border: "1.5px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    background: "#fff",
    boxSizing: "border-box" as const,
    color: "#111",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  },
  eyeBtn: {
    position: "absolute" as const,
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 17,
    color: "#9ca3af",
    lineHeight: 1,
    padding: 0,
  },
  primaryBtn: {
    width: "100%",
    padding: "11px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  errorBox: {
    background: "#fef2f2",
    border: "1.5px solid #fca5a5",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "#dc2626",
    marginBottom: 16,
  },
  demoBox: {
    marginTop: 22,
    padding: "14px 16px",
    background: "#f0f9ff",
    borderRadius: 10,
    border: "1px solid #bae6fd",
  },
  demoBtn: {
    fontSize: 12,
    padding: "6px 10px",
    border: "1px solid #bfdbfe",
    borderRadius: 6,
    cursor: "pointer",
    color: "#1d4ed8",
    textAlign: "left" as const,
    transition: "all 0.1s",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13,
    padding: 0,
    textDecoration: "underline",
    textUnderlineOffset: 2,
  },
};
