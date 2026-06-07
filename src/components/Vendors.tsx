import { useState } from "react";
import { inp, FG, Row2, Modal, Tbl, TD, Badge, BtnPrimary, BtnSecondary, BtnGhost, PH } from "./ui";

export default function Vendors({ vendors, onCreateVendor, onUpdateVendor }: any) {
  const [q, setQ]       = useState("");
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const blank = { name:"", category:"Electronics", gst:"", contact:"", email:"", phone:"" };
  const [f, setF]       = useState(blank);

  const list = vendors.filter((v: any) =>
    v.name.toLowerCase().includes(q.toLowerCase()) ||
    v.category.toLowerCase().includes(q.toLowerCase())
  );

  const save = async () => {
    if (!f.name || !f.email) return alert("Name and email required");
    try {
      if (edit) { await onUpdateVendor(edit.id, f); }
      else      { await onCreateVendor(f); }
      setShow(false); setEdit(null); setF(blank);
    } catch (err: any) { alert(err.message || "Failed to save vendor"); }
  };

  return (
    <div>
      <PH
        title="Vendor Management"
        sub={`${vendors.filter((v: any) => v.status === "Active").length} active vendors`}
        action={<BtnPrimary onClick={() => { setF(blank); setEdit(null); setShow(true); }}>+ Register Vendor</BtnPrimary>}
      />
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
        <input style={{ ...inp, maxWidth:320, marginBottom:16 }} placeholder="Search by name or category…" value={q} onChange={e => setQ(e.target.value)} />
        <Tbl cols={["ID","Name","Category","GST","Contact","Rating","Status","Actions"]}
          rows={list.map((v: any) => (
            <tr key={v.id}>
              <TD mono muted>{v.id}</TD>
              <TD bold>{v.name}<br /><span style={{ fontSize:12, fontWeight:400, color:"#9ca3af" }}>{v.email}</span></TD>
              <TD>{v.category}</TD>
              <TD mono>{v.gst || "—"}</TD>
              <TD>{v.contact}<br /><span style={{ fontSize:12, color:"#9ca3af" }}>{v.phone}</span></TD>
              <TD><span style={{ color:"#d97706", fontWeight:600 }}>★ {v.rating}</span></TD>
              <TD><Badge s={v.status} /></TD>
              <TD>
                <div style={{ display:"flex", gap:6 }}>
                  <BtnGhost onClick={() => { setF({...v}); setEdit(v); setShow(true); }}>Edit</BtnGhost>
                  <BtnGhost onClick={() => onUpdateVendor(v.id, { status: v.status === "Active" ? "Inactive" : "Active" })}>
                    {v.status === "Active" ? "Disable" : "Enable"}
                  </BtnGhost>
                </div>
              </TD>
            </tr>
          ))} />
      </div>

      {show && (
        <Modal title={edit ? "Edit Vendor" : "Register Vendor"} onClose={() => setShow(false)}>
          <Row2>
            <FG label="Company Name *"><input style={inp} value={f.name} onChange={e => setF({...f, name:e.target.value})} placeholder="TechSupply Co." /></FG>
            <FG label="Category">
              <select style={inp} value={f.category} onChange={e => setF({...f, category:e.target.value})}>
                {["Electronics","Stationery","Machinery","Software","Furniture","Services"].map(c => <option key={c}>{c}</option>)}
              </select>
            </FG>
          </Row2>
          <FG label="GST Number"><input style={inp} value={f.gst} onChange={e => setF({...f, gst:e.target.value})} placeholder="27AABCT1234C1Z5" /></FG>
          <Row2>
            <FG label="Contact Person"><input style={inp} value={f.contact} onChange={e => setF({...f, contact:e.target.value})} /></FG>
            <FG label="Phone"><input style={inp} value={f.phone} onChange={e => setF({...f, phone:e.target.value})} /></FG>
          </Row2>
          <FG label="Email *"><input style={inp} value={f.email} onChange={e => setF({...f, email:e.target.value})} type="email" /></FG>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:8 }}>
            <BtnSecondary onClick={() => setShow(false)}>Cancel</BtnSecondary>
            <BtnPrimary onClick={save}>{edit ? "Save Changes" : "Register"}</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}
