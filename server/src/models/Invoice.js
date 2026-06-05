import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  poId:     { type: String, required: true },
  vendorId: { type: String, required: true },
  product:  { type: String, required: true },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  tax:      { type: Number, default: 0 },
  total:    { type: Number, required: true },
  status:   { type: String, enum: ["Draft","Sent","Paid"], default: "Draft" },
  dueDate:  { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Invoice", invoiceSchema);
