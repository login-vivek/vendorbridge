import { useState } from "react";
import { AuthProvider } from "./auth/AuthContext";
import { useAuth } from "./auth/useAuth";
import { useStore } from "./store/useStore";
import { api, norm } from "./api/client";
import { NAV_LABELS, NAV_ICONS } from "./data/seed";

import Login      from "./components/Login";
import Signup     from "./components/Signup";
import Dashboard  from "./components/Dashboard";
import Vendors    from "./components/Vendors";
import RFQs       from "./components/RFQs";
import Quotations from "./components/Quotations";
import Compare    from "./components/Compare";
import Approvals  from "./components/Approvals";
import POs        from "./components/POs";
import Invoices   from "./components/Invoices";
import Logs       from "./components/Logs";
import Reports    from "./components/Reports";

const PAGE_KEY = "vb_current_page";

const ROLE_NAV: Record<string, string[]> = {
  "Procurement Officer": ["dashboard","vendors","rfqs","quotations","compare","pos","invoices","logs","reports"],
  "Vendor":              ["dashboard","quotations","pos","invoices"],
  "Manager":             ["dashboard","approvals","rfqs","pos","reports","logs"],
  "Admin":               ["dashboard","vendors","rfqs","quotations","compare","pos","invoices","logs","reports"],
};

