import mongoose from "mongoose";

const poSchema = new mongoose.Schema({
  rfqId:       { type: String, required: true },
  quotationId: { type: String, required: true },
  vendorId:    { type: String, required: true },
  product:     { type: String, required: true },
  quantity:    { type: Number, required: true },
  unitPrice:   { type: Number, required: true },
  subtotal:    { type: Number, required: true },
  tax:         { type: Number, default: 0 },
  total:       { type: Number, required: true },
  status:      { type: String, enum: ["Active","Invoiced","Cancelled"], default: "Active" },
}, { timestamps: true });

export default mongoose.model("PurchaseOrder", poSchema);
