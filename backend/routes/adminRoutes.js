import express from "express";
import { registerAdmin, loginAdmin, getAdminProfile, listAdmins, deleteAdmin, updateAdmin } from "../controllers/adminController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import pool from "../config/db.js";

const router = express.Router();

// Register (only run once to create first admin)
// You can comment this out after first use for security
router.post("/register", registerAdmin);

// Login
router.post("/login", loginAdmin);

// Protected routes
router.get("/profile", authMiddleware, getAdminProfile);
router.get("/list", authMiddleware, listAdmins);           
router.put("/:id", authMiddleware, updateAdmin); 
router.delete("/:id", authMiddleware, deleteAdmin);    

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    // Fetch full admin details
    const result = await pool.query(
      `SELECT id, name, email, created_at FROM admins WHERE id = $1`,
      [req.admin.id]
    );

    const admin = result.rows[0];

    res.json({
      success: true,
      message: "Welcome to the Admin Dashboard 🚀",
      admin: admin,
    });
  } catch (err) {
    console.error("❌ Dashboard error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
