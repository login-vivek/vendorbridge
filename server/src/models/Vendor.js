import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  category: { type: String, default: "Electronics" },
  gst:      { type: String, default: "" },
  contact:  { type: String, default: "" },
  email:    { type: String, required: true },
  phone:    { type: String, default: "" },
  status:   { type: String, enum: ["Active","Inactive"], default: "Active" },
  rating:   { type: Number, default: 4.0, min: 0, max: 5 },
}, { timestamps: true });

export default mongoose.model("Vendor", vendorSchema);
