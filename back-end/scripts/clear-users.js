import pool from "../src/config/database.js";

async function clearUsers() {
  try {
    console.log("Connecting to database...");

    // Test connection
    const [rows] = await pool.execute("SELECT COUNT(*) as count FROM users");
    console.log(`Found ${rows[0].count} users in database`);

    // Clear users table
    await pool.execute("DELETE FROM users");
    console.log("✓ Users table cleared successfully");

    // Reset auto increment
    await pool.execute("ALTER TABLE users AUTO_INCREMENT = 1");
    console.log("✓ Auto increment reset");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

clearUsers();
