import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      tlsAllowInvalidCertificates: true,   // needed on some networks with SSL inspection
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}
