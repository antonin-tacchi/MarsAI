import db from "../config/database.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, created_at FROM users"
    );

    res.json({ success: true, data: users });
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};
