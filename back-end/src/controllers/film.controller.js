import Film from "../models/Film.js";
import fs from "fs";
import {
  MAX_POSTER_SIZE,
  MAX_THUMBNAIL_SIZE,
  MAX_FILM_SIZE,
} from "../routes/film.routes.js";

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

function cleanupFiles(posterFile, filmFile, thumbnailFile) {
  safeUnlink(posterFile);
  safeUnlink(filmFile);
  safeUnlink(thumbnailFile);
}

export const createFilm = async (req, res) => {
  const posterFile = req.files?.poster?.[0];
  const filmFile = req.files?.film?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];

  try {
    if (!posterFile || !filmFile) {
      cleanupFiles(posterFile, filmFile, thumbnailFile);
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
      categories,
    } = req.body;

    // basic validation
    if (!title || !country || !director_firstname || !director_lastname || !director_email) {
      cleanupFiles(posterFile, filmFile, thumbnailFile);
      return res.status(400).json({
        success: false,
        message: "Missing required text fields",
      });
    }

    // length validation
    if (
      title.length > MAX_TITLE ||
      country.length > MAX_COUNTRY ||
      (description && description.length > MAX_DESCRIPTION) ||
      (ai_tools_used && ai_tools_used.length > MAX_AI_TOOLS) ||
      director_firstname.length > MAX_NAME ||
      director_lastname.length > MAX_NAME ||
      director_email.length > MAX_EMAIL ||
      (director_bio && director_bio.length > MAX_BIO) ||
      (director_school && director_school.length > MAX_SCHOOL) ||
      (director_website && director_website.length > MAX_WEBSITE) ||
      (social_instagram && social_instagram.length > MAX_SOCIAL) ||
      (social_youtube && social_youtube.length > MAX_SOCIAL) ||
      (social_vimeo && social_vimeo.length > MAX_SOCIAL)
    ) {
      cleanupFiles(posterFile, filmFile, thumbnailFile);
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed maximum length",
      });
    }

    // anti-spam: check if this email already submitted a film recently
    const recentSubmissions = await Film.countRecentByEmail(director_email, 60);
    if (recentSubmissions >= 3) {
      cleanupFiles(posterFile, filmFile, thumbnailFile);
      return res.status(429).json({
        success: false,
        message: "Too many submissions from this email. Please try again later.",
      });
    }

    const filmData = {
      title: title.trim(),
      country: country.trim(),
      description: description.trim(),
      film_url: `/uploads/films/${filmFile.filename}`,
      poster_url: `/uploads/posters/${posterFile.filename}`,
      thumbnail_url: thumbnailFile 
        ? `/uploads/thumbnails/${thumbnailFile.filename}` 
        : null,
      ai_tools_used: ai_tools_used?.trim(),
      ai_certification,
      director_firstname: director_firstname.trim(),
      director_lastname: director_lastname.trim(),
      director_email: director_email.trim().toLowerCase(),
      director_bio: director_bio?.trim(),
      director_school: director_school?.trim(),
      director_website: director_website?.trim(),
      social_instagram: social_instagram?.trim(),
      social_youtube: social_youtube?.trim(),
      social_vimeo: social_vimeo?.trim(),
    };

    const newFilm = await Film.create(filmData);

    // Handle categories if they exist (expected as a JSON string or array)
    if (categories) {
      try {
        const categoryIds = Array.isArray(categories) 
          ? categories 
          : JSON.parse(categories);
          
        if (Array.isArray(categoryIds)) {
          // You might need a Film.setCategories(filmId, categoryIds) method
          // await Film.setCategories(newFilm.id, categoryIds);
        }
      } catch (e) {
        console.error("Error parsing categories:", e);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Film submitted successfully",
      data: newFilm,
    });
  } catch (err) {
    cleanupFiles(posterFile, filmFile, thumbnailFile);
    console.error("createFilm error:", err);
    return res.status(500).json({
      success: false,
      message: "An error occurred during submission",
    });
  }
};

export const updateFilmStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const updatedFilm = await Film.updateStatus(id, status, userId);

    return res.status(200).json({
      success: true,
      message: `Film status updated to ${status}`,
      data: updatedFilm,
    });
  } catch (err) {
    console.error("updateFilmStatus error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Error updating film status",
    });
  }
};

export const getApprovedFilms = async (req, res) => {
  try {
    const films = await Film.findForPublicCatalog();
    return res.status(200).json({
      success: true,
      data: films,
    });
  } catch (err) {
    console.error("getApprovedFilms error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch approved films",
      error: err.message
    });
  }
};

export const getFilms = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const sortField = req.query.sortField || "created_at";
    const sortOrder = req.query.sortOrder || "DESC";
    const status = req.query.status || null;
    const all = req.query.all === "true";

    const offset = (page - 1) * limit;

    const { rows, count } = await Film.findAll({
      limit: all ? 1000 : limit,
      offset: all ? 0 : offset,
      sortField,
      sortOrder,
      status,
    });

    return res.status(200).json({
      success: true,
      pagination: {
        totalItems: count,
        totalPages: Math.max(1, Math.ceil(count / limit)),
        currentPage: all ? 1 : page,
        itemsPerPage: limit,
        hasNextPage: all ? false : page < Math.ceil(count / limit),
        hasPrevPage: all ? false : page > 1,
      },
      data: rows,
    });
  } catch (err) {
    console.error("getFilms error:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des films",
    });
  }
};

export async function getFilmById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid film id" });
    }

    const film = await Film.findById(id);
    if (!film) {
      return res
        .status(404)
        .json({ success: false, message: "Film not found" });
    }

    return res.json({ success: true, data: film });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getFilmStats = async (req, res) => {
  try {
    const stats = await Film.getStats();
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    console.error("getFilmStats error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch film stats",
    });
  }
};