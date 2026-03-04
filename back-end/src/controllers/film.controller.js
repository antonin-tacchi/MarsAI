import Film from "../models/Film.js";
import JuryRating from "../models/JuryRating.js";
import COUNTRIES from "../constants/countries.js";
import fs from "fs";
import {
  MAX_POSTER_SIZE,
  MAX_THUMBNAIL_SIZE,
  MAX_FILM_SIZE,
} from "../routes/film.routes.js";
import { canChangeFilmStatus } from "../services/filmStatus.service.js";
import { sendRejectionEmail } from "../services/email.service.js";

import {
  buildKey,
  uploadBuffer,
  deleteObject,
} from "../services/scalewayStorage.service.js";

import { signGetUrl } from "../services/scalewaySignedUrl.service.js";


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

function getFile(req, field) {
  return req.files?.[field]?.[0] || null;
}

async function withSignedMedia(film) {
  if (!film) return film;

  const [filmStream, posterStream, thumbStream] = await Promise.all([
    film.film_url ? signGetUrl(film.film_url) : Promise.resolve(null),
    film.poster_url ? signGetUrl(film.poster_url) : Promise.resolve(null),
    film.thumbnail_url ? signGetUrl(film.thumbnail_url) : Promise.resolve(null),
  ]);

  return {
    ...film,
    film_stream_url: filmStream,
    poster_stream_url: posterStream,
    thumbnail_stream_url: thumbStream,
  };
}

