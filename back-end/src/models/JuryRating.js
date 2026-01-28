import db from "../config/database.js";

export default class JuryRating {
  /**
   * Create or update a rating
   */
  static async upsert(filmId, userId, rating, comment = null) {
    const sql = `
      INSERT INTO jury_ratings (film_id, user_id, rating, comment, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        rating = VALUES(rating),
        comment = VALUES(comment),
        updated_at = NOW()
    `;
    const [result] = await db.query(sql, [filmId, userId, rating, comment]);
    return result.affectedRows > 0;
  }

  /**
   * Get rating by film and user
   */
  static async findByFilmAndUser(filmId, userId) {
    const sql = `SELECT * FROM jury_ratings WHERE film_id = ? AND user_id = ?`;
    const [rows] = await db.query(sql, [filmId, userId]);
    return rows[0] || null;
  }

  /**
   * Get all ratings for a film
   */
  static async findByFilm(filmId) {
    const sql = `
      SELECT jr.*, u.name as user_name
      FROM jury_ratings jr
      JOIN users u ON jr.user_id = u.id
      WHERE jr.film_id = ?
      ORDER BY jr.created_at DESC
    `;
    const [rows] = await db.query(sql, [filmId]);
    return rows;
  }

  /**
   * Get average rating for a film
   */
  static async getAverageRating(filmId) {
    const sql = `
      SELECT
        AVG(rating) as average,
        COUNT(*) as count
      FROM jury_ratings
      WHERE film_id = ?
    `;
    const [rows] = await db.query(sql, [filmId]);
    return {
      average: rows[0]?.average ? parseFloat(rows[0].average).toFixed(2) : null,
      count: rows[0]?.count || 0,
    };
  }

  /**
   * Get all ratings by a user
   */
  static async findByUser(userId) {
    const sql = `
      SELECT jr.*, f.title as film_title
      FROM jury_ratings jr
      JOIN films f ON jr.film_id = f.id
      WHERE jr.user_id = ?
      ORDER BY jr.updated_at DESC
    `;
    const [rows] = await db.query(sql, [userId]);
    return rows;
  }

  /**
   * Get films with their ratings for jury dashboard
   */
  static async getFilmsWithRatings(userId = null) {
    const sql = `
      SELECT
        f.id,
        f.title,
        f.country,
        f.description,
        f.film_url,
        f.poster_url,
        f.thumbnail_url,
        f.director_firstname,
        f.director_lastname,
        f.ai_tools_used,
        f.status,
        f.created_at,
        (SELECT AVG(rating) FROM jury_ratings WHERE film_id = f.id) as avg_rating,
        (SELECT COUNT(*) FROM jury_ratings WHERE film_id = f.id) as rating_count,
        ${userId ? `(SELECT rating FROM jury_ratings WHERE film_id = f.id AND user_id = ?) as user_rating` : 'NULL as user_rating'}
      FROM films f
      WHERE f.status = 'approved'
      ORDER BY f.created_at DESC
    `;
    const params = userId ? [userId] : [];
    const [rows] = await db.query(sql, params);
    return rows;
  }

  /**
   * Delete a rating
   */
  static async delete(filmId, userId) {
    const sql = `DELETE FROM jury_ratings WHERE film_id = ? AND user_id = ?`;
    const [result] = await db.query(sql, [filmId, userId]);
    return result.affectedRows > 0;
  }
}
