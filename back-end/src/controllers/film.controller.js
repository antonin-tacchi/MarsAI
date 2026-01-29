<<<<<<< HEAD
import { validationResult } from "express-validator";
import Film from "../models/Film.js";
import emailService from "../services/email.service.js";

/**
 * Submit a new film (public - no auth required)
 */
export const submitFilm = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Handle uploaded files
    let filmUrl = null;
    let posterUrl = null;
    let thumbnailUrl = null;

    if (req.files) {
      if (req.files.film && req.files.film[0]) {
        filmUrl = `/uploads/films/${req.files.film[0].filename}`;
      }
      if (req.files.poster && req.files.poster[0]) {
        posterUrl = `/uploads/posters/${req.files.poster[0].filename}`;
      }
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        thumbnailUrl = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`;
      }
    }

    const filmData = {
      // Film Information
      title: req.body.title,
      country: req.body.country,
      description: req.body.description,
      film_url: filmUrl,
      poster_url: posterUrl || req.body.poster_url,
      thumbnail_url: thumbnailUrl || req.body.thumbnail_url,
      ai_tools_used: req.body.ai_tools_used,
      ai_certification: req.body.ai_certification,

      // Director Information
      director_firstname: req.body.director_firstname,
      director_lastname: req.body.director_lastname,
      director_email: req.body.director_email,
      director_bio: req.body.director_bio,
      director_school: req.body.director_school,
      director_website: req.body.director_website,
      social_instagram: req.body.social_instagram,
      social_youtube: req.body.social_youtube,
      social_vimeo: req.body.social_vimeo,
    };

    const film = await Film.create(filmData);

    // Assign categories if provided
    if (req.body.category_ids && Array.isArray(req.body.category_ids)) {
      for (const categoryId of req.body.category_ids) {
        await Film.assignCategory(film.id, categoryId);
      }
    }

    // Send confirmation email
    await emailService.sendSubmissionConfirmation(film);

    return res.status(201).json({
      success: true,
      message: "Film soumis avec succes. Vous recevrez un email de confirmation.",
      data: {
        id: film.id,
        title: film.title,
        status: film.status,
      },
    });
  } catch (error) {
    console.error("Submit film error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la soumission du film",
    });
=======
import Film from "../models/Film.js";
import fs from "fs";

const MAX_TITLE = 255;
const MAX_COUNTRY = 100;
const MAX_DESCRIPTION = 2000;
const MAX_AI_TOOLS = 255;
const MAX_NAME = 100;
const MAX_EMAIL = 255;
const MAX_BIO = 2000;
const MAX_SCHOOL = 255;
const MAX_WEBSITE = 255;
const MAX_SOCIAL = 255;

function safeUnlink(file) {
  if (!file?.path) return;
  fs.unlink(file.path, () => {});
}

export const createFilm = async (req, res) => {
  try {
    const posterFile = req.files?.poster?.[0];
    const filmFile = req.files?.film?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];

    if (!posterFile || !filmFile) {
      safeUnlink(posterFile);
      safeUnlink(filmFile);
      safeUnlink(thumbnailFile);

      return res.status(400).json({
        success: false,
        message: "poster and film files are required",
      });
    }

    const {
      title,
      country,
      description,
      ai_tools_used,
      ai_certification,
      director_firstname,
      director_lastname,
      director_email,
      director_bio,
      director_school,
      director_website,
      social_instagram,
      social_youtube,
      social_vimeo,
    } = req.body;

    if (!title || !country || !description || !director_firstname || !director_lastname || !director_email) {
      safeUnlink(posterFile);
      safeUnlink(filmFile);
      safeUnlink(thumbnailFile);

      return res.status(400).json({
        success: false,
        message:
          "title, country, description, director_firstname, director_lastname, director_email are required",
      });
    }

    const tooLong =
      title.length > MAX_TITLE ||
      country.length > MAX_COUNTRY ||
      description.length > MAX_DESCRIPTION ||
      (ai_tools_used && ai_tools_used.length > MAX_AI_TOOLS) ||
      director_firstname.length > MAX_NAME ||
      director_lastname.length > MAX_NAME ||
      director_email.length > MAX_EMAIL ||
      (director_bio && director_bio.length > MAX_BIO) ||
      (director_school && director_school.length > MAX_SCHOOL) ||
      (director_website && director_website.length > MAX_WEBSITE) ||
      (social_instagram && social_instagram.length > MAX_SOCIAL) ||
      (social_youtube && social_youtube.length > MAX_SOCIAL) ||
      (social_vimeo && social_vimeo.length > MAX_SOCIAL);

    if (tooLong) {
      safeUnlink(posterFile);
      safeUnlink(filmFile);
      safeUnlink(thumbnailFile);

      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length",
      });
    }

    const recentCount = await Film.countRecentByEmail(director_email);
    if (recentCount >= 5) {
      safeUnlink(posterFile);
      safeUnlink(filmFile);
      safeUnlink(thumbnailFile);

      return res.status(429).json({
        success: false,
        message: "Too many submissions for this email. Please try again later.",
      });
    }

    const filmUrl = `/uploads/films/${filmFile.filename}`;
    const posterUrl = `/uploads/posters/${posterFile.filename}`;
    const thumbnailUrl = thumbnailFile ? `/uploads/thumbnails/${thumbnailFile.filename}` : null;

    // Handle ai_certification: can be true, "true", 1, "1"
    const isAiCert =
      ai_certification === true ||
      ai_certification === 1 ||
      String(ai_certification).toLowerCase() === "true" ||
      String(ai_certification) === "1";

    // AI certification is required
    if (!isAiCert) {
      safeUnlink(posterFile);
      safeUnlink(filmFile);
      safeUnlink(thumbnailFile);

      return res.status(400).json({
        success: false,
        message: "La certification IA est obligatoire. Veuillez cocher la case.",
      });
    }

    const created = await Film.create({
      title,
      country,
      description,
      film_url: filmUrl,
      youtube_url: null,
      poster_url: posterUrl,
      thumbnail_url: thumbnailUrl,
      ai_tools_used: ai_tools_used || null,
      ai_certification: isAiCert,
      director_firstname,
      director_lastname,
      director_email,
      director_bio: director_bio || null,
      director_school: director_school || null,
      director_website: director_website || null,
      social_instagram: social_instagram || null,
      social_youtube: social_youtube || null,
      social_vimeo: social_vimeo || null,
    });

    return res.status(201).json({
      success: true,
      message: "Film submitted",
      data: created,
    });
  } catch (err) {
    console.error("createFilm error:", err);

    const posterFile = req.files?.poster?.[0];
    const filmFile = req.files?.film?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];

    safeUnlink(posterFile);
    safeUnlink(filmFile);
    safeUnlink(thumbnailFile);

    return res.status(500).json({ success: false, message: "Server error" });
>>>>>>> thomas/claude/youtube-jury-backup-flqXs
  }
};

/**
<<<<<<< HEAD
 * Get all films (for jury/admin)
 */
export const getAllFilms = async (req, res) => {
  try {
    const { status } = req.query;
    const filters = {};
    if (status) filters.status = status;

    const films = await Film.getAll(filters);

    return res.status(200).json({
      success: true,
      data: films,
    });
  } catch (error) {
    console.error("Get all films error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la recuperation des films",
    });
  }
};

/**
 * Get pending films (for jury/admin)
 */
export const getPendingFilms = async (req, res) => {
  try {
    const films = await Film.getPending();

=======
 * Get all pending films (Admin only)
 */
export const getPendingFilms = async (req, res) => {
  try {
    const films = await Film.findAllPending();
>>>>>>> thomas/claude/youtube-jury-backup-flqXs
    return res.status(200).json({
      success: true,
      data: films,
    });
<<<<<<< HEAD
  } catch (error) {
    console.error("Get pending films error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la recuperation des films en attente",
    });
=======
  } catch (err) {
    console.error("getPendingFilms error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
>>>>>>> thomas/claude/youtube-jury-backup-flqXs
  }
};

/**
<<<<<<< HEAD
 * Get approved films (public - for catalog)
 */
export const getApprovedFilms = async (req, res) => {
  try {
    const films = await Film.getApproved();

    // Return only public information
    const publicFilms = films.map((film) => ({
      id: film.id,
      title: film.title,
      director_firstname: film.director_firstname,
      director_lastname: film.director_lastname,
      description: film.description,
      country: film.country,
      poster_url: film.poster_url,
      ai_tools_used: film.ai_tools_used,
    }));

    return res.status(200).json({
      success: true,
      data: publicFilms,
    });
  } catch (error) {
    console.error("Get approved films error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la recuperation des films",
    });
=======
 * Get all approved films (Catalog - Public)
 */
export const getApprovedFilms = async (req, res) => {
  try {
    const films = await Film.findApproved();
    return res.status(200).json({
      success: true,
      data: films,
    });
  } catch (err) {
    console.error("getApprovedFilms error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
>>>>>>> thomas/claude/youtube-jury-backup-flqXs
  }
};

/**
<<<<<<< HEAD
 * Get a single film by ID
 */
export const getFilmById = async (req, res) => {
  try {
    const { id } = req.params;
    const film = await Film.findById(id);
=======
 * Update film status (Admin only)
 */
export const updateFilmStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'approved' or 'rejected'",
      });
    }

    const film = await Film.findById(id);
    if (!film) {
      return res.status(404).json({
        success: false,
        message: "Film not found",
      });
    }

    const updated = await Film.updateStatus(id, status, rejection_reason || null);

    if (!updated) {
      return res.status(500).json({
        success: false,
        message: "Failed to update film status",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Film ${status}`,
      data: { id, status },
    });
  } catch (err) {
    console.error("updateFilmStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get all films (Admin only)
 */
export const getAllFilms = async (req, res) => {
  try {
    const films = await Film.findAll();
    return res.status(200).json({
      success: true,
      data: films,
    });
  } catch (err) {
    console.error("getAllFilms error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============ PUBLIC ROUTES ============

/**
 * Get public catalog of approved films (Public - No auth required)
 * Returns films with YouTube URLs for public viewing
 */
export const getPublicCatalog = async (req, res) => {
  try {
    const films = await Film.findForPublicCatalog();
    return res.status(200).json({
      success: true,
      data: films,
    });
  } catch (err) {
    console.error("getPublicCatalog error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get single film for public viewing (Public - No auth required)
 * Returns film with YouTube URL and director info
 */
export const getPublicFilm = async (req, res) => {
  try {
    const { id } = req.params;
    const film = await Film.findForPublicView(id);
>>>>>>> thomas/claude/youtube-jury-backup-flqXs

    if (!film) {
      return res.status(404).json({
        success: false,
<<<<<<< HEAD
        message: "Film non trouve",
      });
    }

    // Get categories
    const categories = await Film.getCategories(id);
    film.categories = categories;

=======
        message: "Film not found or not approved",
      });
    }

>>>>>>> thomas/claude/youtube-jury-backup-flqXs
    return res.status(200).json({
      success: true,
      data: film,
    });
<<<<<<< HEAD
  } catch (error) {
    console.error("Get film by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la recuperation du film",
    });
  }
};

/**
 * Approve a film (jury/admin only)
 */
export const approveFilm = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
=======
  } catch (err) {
    console.error("getPublicFilm error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============ ADMIN ROUTES ============

/**
 * Update YouTube URL for a film (Admin only)
 */
export const updateYouTubeUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { youtube_url } = req.body;
>>>>>>> thomas/claude/youtube-jury-backup-flqXs

    const film = await Film.findById(id);
    if (!film) {
      return res.status(404).json({
        success: false,
<<<<<<< HEAD
        message: "Film non trouve",
      });
    }

    if (film.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Ce film a deja ete traite (statut: ${film.status})`,
      });
    }

    const updatedFilm = await Film.approve(id, userId);

    // Send approval email
    await emailService.sendApprovalNotification(updatedFilm);

    return res.status(200).json({
      success: true,
      message: "Film approuve avec succes",
      data: updatedFilm,
    });
  } catch (error) {
    console.error("Approve film error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'approbation du film",
    });
  }
};

/**
 * Reject a film (jury/admin only)
 */
export const rejectFilm = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const film = await Film.findById(id);
    if (!film) {
      return res.status(404).json({
        success: false,
        message: "Film non trouve",
      });
    }

    if (film.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Ce film a deja ete traite (statut: ${film.status})`,
      });
    }

    const updatedFilm = await Film.reject(id, userId, reason);

    // Send rejection email
    await emailService.sendRejectionNotification(updatedFilm);

    return res.status(200).json({
      success: true,
      message: "Film refuse",
      data: updatedFilm,
    });
  } catch (error) {
    console.error("Reject film error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du refus du film",
    });
  }
};