/* ── Spinner ── */
const Spinner = ({ label }: { label?: string }) => (
  <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#f3f4f6", fontFamily:"system-ui,sans-serif", gap:16 }}>
    <div style={{ fontSize:24, fontWeight:800, color:"#111" }}>Vendor<span style={{ color:"#2563eb" }}>Bridge</span></div>
    <div style={{ width:36, height:36, border:"3px solid #e5e7eb", borderTopColor:"#2563eb", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
    {label && <div style={{ fontSize:13, color:"#6b7280" }}>{label}</div>}
    <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
  </div>
);

/* ══════════════════════════════════════════
   Root — store lives outside auth so it
   never remounts across login/logout
══════════════════════════════════════════ */
export default function App() {
  const store = useStore();
  return (
    <AuthProvider>
      <Inner store={store} />
    </AuthProvider>
  );
}

/* ══════════════════════════════════════════
   Inner
══════════════════════════════════════════ */
function Inner({ store }: { store: ReturnType<typeof useStore> }) {
  const { user, ready, logout } = useAuth();
  const [authView, setAuthView] = useState<"login" | "signup">("login");

  const [page, setPageState] = useState<string>(() => {
    try { return localStorage.getItem(PAGE_KEY) || "dashboard"; } catch { return "dashboard"; }
  });

  const setPage = (p: string) => {
    setPageState(p);
    try { localStorage.setItem(PAGE_KEY, p); } catch { /* ignore */ }
  };

  const {
    vendors, setVendors,
    rfqs,    setRfqs,
    quotations, setQuotations,
    pos,     setPOs,
    invoices, setInvoices,
    approvals, setApprovals,
    logs,
    addLog,
    refreshAll,
    loading,
  } = store;

  /* ── auth not ready yet ── */
  if (!ready) return <Spinner label="Loading…" />;

  /* ── not logged in ── */
  if (!user) {
    if (authView === "signup")
      return <Signup onSuccess={() => { refreshAll(); setPage("dashboard"); }} onGoLogin={() => setAuthView("login")} />;
    return <Login onSuccess={() => { refreshAll(); setPage("dashboard"); }} onGoSignup={() => setAuthView("signup")} />;
  }

  /* ── data still loading ── */
  if (loading) return <Spinner label="Fetching data…" />;

  const navItems  = ROLE_NAV[user.role] ?? ROLE_NAV["Procurement Officer"];
  const activePage = navItems.includes(page) ? page : "dashboard";
  const appUser   = { ...user };
  const shared    = { vendors, rfqs, quotations, pos, invoices, approvals };

  /* ── API-backed setters passed to components ── */

  /* Vendors */
  const handleCreateVendor = async (data: any) => {
    const v = norm(await api.createVendor(data));
    setVendors(vs => [v, ...vs]);
    addLog("Vendor Registered", v.name, user.id);
  };
  const handleUpdateVendor = async (id: string, data: any) => {
    const v = norm(await api.updateVendor(id, data));
    setVendors(vs => vs.map(x => x.id === id ? v : x));
  };

  /* RFQs */
  const handleCreateRfq = async (data: any) => {
    const r = norm(await api.createRfq(data));
    setRfqs(rs => [r, ...rs]);
    addLog("RFQ Created", `${r.id}: ${r.title}`, user.id);
  };
  const handleUpdateRfq = async (id: string, data: any) => {
    const r = norm(await api.updateRfq(id, data));
    setRfqs(rs => rs.map(x => x.id === id ? r : x));
  };

  /* Quotations */
  const handleCreateQuotation = async (data: any) => {
    const q = norm(await api.createQuotation(data));
    setQuotations(qs => [q, ...qs]);
    setRfqs(rs => rs.map(r => r.id === data.rfqId ? { ...r, status: "Quoted" } : r));
    addLog("Quotation Submitted", `${q.id} for ${data.rfqId}`, user.id);
  };
  const handleUpdateQuotation = async (id: string, data: any) => {
    const q = norm(await api.updateQuotation(id, data));
    setQuotations(qs => qs.map(x => x.id === id ? q : x));
  };

  /* Approvals */
  const handleCreateApproval = async (data: any) => {
    const a = norm(await api.createApproval(data));
    setApprovals(as => [a, ...as]);
    setQuotations(qs => qs.map(q => q.id === data.quotationId ? { ...q, status: "Pending Approval" } : q));
    addLog("Sent for Approval", data.quotationId, user.id);
  };
  const handleUpdateApproval = async (id: string, data: any) => {
    const a = norm(await api.updateApproval(id, data));
    setApprovals(as => as.map(x => x.id === id ? a : x));
    setQuotations(qs => qs.map(q => q.id === a.quotationId ? { ...q, status: a.status } : q));
    if (a.status === "Approved") {
      /* PO was auto-created on server — refresh POs */
      api.getPOs().then(ps => setPOs(norm(ps)));
    }
    addLog(`Quotation ${a.status}`, a.quotationId, user.id);
  };

  /* Invoices */
  const handleCreateInvoice = async (data: any) => {
    const inv = norm(await api.createInvoice(data));
    setInvoices(is => [inv, ...is]);
    setPOs(ps => ps.map(p => p.id === data.poId ? { ...p, status: "Invoiced" } : p));
    addLog("Invoice Generated", inv.id, user.id);
  };
  const handleUpdateInvoice = async (id: string, data: any) => {
    const inv = norm(await api.updateInvoice(id, data));
    setInvoices(is => is.map(x => x.id === id ? inv : x));
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard {...shared} user={appUser} onNav={setPage} />;
      case "vendors":
        return <Vendors
          vendors={vendors}
          setVendors={setVendors}
          addLog={addLog}
          onCreateVendor={handleCreateVendor}
          onUpdateVendor={handleUpdateVendor}
        />;
      case "rfqs":
        return <RFQs
          rfqs={rfqs}
          setRfqs={setRfqs}
          vendors={vendors}
          user={appUser}
          addLog={addLog}
          onCreateRfq={handleCreateRfq}
          onUpdateRfq={handleUpdateRfq}
        />;
      case "quotations":
        return <Quotations
          quotations={quotations}
          setQuotations={setQuotations}
          rfqs={rfqs}
          setRfqs={setRfqs}
          vendors={vendors}
          user={appUser}
          addLog={addLog}
          approvals={approvals}
          setApprovals={setApprovals}
          onCreateQuotation={handleCreateQuotation}
          onUpdateQuotation={handleUpdateQuotation}
          onCreateApproval={handleCreateApproval}
        />;
      case "compare":
        return <Compare quotations={quotations} rfqs={rfqs} vendors={vendors} />;
      case "approvals":
        return <Approvals
          approvals={approvals}
          setApprovals={setApprovals}
          quotations={quotations}
          setQuotations={setQuotations}
          rfqs={rfqs}
          vendors={vendors}
          setPOs={setPOs}
          user={appUser}
          addLog={addLog}
          onUpdateApproval={handleUpdateApproval}
        />;
      case "pos":
        return <POs
          pos={pos}
          vendors={vendors}
          invoices={invoices}
          setInvoices={setInvoices}
          user={appUser}
          addLog={addLog}
          onCreateInvoice={handleCreateInvoice}
        />;
      case "invoices":
        return <Invoices
          invoices={invoices}
          setInvoices={setInvoices}
          vendors={vendors}
          user={appUser}
          addLog={addLog}
          onUpdateInvoice={handleUpdateInvoice}
        />;
      case "logs":
        return <Logs logs={logs} />;
      case "reports":
        return <Reports vendors={vendors} rfqs={rfqs} quotations={quotations} pos={pos} invoices={invoices} />;
      default:
        return <Dashboard {...shared} user={appUser} onNav={setPage} />;
    }
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f3f4f6", fontFamily:"system-ui,sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside style={{ width:220, background:"#fff", borderRight:"1px solid #e5e7eb", display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"20px 16px 12px", borderBottom:"1px solid #e5e7eb" }}>
          <div style={{ fontSize:18, fontWeight:800, color:"#111" }}>
            Vendor<span style={{ color:"#2563eb" }}>Bridge</span>
          </div>
          <div style={{ fontSize:11, color:"#6b7280", marginTop:2 }}>Procurement ERP</div>
        </div>

        <nav style={{ flex:1, padding:"8px 0", overflowY:"auto" }}>
          {navItems.map(key => (
            <button key={key} onClick={() => setPage(key)}
              style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"9px 16px", border:"none", textAlign:"left", cursor:"pointer", fontSize:14,
                background: activePage===key ? "#eff6ff" : "none",
                color:      activePage===key ? "#2563eb" : "#374151",
                fontWeight: activePage===key ? 600 : 400,
                borderLeft: activePage===key ? "3px solid #2563eb" : "3px solid transparent",
              }}>
              <span style={{ fontSize:16 }}>{NAV_ICONS[key]}</span>
              {NAV_LABELS[key]}
            </button>
          ))}
        </nav>

        <div style={{ padding:"12px 16px", borderTop:"1px solid #e5e7eb" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"#2563eb", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12, flexShrink:0 }}>
              {user.avatar}
            </div>
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#111", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</div>
              <div style={{ fontSize:11, color:"#6b7280" }}>{user.role}</div>
            </div>
          </div>
          <button onClick={() => { logout(); setPageState("dashboard"); setAuthView("login"); }}
            style={{ width:"100%", padding:"7px", background:"#f3f4f6", border:"1px solid #e5e7eb", borderRadius:6, fontSize:13, cursor:"pointer", color:"#374151", marginBottom:6 }}>
            Sign Out
          </button>
          <button onClick={refreshAll}
            style={{ width:"100%", padding:"5px", background:"none", border:"1px dashed #d1d5db", borderRadius:5, fontSize:11, cursor:"pointer", color:"#9ca3af" }}>
            ↺ Refresh data
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex:1, padding:24, overflowY:"auto" }}>
        {renderPage()}
      </main>
    </div>
  );
}
