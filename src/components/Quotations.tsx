import { useState, useCallback } from "react";
import { fmt, fmtD, inp, FG, Row2, Modal, Tbl, TD, Badge, BtnPrimary, BtnSecondary, BtnGhost, PH } from "./ui";

interface QuoteForm { rfqId:string; unitPrice:string; delivery:string; notes:string; }
const BLANK: QuoteForm = { rfqId:"", unitPrice:"", delivery:"", notes:"" };

export default function Quotations({ quotations, rfqs, vendors, user, approvals, onCreateQuotation, onCreateApproval }: any) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<QuoteForm>({ ...BLANK });
  const [busy, setBusy] = useState(false);

  const myVid: string | undefined = user.vendorId;

  const list = myVid ? quotations.filter((q: any) => q.vendorId === myVid) : quotations;

  const assignedRfqs = rfqs.filter((r: any) => {
    const isOpen = r.status === "Open" || r.status === "Quoted";
    if (!myVid) return isOpen;
    return isOpen && Array.isArray(r.vendors) && r.vendors.includes(myVid);
  });

  const openRfqs = rfqs.filter((r: any) => r.status === "Open" || r.status === "Quoted");
  const dropdownRfqs = myVid ? assignedRfqs : openRfqs;

  const setRfqId    = useCallback((v: string) => setForm(f => ({ ...f, rfqId: v })),    []);
  const setPrice    = useCallback((v: string) => setForm(f => ({ ...f, unitPrice: v })), []);
  const setDelivery = useCallback((v: string) => setForm(f => ({ ...f, delivery: v })),  []);
  const setNotes    = useCallback((v: string) => setForm(f => ({ ...f, notes: v })),     []);

  const openModal = (rfqId = "") => { setForm({ ...BLANK, rfqId }); setShow(true); };

  const submit = async () => {
    if (!form.rfqId || !form.unitPrice) return alert("RFQ and unit price required");
    const rfq = rfqs.find((r: any) => r.id === form.rfqId);
    setBusy(true);
    try {
      await onCreateQuotation({
        rfqId:      form.rfqId,
        vendorId:   myVid,
        unitPrice:  parseInt(form.unitPrice),
        totalPrice: parseInt(form.unitPrice) * (rfq?.quantity || 1),
        delivery:   form.delivery,
        notes:      form.notes,
      });
      setShow(false);
    } catch (err: any) {
      alert(err.message || "Failed to submit quotation");
    } finally { setBusy(false); }
  };

  const sendApproval = async (q: any) => {
    if (approvals.find((a: any) => a.quotationId === q.id)) return alert("Already submitted for approval");
    try {
      await onCreateApproval({
        rfqId:       q.rfqId,
        quotationId: q.id,
        timeline:    [{ action:"Submitted for approval", by: user.id, at: new Date().toLocaleString() }],
      });
      alert(`${q.id} sent for manager approval!`);
    } catch (err: any) {
      alert(err.message || "Failed to send for approval");
    }
  };

  return (
    <div>
      {/* Vendor: assigned RFQs */}
      {myVid && (
        <div style={{ marginBottom:24 }}>
          <PH title="RFQs Assigned to You" sub={`${assignedRfqs.length} open`}
            action={assignedRfqs.length > 0 && <BtnPrimary onClick={() => openModal()}>+ Submit Quotation</BtnPrimary>} />
          <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
            {assignedRfqs.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 0", color:"#9ca3af" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
                <div style={{ fontSize:14, fontWeight:600, color:"#374151" }}>No RFQs assigned yet</div>
                <div style={{ fontSize:13, marginTop:4 }}>The procurement officer will assign RFQs when they need quotes.</div>
              </div>
            ) : (
              <Tbl cols={["RFQ ID","Title","Product","Qty","Deadline","Status","Action"]}
                rows={assignedRfqs.map((r: any) => {
                  const alreadyQuoted = quotations.some((q: any) => q.rfqId === r.id && q.vendorId === myVid);
                  return (
                    <tr key={r.id}>
                      <TD mono muted>{r.id}</TD>
                      <TD bold>{r.title}</TD>
                      <TD>{r.product}</TD>
                      <TD>{r.quantity} {r.unit}</TD>
                      <TD>{fmtD(r.deadline)}</TD>
                      <TD><Badge s={r.status} /></TD>
                      <TD>
                        {alreadyQuoted
                          ? <span style={{ fontSize:12, color:"#16a34a", fontWeight:600 }}>✓ Quote submitted</span>
                          : <BtnPrimary onClick={() => openModal(r.id)} style={{ padding:"5px 12px", fontSize:13 }}>Submit Quote</BtnPrimary>
                        }
                      </TD>
                    </tr>
                  );
                })} empty="No assigned RFQs" />
            )}
          </div>
        </div>
      )}

      {/* Quotations table */}
      <PH title={myVid ? "My Submitted Quotations" : "All Quotations"} sub={`${list.length} total`} />
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
        <Tbl cols={["Quote ID","RFQ","Vendor","Unit Price","Total","Delivery","Notes","Status","Actions"]}
          rows={list.map((q: any) => {
            const rfq    = rfqs.find((r: any) => r.id === q.rfqId);
            const vendor = vendors.find((v: any) => v.id === q.vendorId);
            const hasApr = approvals.find((a: any) => a.quotationId === q.id);
            return (
              <tr key={q.id}>
                <TD mono muted>{q.id}</TD>
                <TD>{rfq?.title || q.rfqId}</TD>
                <TD bold>{vendor?.name || q.vendorId}</TD>
                <TD>{fmt(q.unitPrice)}</TD>
                <TD bold>{fmt(q.totalPrice)}</TD>
                <TD>{q.delivery || "—"}</TD>
                <TD muted>{q.notes || "—"}</TD>
                <TD><Badge s={q.status} /></TD>
                <TD>
                  {(user.role === "Procurement Officer" || user.role === "Admin") && q.status === "Submitted" && !hasApr &&
                    <BtnGhost onClick={() => sendApproval(q)}>Send for Approval</BtnGhost>}
                </TD>
              </tr>
            );
          })} empty="No quotations yet" />
      </div>

      {/* Submit modal */}
      {show && (
        <Modal title="Submit Quotation" onClose={() => setShow(false)}>
          <FG label="Select RFQ *">
            <select style={inp} value={form.rfqId} onChange={e => setRfqId(e.target.value)}>
              <option value="">-- Select RFQ --</option>
              {dropdownRfqs.map((r: any) => <option key={r.id} value={r.id}>{r.id} — {r.title}</option>)}
            </select>
          </FG>
          <Row2>
            <FG label="Unit Price (₹) *">
              <input style={inp} type="number" min="1" value={form.unitPrice} onChange={e => setPrice(e.target.value)} placeholder="e.g. 50000" autoFocus />
            </FG>
            <FG label="Delivery Timeline">
              <input style={inp} value={form.delivery} onChange={e => setDelivery(e.target.value)} placeholder="e.g. 10 days" />
            </FG>
          </Row2>
          <FG label="Notes / Terms">
            <textarea style={{ ...inp, resize:"vertical", fontFamily:"inherit" }} rows={3} value={form.notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Includes 1-year warranty" />
          </FG>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:16, paddingTop:12, borderTop:"1px solid #f3f4f6" }}>
            <BtnSecondary onClick={() => setShow(false)}>Cancel</BtnSecondary>
            <BtnPrimary onClick={submit} style={{ opacity: busy ? 0.7 : 1 }}>{busy ? "Submitting…" : "Submit Quotation"}</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}
