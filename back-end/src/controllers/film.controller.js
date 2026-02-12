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
        message: "Poster and film files are required",
      });
    }

    if (posterFile.size > MAX_POSTER_SIZE) {
      cleanupFiles(posterFile, filmFile, thumbnailFile);
      return res.status(400).json({ success: false, message: "Poster file is too large" });
    }

    if (thumbnailFile && thumbnailFile.size > MAX_THUMBNAIL_SIZE) {
      cleanupFiles(posterFile, filmFile, thumbnailFile);
      return res.status(400).json({ success: false, message: "Thumbnail file is too large" });
    }

    if (filmFile.size > MAX_FILM_SIZE) {
      cleanupFiles(posterFile, filmFile, thumbnailFile);
      return res.status(400).json({ success: false, message: "Film file is too large" });
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

    if (
      !title ||
      !country ||
      !description ||
      !director_firstname ||
      !director_lastname ||
      !director_email
    ) {
      cleanupFiles(posterFile, filmFile, thumbnailFile);
      return res.status(400).json({
        success: false,
        message:
          "Title, country, description, director's first name, last name, and email are required",
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
      cleanupFiles(posterFile, filmFile, thumbnailFile);
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the maximum allowed length",
      });
    }

    const recentCount = await Film.countRecentByEmail(director_email);
    if (recentCount >= 5) {
      cleanupFiles(posterFile, filmFile, thumbnailFile);
      return res.status(429).json({
        success: false,
        message: "Too many submissions from this email. Please try again later",
      });
    }

    const filmUrl = `/uploads/films/${filmFile.filename}`;
    const posterUrl = `/uploads/posters/${posterFile.filename}`;
    const thumbnailUrl = thumbnailFile
      ? `/uploads/thumbnails/${thumbnailFile.filename}`
      : null;

    const created = await Film.create({
      title,
      country,
      description,
      film_url: filmUrl,
      youtube_url: null,
      poster_url: posterUrl,
      thumbnail_url: thumbnailUrl,
      ai_tools_used: ai_tools_used || null,
      ai_certification: ai_certification,
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
      message: "Film submitted successfully",
      data: created,
    });
  } catch (err) {
    console.error("createFilm error:", err);
    cleanupFiles(posterFile, filmFile, thumbnailFile);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getFilms = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const all = String(req.query.all || "") === "1";

    const limit = all
      ? 50
      : Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const offset = all ? 0 : (page - 1) * limit;

    const sortField = req.query.sortField || "created_at";
    const sortOrder = req.query.sortOrder || "DESC";

    const { rows, count } = await Film.findAll({
      limit,
      offset,
      sortField,
      sortOrder,
      status: "approved",
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
      message: "Failed to fetch films",
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

// Public catalog - no auth required
export const getPublicCatalog = async (req, res) => {
  try {
    const films = await Film.findForPublicCatalog();
    return res.status(200).json({ success: true, data: films });
  } catch (err) {
    console.error("getPublicCatalog error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Public single film - no auth required
export const getPublicFilm = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ success: false, message: "Invalid film id" });
    }

    const film = await Film.findForPublicView(id);
    if (!film) {
      return res.status(404).json({ success: false, message: "Film not found" });
    }

    return res.json({ success: true, data: film });
  } catch (err) {
    console.error("getPublicFilm error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

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
