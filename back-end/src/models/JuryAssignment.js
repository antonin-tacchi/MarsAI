import db from "../config/database.js";

export default class JuryAssignment {
  static async findAssignedFilms({
    juryId,
    limit = 20,
    offset = 0,
    sortOrder = "DESC",
  }) {
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const safeOffset = Math.max(0, parseInt(offset, 10) || 0);
    const safeOrder = String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const sql = `
      SELECT
        f.id,
        f.title,
        f.country,
        f.description,
        f.film_url,
        f.youtube_url,
        f.poster_url,
        f.thumbnail_url,
        f.ai_tools_used,
        f.ai_certification,
        f.director_firstname,
        f.director_lastname,
        f.director_email,
        f.director_bio,
        f.director_school,
        f.director_website,
        f.social_instagram,
        f.social_youtube,
        f.social_vimeo,
        f.status,
        f.created_at,

        ja.assigned_at,
        ja.status AS assignment_status,
        ja.refusal_reason,

        jr.rating   AS user_rating,
        jr.comment  AS user_comment,
        ROUND(AVG(jr_all.rating), 1) AS average_rating,
        COUNT(jr_all.id)              AS total_ratings,

        COUNT(*) OVER() AS total
      FROM jury_assignments ja
      INNER JOIN films f
        ON f.id = ja.film_id
      LEFT JOIN jury_ratings jr
        ON jr.film_id = f.id AND jr.user_id = ?
      LEFT JOIN jury_ratings jr_all
        ON jr_all.film_id = f.id
      WHERE ja.jury_id = ?
        AND ja.status = 'active'
      GROUP BY
        f.id,
        ja.assigned_at,
        ja.status,
        ja.refusal_reason,
        jr.rating,
        jr.comment
      ORDER BY ja.assigned_at ${safeOrder}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(sql, [juryId, juryId, safeLimit, safeOffset]);

    const count = rows?.length ? rows[0].total : 0;
    const cleanRows = rows.map(({ total, ...rest }) => rest);

    return { rows: cleanRows, count };
  }

  static async getJuryStats(juryId) {
    const sql = `
      SELECT
        COUNT(*) AS total_assigned,
        SUM(CASE WHEN ja.status = 'refused' THEN 1 ELSE 0 END) AS total_refused,
        SUM(CASE WHEN ja.status = 'active' AND jr.id IS NULL THEN 1 ELSE 0 END) AS total_unrated,
        SUM(CASE WHEN ja.status = 'active' AND jr.id IS NOT NULL THEN 1 ELSE 0 END) AS total_rated
      FROM jury_assignments ja
      LEFT JOIN jury_ratings jr
        ON jr.film_id = ja.film_id AND jr.user_id = ?
      WHERE ja.jury_id = ?
    `;

    const [rows] = await db.query(sql, [juryId, juryId]);
    return rows?.[0] || { total_assigned: 0, total_refused: 0, total_unrated: 0, total_rated: 0 };
  }

  // Refuse a film assignment
  static async refuse(juryId, filmId, reason) {
    // Check assignment exists and is active
    const [existing] = await db.query(
      "SELECT id, status FROM jury_assignments WHERE jury_id = ? AND film_id = ?",
      [juryId, filmId]
    );

    if (!existing.length) return null;
    if (existing[0].status === "refused") return { alreadyRefused: true };

    await db.query(
      `UPDATE jury_assignments
       SET status = 'refused', refusal_reason = ?, refused_at = NOW()
       WHERE jury_id = ? AND film_id = ?`,
      [reason, juryId, filmId]
    );

    return { success: true };
  }

  // Check if a jury member is assigned to a film
  static async isAssigned(juryId, filmId) {
    const [rows] = await db.query(
      "SELECT id, status FROM jury_assignments WHERE jury_id = ? AND film_id = ?",
      [juryId, filmId]
    );
    return rows?.[0] || null;
  }
}
