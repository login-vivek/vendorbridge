import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema({
  rfqId:      { type: String, required: true },
  vendorId:   { type: String, required: true },
  unitPrice:  { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  delivery:   { type: String, default: "" },
  notes:      { type: String, default: "" },
  status:     { type: String, enum: ["Submitted","Pending Approval","Approved","Rejected"], default: "Submitted" },
}, { timestamps: true });

export default mongoose.model("Quotation", quotationSchema);
