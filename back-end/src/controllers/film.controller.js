import Film from "../models/Film.js";
import fs from "fs";
import { MAX_POSTER_SIZE, MAX_THUMBNAIL_SIZE, MAX_FILM_SIZE} from "../routes/film.routes.js";
import FilmsRepository from "../repositories/films.repository.js";
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
      return res
        .status(400)
        .json({ success: false, message: "Poster too large" });
    }

    if (thumbnailFile && thumbnailFile.size > MAX_THUMBNAIL_SIZE) {
      cleanupFiles(posterFile, filmFile, thumbnailFile);
      return res
        .status(400)
        .json({ success: false, message: "Thumbnail too large" });
    }

    if (filmFile.size > MAX_FILM_SIZE) {
      cleanupFiles(posterFile, filmFile, thumbnailFile);
      return res
        .status(400)
        .json({ success: false, message: "Film too large" });
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

export const getFilms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    let sortOrder = "DESC";

    if (req.query.sortBy === "oldest") {
      sortOrder = "ASC";
    }

    const { rows, total } = await FilmsRepository.findAll({
      filters: {},
      sort: sortOrder === "ASC" ? "oldest" : "recent",
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        itemsPerPage: limit,
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
      return res.status(400).json({ success: false, message: "Invalid film id" });
    }

    const film = await Film.findById(id);
    if (!film) {
      return res.status(404).json({ success: false, message: "Film not found" });
    }

    return res.json({ success: true, data: film });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const updateFilmStatus = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    let sortOrder = "DESC"; 
    
    if (req.query.sortBy === "oldest") {
      sortOrder = "ASC";
    }

    const { rows, count } = await Film.findAll({
      limit,
      offset,
      sortField: "created_at", 
      sortOrder,
    });

    return res.status(200).json({
      success: true,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
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