/**
 * Get film statistics (jury/admin)
 */
export const getFilmStats = async (req, res) => {
  try {
    const stats = await Film.getStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get film stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la recuperation des statistiques",
    });
  }
};

/**
 * Check submission status by email (public)
 */
export const checkSubmissionStatus = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email requis",
      });
    }

    const films = await Film.findByEmail(email);

    return res.status(200).json({
      success: true,
      data: films,
    });
  } catch (error) {
    console.error("Check submission status error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la verification du statut",
    });
  }
};

/**
 * Delete a film (admin only)
 */
export const deleteFilm = async (req, res) => {
  try {
    const { id } = req.params;

    const film = await Film.findById(id);
    if (!film) {
      return res.status(404).json({
        success: false,
        message: "Film non trouve",
      });
    }

    await Film.delete(id);

    return res.status(200).json({
      success: true,
      message: "Film supprime avec succes",
    });
  } catch (error) {
    console.error("Delete film error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du film",
    });
  }
};

/**
 * Rate a film (jury/admin)
 */
export const rateFilm = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "La note doit etre entre 1 et 5",
      });
    }

    const film = await Film.findById(id);
    if (!film) {
      return res.status(404).json({
        success: false,
        message: "Film non trouve",
      });
    }

    const userRating = await Film.rateFilm(id, userId, rating, comment);
    const averageRating = await Film.getAverageRating(id);

    return res.status(200).json({
      success: true,
      message: "Note enregistree",
      data: {
        userRating,
        averageRating,
      },
    });
  } catch (error) {
    console.error("Rate film error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la notation du film",
    });
  }
};

