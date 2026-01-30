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

    const isAiCert =
    ai_certification === 1 ||
    ai_certification === "1" ||
    ai_certification === true ||
    String(ai_certification).toLowerCase() === "true" ||
    String(ai_certification).toLowerCase() === "on";

    const created = await Film.create({
      title,
      country,
      description,
      film_url: filmUrl,
      youtube_link: null,
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
  }
};
