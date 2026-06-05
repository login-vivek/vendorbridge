import { useState } from "react";
import { uid, fmt, inp, FG, Badge, BtnSuccess, BtnDanger, PH } from "./ui";

export default function Approvals({ approvals, setApprovals, quotations, setQuotations, rfqs, vendors, setPOs, user, addLog }: any) {
  const [sel, setSel]         = useState<any>(null);
  const [remarks, setRemarks] = useState("");

  const decide = (apr: any, decision: string) => {
    const updated = {
      ...apr, status:decision, remarks, approvedBy:user.id, approvedAt:new Date().toLocaleString(),
      timeline:[...apr.timeline, { action:decision, by:user.id, at:new Date().toLocaleString() }],
    };
    setApprovals((as: any[]) => as.map(a => a.id === apr.id ? updated : a));
    setQuotations((qs: any[]) => qs.map(q => q.id === apr.quotationId ? { ...q, status:decision } : q));

    if (decision === "Approved") {
      const q   = quotations.find((x: any) => x.id === apr.quotationId);
      const rfq = rfqs.find((r: any) => r.id === apr.rfqId);
      if (q && rfq) {
        const po = {
          id:uid("PO"), rfqId:rfq.id, quotationId:q.id, vendorId:q.vendorId,
          product:rfq.product, quantity:rfq.quantity, unitPrice:q.unitPrice,
          subtotal:q.totalPrice, tax:Math.round(q.totalPrice * 0.18),
          total:q.totalPrice + Math.round(q.totalPrice * 0.18),
          status:"Active", createdAt:new Date().toISOString().split("T")[0],
        };
        setPOs((ps: any[]) => [po, ...ps]);
        addLog("PO Generated", po.id, user.id);
      }
    }
    addLog(`Quotation ${decision}`, apr.quotationId, user.id);
    setSel(null); setRemarks("");
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
                  {sel.timeline.map((t: any, i: number) => (
                    <div key={i} style={{ display:"flex", gap:8, marginBottom:6, fontSize:13 }}>
                      <div style={{ width:7, height:7, borderRadius:"50%", background:"#2563eb", marginTop:4, flexShrink:0 }} />
                      <div><span style={{ color:"#111" }}>{t.action}</span> <span style={{ color:"#9ca3af" }}>— {t.at} · {t.by}</span></div>
                    </div>
                  ))}
                </div>
                <FG label="Remarks">
                  <textarea style={{...inp, resize:"vertical"}} rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add your remarks…" />
                </FG>
                <div style={{ display:"flex", gap:8, marginTop:10 }}>
                  <BtnSuccess onClick={() => decide(sel, "Approved")} style={{ flex:1 }}>✓ Approve</BtnSuccess>
                  <BtnDanger  onClick={() => decide(sel, "Rejected")} style={{ flex:1 }}>✗ Reject</BtnDanger>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
