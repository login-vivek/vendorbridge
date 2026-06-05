import mongoose from "mongoose";

const rfqSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  product:   { type: String, required: true },
  quantity:  { type: Number, required: true, default: 1 },
  unit:      { type: String, default: "units" },
  deadline:  { type: String, default: "" },
  vendors:   [{ type: String }],           // array of Vendor _id strings
  status:    { type: String, enum: ["Open","Quoted","Closed"], default: "Open" },
  createdBy: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("RFQ", rfqSchema);
