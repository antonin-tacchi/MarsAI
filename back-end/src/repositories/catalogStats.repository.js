import pool from "../config/database.js";

export default class FilmRepository {
  static async countAll() {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS count
      FROM films
    `);
    return rows[0]?.count ?? 0;
  }

  static async countByCategory() {
    const [rows] = await pool.query(`
      SELECT
        c.id AS categoryId,
        c.name AS name,
        COUNT(fc.film_id) AS count
      FROM categories c
      LEFT JOIN film_categories fc ON fc.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `);
    return rows;
  }

  static async countByCountry() {
    const [rows] = await pool.query(`
      SELECT
        f.country AS country,
        COUNT(*) AS count
      FROM films f
      GROUP BY f.country
      ORDER BY count DESC
    `);
    return rows;
  }

  static async countByAiTool() {
    const [rows] = await pool.query(`
      SELECT
        f.ai_tools_used AS tool,
        COUNT(*) AS count
      FROM films f
      GROUP BY f.ai_tools_used
      ORDER BY count DESC
    `);
    return rows;
  }
}
