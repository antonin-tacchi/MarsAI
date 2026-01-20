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

// Connection test
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL database");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Error connecting to MySQL database:", error.message);
    return false;
  }
};

export default pool;
