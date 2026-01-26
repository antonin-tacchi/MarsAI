import pool from "../config/database.js";

/**
 * Film Model - Film submissions management
 * Les informations du realisateur sont liees au film
 */
class FilmModel {
  /**
   * Create a new film submission
   */
  async create(filmData) {
    try {
      const {
        // Film Information
        title,
        country = null,
        description = null,
        film_url = null,
        youtube_link = null,
        poster_url = null,
        ai_tools_used = null,
        ai_certification = false,

        // Director Information
        director_firstname,
        director_lastname,
        director_email,
        director_bio = null,
        director_school = null,
        director_website = null,
        social_instagram = null,
        social_youtube = null,
        social_vimeo = null,
      } = filmData;

      const [result] = await pool.execute(
        `INSERT INTO films (
          title, country, description, film_url, youtube_link, poster_url,
          ai_tools_used, ai_certification,
          director_firstname, director_lastname, director_email,
          director_bio, director_school, director_website,
          social_instagram, social_youtube, social_vimeo,
          status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [
          title,
          country,
          description,
          film_url,
          youtube_link,
          poster_url,
          ai_tools_used,
          ai_certification ? 1 : 0,
          director_firstname,
          director_lastname,
          director_email,
          director_bio,
          director_school,
          director_website,
          social_instagram,
          social_youtube,
          social_vimeo,
        ]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      console.error("Error creating film:", error);
      throw error;
    }
  }

  /**
   * Find a film by ID
   */
  async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT f.*, u.name as status_changed_by_name
         FROM films f
         LEFT JOIN users u ON f.status_changed_by = u.id
         WHERE f.id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error finding film by ID:", error);
      throw error;
    }
  }

  /**
   * Find films by email (for director to check their submissions)
   */
  async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, title, status, created_at, status_changed_at
         FROM films
         WHERE director_email = ?
         ORDER BY created_at DESC`,
        [email]
      );
      return rows;
    } catch (error) {
      console.error("Error finding films by email:", error);
      throw error;
    }
  }

  /**
   * Get all films (for jury/admin)
   */
  async getAll(filters = {}) {
    try {
      let query = `
        SELECT f.*, u.name as status_changed_by_name
        FROM films f
        LEFT JOIN users u ON f.status_changed_by = u.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.status) {
        query += " AND f.status = ?";
        params.push(filters.status);
      }

      query += " ORDER BY f.created_at DESC";

      if (filters.limit) {
        query += " LIMIT ?";
        params.push(parseInt(filters.limit));
      }

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error("Error getting all films:", error);
      throw error;
    }
  }

  /**
   * Get films pending review
   */
  async getPending() {
    return this.getAll({ status: "pending" });
  }

  /**
   * Get approved films (for public catalog)
   */
  async getApproved() {
    return this.getAll({ status: "approved" });
  }

  /**
   * Update film status (approve or reject)
   */
  async updateStatus(id, status, userId, rejectionReason = null) {
    try {
      await pool.execute(
        `UPDATE films SET
          status = ?,
          status_changed_at = NOW(),
          status_changed_by = ?,
          rejection_reason = ?
         WHERE id = ?`,
        [status, userId, rejectionReason, id]
      );

      return await this.findById(id);
    } catch (error) {
      console.error("Error updating film status:", error);
      throw error;
    }
  }

  /**
   * Approve a film
   */
  async approve(id, userId) {
    return this.updateStatus(id, "approved", userId, null);
  }

  /**
   * Reject a film
   */
  async reject(id, userId, reason) {
    return this.updateStatus(id, "rejected", userId, reason);
  }

  /**
   * Get film statistics
   */
  async getStats() {
    try {
      const [rows] = await pool.execute(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM films
      `);
      return rows[0];
    } catch (error) {
      console.error("Error getting film stats:", error);
      throw error;
    }
  }

  /**
   * Assign category to film
   */
  async assignCategory(filmId, categoryId) {
    try {
      await pool.execute(
        "INSERT INTO film_categories (film_id, category_id) VALUES (?, ?)",
        [filmId, categoryId]
      );
    } catch (error) {
      console.error("Error assigning category to film:", error);
      throw error;
    }
  }

  /**
   * Get categories for a film
   */
  async getCategories(filmId) {
    try {
      const [rows] = await pool.execute(
        `SELECT c.* FROM categories c
         JOIN film_categories fc ON c.id = fc.category_id
         WHERE fc.film_id = ?`,
        [filmId]
      );
      return rows;
    } catch (error) {
      console.error("Error getting film categories:", error);
      throw error;
    }
  }

  /**
   * Delete a film
   */
  async delete(id) {
    try {
      await pool.execute("DELETE FROM films WHERE id = ?", [id]);
    } catch (error) {
      console.error("Error deleting film:", error);
      throw error;
    }
  }
}

export default new FilmModel();
