import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";

const router = Router();

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

/* POST /api/auth/signup */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ error: "All fields required" });

    if (await User.findOne({ email }))
      return res.status(400).json({ error: "Email already registered" });

    let vendorId = null;

    /* If signing up as Vendor, create a Vendor record automatically */
    if (role === "Vendor") {
      const vendor = await Vendor.create({
        name, email,
        contact: name,
        status: "Active",
        rating: 4.0,
      });
      vendorId = vendor._id.toString();
    }

    const user = await User.create({ name, email, password, role, vendorId });
    res.status(201).json({ token: sign(user._id), user: { ...user.toJSON(), vendorId } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* POST /api/auth/login */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: "No account found with that email." });
    if (!(await user.matchPassword(password)))
      return res.status(401).json({ error: "Incorrect password." });
    res.json({ token: sign(user._id), user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* GET /api/auth/me */
router.get("/me", async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "No token" });
    const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
