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
    const s = String(v ?? "")
      .trim()
      .toLowerCase();
    if (v === 1 || v === true) return 1;
    if (s === "1" || s === "true" || s === "on") return 1;
    return 0;
  }

  static async create(data) {
    const sql = `
      INSERT INTO films (
        title, country, description, film_url, youtube_url,
        poster_url, thumbnail_url, ai_tools_used, 
        classification, ai_certification,
        director_firstname, director_lastname, director_email,
        director_bio, director_school, director_website,
        social_instagram, social_youtube, social_vimeo,
        status, created_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?, ?, ?, ?, 
        ?, NOW()
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
      data.classification || "Hybride", // Ajout classification
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

  static async findAll({
    limit = 20,
    offset = 0,
    sortField = "created_at",
    sortOrder = "DESC",
    status,
  } = {}) {
    const allowedSortFields = new Set(["created_at", "title", "country", "id"]);
    const safeField = allowedSortFields.has(sortField)
      ? sortField
      : "created_at";
    const safeOrder =
      String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const safeOffset = Math.max(0, parseInt(offset, 10) || 0);

    const whereClauses = [];
    const queryParams = [];
    if (status) {
      whereClauses.push("f.status = ?");
      queryParams.push(status);
    }
    const whereSQL =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const sql = `
      SELECT f.id, f.title, f.country, f.poster_url, f.thumbnail_url, f.youtube_url,
             f.director_firstname, f.director_lastname, f.created_at, f.ai_tools_used,
             f.status, f.classification,
             GROUP_CONCAT(c.name SEPARATOR ', ') AS categories,
             COUNT(*) OVER() AS total
      FROM films f
      LEFT JOIN film_categories fc ON f.id = fc.film_id
      LEFT JOIN categories c ON fc.category_id = c.id
      ${whereSQL}
      GROUP BY f.id
      ORDER BY f.${safeField} ${safeOrder}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(safeLimit, safeOffset);
    const [rows] = await db.query(sql, queryParams);
    const count = rows.length > 0 ? rows[0].total : 0;
    return { rows: rows.map(({ total, ...rest }) => rest), count };
  }

  static async findById(id) {
    const sql = `SELECT * FROM films WHERE id = ? LIMIT 1`;
    const [rows] = await db.query(sql, [id]);
    return rows?.[0] || null;
  }

  static async findForPublicCatalog() {
    const sql = `
      SELECT id, title, country, description, poster_url, thumbnail_url,
             youtube_url, ai_tools_used, classification, director_firstname, director_lastname,
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
             poster_url, thumbnail_url, ai_tools_used, classification, ai_certification,
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

  static async updateStatus(filmId, status, userId, rejectionReason = null) {
    const film = await this.findById(filmId);
    if (!film) throw new Error("Film non trouvé");
    const sql = `
      UPDATE films
      SET status = ?, status_changed_at = NOW(), status_changed_by = ?, rejection_reason = ?
      WHERE id = ?
    `;
    await db.query(sql, [status, userId || null, rejectionReason, filmId]);
    return { ...film, status, rejection_reason: rejectionReason };
  }

  static async getStats() {
    const [statusRows] = await db.query(
      `SELECT status, COUNT(*) as count FROM films GROUP BY status`,
    );
    const [countryRows] = await db.query(
      `SELECT country, COUNT(*) as count FROM films WHERE status = 'approved' GROUP BY country ORDER BY count DESC`,
    );
    const [categoryRows] = await db.query(
      `SELECT c.id as category_id, c.name as category_name, COUNT(fc.film_id) as count
       FROM categories c
       INNER JOIN film_categories fc ON fc.category_id = c.id
       INNER JOIN films f ON fc.film_id = f.id AND f.status = 'approved'
       GROUP BY c.id, c.name
       ORDER BY c.name ASC`,
    );
    const [categoryRows] = await db.query(
      `SELECT c.id as category_id, c.name as category_name, COUNT(fc.film_id) as count
       FROM categories c
       INNER JOIN film_categories fc ON fc.category_id = c.id
       INNER JOIN films f ON fc.film_id = f.id AND f.status = 'approved'
       GROUP BY c.id, c.name
       ORDER BY c.name ASC`,
    );
    return {
      byStatus: statusRows,
      byCountry: countryRows,
      byCategory: categoryRows,
      total: statusRows.reduce((sum, r) => sum + r.count, 0),
    };
  }
}
