import pool from "../config/database.js";

/**
 * Stats Model - MySQL database operations for admin statistics
 */
class StatsModel {
  /**
   * Get overview statistics (total films, by status, votes, AI usage)
   * @returns {Promise<Object>} Overview stats
   */
  async getOverviewStats() {
    try {
      const [filmStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_films,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_films,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_films,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_films,
          SUM(CASE WHEN ai_certification = 1 THEN 1 ELSE 0 END) as films_with_ai,
          SUM(CASE WHEN ai_certification = 0 THEN 1 ELSE 0 END) as films_without_ai
        FROM films
      `);

      // Get total public votes (if you have a public_votes table)
      // For now, using jury_ratings as placeholder
      const [voteStats] = await pool.execute(`
        SELECT COUNT(*) as total_votes
        FROM jury_ratings
      `);

      return {
        total_films: parseInt(filmStats[0].total_films) || 0,
        pending_films: parseInt(filmStats[0].pending_films) || 0,
        approved_films: parseInt(filmStats[0].approved_films) || 0,
        rejected_films: parseInt(filmStats[0].rejected_films) || 0,
        total_public_votes: parseInt(voteStats[0].total_votes) || 0,
        films_with_ai: parseInt(filmStats[0].films_with_ai) || 0,
        films_without_ai: parseInt(filmStats[0].films_without_ai) || 0,
      };
    } catch (error) {
      console.error("Error getting overview stats:", error);
      throw error;
    }
  }

  /**
   * Get film distribution by country
   * @returns {Promise<Array>} Array of {country, count}
   */
  async getStatsByCountry() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          country,
          COUNT(*) as count
        FROM films
        WHERE country IS NOT NULL AND country != ''
        GROUP BY country
        ORDER BY count DESC, country ASC
      `);

      return rows.map((row) => ({
        country: row.country,
        count: parseInt(row.count),
      }));
    } catch (error) {
      console.error("Error getting stats by country:", error);
      throw error;
    }
  }

