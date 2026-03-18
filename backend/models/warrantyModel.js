import pool from "../config/db.js";

export const WarrantyModel = {
  async checkDuplicate(serialNumber, productName) {
    const result = await pool.query(
      "SELECT registration_id FROM warranties WHERE serial_number = $1 AND product_name = $2",
      [serialNumber, productName]
    );
    return result.rows.length > 0;
  },

  async create(data) {
    const query = `
      INSERT INTO warranties (
        registration_id, name, email, contact_number, gender, birthdate,
        brand, product_name, purchase_date, purchase_from,
        purchase_type, store_name, store_branch, online_platform, online_store,
        receipt_number, serial_number, receipt_image,
        terms_accepted, pdpa_accepted
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      RETURNING *;
    `;
    const values = [
      data.registrationId, data.name, data.email, data.contactNumber, data.gender, data.birthdate,
      data.brand, data.productName, data.purchaseDate, data.purchaseFrom,
      data.purchaseType, data.storeName, data.storeBranch, data.onlinePlatform, data.onlineStore,
      data.receiptNumber, data.serialNumber, data.receiptImage,
      data.termsAccepted, data.pdpaAccepted
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async getById(id) {
    const result = await pool.query(
      "SELECT * FROM warranties WHERE registration_id = $1", [id]
    );
    return result.rows[0];
  }
};