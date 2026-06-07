import { fmt, fmtD, Tbl, TD, Badge, BtnGhost, PH } from "./ui";

export default function POs({ pos, vendors, invoices, user, onCreateInvoice }: any) {
  const myVid = user.vendorId;
  const list  = myVid ? pos.filter((p: any) => p.vendorId === myVid) : pos;

  const genInvoice = async (po: any) => {
    if (invoices.find((i: any) => i.poId === po.id)) return alert("Invoice already exists for this PO");
    try {
      await onCreateInvoice({
        poId:     po.id,
        vendorId: po.vendorId,
        product:  po.product,
        quantity: po.quantity,
        subtotal: po.subtotal,
        tax:      po.tax,
        total:    po.total,
        dueDate:  new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      });
      alert("✅ Invoice generated!");
    } catch (err: any) {
      alert(err.message || "Failed to generate invoice");
    }
  };

  return (
    <div>
      <PH title="Purchase Orders" sub={`${list.length} total`} />
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:8, padding:20 }}>
        <Tbl cols={["PO Number","Product","Vendor","Qty","Subtotal","Tax 18%","Total","Date","Status","Action"]}
          rows={list.map((po: any) => {
            const v   = vendors.find((x: any) => x.id === po.vendorId);
            const has = invoices.find((i: any) => i.poId === po.id);
            return (
              <tr key={po.id}>
                <TD mono>{po.id}</TD>
                <TD bold>{po.product}</TD>
                <TD>{v?.name}</TD>
                <TD>{po.quantity}</TD>
                <TD>{fmt(po.subtotal)}</TD>
                <TD>{fmt(po.tax)}</TD>
                <TD bold>{fmt(po.total)}</TD>
                <TD>{fmtD(po.createdAt)}</TD>
                <TD><Badge s={has ? "Invoiced" : po.status} /></TD>
                <TD>
                  {!has && (user.role === "Procurement Officer" || user.role === "Admin")
                    ? <BtnGhost onClick={() => genInvoice(po)}>Generate Invoice</BtnGhost>
                    : has ? <span style={{ fontSize:12, color:"#16a34a" }}>✓ Done</span> : null}
                </TD>
              </tr>
            );
          })} empty="No purchase orders yet" />
      </div>
    </div>
  );
}
