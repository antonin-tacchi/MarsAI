import db from "../db.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, country, created_at FROM users"
    );

    res.json(users);
  } catch (error) {
    next(error);
  }
};
