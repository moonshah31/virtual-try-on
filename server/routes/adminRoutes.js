import express from "express";
import { requireAdminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/login", (req, res) => {

  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res.json({
      success: true
    });
  }

  res.status(401).json({
    success: false,
    message: "Invalid credentials"
  });
});

router.get("/session", requireAdminAuth, (req, res) => {
  res.json({ success: true });
});

export default router;
