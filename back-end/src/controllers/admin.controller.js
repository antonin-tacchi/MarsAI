import pool from "../config/database.js";


export const getAllUsers = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, created_at FROM users"
    );

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};
