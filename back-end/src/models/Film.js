import db from "../config/database.js";
import { FILM_STATUS } from "../constants/filmStatus.js";

export default class Film {
  static async countRecentByEmail(email, minutes = 60) {
    const sql = `
      SELECT COUNT(*) AS total
      FROM films
      WHERE director_email = ?
        AND created_at >= (NOW() - INTERVAL ? MINUTE)
    `;
    const [rows] = await db.query(sql, [email, minutes]);
    return rows?.[0]?.total ?? 0;
  }

  static toTinyInt(v) {
    const s = String(v ?? "").trim().toLowerCase();

    if (v === 1 || v === true) return 1;
    if (s === "1" || s === "true" || s === "on") return 1;

    return 0;
  }

  static async create(data) {
    const sql = `
      INSERT INTO films (
        title,
        country,
        description,
        film_url,
        youtube_url,
        poster_url,
        thumbnail_url,
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

        status,
        created_at
      )
      VALUES (
        ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?,

        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,

        ?,
        NOW()
      )
    `;

    const params = [
      data.title,
      data.country,
      data.description,
      data.film_url,
      data.youtube_url || null,
      data.poster_url,
      data.thumbnail_url,

      data.ai_tools_used,
      Film.toTinyInt(data.ai_certification),

      data.director_firstname,
      data.director_lastname,
      data.director_email,
      data.director_bio,
      data.director_school,
      data.director_website,
      data.social_instagram,
      data.social_youtube,
      data.social_vimeo,

      FILM_STATUS.PENDING,
    ];

    const [result] = await db.query(sql, params);

    return {
      id: result.insertId,
      ...data,
      ai_certification: Film.toTinyInt(data.ai_certification),
      status: "pending",
    };
  }

static async findAll({ limit = 20, offset = 0, sortField = "created_at", sortOrder = "DESC" } = {}) {
  const allowedSortFields = new Set([
    "created_at",
    "title",
    "country",
    "id",
  ]);

  const safeField = allowedSortFields.has(sortField) ? sortField : "created_at";
  const safeOrder = String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";

  const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const safeOffset = Math.max(0, parseInt(offset, 10) || 0);

  const sqlData = `
    SELECT
      id,
      title,
      country,
      poster_url,
      thumbnail_url,
      director_firstname,
      director_lastname,
      created_at
    FROM films
    ORDER BY ${safeField} ${safeOrder}
    LIMIT ? OFFSET ?
  `;

  const sqlCount = `SELECT COUNT(*) AS total FROM films`;

  const [rows] = await db.query(sqlData, [safeLimit, safeOffset]);
  const [countResult] = await db.query(sqlCount);

  return {
    rows,
    count: countResult?.[0]?.total ?? 0,
  };
}

static async findById(id) {
    const sql = `SELECT * FROM films WHERE id = ? LIMIT 1`;
    const [rows] = await db.query(sql, [id]);
    return rows?.[0] || null;
}

  static async findAllApproved() {
    const sql = `
      SELECT * FROM films
      WHERE status = 'approved'
      ORDER BY created_at DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async findForPublicCatalog() {
    const sql = `
      SELECT id, title, country, description, poster_url, thumbnail_url,
             youtube_url, ai_tools_used, director_firstname, director_lastname,
             director_school, created_at
      FROM films
      WHERE status = 'approved'
      ORDER BY created_at DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async findForPublicView(id) {
    const sql = `
      SELECT id, title, country, description, film_url, youtube_url,
             poster_url, thumbnail_url, ai_tools_used, ai_certification,
             director_firstname, director_lastname, director_email,
             director_bio, director_school, director_website,
             social_instagram, social_youtube, social_vimeo,
             created_at
      FROM films
      WHERE id = ? AND status = 'approved'
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [id]);
    return rows?.[0] || null;
  }
}
