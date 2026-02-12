import pool from "../config/database.js";

/**
 * Rating Model - MySQL database operations for jury ratings
 */
class RatingModel {
  /**
   * Create a new rating
   * @param {number} filmId - Film ID
   * @param {number} userId - Jury user ID
   * @param {number} rating - Rating value (1-10)
   * @param {string|null} comment - Optional comment
   * @returns {Promise<Object>} Created rating
   */
  async create(filmId, userId, rating, comment = null) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO jury_ratings (film_id, user_id, rating, comment, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [filmId, userId, rating, comment]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      // Check for duplicate entry (unique constraint violation)
      if (error.code === "ER_DUP_ENTRY") {
        const duplicateError = new Error("You have already rated this film");
        duplicateError.code = "DUPLICATE_RATING";
        throw duplicateError;
      }
      console.error("Error creating rating:", error);
      throw error;
    }
  }

  /**
   * Update an existing rating
   * @param {number} ratingId - Rating ID
   * @param {number} userId - Jury user ID (for ownership check)
   * @param {Object} updates - Fields to update (rating, comment)
   * @returns {Promise<Object>} Updated rating
   */
  async update(ratingId, userId, updates) {
    try {
      const fields = [];
      const values = [];

      if (updates.rating !== undefined) {
        fields.push("rating = ?");
        values.push(updates.rating);
      }

      if (updates.comment !== undefined) {
        fields.push("comment = ?");
        values.push(updates.comment);
      }

      if (fields.length === 0) {
        return await this.findById(ratingId);
      }

      // Add updated_at
      fields.push("updated_at = NOW()");

      // Add WHERE conditions
      values.push(ratingId, userId);

      const [result] = await pool.execute(
        `UPDATE jury_ratings 
         SET ${fields.join(", ")} 
         WHERE id = ? AND user_id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return null; // Rating not found or user doesn't own it
      }

      return await this.findById(ratingId);
    } catch (error) {
      console.error("Error updating rating:", error);
      throw error;
    }
  }

  /**
   * Find a rating by ID
   * @param {number} ratingId - Rating ID
   * @returns {Promise<Object|null>} Rating object or null
   */
  async findById(ratingId) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          jr.id,
          jr.film_id,
          jr.user_id,
          jr.rating,
          jr.comment,
          jr.created_at,
          jr.updated_at,
          u.name as jury_name,
          u.email as jury_email
         FROM jury_ratings jr
         LEFT JOIN users u ON jr.user_id = u.id
         WHERE jr.id = ?`,
        [ratingId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error finding rating by ID:", error);
      throw error;
    }
  }

  /**
   * Find a rating by film and user (to check if already exists)
   * @param {number} filmId - Film ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Rating object or null
   */
  async findByFilmAndUser(filmId, userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM jury_ratings 
         WHERE film_id = ? AND user_id = ?`,
        [filmId, userId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error finding rating by film and user:", error);
      throw error;
    }
  }

  /**
   * Get all ratings for a specific film
   * @param {number} filmId - Film ID
   * @returns {Promise<Array>} Array of ratings with jury info
   */
  async findByFilm(filmId) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          jr.id,
          jr.film_id,
          jr.user_id,
          jr.rating,
          jr.comment,
          jr.created_at,
          jr.updated_at,
          u.name as jury_name,
          u.email as jury_email
         FROM jury_ratings jr
         LEFT JOIN users u ON jr.user_id = u.id
         WHERE jr.film_id = ?
         ORDER BY jr.created_at DESC`,
        [filmId]
      );
      return rows;
    } catch (error) {
      console.error("Error finding ratings by film:", error);
      throw error;
    }
  }

  /**
   * Get all ratings by a specific user (jury member)
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of ratings with film info
   */
  async findByUser(userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          jr.id,
          jr.film_id,
          jr.user_id,
          jr.rating,
          jr.comment,
          jr.created_at,
          jr.updated_at,
          f.title as film_title,
          f.director_firstname,
          f.director_lastname,
          f.poster_url
         FROM jury_ratings jr
         LEFT JOIN films f ON jr.film_id = f.id
         WHERE jr.user_id = ?
         ORDER BY jr.created_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error("Error finding ratings by user:", error);
      throw error;
    }
  }

  /**
   * Get rating statistics for a film (average, count)
   * @param {number} filmId - Film ID
   * @returns {Promise<Object>} Stats object with average and count
   */
  async getFilmStats(filmId) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          COUNT(*) as total_ratings,
          AVG(rating) as average_rating,
          MIN(rating) as min_rating,
          MAX(rating) as max_rating
         FROM jury_ratings
         WHERE film_id = ?`,
        [filmId]
      );
      
      const stats = rows[0];
      return {
        total_ratings: parseInt(stats.total_ratings) || 0,
        average_rating: stats.average_rating ? parseFloat(stats.average_rating).toFixed(2) : null,
        min_rating: stats.min_rating || null,
        max_rating: stats.max_rating || null,
      };
    } catch (error) {
      console.error("Error getting film stats:", error);
      throw error;
    }
  }

  /**
   * Delete a rating (for admin or owner)
   * @param {number} ratingId - Rating ID
   * @param {number} userId - User ID (for ownership check)
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(ratingId, userId) {
    try {
      const [result] = await pool.execute(
        `DELETE FROM jury_ratings 
         WHERE id = ? AND user_id = ?`,
        [ratingId, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting rating:", error);
      throw error;
    }
  }
}

export default new RatingModel();
