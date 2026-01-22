import pool from "../src/config/database.js";

async function testConnection() {
  console.log("Testing database connection...");
  console.log("Configuration:");
  console.log("- Host:", process.env.DB_HOST || "localhost");
  console.log("- Port:", process.env.DB_PORT || "3306");
  console.log("- User:", process.env.DB_USER || "root");
  console.log("- Password:", process.env.DB_PASSWORD ? "***" : "(empty)");
  console.log("- Database:", process.env.DB_NAME || "marsai");
  console.log("");

  try {
    console.log("Attempting to connect...");
    const [rows] = await pool.execute("SELECT 1 + 1 AS result");
    console.log("✓ Connection successful!");
    console.log("Test query result:", rows[0].result);

    // Check if database exists
    const [databases] = await pool.execute("SHOW DATABASES");
    console.log("\nAvailable databases:", databases.map(db => db.Database).join(", "));

    // Try to use marsai database
    try {
      await pool.execute("USE marsai");
      console.log("✓ Database 'marsai' exists");

      // Check users table
      const [tables] = await pool.execute("SHOW TABLES");
      console.log("Tables in marsai:", tables.map(t => Object.values(t)[0]).join(", "));

      // Count users
      const [userCount] = await pool.execute("SELECT COUNT(*) as count FROM users");
      console.log(`\n✓ Users table exists with ${userCount[0].count} users`);

      // Show users (without passwords)
      const [users] = await pool.execute("SELECT id, name, email FROM users");
      if (users.length > 0) {
        console.log("\nExisting users:");
        users.forEach(user => {
          console.log(`  - ID ${user.id}: ${user.name} (${user.email})`);
        });
      } else {
        console.log("\nNo users in database");
      }

    } catch (error) {
      console.error("✗ Error accessing database:", error.message);
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("✗ Connection failed:", error.message);
    console.error("\nPossible issues:");
    console.error("1. MySQL is not running");
    console.error("2. Wrong host or port");
    console.error("3. Wrong username or password");
    console.error("4. Database 'marsai' does not exist");
    process.exit(1);
  }
}

testConnection();
