import { useState, useEffect } from "react";
import { fmt, inp, FG, Badge, PH } from "./ui";

export default function Compare({ quotations, rfqs, vendors }: any) {
  const withQuotes = rfqs.filter((r: any) => quotations.some((q: any) => q.rfqId === r.id));
  const [rfqId, setRfqId] = useState(withQuotes[0]?.id || "");

  // Update default selection whenever new quotes come in
  useEffect(() => {
    if (!rfqId && withQuotes.length > 0) {
      setRfqId(withQuotes[0].id);
    }
  }, [quotations, rfqs]);

  const quotes = quotations.filter((q: any) => q.rfqId === rfqId);
  const minP   = quotes.length ? Math.min(...quotes.map((q: any) => q.totalPrice)) : 0;
  const minD   = quotes.length ? Math.min(...quotes.map((q: any) => parseInt(q.delivery) || 999)) : 0;

  return (
    <div>
      <PH title="Compare Quotations" />
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20, marginBottom:16 }}>
        <FG label="Select RFQ to Compare">
          <select style={{ ...inp, maxWidth:360 }} value={rfqId} onChange={e => setRfqId(e.target.value)}>
            <option value="">-- Select --</option>
            {withQuotes.map((r: any) => (
              <option key={r.id} value={r.id}>{r.id} – {r.title}</option>
            ))}
          </select>
        </FG>
        {withQuotes.length === 0 && (
          <p style={{ color:"#9ca3af", fontSize:13, marginTop:8 }}>
            No RFQs have received quotations yet.
          </p>
        )}
      </div>

      {rfqId && quotes.length === 0 && (
        <p style={{ color:"#9ca3af", textAlign:"center", padding:32 }}>No quotations for this RFQ yet.</p>
      )}

      {quotes.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:`repeat(${Math.min(quotes.length, 3)},1fr)`, gap:14 }}>
          {quotes.map((q: any) => {
            const v         = vendors.find((x: any) => x.id === q.vendorId);
            const isLowest  = q.totalPrice === minP;
            const isFastest = (parseInt(q.delivery) || 999) === minD;
            return (
              <div key={q.id} style={{ background:"#fff", border:`2px solid ${isLowest ? "#16a34a" : "#e5e7eb"}`, borderRadius:8, padding:20, position:"relative" }}>
                {isLowest && (
                  <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"#16a34a", color:"#fff", padding:"2px 12px", borderRadius:99, fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>
                    ✓ Best Price
                  </div>
                )}
                <div style={{ fontWeight:700, fontSize:16, color:"#111", marginBottom:2 }}>{v?.name || q.vendorId}</div>
                <div style={{ fontSize:12, color:"#6b7280", marginBottom:14 }}>Quote ID: {q.id}</div>
                <div style={{ fontSize:24, fontWeight:800, color:"#111" }}>{fmt(q.totalPrice)}</div>
                <div style={{ fontSize:12, color:"#6b7280", marginBottom:12 }}>Unit: {fmt(q.unitPrice)}</div>
                <div style={{ fontSize:13, color: isFastest ? "#2563eb" : "#374151", fontWeight: isFastest ? 700 : 400 }}>
                  🚚 {q.delivery} {isFastest && "(Fastest)"}
                </div>
                {q.notes && <div style={{ fontSize:12, color:"#9ca3af", marginTop:8 }}>{q.notes}</div>}
                <div style={{ marginTop:12 }}><Badge s={q.status} /></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}