/**
 * Get ratings for a film (jury/admin)
 */
export const getFilmRatings = async (req, res) => {
  try {
    const { id } = req.params;

    const film = await Film.findById(id);
    if (!film) {
      return res.status(404).json({
        success: false,
        message: "Film non trouve",
      });
    }

    const ratings = await Film.getFilmRatings(id);
    const averageRating = await Film.getAverageRating(id);

    return res.status(200).json({
      success: true,
      data: {
        ratings,
        average: averageRating.average,
        count: averageRating.count,
      },
    });
  } catch (error) {
    console.error("Get film ratings error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la recuperation des notes",
    });
  }
};

/**
 * Update film categories (jury/admin)
 */
export const updateFilmCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_ids } = req.body;

    const film = await Film.findById(id);
    if (!film) {
      return res.status(404).json({
        success: false,
        message: "Film non trouve",
      });
    }

    const categories = await Film.updateCategories(id, category_ids || []);

    return res.status(200).json({
      success: true,
      message: "Categories mises a jour",
      data: categories,
    });
  } catch (error) {
    console.error("Update film categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la mise a jour des categories",
    });
  }
};

/**
 * Get all categories
 */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Film.getAllCategories();

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get all categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la recuperation des categories",
    });
  }
};

/**
 * Get films for jury dashboard (with ratings info)
 */
