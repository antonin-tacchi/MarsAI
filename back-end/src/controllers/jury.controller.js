import JuryRating from "../models/JuryRating.js";
import Film from "../models/Film.js";
import User from "../models/User.js";
import db from "../config/database.js";

/**
 * Get all approved films with ratings for jury dashboard
 */
export const getJuryFilms = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const films = await JuryRating.getFilmsWithRatings(userId);

    return res.status(200).json({
      success: true,
      data: films,
    });
  } catch (error) {
    console.error("getJuryFilms error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la recuperation des films",
    });
  }
};

/**
 * Get single film with all ratings
 */
export const getFilmDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const film = await Film.findById(id);
    if (!film) {
      return res.status(404).json({
        success: false,
        message: "Film non trouve",
      });
    }

    const ratings = await JuryRating.findByFilm(id);
    const stats = await JuryRating.getAverageRating(id);
    const userRating = await JuryRating.findByFilmAndUser(id, userId);

    return res.status(200).json({
      success: true,
      data: {
        ...film,
        ratings,
        stats,
        userRating: userRating?.rating || null,
        userComment: userRating?.comment || null,
      },
    });
  } catch (error) {
    console.error("getFilmDetails error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la recuperation du film",
    });
  }
};

/**
 * Rate a film (1-5 stars)
 */
export const rateFilm = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.userId;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "La note doit etre entre 1 et 5",
      });
    }

    // Check if film exists and is approved
    const film = await Film.findById(id);
    if (!film) {
      return res.status(404).json({
        success: false,
        message: "Film non trouve",
      });
    }

    if (film.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Seuls les films approuves peuvent etre notes",
      });
    }

    // Create or update rating
    await JuryRating.upsert(id, userId, rating, comment || null);

    // Get updated stats
    const stats = await JuryRating.getAverageRating(id);

    return res.status(200).json({
      success: true,
      message: "Note enregistree",
      data: {
        filmId: id,
        rating,
        comment,
        stats,
      },
    });
  } catch (error) {
    console.error("rateFilm error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement de la note",
    });
  }
};

/**
 * Get all jury members (Super Jury / Admin only)
 */
export const getJuryMembers = async (req, res) => {
  try {
    const sql = `
      SELECT DISTINCT u.id, u.name, u.email,
        (SELECT GROUP_CONCAT(r.role_name) FROM user_roles ur
         JOIN roles r ON ur.role_id = r.id
         WHERE ur.user_id = u.id) as roles,
        (SELECT COUNT(*) FROM jury_ratings jr WHERE jr.user_id = u.id) as ratings_count
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      WHERE ur.role_id IN (1, 3)
      ORDER BY u.name
    `;
    const [rows] = await db.query(sql);

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("getJuryMembers error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la recuperation des jurys",
    });
  }
};

/**
 * Get film rankings by average rating
 */
export const getFilmRankings = async (req, res) => {
  try {
    const sql = `
      SELECT
        f.id,
        f.title,
        f.country,
        f.poster_url,
        f.thumbnail_url,
        f.director_firstname,
        f.director_lastname,
        AVG(jr.rating) as avg_rating,
        COUNT(jr.id) as rating_count
      FROM films f
      LEFT JOIN jury_ratings jr ON f.id = jr.film_id
      WHERE f.status = 'approved'
      GROUP BY f.id
      HAVING rating_count >= 3
      ORDER BY avg_rating DESC, rating_count DESC
    `;
    const [rows] = await db.query(sql);

    return res.status(200).json({
      success: true,
      data: rows.map((row, index) => ({
        ...row,
        rank: index + 1,
        avg_rating: row.avg_rating ? parseFloat(row.avg_rating).toFixed(2) : null,
      })),
    });
  } catch (error) {
    console.error("getFilmRankings error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la recuperation du classement",
    });
  }
};

/**
 * Get user's ratings history
 */
export const getUserRatings = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const ratings = await JuryRating.findByUser(userId);

    return res.status(200).json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    console.error("getUserRatings error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la recuperation des notes",
    });
  }
};
