import mysql from "mysql2/promise";

// MySQL connection configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "marsai",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Connection test with retry
export const testConnection = async (retries = 10, delay = 3000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log("✅ Connected to MySQL database");
      connection.release();
      return true;
    } catch (error) {
      console.error(`❌ DB connection attempt ${i}/${retries} failed: ${error.message}`);
      if (i < retries) await new Promise((r) => setTimeout(r, delay));
    }
  }
  return false;
};

export default pool;
