import pool from "../config/db.js";

export const FormConfigModel = {
  async get() {
    const result = await pool.query(
      "SELECT * FROM form_config WHERE id = 1"
    );
    
    if (result.rows.length === 0) {
      // Return default config if none exists
      return {
        store_options: {
          "JBL Concept Store": ["SM North EDSA", "SM Megamall", "SM Mall of Asia", "Trinoma"],
          "SM Department Store": ["SM North EDSA", "SM Megamall", "SM Mall of Asia", "SM Aura", "SM Seaside"],
          "S&R": ["Shaw Boulevard", "Congressional", "Fort Bonifacio", "Alabang"],
          "Power Mac": ["Greenbelt", "Trinoma", "SM Megamall", "Shangri-La"]
        },
        online_platform_stores: {
          "Lazada": ["JBL Lazada", "Onward Lazada"],
          "TikTok": ["JBL TikTok", "Onward TikTok"],
          "Shopee": ["JBL Shopee", "Onward Shopee"],
          "jblstore.com.ph": []
        },
        brand_options: ["JBL", "Harman Kardon", "AKG", "Infinity"],
        purchase_type_options: ["Store", "Online"]
      };
    }
    
    return result.rows[0];
  },

  async update(data) {
    const query = `
      INSERT INTO form_config (
        id, 
        store_options, 
        online_platform_stores, 
        brand_options,
        purchase_type_options,
        updated_at
      )
      VALUES (1, $1, $2, $3, $4, NOW())
      ON CONFLICT (id)
      DO UPDATE SET
        store_options = $1,
        online_platform_stores = $2,
        brand_options = $3,
        purchase_type_options = $4,
        updated_at = NOW()
      RETURNING *;
    `;
    
    const result = await pool.query(query, [
      JSON.stringify(data.storeOptions),
      JSON.stringify(data.onlinePlatformStores),
      JSON.stringify(data.brand_options),
      JSON.stringify(data.purchase_type_options)
    ]);
    
    return result.rows[0];
  }
};