import { Router } from "express";
import pool from "../config/database.js";

const router = Router();

/**
 * @route   GET /api/test/db
 * @desc    Test database connection and show basic stats
 * @access  Public
 */
router.get("/db", async (req, res) => {
  try {
    // Test connection
    const connection = await pool.getConnection();

    // Get database info
    const [dbInfo] = await connection.query("SELECT DATABASE() as db_name");

    // Get users count
    const [userCount] = await connection.query("SELECT COUNT(*) as count FROM users");

    // Get films count
    const [filmCount] = await connection.query("SELECT COUNT(*) as count FROM films");

    connection.release();

    res.status(200).json({
      success: true,
      message: "Database connection successful",
      data: {
        database: dbInfo[0].db_name,
        users: userCount[0].count,
        films: filmCount[0].count,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/test/users
 * @desc    Get list of users (for testing)
 * @access  Public
 */
router.get("/users", async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, created_at FROM users LIMIT 10"
    );

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
});

export default router;
