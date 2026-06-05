import { useState } from "react";
import { fmt, fmtD, Modal, Tbl, TD, Badge, BtnPrimary, BtnSecondary, BtnGhost, PH } from "./ui";

export default function Invoices({ invoices, setInvoices, vendors, user, addLog }: any) {
  const [view, setView] = useState<any>(null);
  const myVid = user.vendorId;
  const list  = myVid ? invoices.filter((i: any) => i.vendorId === myVid) : invoices;

  const send = (inv: any) => {
    const v = vendors.find((x: any) => x.id === inv.vendorId);
    setInvoices((is: any[]) => is.map(i => i.id === inv.id ? { ...i, status:"Sent" } : i));
    addLog("Invoice Sent", `${inv.id} → ${v?.email}`, user.id);
    alert(`📧 Invoice ${inv.id} sent to ${v?.email}!`);
    if (view?.id === inv.id) setView({ ...inv, status:"Sent" });
  };

  const print = (inv: any) => {
    const v = vendors.find((x: any) => x.id === inv.vendorId);
    const w = window.open("", "_blank")!;
    w.document.write(`<html><head><title>Invoice ${inv.id}</title><style>
      body{font-family:Arial;padding:40px;color:#111} h1{color:#2563eb;font-size:26px}
      .grid{display:flex;justify-content:space-between;margin:20px 0}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th,td{padding:10px 14px;border:1px solid #e5e7eb;text-align:left}
      th{background:#f9fafb} .total{font-size:18px;font-weight:700;color:#16a34a}
    </style></head><body>
      <h1>VendorBridge</h1><p>Procurement &amp; Vendor Management ERP</p><hr/>
      <div class="grid">
        <div><b>${inv.id}</b><br/>Date: ${fmtD(inv.createdAt)}<br/>Due: ${fmtD(inv.dueDate)}</div>
        <div><b>Vendor:</b><br/>${v?.name}<br/>${v?.email}<br/>GST: ${v?.gst}</div>
      </div>
      <table><tr><th>Product</th><th>Qty</th><th>Subtotal</th><th>Tax (18%)</th><th>Total</th></tr>
      <tr><td>${inv.product}</td><td>${inv.quantity}</td><td>${fmt(inv.subtotal)}</td><td>${fmt(inv.tax)}</td><td class="total">${fmt(inv.total)}</td></tr></table>
      <p style="margin-top:30px;color:#6b7280">Thank you for your business!</p>
    </body></html>`);
    w.document.close(); w.print();
    addLog("Invoice Printed", inv.id, user.id);
  };

  return (
    <div>
      <PH title="Invoices" sub={`${list.length} total`} />
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
        <Tbl cols={["Invoice ID","PO Ref","Vendor","Product","Subtotal","Tax","Total","Due Date","Status","Actions"]}
          rows={list.map((inv: any) => {
            const v = vendors.find((x: any) => x.id === inv.vendorId);
            return (
              <tr key={inv.id}>
                <TD mono>{inv.id}</TD>
                <TD mono muted>{inv.poId}</TD>
                <TD bold>{v?.name}</TD>
                <TD>{inv.product}</TD>
                <TD>{fmt(inv.subtotal)}</TD>
                <TD>{fmt(inv.tax)}</TD>
                <TD bold>{fmt(inv.total)}</TD>
                <TD>{fmtD(inv.dueDate)}</TD>
                <TD><Badge s={inv.status} /></TD>
                <TD>
                  <div style={{ display:"flex", gap:5 }}>
                    <BtnGhost onClick={() => setView(inv)}>View</BtnGhost>
                    {(user.id === "officer" || user.id === "admin") && (
                      <>
                        <BtnGhost onClick={() => print(inv)}>Print</BtnGhost>
                        {inv.status !== "Sent" && (
                          <BtnGhost onClick={() => send(inv)} style={{ color:"#16a34a", borderColor:"#bbf7d0" }}>Send Email</BtnGhost>
                        )}
                      </>
                    )}
                  </div>
                </TD>
              </tr>
            );
          })} empty="No invoices yet" />
      </div>

      {view && (
        <Modal title={`Invoice: ${view.id}`} onClose={() => setView(null)} wide>
          {(() => {
            const v = vendors.find((x: any) => x.id === view.vendorId);
            return (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
                  <div>
                    <div style={{ fontSize:22, fontWeight:800, color:"#2563eb" }}>VendorBridge</div>
                    <div style={{ fontSize:12, color:"#6b7280" }}>Procurement ERP</div>
                  </div>
                  <div style={{ textAlign:"right", fontSize:13 }}>
                    <div style={{ fontWeight:700, fontSize:16 }}>{view.id}</div>
                    <div style={{ color:"#6b7280" }}>Date: {fmtD(view.createdAt)}</div>
                    <div style={{ color:"#6b7280" }}>Due: {fmtD(view.dueDate)}</div>
                  </div>
                </div>
                <div style={{ background:"#f9fafb", borderRadius:6, padding:14, marginBottom:16, fontSize:13 }}>
                  <div style={{ fontWeight:700, marginBottom:4 }}>Vendor: {v?.name}</div>
                  <div style={{ color:"#6b7280" }}>{v?.email} · {v?.phone}</div>
                  <div style={{ color:"#6b7280", fontFamily:"monospace" }}>GST: {v?.gst}</div>
                </div>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14, marginBottom:16 }}>
                  <thead>
                    <tr style={{ background:"#f9fafb" }}>
                      {["Product","Qty","Subtotal","Tax 18%","Total"].map(h => (
                        <th key={h} style={{ padding:"9px 12px", textAlign:"left", border:"1px solid #e5e7eb" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding:"10px 12px", border:"1px solid #e5e7eb" }}>{view.product}</td>
                      <td style={{ padding:"10px 12px", border:"1px solid #e5e7eb" }}>{view.quantity}</td>
                      <td style={{ padding:"10px 12px", border:"1px solid #e5e7eb" }}>{fmt(view.subtotal)}</td>
                      <td style={{ padding:"10px 12px", border:"1px solid #e5e7eb" }}>{fmt(view.tax)}</td>
                      <td style={{ padding:"10px 12px", border:"1px solid #e5e7eb", fontWeight:700, color:"#16a34a", fontSize:16 }}>{fmt(view.total)}</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <Badge s={view.status} />
                  <div style={{ display:"flex", gap:8 }}>
                    <BtnSecondary onClick={() => print(view)}>🖨 Print</BtnSecondary>
                    {view.status !== "Sent" && (user.id === "officer" || user.id === "admin") && (
                      <BtnPrimary onClick={() => send(view)}>📧 Send Email</BtnPrimary>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
