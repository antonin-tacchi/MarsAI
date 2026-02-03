import Film from "../models/Film.js";
import fs from "fs";
import FilmsRepository from "../repositories/films.repository.js";
import { MAX_POSTER_SIZE, MAX_THUMBNAIL_SIZE, MAX_FILM_SIZE } from "../routes/film.routes.js";
import { FILM_STATUS } from "../constants/filmStatus.js";
import { canChangeFilmStatus } from "../services/filmStatus.service.js";

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

    if (posterFile.size > MAX_POSTER_SIZE) {
      cleanupFiles(posterFile, filmFile, thumbnailFile);
      return res.status(400).json({ success: false, message: "Poster too large" });
    }

    if (thumbnailFile && thumbnailFile.size > MAX_THUMBNAIL_SIZE) {
      cleanupFiles(posterFile, filmFile, thumbnailFile);
      return res.status(400).json({ success: false, message: "Thumbnail too large" });
    }

    if (filmFile.size > MAX_FILM_SIZE) {
      cleanupFiles(posterFile, filmFile, thumbnailFile);
      return res.status(400).json({ success: false, message: "Film too large" });
    }XMLDocument

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
      cleanupFiles(posterFile, filmFile, thumbnailFile);
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
      cleanupFiles(posterFile, filmFile, thumbnailFile);
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length",
      });
    }

    const recentCount = await Film.countRecentByEmail(director_email);
    if (recentCount >= 5) {
      cleanupFiles(posterFile, filmFile, thumbnailFile);
      return res.status(429).json({
        success: false,
        message: "Too many submissions for this email. Please try again later.",
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
      youtube_link: null,
      poster_url: posterUrl,
      thumbnail_url: thumbnailUrl,
      ai_tools_used: ai_tools_used || null,
      ai_certification,
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
    cleanupFiles(posterFile, filmFile, thumbnailFile);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateFilmStatus = async (req, res) => {
  try {
    const filmId = req.params.id;
    const { status: nextStatus } = req.body;

    if (!Object.values(FILM_STATUS).includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const film = await Film.findById(filmId);
    if (!film) {
      return res.status(404).json({
        success: false,
        message: "Film not found",
      });
    }

    if (!canChangeFilmStatus(film.status, nextStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status transition not allowed",
      });
    }

    await Film.updateStatus(filmId, nextStatus);

    return res.json({
      success: true,
      message: "Film status updated",
      data: {
        id: filmId,
        status: nextStatus,
      },
    });
  } catch (err) {
    console.error("updateFilmStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllFilms = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limitRaw = parseInt(req.query.limit || "20", 10);
    const limit = Math.min(Math.max(limitRaw, 1), 100);
    const offset = (page - 1) * limit;

    const filters = {
      q: req.query.q?.trim() || null,
      countries: req.query.countries
        ? req.query.countries.split(",").map(s => s.trim()).filter(Boolean)
        : [],
      categories: req.query.categories
        ? req.query.categories.split(",").map(s => s.trim()).filter(Boolean)
        : [],
      ai_tools: req.query.ai_tools
        ? req.query.ai_tools.split(",").map(s => s.trim()).filter(Boolean)
        : [],
    };

    const sort = req.query.sort || "recent";
    const { rows, total } = await FilmsRepository.findAll({ filters, sort, limit, offset });
    const items = rows.map(Film.toPublicDTO);

    return res.json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getAllFilms error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
