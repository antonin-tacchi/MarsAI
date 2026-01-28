import db from "../config/database.js";

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

        'pending',
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
      data.ai_certification ? 1 : 0,

      data.director_firstname,
      data.director_lastname,
      data.director_email,
      data.director_bio,
      data.director_school,
      data.director_website,
      data.social_instagram,
      data.social_youtube,
      data.social_vimeo,
    ];

    const [result] = await db.query(sql, params);

    return {
      id: result.insertId,
      ...data,
      status: "pending",
    };
  }

  static async findById(id) {
    const sql = `SELECT * FROM films WHERE id = ?`;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  }

  static async findAllPending() {
    const sql = `
      SELECT id, title, country, description, film_url, poster_url, thumbnail_url,
             director_firstname, director_lastname, director_email, director_bio,
             ai_tools_used, ai_certification, status, created_at
      FROM films
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async findApproved() {
    const sql = `
      SELECT id, title, country, description, film_url, poster_url, thumbnail_url,
             director_firstname, director_lastname, director_bio,
             ai_tools_used, ai_certification, status, created_at
      FROM films
      WHERE status = 'approved'
      ORDER BY created_at DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async updateStatus(id, status, rejectionReason = null) {
    const sql = `
      UPDATE films
      SET status = ?, rejection_reason = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const [result] = await db.query(sql, [status, rejectionReason, id]);
    return result.affectedRows > 0;
  }

  static async findAll() {
    const sql = `
      SELECT id, title, country, description, film_url, poster_url, thumbnail_url,
             director_firstname, director_lastname, director_email, director_bio,
             ai_tools_used, ai_certification, status, created_at
      FROM films
      ORDER BY created_at DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }
}