export const getFilmsForJury = async (req, res) => {
  try {
    const userId = req.user.id;
    const films = await Film.getFilmsForJury(userId);

    // Get categories for each film
    const filmsWithCategories = await Promise.all(
      films.map(async (film) => {
        const categories = await Film.getCategories(film.id);
        return { ...film, categories };
      })
    );

    return res.status(200).json({
      success: true,
      data: filmsWithCategories,
    });
  } catch (error) {
    console.error("Get films for jury error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la recuperation des films",
    });
  }
};

// ============================================
// SUPER JURY ENDPOINTS
// ============================================

const MIN_RATINGS_REQUIRED = 3; // Films need 3 ratings to be considered "reviewed"

/**
 * Get all pending films for Super Jury with stats
 */
export const getFilmsForSuperJury = async (req, res) => {
  try {
    const [allFilms, stats] = await Promise.all([
      Film.getAllPendingFilmsForSuperJury(MIN_RATINGS_REQUIRED),
      Film.getSuperJuryStats(MIN_RATINGS_REQUIRED),
    ]);

    // Separate films into two groups
    const filmsNeedingReview = allFilms.filter(f => f.rating_count < MIN_RATINGS_REQUIRED);
    const filmsReviewComplete = allFilms.filter(f => f.rating_count >= MIN_RATINGS_REQUIRED);

    // Get categories for films needing review
    const filmsWithCategories = await Promise.all(
      filmsNeedingReview.map(async (film) => {
        const categories = await Film.getCategories(film.id);
        return { ...film, categories };
      })
    );

    return res.status(200).json({
      success: true,
      data: filmsWithCategories,
      completed: filmsReviewComplete,
      stats: {
        ...stats,
        minRatingsRequired: MIN_RATINGS_REQUIRED,
      },
    });
  } catch (error) {
    console.error("Get films for super jury error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la recuperation des films",
    });
  }
};

