import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "lime_scribe",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create and export the pool
export const pool = new Pool(poolConfig);

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();
    console.log("✅ Database connection successful");
    return true;
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    return false;
  }
}

// Initialize database (run schema if needed)
export async function initializeDatabase(): Promise<void> {
  try {
    await testConnection();
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Failed to initialize database:", err);
    throw err;
  }
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  await pool.end();
  console.log("Database pool closed");
}
