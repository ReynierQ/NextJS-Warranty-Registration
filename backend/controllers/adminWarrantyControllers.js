// controllers/adminWarrantyController.js
import pool from "../config/db.js";

const normalizeDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Get all warranties (with optional search)
export const getWarranties = async (req, res) => {
  try {
    const { search = "" } = req.query;
    let result;

    if (search) {
      result = await pool.query(
        `SELECT * FROM warranties 
         WHERE name ILIKE $1 
            OR email ILIKE $1 
            OR product_name ILIKE $1 
         ORDER BY created_at DESC`,
        [`%${search}%`]
      );
    } else {
      result = await pool.query(
        `SELECT * FROM warranties ORDER BY created_at DESC`
      );
    }

    const normalized = result.rows.map((w) => ({
      ...w,
      birthdate: normalizeDate(w.birthdate),
      purchase_date: normalizeDate(w.purchase_date),
    }));

    res.json({ success: true, data: normalized });

  } catch (err) {
    console.error("❌ Error fetching warranties:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a warranty
export const updateWarranty = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, name, email, product_name, purchase_from } = req.body;

    const result = await pool.query(
      `UPDATE warranties 
       SET status = COALESCE($1, status),
           name = COALESCE($2, name),
           email = COALESCE($3, email),
           product_name = COALESCE($4, product_name),
           purchase_from = COALESCE($5, purchase_from)
       WHERE registration_id = $6
       RETURNING *`,
      [status, name, email, product_name, purchase_from, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("❌ Error updating warranty:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a warranty
export const deleteWarranty = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM warranties WHERE registration_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, message: "Warranty deleted" });
  } catch (err) {
    console.error("❌ Error deleting warranty:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
