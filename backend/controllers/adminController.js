import bcrypt from "bcryptjs"; // more common than bcrypt, lighter for Node
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { initializeAdminTable } from "../models/adminModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // move this to .env

// Ensure the table exists on startup
initializeAdminTable();

// Register Admin
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if email already exists
    const existing = await pool.query("SELECT id FROM admins WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO admins (name, email, password_hash)
       VALUES ($1, $2, $3) RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );

    res.status(201).json({ 
      success: true, 
      message: "Admin registered successfully",
      admin: result.rows[0] 
    });
  } catch (err) {
    console.error("❌ Admin registration error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login Admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);
    const admin = result.rows[0];

    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, admin.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Create JWT
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "2h" } // slightly longer session
    );

    res.json({ 
      success: true, 
      message: "Login successful",
      token 
    });
  } catch (err) {
    console.error("❌ Admin login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Protected Profile
export const getAdminProfile = async (req, res) => {
  try {
    // Fetch full admin details from database using the ID from the JWT
    const result = await pool.query(
      `SELECT id, name, email, created_at FROM admins WHERE id = $1`,
      [req.admin.id]
    );

    const admin = result.rows[0];

    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: "Admin not found" 
      });
    }

    res.json({
      success: true,
      message: "Welcome Admin!",
      admin: admin, // Now includes name and other fields
    });
  } catch (err) {
    console.error("❌ Get profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// List all admins
export const listAdmins = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, created_at FROM admins ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      admins: result.rows
    });
  } catch (err) {
    console.error("❌ List admins error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update admin
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // Check if admin exists
    const existing = await pool.query("SELECT id FROM admins WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Check if email is already used by another admin
    if (email) {
      const emailCheck = await pool.query(
        "SELECT id FROM admins WHERE email = $1 AND id != $2", 
        [email, id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ 
          success: false, 
          message: "Email already used by another admin" 
        });
      }
    }

    // Build update query dynamically
    let updateFields = [];
    let values = [];
    let valueIndex = 1;

    if (name) {
      updateFields.push(`name = $${valueIndex}`);
      values.push(name);
      valueIndex++;
    }

    if (email) {
      updateFields.push(`email = $${valueIndex}`);
      values.push(email);
      valueIndex++;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      updateFields.push(`password_hash = $${valueIndex}`);
      values.push(passwordHash);
      valueIndex++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No fields to update" 
      });
    }

    values.push(id);
    const query = `
      UPDATE admins 
      SET ${updateFields.join(', ')}
      WHERE id = $${valueIndex}
      RETURNING id, name, email, created_at
    `;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      message: "Admin updated successfully",
      admin: result.rows[0]
    });
  } catch (err) {
    console.error("❌ Update admin error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself (optional safety check)
    if (req.admin.id === parseInt(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete your own account" 
      });
    }

    const result = await pool.query(
      `DELETE FROM admins WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Admin not found" 
      });
    }

    res.json({
      success: true,
      message: "Admin deleted successfully"
    });
  } catch (err) {
    console.error("❌ Delete admin error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