export const createFilm = async (req, res) => {
  const posterFile = getFile(req, "poster");
  const filmFile = getFile(req, "film");
  const thumbnailFile = getFile(req, "thumbnail");

  const uploadedKeys = [];

  try {
    if (!posterFile || !filmFile) {
      return res.status(400).json({
        success: false,
        message: "Les fichiers poster et film sont requis",
      });
    }

    if (posterFile.size > MAX_POSTER_SIZE) {
      return res.status(400).json({
        success: false,
        message: "Le fichier poster est trop volumineux",
      });
    }

    if (thumbnailFile && thumbnailFile.size > MAX_THUMBNAIL_SIZE) {
      return res.status(400).json({
        success: false,
        message: "Le fichier thumbnail est trop volumineux",
      });
    }

    if (filmFile.size > MAX_FILM_SIZE) {
      return res.status(400).json({
        success: false,
        message: "Le fichier film est trop volumineux",
      });
    }

    const {
      title, title_english, country, description, description_english, ai_tools_used, classification,
      ai_certification, director_firstname, director_lastname,
      director_email, director_bio, director_school, director_website,
      social_instagram, social_youtube, social_vimeo,
    } = req.body;

    if (
      !title ||
      !title_english ||
      !country ||
      !description ||
      !description_english ||
      !director_firstname ||
      !director_lastname ||
      !director_email
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Titre, titre anglais, pays, description, description anglaise, prénom, nom et email du réalisateur sont requis",
      });
    }

    const countryClean = String(country || "").trim();
    if (!countryClean) {
      return res.status(400).json({ success: false, message: "Pays requis" });
    }

    if (
      Array.isArray(globalThis.COUNTRIES) &&
      globalThis.COUNTRIES.length > 0 &&
      !globalThis.COUNTRIES.includes(countryClean)
    ) {
      return res.status(400).json({ success: false, message: "Pays invalide" });
    }

    const tooLong =
      title.length > MAX_TITLE ||
      title_english.length > MAX_TITLE ||
      countryClean.length > MAX_COUNTRY ||
      description.length > MAX_DESCRIPTION ||
      description_english.length > MAX_DESCRIPTION ||
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
      return res.status(400).json({
        success: false,
        message:
          "Un ou plusieurs champs dépassent la longueur maximale autorisée",
      });
    }

    const recentCount = await Film.countRecentByEmail(director_email);
    if (recentCount >= 5) {
      return res.status(429).json({
        success: false,
        message:
          "Trop de soumissions pour cet email. Veuillez réessayer plus tard",
      });
    }

    const posterKey = buildKey("posters", posterFile.originalname);
    const posterUp = await uploadBuffer({
      buffer: posterFile.buffer,
      key: posterKey,
      contentType: posterFile.mimetype,
    });
    uploadedKeys.push(posterUp.key);

    const filmKey = buildKey("films", filmFile.originalname);
    const filmUp = await uploadBuffer({
      buffer: filmFile.buffer,
      key: filmKey,
      contentType: filmFile.mimetype,
    });
    uploadedKeys.push(filmUp.key);

    let thumbKey = null;
    if (thumbnailFile) {
      const tKey = buildKey("thumbnails", thumbnailFile.originalname);
      const thumbUp = await uploadBuffer({
        buffer: thumbnailFile.buffer,
        key: tKey,
        contentType: thumbnailFile.mimetype,
      });
      uploadedKeys.push(thumbUp.key);
      thumbKey = thumbUp.key;
    }

    const created = await Film.create({
      title,
      title_english,
      country: countryClean,
      description,
      description_english,
      film_url: filmUp.key,
      youtube_url: null,
      poster_url: posterUp.key,
      thumbnail_url: thumbKey,
      ai_tools_used: ai_tools_used || null,
      classification: classification || "Hybride",
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

    const createdSigned = await withSignedMedia(created);

    return res.status(201).json({
      success: true,
      message: "Film soumis avec succès",
      data: createdSigned,
    });
  } catch (err) {
    console.error("createFilm error:", err);
    await Promise.allSettled(uploadedKeys.map((k) => deleteObject(k)));
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

export const updateFilmStatus = async (req, res) => {
  try {
    const filmId = parseInt(req.params.id, 10);
    const { status, rejection_reason } = req.body;

    if (!filmId) {
      return res.status(400).json({
        success: false,
        message: "L'ID du film et le statut sont requis",
      });
    }

    const newStatus = (status || "").trim();
    if (!newStatus || !["pending", "approved", "rejected", "selected"].includes(newStatus)) {
      return res.status(400).json({ success: false, message: "Statut invalide" });
    }

    const film = await Film.findById(filmId);
    if (!film) {
      return res.status(404).json({ success: false, message: "Film non trouvé" });
    }

    if (!canChangeFilmStatus(film.status, newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Transition de statut non autorisée : ${film.status} → ${newStatus}`,
      });
    }

    if (newStatus === "rejected" && !rejection_reason) {
      return res.status(400).json({
        success: false,
        message: "Une raison de rejet est requise",
      });
    }

    const userId = req.user?.userId;

    const updatedFilm = await Film.updateStatus(
      filmId,
      newStatus,
      userId,
      rejection_reason || null
    );

    if (newStatus === "rejected") {
      sendRejectionEmail(updatedFilm, rejection_reason).catch((err) =>
        console.error("Rejection email failed:", err.message)
      );
    }

    const signed = await withSignedMedia(updatedFilm);

    return res.status(200).json({
      success: true,
      message: "Statut du film mis à jour avec succès",
      data: signed,
    });
  } catch (err) {
    console.error("updateFilmStatus error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Échec de la mise à jour du statut du film",
    });
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

    const allowedStatuses = ["approved", "selected", "pending", "rejected"];
    const requestedStatus = req.query.status || "approved";
    const safeStatus = allowedStatuses.includes(requestedStatus) ? requestedStatus : "approved";

    const { rows, count } = await Film.findAll({
      limit,
      offset,
      sortField,
      sortOrder,
      status: safeStatus,
    });

    const signedRows = await Promise.all(rows.map(withSignedMedia));

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
      data: signedRows,
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
      return res.status(400).json({ success: false, message: "ID du film invalide" });
    }

    const film = await Film.findById(id);
    if (!film) {
      return res.status(404).json({ success: false, message: "Film non trouvé" });
    }

    const signed = await withSignedMedia(film);
    return res.json({ success: true, data: signed });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

export const getPublicCatalog = async (req, res) => {
  try {
    const films = await Film.findForPublicCatalog();
    const signed = await Promise.all((films || []).map(withSignedMedia));
    return res.status(200).json({ success: true, data: signed });
  } catch (err) {
    console.error("getApprovedFilms error:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

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

    const signed = await withSignedMedia(film);
    return res.json({ success: true, data: signed });
  } catch (err) {
    console.error("getPublicFilm error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPublicRanking = async (req, res) => {
  try {
    const ranking = await JuryRating.getRanking();
    return res.status(200).json({ success: true, data: ranking });
  } catch (err) {
    console.error("getPublicRanking error:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du classement",
    });
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
      message: "Erreur lors de la récupération des statistiques",
    });
  }
};

export async function getFilmStreamUrl(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid film id" });

    const film = await Film.findById(id);
    if (!film) return res.status(404).json({ success: false, message: "Film not found" });

    const url = await signGetUrl(film.film_url);
    return res.json({ success: true, url });
  } catch (err) {
    console.error("getFilmStreamUrl error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}