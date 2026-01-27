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
        thumbnail_url = null,
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
          title, country, description, film_url, youtube_link, poster_url, thumbnail_url,
          ai_tools_used, ai_certification,
          director_firstname, director_lastname, director_email,
          director_bio, director_school, director_website,
          social_instagram, social_youtube, social_vimeo,
          status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
        [
          title,
          country,
          description,
          film_url,
          youtube_link,
          poster_url,
          thumbnail_url,
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

  /**
   * Rate a film (jury member)
   */
  async rateFilm(filmId, userId, rating, comment = null) {
    try {
      // Use INSERT ... ON DUPLICATE KEY UPDATE for upsert
      await pool.execute(
        `INSERT INTO jury_ratings (film_id, user_id, rating, comment)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), updated_at = NOW()`,
        [filmId, userId, rating, comment]
      );

      return await this.getFilmRating(filmId, userId);
    } catch (error) {
      console.error("Error rating film:", error);
      throw error;
    }
  }

  /**
   * Get a specific jury member's rating for a film
   */
  async getFilmRating(filmId, userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM jury_ratings WHERE film_id = ? AND user_id = ?`,
        [filmId, userId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error getting film rating:", error);
      throw error;
    }
  }

  /**
   * Get all ratings for a film with jury info
   */
  async getFilmRatings(filmId) {
    try {
      const [rows] = await pool.execute(
        `SELECT jr.*, u.name as jury_name
         FROM jury_ratings jr
         JOIN users u ON jr.user_id = u.id
         WHERE jr.film_id = ?
         ORDER BY jr.created_at DESC`,
        [filmId]
      );
      return rows;
    } catch (error) {
      console.error("Error getting film ratings:", error);
      throw error;
    }
  }

  /**
   * Get average rating for a film
   */
  async getAverageRating(filmId) {
    try {
      const [rows] = await pool.execute(
        `SELECT AVG(rating) as average, COUNT(*) as count
         FROM jury_ratings WHERE film_id = ?`,
        [filmId]
      );
      return {
        average: rows[0].average ? parseFloat(rows[0].average).toFixed(1) : null,
        count: rows[0].count,
      };
    } catch (error) {
      console.error("Error getting average rating:", error);
      throw error;
    }
  }

  /**
   * Update categories for a film (replace all)
   */
  async updateCategories(filmId, categoryIds) {
    try {
      // Remove existing categories
      await pool.execute("DELETE FROM film_categories WHERE film_id = ?", [filmId]);

      // Add new categories
      if (categoryIds && categoryIds.length > 0) {
        for (const categoryId of categoryIds) {
          await pool.execute(
            "INSERT INTO film_categories (film_id, category_id) VALUES (?, ?)",
            [filmId, categoryId]
          );
        }
      }

      return await this.getCategories(filmId);
    } catch (error) {
      console.error("Error updating film categories:", error);
      throw error;
    }
  }

  /**
   * Get all available categories
   */
  async getAllCategories() {
    try {
      const [rows] = await pool.execute("SELECT * FROM categories ORDER BY name");
      return rows;
    } catch (error) {
      console.error("Error getting all categories:", error);
      throw error;
    }
  }

  /**
   * Get films with ratings info for jury dashboard (only assigned films)
   */
  async getFilmsForJury(userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT f.*,
          (SELECT AVG(rating) FROM jury_ratings WHERE film_id = f.id) as average_rating,
          (SELECT COUNT(*) FROM jury_ratings WHERE film_id = f.id) as rating_count,
          (SELECT rating FROM jury_ratings WHERE film_id = f.id AND user_id = ?) as my_rating
         FROM films f
         INNER JOIN jury_assignments ja ON f.id = ja.film_id AND ja.jury_id = ?
         WHERE f.status = 'pending'
         ORDER BY f.created_at DESC`,
        [userId, userId]
      );
      return rows;
    } catch (error) {
      console.error("Error getting films for jury:", error);
      throw error;
    }
  }

  /**
   * Get all pending films for Super Jury (no assignment filter)
   * @param {number} minRatings - Minimum ratings required (films with this many ratings are "complete")
   */
  async getAllPendingFilmsForSuperJury(minRatings = 3) {
    try {
      const [rows] = await pool.execute(
        `SELECT f.*,
          (SELECT AVG(rating) FROM jury_ratings WHERE film_id = f.id) as average_rating,
          (SELECT COUNT(*) FROM jury_ratings WHERE film_id = f.id) as rating_count,
          (SELECT COUNT(*) FROM jury_assignments WHERE film_id = f.id) as assignment_count
         FROM films f
         WHERE f.status = 'pending'
         ORDER BY f.created_at DESC`
      );
      return rows;
    } catch (error) {
      console.error("Error getting films for super jury:", error);
      throw error;
    }
  }

  /**
   * Get films that still need ratings (less than minRatings)
   * @param {number} minRatings - Minimum ratings required
   */
  async getFilmsNeedingRatings(minRatings = 3) {
    try {
      const [rows] = await pool.execute(
        `SELECT f.*,
          (SELECT AVG(rating) FROM jury_ratings WHERE film_id = f.id) as average_rating,
          (SELECT COUNT(*) FROM jury_ratings WHERE film_id = f.id) as rating_count,
          (SELECT COUNT(*) FROM jury_assignments WHERE film_id = f.id) as assignment_count
         FROM films f
         WHERE f.status = 'pending'
         HAVING rating_count < ?
         ORDER BY rating_count ASC, f.created_at ASC`,
        [minRatings]
      );
      return rows;
    } catch (error) {
      console.error("Error getting films needing ratings:", error);
      throw error;
    }
  }

  /**
   * Get films that have enough ratings (completed evaluation)
   * @param {number} minRatings - Minimum ratings required
   */
  async getFilmsWithEnoughRatings(minRatings = 3) {
    try {
      const [rows] = await pool.execute(
        `SELECT f.*,
          (SELECT AVG(rating) FROM jury_ratings WHERE film_id = f.id) as average_rating,
          (SELECT COUNT(*) FROM jury_ratings WHERE film_id = f.id) as rating_count,
          (SELECT COUNT(*) FROM jury_assignments WHERE film_id = f.id) as assignment_count
         FROM films f
         WHERE f.status = 'pending'
         HAVING rating_count >= ?
         ORDER BY average_rating DESC, rating_count DESC`,
        [minRatings]
      );
      return rows;
    } catch (error) {
      console.error("Error getting films with enough ratings:", error);
      throw error;
    }
  }

  /**
   * Get statistics for Super Jury dashboard
   */
  async getSuperJuryStats(minRatings = 3) {
    try {
      const [rows] = await pool.execute(
        `SELECT
          COUNT(*) as total_pending,
          SUM(CASE WHEN (SELECT COUNT(*) FROM jury_ratings WHERE film_id = f.id) < ? THEN 1 ELSE 0 END) as needs_review,
          SUM(CASE WHEN (SELECT COUNT(*) FROM jury_ratings WHERE film_id = f.id) >= ? THEN 1 ELSE 0 END) as review_complete
         FROM films f
         WHERE f.status = 'pending'`,
        [minRatings, minRatings]
      );
      return rows[0];
    } catch (error) {
      console.error("Error getting super jury stats:", error);
      throw error;
    }
  }

  /**
   * Assign films to a jury member (Super Jury only)
   */
  async assignFilmsToJury(juryId, filmIds, assignedBy) {
    try {
      const results = [];
      for (const filmId of filmIds) {
        try {
          await pool.execute(
            `INSERT INTO jury_assignments (jury_id, film_id, assigned_by)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE assigned_by = VALUES(assigned_by), assigned_at = NOW()`,
            [juryId, filmId, assignedBy]
          );
          results.push({ filmId, success: true });
        } catch (err) {
          results.push({ filmId, success: false, error: err.message });
        }
      }
      return results;
    } catch (error) {
      console.error("Error assigning films to jury:", error);
      throw error;
    }
  }

  /**
   * Remove film assignment from jury member
   */
  async removeFilmAssignment(juryId, filmId) {
    try {
      await pool.execute(
        "DELETE FROM jury_assignments WHERE jury_id = ? AND film_id = ?",
        [juryId, filmId]
      );
    } catch (error) {
      console.error("Error removing film assignment:", error);
      throw error;
    }
  }

  /**
   * Get all assignments for a jury member
   */
  async getJuryAssignments(juryId) {
    try {
      const [rows] = await pool.execute(
        `SELECT ja.*, f.title, f.thumbnail_url, f.poster_url, f.director_firstname, f.director_lastname
         FROM jury_assignments ja
         JOIN films f ON ja.film_id = f.id
         WHERE ja.jury_id = ?
         ORDER BY ja.assigned_at DESC`,
        [juryId]
      );
      return rows;
    } catch (error) {
      console.error("Error getting jury assignments:", error);
      throw error;
    }
  }

  /**
   * Get all jury members with their assignment counts
   */
  async getJuryMembersWithAssignments() {
    try {
      const [rows] = await pool.execute(
        `SELECT u.id, u.name, u.email,
          (SELECT COUNT(*) FROM jury_assignments WHERE jury_id = u.id) as assigned_films,
          (SELECT COUNT(*) FROM jury_ratings WHERE user_id = u.id) as rated_films
         FROM users u
         JOIN user_roles ur ON u.id = ur.user_id
         WHERE ur.role_id = 1
         ORDER BY u.name`
      );
      return rows;
    } catch (error) {
      console.error("Error getting jury members:", error);
      throw error;
    }
  }

  /**
   * Get films assigned to a specific jury member (for Super Jury view)
   */
  async getFilmsAssignedToJury(juryId) {
    try {
      const [rows] = await pool.execute(
        `SELECT f.id, f.title, f.thumbnail_url, f.poster_url, f.director_firstname, f.director_lastname,
          ja.assigned_at,
          (SELECT rating FROM jury_ratings WHERE film_id = f.id AND user_id = ?) as jury_rating
         FROM films f
         JOIN jury_assignments ja ON f.id = ja.film_id
         WHERE ja.jury_id = ?
         ORDER BY ja.assigned_at DESC`,
        [juryId, juryId]
      );
      return rows;
    } catch (error) {
      console.error("Error getting films assigned to jury:", error);
      throw error;
    }
  }
}

export default new FilmModel();
