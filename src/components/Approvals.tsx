import { useState } from "react";
import { fmt, inp, FG, Badge, BtnSuccess, BtnDanger, PH } from "./ui";

export default function Approvals({ approvals, quotations, rfqs, vendors, onUpdateApproval }: any) {
  const [sel, setSel]         = useState<any>(null);
  const [remarks, setRemarks] = useState("");
  const [busy, setBusy]       = useState(false);

  const decide = async (apr: any, decision: string) => {
    setBusy(true);
    try {
      await onUpdateApproval(apr.id, { status: decision, remarks });
      setSel(null);
      setRemarks("");
    } catch (err: any) {
      alert(err.message || "Failed to update approval");
    } finally { setBusy(false); }
  };

  const pending = approvals.filter((a: any) => a.status === "Pending");
  const done    = approvals.filter((a: any) => a.status !== "Pending");

  return (
    <div>
      <PH title="Approval Workflow" sub={`${pending.length} pending`} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>

        {/* Left: list */}
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>Pending ({pending.length})</div>
          {pending.length === 0 && <p style={{ color:"#9ca3af", fontSize:13 }}>No pending approvals 🎉</p>}
          {pending.map((a: any) => {
            const q   = quotations.find((x: any) => x.id === a.quotationId);
            const rfq = rfqs.find((r: any) => r.id === a.rfqId);
            const v   = vendors.find((x: any) => x.id === q?.vendorId);
            return (
              <div key={a.id} onClick={() => setSel(a)}
                style={{ padding:12, border:`1px solid ${sel?.id===a.id?"#2563eb":"#e5e7eb"}`, borderRadius:6, marginBottom:8, cursor:"pointer", background:sel?.id===a.id?"#eff6ff":"#fff" }}>
                <div style={{ fontWeight:600, fontSize:14, color:"#111" }}>{rfq?.title || a.rfqId}</div>
                <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>{v?.name} · {fmt(q?.totalPrice || 0)}</div>
                <div style={{ marginTop:6 }}><Badge s={a.status} /></div>
              </div>
            );
          })}
          {done.length > 0 && (
            <>
              <div style={{ fontWeight:700, fontSize:14, margin:"16px 0 10px", color:"#6b7280" }}>Decisions</div>
              {done.map((a: any) => (
                <div key={a.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f3f4f6", fontSize:13 }}>
                  <span style={{ color:"#374151" }}>{a.quotationId}</span>
                  <Badge s={a.status} />
                </div>
              ))}
            </>
          )}
        </div>

        {/* Right: review panel */}
        <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
          {!sel && <p style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:"40px 0" }}>← Select an approval to review</p>}
          {sel && (() => {
            const q   = quotations.find((x: any) => x.id === sel.quotationId);
            const rfq = rfqs.find((r: any) => r.id === sel.rfqId);
            const v   = vendors.find((x: any) => x.id === q?.vendorId);
            return (
              <div>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>Review: {sel.quotationId}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                  {([["RFQ", rfq?.title], ["Vendor", v?.name], ["Amount", fmt(q?.totalPrice || 0)], ["Delivery", q?.delivery]] as [string,string][]).map(([k, val]) => (
                    <div key={k} style={{ background:"#f9fafb", borderRadius:6, padding:10 }}>
                      <div style={{ fontSize:11, color:"#9ca3af", fontWeight:600 }}>{k}</div>
                      <div style={{ fontSize:14, fontWeight:600, color:"#111", marginTop:2 }}>{val || "—"}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontWeight:600, fontSize:13, marginBottom:8 }}>Timeline</div>
                  {(sel.timeline || []).map((t: any, i: number) => (
                    <div key={i} style={{ display:"flex", gap:8, marginBottom:6, fontSize:13 }}>
                      <div style={{ width:7, height:7, borderRadius:"50%", background:"#2563eb", marginTop:4, flexShrink:0 }} />
                      <div><span style={{ color:"#111" }}>{t.action}</span> <span style={{ color:"#9ca3af" }}>— {t.at} · {t.by}</span></div>
                    </div>
                  ))}
                </div>
                <FG label="Remarks">
                  <textarea style={{...inp, resize:"vertical"}} rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add your remarks…" />
                </FG>
                <div style={{ display:"flex", gap:8, marginTop:10, opacity: busy ? 0.7 : 1 }}>
                  <BtnSuccess onClick={() => decide(sel, "Approved")} style={{ flex:1 }}>{busy ? "…" : "✓ Approve"}</BtnSuccess>
                  <BtnDanger  onClick={() => decide(sel, "Rejected")} style={{ flex:1 }}>{busy ? "…" : "✗ Reject"}</BtnDanger>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
