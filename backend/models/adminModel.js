import pool from "../config/db.js";

// Initialize the admins table if it doesn't exist
export async function initializeAdminTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Create a new admin
export async function createAdmin({ name, email, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO admins (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, passwordHash]
  );
  return result.rows[0];
}

// Find admin by email
export async function findAdminByEmail(email) {
  const result = await pool.query(
    `SELECT * FROM admins WHERE email = $1`,
    [email]
  );
  return result.rows[0];
}
