import db from "../config/database.js";

export default class JuryRating {
  // Create or update a rating (upsert)
  static async create(filmId, userId, rating, comment = null) {
    const sql = `
      INSERT INTO jury_ratings (film_id, user_id, rating, comment)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        rating = VALUES(rating),
        comment = VALUES(comment),
        updated_at = NOW()
    `;
    const [result] = await db.query(sql, [filmId, userId, rating, comment]);
    return result;
  }

  // Find rating by film and user
  static async findByFilmAndUser(filmId, userId) {
    const sql = `
      SELECT id, film_id, user_id, rating, comment, created_at, updated_at
      FROM jury_ratings
      WHERE film_id = ? AND user_id = ?
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [filmId, userId]);
    return rows?.[0] || null;
  }

  // Find all ratings for a film
  static async findByFilm(filmId) {
    const sql = `
      SELECT jr.*, u.name as user_name
      FROM jury_ratings jr
      JOIN users u ON u.id = jr.user_id
      WHERE jr.film_id = ?
      ORDER BY jr.created_at DESC
    `;
    const [rows] = await db.query(sql, [filmId]);
    return rows;
  }

  // Find all ratings by a user
  static async findByUser(userId) {
    const sql = `
      SELECT jr.*, f.title as film_title, f.poster_url, f.thumbnail_url, f.youtube_url
      FROM jury_ratings jr
      JOIN films f ON f.id = jr.film_id
      WHERE jr.user_id = ?
      ORDER BY jr.updated_at DESC
    `;
    const [rows] = await db.query(sql, [userId]);
    return rows;
  }

  // Get average rating for a film
  static async getAverageRating(filmId) {
    const sql = `
      SELECT
        ROUND(AVG(rating), 1) as average,
        COUNT(*) as count
      FROM jury_ratings
      WHERE film_id = ?
    `;
    const [rows] = await db.query(sql, [filmId]);
    return {
      average: rows?.[0]?.average || null,
      count: rows?.[0]?.count || 0,
    };
  }

  // Delete a rating
  static async delete(filmId, userId) {
    const sql = `
      DELETE FROM jury_ratings
      WHERE film_id = ? AND user_id = ?
    `;
    const [result] = await db.query(sql, [filmId, userId]);
    return result.affectedRows > 0;
  }
}