  /**
   * Get film distribution by category
   * @returns {Promise<Array>} Array of {category_id, category_name, count}
   */
  async getStatsByCategory() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          c.id as category_id,
          c.name as category_name,
          COUNT(fc.film_id) as count
        FROM categories c
        LEFT JOIN film_categories fc ON c.id = fc.category_id
        LEFT JOIN films f ON fc.film_id = f.id
        GROUP BY c.id, c.name
        ORDER BY count DESC, c.name ASC
      `);

      return rows.map((row) => ({
        category_id: row.category_id,
        category_name: row.category_name,
        count: parseInt(row.count) || 0,
      }));
    } catch (error) {
      console.error("Error getting stats by category:", error);
      throw error;
    }
  }

  /**
   * Get AI usage statistics
   * @returns {Promise<Object>} AI usage stats
   */
  async getAIUsageStats() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          SUM(CASE WHEN ai_certification = 1 THEN 1 ELSE 0 END) as with_ai_certification,
          SUM(CASE WHEN ai_certification = 0 THEN 1 ELSE 0 END) as without_ai_certification,
          COUNT(*) as total
        FROM films
      `);

      const withAI = parseInt(rows[0].with_ai_certification) || 0;
      const withoutAI = parseInt(rows[0].without_ai_certification) || 0;
      const total = parseInt(rows[0].total) || 0;

      const percentageAI = total > 0 ? ((withAI / total) * 100).toFixed(1) : 0;

      return {
        with_ai_certification: withAI,
        without_ai_certification: withoutAI,
        percentage_ai: parseFloat(percentageAI),
        total_films: total,
      };
    } catch (error) {
      console.error("Error getting AI usage stats:", error);
      throw error;
    }
  }

  /**
   * Get film submission timeline (films per month)
   * @param {number} months - Number of months to look back (default 6)
   * @returns {Promise<Array>} Array of {month, year, count}
   */
  async getSubmissionTimeline(months = 6) {
    try {
      const [rows] = await pool.execute(
        `
        SELECT 
          YEAR(created_at) as year,
          MONTH(created_at) as month,
          COUNT(*) as count
        FROM films
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
        GROUP BY YEAR(created_at), MONTH(created_at)
        ORDER BY year DESC, month DESC
      `,
        [months]
      );

      return rows.map((row) => ({
        year: row.year,
        month: row.month,
        count: parseInt(row.count),
        month_name: new Date(row.year, row.month - 1).toLocaleString("fr-FR", {
          month: "long",
        }),
      }));
    } catch (error) {
      console.error("Error getting submission timeline:", error);
      throw error;
    }
  }

  /**
   * Get top rated films (by jury ratings average)
   * @param {number} limit - Number of top films to return (default 10)
   * @returns {Promise<Array>} Array of top rated films
   */
  async getTopRatedFilms(limit = 10) {
    try {
      const [rows] = await pool.execute(
        `
        SELECT 
          f.id,
          f.title,
          f.director_firstname,
          f.director_lastname,
          f.poster_url,
          AVG(jr.rating) as average_rating,
          COUNT(jr.id) as rating_count
        FROM films f
        INNER JOIN jury_ratings jr ON f.id = jr.film_id
        WHERE f.status = 'approved'
        GROUP BY f.id, f.title, f.director_firstname, f.director_lastname, f.poster_url
        HAVING COUNT(jr.id) >= 3
        ORDER BY average_rating DESC, rating_count DESC
        LIMIT ?
      `,
        [limit]
      );

      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        director_firstname: row.director_firstname,
        director_lastname: row.director_lastname,
        poster_url: row.poster_url,
        average_rating: parseFloat(row.average_rating).toFixed(2),
        rating_count: parseInt(row.rating_count),
      }));
    } catch (error) {
      console.error("Error getting top rated films:", error);
      throw error;
    }
  }

  /**
   * Get jury activity stats
   * @returns {Promise<Object>} Jury activity statistics
   */
  async getJuryActivityStats() {
    try {
      const [juryStats] = await pool.execute(`
        SELECT 
          COUNT(DISTINCT u.id) as total_jury_members,
          COUNT(jr.id) as total_ratings,
          AVG(ratings_per_jury) as avg_ratings_per_jury
        FROM users u
        INNER JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN jury_ratings jr ON u.id = jr.user_id
        LEFT JOIN (
          SELECT user_id, COUNT(*) as ratings_per_jury
          FROM jury_ratings
          GROUP BY user_id
        ) AS jury_counts ON u.id = jury_counts.user_id
        WHERE ur.role_id = 1
      `);

      const [mostActiveJury] = await pool.execute(`
        SELECT 
          u.id,
          u.name,
          COUNT(jr.id) as rating_count
        FROM users u
        INNER JOIN jury_ratings jr ON u.id = jr.user_id
        GROUP BY u.id, u.name
        ORDER BY rating_count DESC
        LIMIT 5
      `);

      return {
        total_jury_members: parseInt(juryStats[0].total_jury_members) || 0,
        total_ratings: parseInt(juryStats[0].total_ratings) || 0,
        avg_ratings_per_jury: parseFloat(
          juryStats[0].avg_ratings_per_jury || 0
        ).toFixed(2),
        most_active_jury: mostActiveJury.map((jury) => ({
          id: jury.id,
          name: jury.name,
          rating_count: parseInt(jury.rating_count),
        })),
      };
    } catch (error) {
      console.error("Error getting jury activity stats:", error);
      throw error;
    }
  }

  /**
   * Get all statistics in one call (for dashboard overview)
   * @returns {Promise<Object>} All statistics combined
   */
  async getAllStats() {
    try {
      const [overview, byCountry, byCategory, aiUsage] = await Promise.all([
        this.getOverviewStats(),
        this.getStatsByCountry(),
        this.getStatsByCategory(),
        this.getAIUsageStats(),
      ]);

      return {
        overview,
        by_country: byCountry,
        by_category: byCategory,
        ai_usage: aiUsage,
      };
    } catch (error) {
      console.error("Error getting all stats:", error);
      throw error;
    }
  }
}

export default new StatsModel();