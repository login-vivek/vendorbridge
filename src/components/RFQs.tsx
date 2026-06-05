import { useState, useCallback } from "react";
import { uid, fmtD, inp, FG, Row2, Modal, Tbl, TD, Badge, BtnPrimary, BtnSecondary, BtnGhost, PH } from "./ui";

interface RFQForm {
  title: string;
  product: string;
  quantity: string;
  unit: string;
  deadline: string;
  vendors: string[];
}

const BLANK: RFQForm = {
  title: "", product: "", quantity: "", unit: "units", deadline: "", vendors: [],
};

export default function RFQs({ rfqs, setRfqs, vendors, user, addLog }: any) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<RFQForm>({ ...BLANK });

  const canManage = user.role === "Procurement Officer" || user.role === "Admin";

  const openModal = () => {
    setForm({ ...BLANK });
    setShow(true);
  };

  const closeModal = () => {
    setShow(false);
  };

  /* individual field updaters — stable references, no object spread chain issues */
  const setTitle    = useCallback((v: string) => setForm(f => ({ ...f, title: v })),    []);
  const setProduct  = useCallback((v: string) => setForm(f => ({ ...f, product: v })),  []);
  const setQuantity = useCallback((v: string) => setForm(f => ({ ...f, quantity: v })), []);
  const setUnit     = useCallback((v: string) => setForm(f => ({ ...f, unit: v })),     []);
  const setDeadline = useCallback((v: string) => setForm(f => ({ ...f, deadline: v })), []);
  const toggleVendor = useCallback((vid: string, checked: boolean) => {
    setForm(f => ({
      ...f,
      vendors: checked ? [...f.vendors, vid] : f.vendors.filter(x => x !== vid),
    }));
  }, []);

  const create = () => {
    if (!form.title.trim() || !form.product.trim()) {
      alert("Title and product are required");
      return;
    }
    const r = {
      id: uid("RFQ"),
      title: form.title.trim(),
      product: form.product.trim(),
      quantity: parseInt(form.quantity) || 1,
      unit: form.unit,
      deadline: form.deadline,
      vendors: form.vendors,
      status: "Open",
      createdBy: user.id,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setRfqs((rs: any[]) => [r, ...rs]);
    addLog("RFQ Created", `${r.id}: ${r.title}`, user.id);
    setShow(false);
  };

  const activeVendors = vendors.filter((v: any) => v.status === "Active");

  return (
    <div>
      <PH
        title="Request for Quotation"
        sub={`${rfqs.filter((r: any) => r.status === "Open").length} open`}
        action={canManage && <BtnPrimary onClick={openModal}>+ Create RFQ</BtnPrimary>}
      />

      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
        <Tbl
          cols={["RFQ ID","Title","Product","Qty","Deadline","Assigned Vendors","Status","Actions"]}
          rows={rfqs.map((r: any) => (
            <tr key={r.id}>
              <TD mono muted>{r.id}</TD>
              <TD bold>{r.title}</TD>
              <TD>{r.product}</TD>
              <TD>{r.quantity} {r.unit}</TD>
              <TD>{fmtD(r.deadline)}</TD>
              <TD>
                {(r.vendors || []).length > 0
                  ? (r.vendors || []).map((vid: string) => {
                      const v = vendors.find((x: any) => x.id === vid);
                      return v
                        ? <span key={vid} style={{ fontSize:11, background:"#eff6ff", padding:"2px 7px", borderRadius:4, marginRight:4, color:"#2563eb", border:"1px solid #bfdbfe" }}>{v.name}</span>
                        : null;
                    })
                  : <span style={{ color:"#9ca3af", fontSize:12 }}>No vendors assigned</span>
                }
              </TD>
              <TD><Badge s={r.status} /></TD>
              <TD>
                {r.status !== "Closed" && canManage && (
                  <BtnGhost onClick={() =>
                    setRfqs((rs: any[]) => rs.map(x => x.id === r.id ? { ...x, status:"Closed" } : x))
                  }>
                    Close
                  </BtnGhost>
                )}
              </TD>
            </tr>
          ))}
          empty="No RFQs yet"
        />
      </div>

      {show && (
        <Modal title="Create RFQ" onClose={closeModal}>
          <FG label="RFQ Title *">
            <input
              style={inp}
              value={form.title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Office Laptops Q4"
              autoFocus
            />
          </FG>

          <FG label="Product / Service *">
            <input
              style={inp}
              value={form.product}
              onChange={e => setProduct(e.target.value)}
              placeholder="e.g. Dell Latitude 5540"
            />
          </FG>

          <Row2>
            <FG label="Quantity">
              <input
                style={inp}
                type="number"
                min="1"
                value={form.quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="1"
              />
            </FG>
            <FG label="Unit">
              <select style={inp} value={form.unit} onChange={e => setUnit(e.target.value)}>
                {["units","packs","kg","liters","sets","nos"].map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </FG>
          </Row2>

          <FG label="Deadline">
            <input
              style={inp}
              type="date"
              value={form.deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </FG>

          <FG label={`Assign Vendors (${form.vendors.length} selected)`}>
            <div style={{ border:"1px solid #d1d5db", borderRadius:6, padding:"8px 12px", maxHeight:160, overflowY:"auto", background:"#fafafa" }}>
              {activeVendors.length === 0
                ? <p style={{ color:"#9ca3af", fontSize:13, margin:0 }}>No active vendors available</p>
                : activeVendors.map((v: any) => (
                    <label key={v.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0", fontSize:14, cursor:"pointer", userSelect:"none" }}>
                      <input
                        type="checkbox"
                        checked={form.vendors.includes(v.id)}
                        onChange={e => toggleVendor(v.id, e.target.checked)}
                        style={{ width:15, height:15, cursor:"pointer" }}
                      />
                      <span style={{ fontWeight:500, color:"#111" }}>{v.name}</span>
                      <span style={{ color:"#9ca3af", fontSize:12 }}>({v.category})</span>
                    </label>
                  ))
              }
            </div>
            {form.vendors.length === 0 && (
              <p style={{ fontSize:11, color:"#d97706", margin:"4px 0 0" }}>
                ⚠ Select at least one vendor so they can submit quotes
              </p>
            )}
          </FG>

          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:16, paddingTop:12, borderTop:"1px solid #f3f4f6" }}>
            <BtnSecondary onClick={closeModal}>Cancel</BtnSecondary>
            <BtnPrimary onClick={create}>Create RFQ</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}
