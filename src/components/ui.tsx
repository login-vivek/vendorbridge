import React from "react";

/* ── helpers ── */
export const fmt  = (n: number) => "₹" + Number(n).toLocaleString("en-IN");
export const fmtD = (d: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";
export const uid  = (p: string) => p + "-" + Date.now().toString(36).toUpperCase();

/* ── badge ── */
const BADGE_COLORS: Record<string, string> = {
  Active:"#16a34a", Inactive:"#dc2626", Open:"#2563eb", Quoted:"#d97706",
  Approved:"#16a34a", Rejected:"#dc2626", Pending:"#d97706", Submitted:"#7c3aed",
  Invoiced:"#0891b2", Sent:"#0891b2", Draft:"#6b7280", Closed:"#6b7280",
  "Pending Approval":"#d97706",
};
export const Badge = ({ s }: { s: string }) => {
  const c = BADGE_COLORS[s] || "#6b7280";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:99, fontSize:12, fontWeight:600, background:c+"18", color:c, border:`1px solid ${c}44` }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:c, display:"inline-block" }} />
      {s}
    </span>
  );
};

/* ── modal ── */
export const Modal = ({ title, onClose, children, wide }: { title:string; onClose:()=>void; children:React.ReactNode; wide?:boolean }) => (
  <div
    style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:16 }}
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div
      style={{ background:"#fff", borderRadius:8, padding:24, width:"100%", maxWidth:wide?680:500, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 8px 30px rgba(0,0,0,0.15)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h3 style={{ fontSize:17, fontWeight:700, color:"#111", margin:0 }}>{title}</h3>
        <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#888", lineHeight:1, padding:"0 4px" }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

/* ── form helpers ── */
// Returns a fresh style object every call so React always treats it as a new value
export const inp: React.CSSProperties = {
  width:"100%", padding:"8px 10px", border:"1px solid #d1d5db", borderRadius:6,
  fontSize:14, outline:"none", background:"#fff", boxSizing:"border-box",
  color:"#111", fontFamily:"inherit",
};
const lbl: React.CSSProperties = { fontSize:13, fontWeight:600, color:"#374151", marginBottom:3, display:"block" };

export const FG = ({ label, children }: { label?:string; children:React.ReactNode }) => (
  <div style={{ marginBottom:12 }}>
    {label && <label style={lbl}>{label}</label>}
    {children}
  </div>
);
export const Row2 = ({ children }: { children:React.ReactNode }) => (
  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>{children}</div>
);

/* ── buttons ── */
type BtnProps = { onClick?:()=>void; children:React.ReactNode; style?:React.CSSProperties };
export const BtnPrimary   = ({ onClick, children, style }: BtnProps) => <button onClick={onClick} style={{ padding:"8px 16px", background:"#2563eb", color:"#fff", border:"none", borderRadius:6, fontSize:14, fontWeight:600, cursor:"pointer", ...style }}>{children}</button>;
export const BtnSecondary = ({ onClick, children, style }: BtnProps) => <button onClick={onClick} style={{ padding:"8px 16px", background:"#fff", color:"#374151", border:"1px solid #d1d5db", borderRadius:6, fontSize:14, cursor:"pointer", ...style }}>{children}</button>;
export const BtnDanger    = ({ onClick, children, style }: BtnProps) => <button onClick={onClick} style={{ padding:"8px 16px", background:"#dc2626", color:"#fff", border:"none", borderRadius:6, fontSize:14, fontWeight:600, cursor:"pointer", ...style }}>{children}</button>;
export const BtnSuccess   = ({ onClick, children, style }: BtnProps) => <button onClick={onClick} style={{ padding:"8px 16px", background:"#16a34a", color:"#fff", border:"none", borderRadius:6, fontSize:14, fontWeight:600, cursor:"pointer", ...style }}>{children}</button>;
export const BtnGhost     = ({ onClick, children, style }: BtnProps) => <button onClick={onClick} style={{ padding:"5px 10px", background:"none", color:"#2563eb", border:"1px solid #bfdbfe", borderRadius:5, fontSize:13, cursor:"pointer", ...style }}>{children}</button>;

/* ── table ── */
export const Tbl = ({ cols, rows, empty }: { cols:string[]; rows:React.ReactNode[]; empty?:string }) => (
  <div style={{ overflowX:"auto" }}>
    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
      <thead>
        <tr style={{ background:"#f9fafb" }}>
          {cols.map(c => <th key={c} style={{ padding:"9px 12px", textAlign:"left", fontSize:12, fontWeight:700, color:"#6b7280", borderBottom:"1px solid #e5e7eb", whiteSpace:"nowrap" }}>{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0
          ? <tr><td colSpan={cols.length} style={{ padding:"32px", textAlign:"center", color:"#9ca3af", fontSize:14 }}>{empty || "No data found"}</td></tr>
          : rows}
      </tbody>
    </table>
  </div>
);

export const TD = ({ children, bold, mono, muted }: { children:React.ReactNode; bold?:boolean; mono?:boolean; muted?:boolean }) => (
  <td style={{ padding:"10px 12px", borderBottom:"1px solid #f3f4f6", color:muted?"#9ca3af":bold?"#111":"#374151", fontWeight:bold?600:400, fontFamily:mono?"monospace":"inherit", fontSize:14, verticalAlign:"middle" }}>
    {children}
  </td>
);

/* ── page header ── */
export const PH = ({ title, sub, action }: { title:string; sub?:string; action?:React.ReactNode }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
    <div>
      <h2 style={{ fontSize:20, fontWeight:700, color:"#111", margin:0 }}>{title}</h2>
      {sub && <p style={{ fontSize:13, color:"#6b7280", margin:"3px 0 0" }}>{sub}</p>}
    </div>
    {action}
  </div>
);

/* ── stat card ── */
export const Stat = ({ label, value, color }: { label:string; value:string|number; color?:string }) => (
  <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:"16px 20px", borderLeft:`4px solid ${color||"#2563eb"}` }}>
    <div style={{ fontSize:12, color:"#6b7280", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:6 }}>{label}</div>
    <div style={{ fontSize:26, fontWeight:700, color:"#111" }}>{value}</div>
  </div>
);