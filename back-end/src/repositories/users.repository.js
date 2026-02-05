import pool from "../config/database.js";

export const findAllUsers = async () => {
  const [rows] = await pool.query("SELECT id, name, email, country, created_at FROM users");
  return rows;
};