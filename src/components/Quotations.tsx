import { useState, useCallback } from "react";
import { uid, fmt, fmtD, inp, FG, Row2, Modal, Tbl, TD, Badge, BtnPrimary, BtnSecondary, BtnGhost, PH } from "./ui";

interface QuoteForm {
  rfqId: string;
  unitPrice: string;
  delivery: string;
  notes: string;
}

const BLANK: QuoteForm = { rfqId:"", unitPrice:"", delivery:"", notes:"" };

export default function Quotations({ quotations, setQuotations, rfqs, setRfqs, vendors, user, addLog, approvals, setApprovals }: any) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<QuoteForm>({ ...BLANK });

  /* vendorId from auth — e.g. "V001" */
  const myVid: string | undefined = user.vendorId;

  /* quotations visible to this user */
  const list = myVid
    ? quotations.filter((q: any) => q.vendorId === myVid)
    : quotations;

  /* RFQs this vendor is assigned to (open/quoted only) */
  const assignedRfqs = rfqs.filter((r: any) => {
    const isOpen = r.status === "Open" || r.status === "Quoted";
    if (!myVid) return isOpen;
    return isOpen && Array.isArray(r.vendors) && r.vendors.includes(myVid);
  });

  /* all open RFQs for officer/admin dropdown */
  const openRfqs = rfqs.filter((r: any) => r.status === "Open" || r.status === "Quoted");

  /* stable field updaters */
  const setRfqId    = useCallback((v: string) => setForm(f => ({ ...f, rfqId: v })),    []);
  const setPrice    = useCallback((v: string) => setForm(f => ({ ...f, unitPrice: v })), []);
  const setDelivery = useCallback((v: string) => setForm(f => ({ ...f, delivery: v })),  []);
  const setNotes    = useCallback((v: string) => setForm(f => ({ ...f, notes: v })),     []);

  const openModal = (rfqId = "") => {
    setForm({ ...BLANK, rfqId });
    setShow(true);
  };

  const submit = () => {
    if (!form.rfqId || !form.unitPrice) return alert("RFQ and unit price required");
    const rfq = rfqs.find((r: any) => r.id === form.rfqId);
    const qty = rfq?.quantity || 1;
    const vendorId = myVid || "V001";
    const q = {
      id: uid("Q"),
      rfqId: form.rfqId,
      vendorId,
      unitPrice: parseInt(form.unitPrice),
      totalPrice: parseInt(form.unitPrice) * qty,
      delivery: form.delivery,
      notes: form.notes,
      status: "Submitted",
      submittedAt: new Date().toISOString().split("T")[0],
    };
    setQuotations((qs: any[]) => [q, ...qs]);
    setRfqs((rs: any[]) => rs.map(r => r.id === form.rfqId ? { ...r, status:"Quoted" } : r));
    addLog("Quotation Submitted", `${q.id} for ${form.rfqId}`, user.id);
    setShow(false);
  };

  const sendApproval = (q: any) => {
    if (approvals.find((a: any) => a.quotationId === q.id)) {
      alert("Already submitted for approval"); return;
    }
    const apr = {
      id: uid("APR"), rfqId: q.rfqId, quotationId: q.id, status: "Pending",
      remarks: "", approvedBy: null, approvedAt: null,
      timeline: [{ action:"Submitted for approval", by: user.id, at: new Date().toLocaleString() }],
    };
    setApprovals((as: any[]) => [apr, ...as]);
    setQuotations((qs: any[]) => qs.map(x => x.id === q.id ? { ...x, status:"Pending Approval" } : x));
    addLog("Sent for Approval", q.id, user.id);
    alert(`${q.id} sent for manager approval!`);
  };

  /* RFQs available in the submit dropdown */
  const dropdownRfqs = myVid ? assignedRfqs : openRfqs;

  return (
    <div>

      {/* ══ VENDOR: assigned RFQs panel ══ */}
      {myVid && (
        <div style={{ marginBottom:24 }}>
          <PH
            title="RFQs Assigned to You"
            sub={`${assignedRfqs.length} open`}
            action={assignedRfqs.length > 0 && <BtnPrimary onClick={() => openModal()}>+ Submit Quotation</BtnPrimary>}
          />
          <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
            {assignedRfqs.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 0", color:"#9ca3af" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
                <div style={{ fontSize:14, fontWeight:600, color:"#374151" }}>No RFQs assigned yet</div>
                <div style={{ fontSize:13, marginTop:4 }}>
                  The procurement officer will assign RFQs to you when they need quotes.
                </div>
              </div>
            ) : (
              <Tbl
                cols={["RFQ ID","Title","Product","Qty","Deadline","Status","Action"]}
                rows={assignedRfqs.map((r: any) => {
                  const alreadyQuoted = quotations.some(
                    (q: any) => q.rfqId === r.id && q.vendorId === myVid
                  );
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
                          : <BtnPrimary onClick={() => openModal(r.id)} style={{ padding:"5px 12px", fontSize:13 }}>
                              Submit Quote
                            </BtnPrimary>
                        }
                      </TD>
                    </tr>
                  );
                })}
                empty="No assigned RFQs"
              />
            )}
          </div>
        </div>
      )}

      {/* ══ Quotations table ══ */}
      <PH
        title={myVid ? "My Submitted Quotations" : "All Quotations"}
        sub={`${list.length} total`}
      />
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
        <Tbl
          cols={["Quote ID","RFQ","Vendor","Unit Price","Total","Delivery","Notes","Status","Actions"]}
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
                  {(user.role === "Procurement Officer" || user.role === "Admin")
                    && q.status === "Submitted"
                    && !hasApr
                    && <BtnGhost onClick={() => sendApproval(q)}>Send for Approval</BtnGhost>
                  }
                </TD>
              </tr>
            );
          })}
          empty="No quotations yet"
        />
      </div>

      {/* ══ Submit Quotation modal ══ */}
      {show && (
        <Modal title="Submit Quotation" onClose={() => setShow(false)}>
          <FG label="Select RFQ *">
            <select
              style={inp}
              value={form.rfqId}
              onChange={e => setRfqId(e.target.value)}
            >
              <option value="">-- Select RFQ --</option>
              {dropdownRfqs.map((r: any) => (
                <option key={r.id} value={r.id}>{r.id} — {r.title}</option>
              ))}
            </select>
          </FG>

          <Row2>
            <FG label="Unit Price (₹) *">
              <input
                style={inp}
                type="number"
                min="1"
                value={form.unitPrice}
                onChange={e => setPrice(e.target.value)}
                placeholder="e.g. 50000"
                autoFocus
              />
            </FG>
            <FG label="Delivery Timeline">
              <input
                style={inp}
                value={form.delivery}
                onChange={e => setDelivery(e.target.value)}
                placeholder="e.g. 10 days"
              />
            </FG>
          </Row2>

          <FG label="Notes / Terms">
            <textarea
              style={{ ...inp, resize:"vertical", fontFamily:"inherit" }}
              rows={3}
              value={form.notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Includes 1-year warranty"
            />
          </FG>

          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:16, paddingTop:12, borderTop:"1px solid #f3f4f6" }}>
            <BtnSecondary onClick={() => setShow(false)}>Cancel</BtnSecondary>
            <BtnPrimary onClick={submit}>Submit Quotation</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}
