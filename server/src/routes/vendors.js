import { Router } from "express";
import supabase from "../supabase.js";

const router = Router();

// GET /api/vendors
router.get("/", async (_req, res) => {
  const { data, error } = await supabase.from("vendors").select("*").order("name");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/vendors/:id
router.get("/:id", async (req, res) => {
  const { data, error } = await supabase.from("vendors").select("*").eq("id", req.params.id).single();
  if (error) return res.status(404).json({ error: "Vendor not found" });
  res.json(data);
});

// POST /api/vendors
router.post("/", async (req, res) => {
  const { data, error } = await supabase.from("vendors").insert(req.body).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// PATCH /api/vendors/:id
router.patch("/:id", async (req, res) => {
  const { data, error } = await supabase.from("vendors").update(req.body).eq("id", req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
