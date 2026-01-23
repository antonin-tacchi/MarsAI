import dotenv from "dotenv";
import pool from "../config/database.js";

dotenv.config();

async function testDatabase() {
  console.log("🔍 Testing database connection and schema...\n");

  try {
    // Test connection
    const connection = await pool.getConnection();
    console.log("✅ Database connection successful");
    console.log(`   Host: ${process.env.DB_HOST || "localhost"}`);
    console.log(`   Database: ${process.env.DB_NAME || "marsai"}\n`);

    // Check if tables exist
    const [tables] = await connection.execute(
      "SHOW TABLES"
    );

    console.log("📋 Existing tables:");
    if (tables.length === 0) {
      console.log("   ❌ No tables found! Database needs to be initialized.\n");
      connection.release();
      return false;
    }

    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   ✓ ${tableName}`);
    });

    // Check required tables
    const tableNames = tables.map(t => Object.values(t)[0]);
    const requiredTables = ['users', 'roles', 'user_roles'];
    const missingTables = requiredTables.filter(t => !tableNames.includes(t));

    if (missingTables.length > 0) {
      console.log("\n❌ Missing required tables:", missingTables.join(', '));
      connection.release();
      return false;
    }

    console.log("\n✅ All required tables exist\n");

    // Check users table structure
    console.log("🔍 Checking 'users' table structure:");
    const [columns] = await connection.execute(
      "DESCRIBE users"
    );
    columns.forEach(col => {
      console.log(`   ${col.Field} (${col.Type})`);
    });

    // Count existing users
    const [userCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM users"
    );
    console.log(`\n👥 Users in database: ${userCount[0].count}`);

    // Count existing roles
    const [roleCount] = await connection.execute(
      "SELECT * FROM roles"
    );
    console.log(`\n🎭 Roles configured:`);
    roleCount.forEach(role => {
      console.log(`   ${role.id}. ${role.name} - ${role.description || 'No description'}`);
    });

    connection.release();
    console.log("\n✅ Database test completed successfully!");
    return true;

  } catch (error) {
    console.error("\n❌ Database test failed:");
    console.error("   Error:", error.message);

    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log("\n💡 Solution: Run the database initialization script");
      console.log("   mysql -u root -p marsai < BDD/marsai.sql");
    } else if (error.code === 'ECONNREFUSED') {
      console.log("\n💡 Solution: Make sure MySQL is running");
      console.log("   Check docker-compose or local MySQL service");
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log("\n💡 Solution: Create the database first");
      console.log("   mysql -u root -p");
      console.log("   CREATE DATABASE marsai;");
    }

    return false;
  } finally {
    await pool.end();
  }
}

testDatabase().then(success => {
  process.exit(success ? 0 : 1);
});
