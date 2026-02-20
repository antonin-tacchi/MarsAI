import { validationResult } from "express-validator";
import Rating from "../models/Rating.js";
import pool from "../config/database.js";

/**
 * Create a new rating for a film
 * POST /api/ratings
 */
export const createRating = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { film_id, rating, comment } = req.body;
    const userId = req.user.userId;

    // Check if film exists
    const [filmRows] = await pool.execute(
      "SELECT id, status FROM films WHERE id = ?",
      [film_id]
    );

    if (filmRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Film not found",
      });
    }

    // Optional: Check if film is approved (only rate approved films)
    const film = filmRows[0];
    if (film.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "You can only rate approved films",
      });
    }

    // Check if user already rated this film
    const existingRating = await Rating.findByFilmAndUser(film_id, userId);
    if (existingRating) {
      return res.status(409).json({
        success: false,
        message: "You have already rated this film. Use PUT to update your rating.",
        existing_rating_id: existingRating.id,
      });
    }

    // Create the rating
    const newRating = await Rating.create(film_id, userId, rating, comment || null);

    return res.status(201).json({
      success: true,
      message: "Rating created successfully",
      data: newRating,
    });
  } catch (error) {
    console.error("Create rating error:", error);

    if (error.code === "DUPLICATE_RATING") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error creating rating",
    });
  }
};

/**
 * Update an existing rating
 * PUT /api/ratings/:id
 */
export const updateRating = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const ratingId = parseInt(req.params.id, 10);
    if (!ratingId) {
      return res.status(400).json({ success: false, message: "Invalid rating ID" });
    }
    const userId = req.user.userId;
    const { rating, comment } = req.body;

    // Check if rating exists and belongs to user
    const existingRating = await Rating.findById(ratingId);
    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    if (existingRating.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own ratings",
      });
    }

    // Prepare updates
    const updates = {};
    if (rating !== undefined) updates.rating = rating;
    if (comment !== undefined) updates.comment = comment;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    // Update the rating
    const updatedRating = await Rating.update(ratingId, userId, updates);

    return res.status(200).json({
      success: true,
      message: "Rating updated successfully",
      data: updatedRating,
    });
  } catch (error) {
    console.error("Update rating error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating rating",
    });
  }
};

/**
 * Get all ratings for a specific film
 * GET /api/ratings/film/:filmId
 */
export const getRatingsByFilm = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const filmId = parseInt(req.params.filmId, 10);
    if (!filmId) {
      return res.status(400).json({ success: false, message: "Invalid film ID" });
    }

    // Check if film exists
    const [filmRows] = await pool.execute(
      "SELECT id FROM films WHERE id = ?",
      [filmId]
    );

    if (filmRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Film not found",
      });
    }

    // Get ratings
    const ratings = await Rating.findByFilm(filmId);
    const stats = await Rating.getFilmStats(filmId);

    return res.status(200).json({
      success: true,
      data: {
        ratings,
        stats,
      },
    });
  } catch (error) {
    console.error("Get ratings by film error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving ratings",
    });
  }
};

/**
 * Get all ratings made by the authenticated jury member
 * GET /api/ratings/my-ratings
 */
export const getMyRatings = async (req, res) => {
  try {
    const userId = req.user.userId;

    const ratings = await Rating.findByUser(userId);

    return res.status(200).json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    console.error("Get my ratings error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving your ratings",
    });
  }
};

/**
 * Get a single rating by ID
 * GET /api/ratings/:id
 */
export const getRatingById = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const ratingId = parseInt(req.params.id, 10);
    if (!ratingId) {
      return res.status(400).json({ success: false, message: "Invalid rating ID" });
    }

    const rating = await Rating.findById(ratingId);

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: rating,
    });
  } catch (error) {
    console.error("Get rating by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving rating",
    });
  }
};

/**
 * Delete a rating (jury can delete their own rating)
 * DELETE /api/ratings/:id
 */
export const deleteRating = async (req, res) => {
  try {
    const ratingId = parseInt(req.params.id, 10);
    if (!ratingId) {
      return res.status(400).json({ success: false, message: "Invalid rating ID" });
    }
    const userId = req.user.userId;

    // Check if rating exists and belongs to user
    const existingRating = await Rating.findById(ratingId);
    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    if (existingRating.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own ratings",
      });
    }

    const deleted = await Rating.delete(ratingId, userId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete rating",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rating deleted successfully",
    });
  } catch (error) {
    console.error("Delete rating error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting rating",
    });
  }
};

/**
 * Get rating statistics for a film
 * GET /api/ratings/stats/:filmId
 */
export const getFilmStats = async (req, res) => {
  try {
    const filmId = parseInt(req.params.filmId, 10);
    if (!filmId) {
      return res.status(400).json({ success: false, message: "Invalid film ID" });
    }

    // Check if film exists
    const [filmRows] = await pool.execute(
      "SELECT id FROM films WHERE id = ?",
      [filmId]
    );

    if (filmRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Film not found",
      });
    }

    const stats = await Rating.getFilmStats(filmId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get film stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving film statistics",
    });
  }
};
