import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  action: { type: String, required: true },
  detail: { type: String, default: "" },
  by:     { type: String, required: true },
  type:   { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Log", logSchema);
