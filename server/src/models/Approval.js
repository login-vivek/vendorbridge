import mongoose from "mongoose";

const approvalSchema = new mongoose.Schema({
  rfqId:       { type: String, required: true },
  quotationId: { type: String, required: true },
  status:      { type: String, enum: ["Pending","Approved","Rejected"], default: "Pending" },
  remarks:     { type: String, default: "" },
  approvedBy:  { type: String, default: null },
  approvedAt:  { type: String, default: null },
  timeline:    [{ action: String, by: String, at: String }],
}, { timestamps: true });

export default mongoose.model("Approval", approvalSchema);
