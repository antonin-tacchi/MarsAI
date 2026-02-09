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

  const sql = `
    SELECT
      id,
      title,
      country,
      poster_url,
      thumbnail_url,
      director_firstname,
      director_lastname,
      created_at,
      COUNT(*) OVER() AS total
    FROM films
    ORDER BY ${safeField} ${safeOrder}
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.query(sql, [safeLimit, safeOffset]);
  const count = rows.length > 0 ? rows[0].total : 0;

  const cleanRows = rows.map(({ total, ...rest }) => rest);

  return {
    rows: cleanRows,
    count,
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

  static async findApprovedWithRatings(userId) {
    const sql = `
      SELECT
        f.id, f.title, f.country, f.description,
        f.film_url, f.youtube_url, f.poster_url, f.thumbnail_url,
        f.ai_tools_used, f.ai_certification,
        f.director_firstname, f.director_lastname, f.director_email,
        f.director_bio, f.director_school, f.director_website,
        f.social_instagram, f.social_youtube, f.social_vimeo,
        f.status, f.created_at,
        jr.rating   AS user_rating,
        jr.comment  AS user_comment,
        ROUND(AVG(jr_all.rating), 1) AS average_rating,
        COUNT(jr_all.id)              AS total_ratings
      FROM films f
      LEFT JOIN jury_ratings jr
        ON jr.film_id = f.id AND jr.user_id = ?
      LEFT JOIN jury_ratings jr_all
        ON jr_all.film_id = f.id
      WHERE f.status = 'approved'
      GROUP BY f.id, jr.rating, jr.comment
      ORDER BY f.created_at DESC
    `;
    const [rows] = await db.query(sql, [userId]);
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

  static async findByIdWithRatings(filmId, userId) {
    const sqlFilm = `
      SELECT
        f.*,
        jr.rating   AS user_rating,
        jr.comment  AS user_comment,
        ROUND(AVG(jr_all.rating), 1) AS average_rating,
        COUNT(jr_all.id)              AS total_ratings
      FROM films f
      LEFT JOIN jury_ratings jr
        ON jr.film_id = f.id AND jr.user_id = ?
      LEFT JOIN jury_ratings jr_all
        ON jr_all.film_id = f.id
      WHERE f.id = ?
      GROUP BY f.id, jr.rating, jr.comment
      LIMIT 1
    `;
    const sqlAllRatings = `
      SELECT jr.id, jr.film_id, jr.user_id, jr.rating, jr.comment,
             jr.created_at, jr.updated_at, u.name AS user_name
      FROM jury_ratings jr
      JOIN users u ON u.id = jr.user_id
      WHERE jr.film_id = ?
      ORDER BY jr.created_at DESC
    `;
    const [[filmRows], [allRatings]] = await Promise.all([
      db.query(sqlFilm, [userId, filmId]),
      db.query(sqlAllRatings, [filmId]),
    ]);
    const film = filmRows?.[0] || null;
    if (!film) return null;
    film.all_ratings = allRatings;
    return film;
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
