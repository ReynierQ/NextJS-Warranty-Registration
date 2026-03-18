import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Initialize database tables
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔧 Initializing database tables...');

    // Create admins table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP WITH TIME ZONE
      );
    `);

    // Create warranties table
   await client.query(`
    CREATE TABLE IF NOT EXISTS warranties (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      registration_id VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      contact_number VARCHAR(50) NOT NULL,
      gender VARCHAR(20),
      birthdate DATE NOT NULL,
      brand VARCHAR(100) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      purchase_date DATE NOT NULL,
      purchase_from VARCHAR(255) NOT NULL,
      purchase_type VARCHAR(50),
      store_name VARCHAR(255),
      store_branch VARCHAR(255),
      online_platform VARCHAR(100),
      online_store VARCHAR(255),
      receipt_number VARCHAR(255) NOT NULL,
      serial_number VARCHAR(255) NOT NULL,
      receipt_image VARCHAR(500),
      terms_accepted BOOLEAN NOT NULL DEFAULT false,
      pdpa_accepted BOOLEAN NOT NULL DEFAULT false,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      
      CONSTRAINT unique_serial_per_product UNIQUE (serial_number, product_name)
    );
  `);

    // Create form_config table with brand_options and purchase_type_options
    await client.query(`
      CREATE TABLE IF NOT EXISTS form_config (
        id INTEGER PRIMARY KEY DEFAULT 1,
        store_options JSONB NOT NULL DEFAULT '{}'::jsonb,
        online_platform_stores JSONB NOT NULL DEFAULT '{}'::jsonb,
        brand_options JSONB NOT NULL DEFAULT '["JBL", "Harman Kardon", "AKG", "Infinity"]'::jsonb,
        purchase_type_options JSONB NOT NULL DEFAULT '["Store", "Online"]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT single_row CHECK (id = 1)
      );
    `);

    // Add new columns if they don't exist (for existing databases)
    await client.query(`
      DO $$ 
      BEGIN
        -- Add brand_options column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'form_config' 
          AND column_name = 'brand_options'
        ) THEN
          ALTER TABLE form_config 
          ADD COLUMN brand_options JSONB NOT NULL DEFAULT '["JBL", "Harman Kardon", "AKG", "Infinity"]'::jsonb;
        END IF;

        -- Add purchase_type_options column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'form_config' 
          AND column_name = 'purchase_type_options'
        ) THEN
          ALTER TABLE form_config 
          ADD COLUMN purchase_type_options JSONB NOT NULL DEFAULT '["Store", "Online"]'::jsonb;
        END IF;

        -- Add created_at column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'form_config' 
          AND column_name = 'created_at'
        ) THEN
          ALTER TABLE form_config 
          ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
    `);

    // Insert default configuration if table is empty
    await client.query(`
      INSERT INTO form_config (
        id, 
        store_options, 
        online_platform_stores,
        brand_options,
        purchase_type_options
      )
      VALUES (
        1,
        '{
          "JBL Concept Store": ["SM North EDSA", "SM Megamall", "SM Mall of Asia", "Trinoma"],
          "SM Department Store": ["SM North EDSA", "SM Megamall", "SM Mall of Asia", "SM Aura", "SM Seaside"],
          "S&R": ["Shaw Boulevard", "Congressional", "Fort Bonifacio", "Alabang"],
          "Power Mac": ["Greenbelt", "Trinoma", "SM Megamall", "Shangri-La"]
        }'::jsonb,
        '{
          "Lazada": ["JBL Lazada", "Onward Lazada"],
          "TikTok": ["JBL TikTok", "Onward TikTok"],
          "Shopee": ["JBL Shopee", "Onward Shopee"],
          "jblstore.com.ph": []
        }'::jsonb,
        '["JBL", "Harman Kardon", "AKG", "Infinity"]'::jsonb,
        '["Store", "Online"]'::jsonb
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_warranties_email ON warranties(email);
      CREATE INDEX IF NOT EXISTS idx_warranties_registration_id ON warranties(registration_id);
      CREATE INDEX IF NOT EXISTS idx_warranties_created_at ON warranties(created_at);
      CREATE INDEX IF NOT EXISTS idx_warranties_status ON warranties(status);
      CREATE INDEX IF NOT EXISTS idx_warranties_serial_product ON warranties(serial_number, product_name);
      CREATE INDEX IF NOT EXISTS idx_warranties_brand ON warranties(brand);
      CREATE INDEX IF NOT EXISTS idx_warranties_product_name ON warranties(product_name);
      CREATE INDEX IF NOT EXISTS idx_form_config_updated_at ON form_config(updated_at);
    `);

    // Create trigger function for updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers
    await client.query(`
      DROP TRIGGER IF EXISTS update_warranties_updated_at ON warranties;
      CREATE TRIGGER update_warranties_updated_at 
        BEFORE UPDATE ON warranties 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_form_config_updated_at ON form_config;
      CREATE TRIGGER update_form_config_updated_at 
        BEFORE UPDATE ON form_config 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Check connection and initialize
pool.connect(async (err, client, release) => {
  if (err) {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  } else {
    console.log("✅ Connected to PostgreSQL");
    release();
    
    // Initialize tables
    try {
      await initializeDatabase();
    } catch (error) {
      console.error("Failed to initialize database:", error);
      process.exit(1);
    }
  }
});

export default pool;