/**
 * Get all jury members with their assignment counts
 */
export const getJuryMembers = async (req, res) => {
  try {
    const juryMembers = await Film.getJuryMembersWithAssignments();

    return res.status(200).json({
      success: true,
      data: juryMembers,
    });
  } catch (error) {
    console.error("Get jury members error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la recuperation des membres du jury",
    });
  }
};

/**
 * Assign films to a jury member (Super Jury only)
 */
export const assignFilmsToJury = async (req, res) => {
  try {
    const { jury_id, film_ids } = req.body;
    const assignedBy = req.user.id;

    if (!jury_id || !film_ids || !Array.isArray(film_ids)) {
      return res.status(400).json({
        success: false,
        message: "jury_id et film_ids sont requis",
      });
    }

    const results = await Film.assignFilmsToJury(jury_id, film_ids, assignedBy);

    return res.status(200).json({
      success: true,
      message: `${film_ids.length} film(s) assigne(s) au jury`,
      data: results,
    });
  } catch (error) {
    console.error("Assign films to jury error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'assignation des films",
    });
  }
};

/**
 * Remove a film assignment from a jury member
 */
export const removeFilmAssignment = async (req, res) => {
  try {
    const { jury_id, film_id } = req.params;

    await Film.removeFilmAssignment(jury_id, film_id);

    return res.status(200).json({
      success: true,
      message: "Assignation supprimee",
    });
  } catch (error) {
    console.error("Remove film assignment error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'assignation",
    });
  }
};

/**
 * Get films assigned to a specific jury member (for Super Jury view)
 */
export const getJuryAssignedFilms = async (req, res) => {
  try {
    const { jury_id } = req.params;

    const films = await Film.getFilmsAssignedToJury(jury_id);

    return res.status(200).json({
      success: true,
      data: films,
    });
  } catch (error) {
    console.error("Get jury assigned films error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la recuperation des films assignes",
    });
=======
        message: "Film not found",
      });
    }

    // Validate YouTube URL format if provided
    if (youtube_url) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      if (!youtubeRegex.test(youtube_url)) {
        return res.status(400).json({
          success: false,
          message: "Invalid YouTube URL format",
        });
      }
    }

    const updated = await Film.updateYouTubeUrl(id, youtube_url || null);

    if (!updated) {
      return res.status(500).json({
        success: false,
        message: "Failed to update YouTube URL",
      });
    }

    return res.status(200).json({
      success: true,
      message: "YouTube URL updated",
      data: { id, youtube_url },
    });
  } catch (err) {
    console.error("updateYouTubeUrl error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
>>>>>>> thomas/claude/youtube-jury-backup-flqXs
  }
};
