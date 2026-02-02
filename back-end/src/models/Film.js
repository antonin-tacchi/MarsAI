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
      status: FILM_STATUS.PENDING,
    };
  }

  static async findById(id) {
    const sql = `SELECT * FROM films WHERE id = ? LIMIT 1`;
    const [rows] = await db.query(sql, [id]);
    return rows?.[0] ?? null;
  }

  static async updateStatus(id, status) {
    const sql = `
      UPDATE films
      SET status = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const [result] = await db.query(sql, [status, id]);
    return result.affectedRows > 0;
  }
  
}
