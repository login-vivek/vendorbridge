import React, { useState } from "react";
import { useAuth } from "../auth/useAuth";
import type { Role } from "../auth/useAuth";

interface Props {
  onSuccess: () => void;
  onGoLogin: () => void;
}

const ROLES: { value: Role; label: string; desc: string }[] = [
  { value: "Procurement Officer", label: "Procurement Officer", desc: "Create RFQs, compare quotes, raise POs" },
  { value: "Vendor",              label: "Vendor",              desc: "Submit quotations, view your POs & invoices" },
  { value: "Manager",             label: "Manager",             desc: "Approve/reject quotations" },
  { value: "Admin",               label: "Admin",               desc: "Full access to everything" },
];

export default function Signup({ onSuccess, onGoLogin }: Props) {
  const { signup, error, clearError } = useAuth();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [role,     setRole]     = useState<Role>("Procurement Officer");
  const [password, setPw]       = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [localErr, setLocalErr] = useState("");

  const displayErr = localErr || error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr("");
    clearError();

    if (!name.trim())         { setLocalErr("Full name is required."); return; }
    if (!email.trim())        { setLocalErr("Email is required."); return; }
    if (password.length < 6)  { setLocalErr("Password must be at least 6 characters."); return; }
    if (password !== confirm)  { setLocalErr("Passwords do not match."); return; }

    setBusy(true);
    const ok = await signup(name.trim(), email.trim().toLowerCase(), password, role);
    setBusy(false);
    if (ok) onSuccess();
  };

  const pw = pwStrength(password);

  return (
    <div style={S.page}>
      <div style={S.card}>

        {/* ── Logo ── */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:30, fontWeight:800, color:"#0f172a", letterSpacing:"-1px" }}>
            Vendor<span style={{ color:"#2563eb" }}>Bridge</span>
          </div>
          <div style={{ fontSize:13, color:"#64748b", marginTop:6 }}>
            Procurement &amp; Vendor Management ERP
          </div>
        </div>

        <div style={{ fontSize:18, fontWeight:700, color:"#0f172a", marginBottom:20 }}>
          Create your account
        </div>

        {/* ── Error ── */}
        {displayErr && (
          <div style={S.errorBox}>⚠ {displayErr}</div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit}>

          {/* Full name */}
          <div style={{ marginBottom:14 }}>
            <label style={S.label}>Full Name</label>
            <input
              style={S.input}
              type="text"
              placeholder="e.g. Kavya Reddy"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom:14 }}>
            <label style={S.label}>Email address</label>
            <input
              style={S.input}
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Role picker */}
          <div style={{ marginBottom:14 }}>
            <label style={S.label}>Role</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {ROLES.map(r => (
                <div
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  style={{
                    padding:"10px 12px",
                    border: `2px solid ${role === r.value ? "#2563eb" : "#e2e8f0"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    background: role === r.value ? "#eff6ff" : "#fff",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize:13, fontWeight:600, color: role === r.value ? "#1d4ed8" : "#111" }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize:11, color:"#94a3b8", marginTop:2, lineHeight:1.4 }}>
                    {r.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom:14 }}>
            <label style={S.label}>
              Password{" "}
              <span style={{ fontWeight:400, color:"#94a3b8", fontSize:12 }}>(min. 6 chars)</span>
            </label>
            <div style={{ position:"relative" }}>
              <input
                style={{ ...S.input, paddingRight:44 }}
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPw(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
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
            {/* strength bar */}
            {password.length > 0 && (
              <div style={{ marginTop:6 }}>
                <div style={{ height:4, borderRadius:2, background:"#f1f5f9", overflow:"hidden" }}>
                  <div style={{
                    height:"100%", borderRadius:2,
                    width: pw.pct + "%",
                    background: pw.color,
                    transition: "width .3s, background .3s",
                  }} />
                </div>
                <span style={{ fontSize:11, color: pw.color, fontWeight:600 }}>{pw.label}</span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div style={{ marginBottom:22 }}>
            <label style={S.label}>Confirm Password</label>
            <input
              style={{
                ...S.input,
                borderColor: confirm && confirm !== password ? "#fca5a5" : "#d1d5db",
              }}
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
            {confirm && confirm !== password && (
              <span style={{ fontSize:11, color:"#dc2626", marginTop:3, display:"block" }}>
                Passwords don't match
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={busy}
            style={{ ...S.primaryBtn, opacity: busy ? 0.65 : 1 }}
          >
            {busy ? "Creating account…" : "Create Account"}
          </button>
        </form>

        {/* ── Switch to login ── */}
        <p style={{ textAlign:"center", fontSize:13, color:"#64748b", marginTop:20 }}>
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => { clearError(); setLocalErr(""); onGoLogin(); }}
            style={S.linkBtn}
          >
            Sign in
          </button>
        </p>

      </div>
    </div>
  );
}

/* ── password strength ── */
function pwStrength(pw: string) {
  let s = 0;
  if (pw.length >= 6)           s++;
  if (pw.length >= 10)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const colors = ["#e2e8f0","#dc2626","#d97706","#2563eb","#16a34a","#16a34a"];
  const labels = ["","Weak","Fair","Good","Strong","Very strong"];
  return { pct: (s / 5) * 100, color: colors[s], label: labels[s] };
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
    maxWidth: 480,
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
