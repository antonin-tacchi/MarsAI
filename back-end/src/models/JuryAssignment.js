import db from "../config/database.js";

export default class JuryAssignment {
  static async findAssignedFilms({
    juryId,
    limit = 20,
    offset = 0,
    sortOrder = "DESC",
    listId = null,
  }) {
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const safeOffset = Math.max(0, parseInt(offset, 10) || 0);
    const safeOrder = String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const listFilter = listId ? "AND ja.list_id = ?" : "";
    const params = listId
      ? [juryId, juryId, listId, safeLimit, safeOffset]
      : [juryId, juryId, safeLimit, safeOffset];

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

        ja.id AS assignment_id,
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
        AND ja.status IN ('active', 'refusal_pending')
        ${listFilter}
      GROUP BY
        f.id,
        ja.id,
        ja.assigned_at,
        ja.status,
        ja.refusal_reason,
        jr.rating,
        jr.comment
      ORDER BY ja.assigned_at ${safeOrder}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(sql, params);

    const count = rows?.length ? rows[0].total : 0;
    const cleanRows = rows.map(({ total, ...rest }) => rest);

    return { rows: cleanRows, count };
  }

  static async getJuryStats(juryId, listId = null) {
    const listFilter = listId ? "AND ja.list_id = ?" : "";
    const params = listId ? [juryId, juryId, listId] : [juryId, juryId];

    const sql = `
      SELECT
        COUNT(*) AS total_assigned,
        SUM(CASE WHEN ja.status = 'refused' THEN 1 ELSE 0 END) AS total_refused,
        SUM(CASE WHEN ja.status = 'refusal_pending' THEN 1 ELSE 0 END) AS total_refusal_pending,
        SUM(CASE WHEN ja.status = 'active' AND jr.id IS NULL THEN 1 ELSE 0 END) AS total_unrated,
        SUM(CASE WHEN ja.status = 'active' AND jr.id IS NOT NULL THEN 1 ELSE 0 END) AS total_rated
      FROM jury_assignments ja
      LEFT JOIN jury_ratings jr
        ON jr.film_id = ja.film_id AND jr.user_id = ?
      WHERE ja.jury_id = ?
        ${listFilter}
    `;

    const [rows] = await db.query(sql, params);
    return rows?.[0] || { total_assigned: 0, total_refused: 0, total_unrated: 0, total_rated: 0 };
  }

  // Refuse a film assignment (sends to refusal_pending for admin validation)
  static async refuse(juryId, filmId, reason) {
    const [existing] = await db.query(
      "SELECT id, status FROM jury_assignments WHERE jury_id = ? AND film_id = ?",
      [juryId, filmId]
    );

    if (!existing.length) return null;
    if (existing[0].status === "refused") return { alreadyRefused: true };
    if (existing[0].status === "refusal_pending") return { alreadyRefused: true };

    await db.query(
      `UPDATE jury_assignments
       SET status = 'refusal_pending', refusal_reason = ?, refused_at = NOW()
       WHERE jury_id = ? AND film_id = ?`,
      [reason, juryId, filmId]
    );

    return { success: true };
  }

  // Admin/Super Jury validates or rejects a jury refusal
  // validate=true → status='refused' (accept the refusal)
  // validate=false → status='active' (reject the refusal, jury keeps the film)
  static async validateRefusal(assignmentId, validate) {
    const [existing] = await db.query(
      "SELECT id, status FROM jury_assignments WHERE id = ?",
      [assignmentId]
    );

    if (!existing.length) return null;
    if (existing[0].status !== "refusal_pending") return { notPending: true };

    const newStatus = validate ? "refused" : "active";
    await db.query(
      `UPDATE jury_assignments SET status = ? WHERE id = ?`,
      [newStatus, assignmentId]
    );

    return { success: true, status: newStatus };
  }

  // Get all refusal_pending assignments for admin/super jury
  static async getPendingRefusals() {
    const sql = `
      SELECT
        ja.id AS assignment_id,
        ja.jury_id,
        ja.film_id,
        ja.refusal_reason,
        ja.refused_at,
        u.name AS jury_name,
        u.email AS jury_email,
        f.title AS film_title,
        f.director_firstname,
        f.director_lastname,
        f.country
      FROM jury_assignments ja
      INNER JOIN users u ON u.id = ja.jury_id
      INNER JOIN films f ON f.id = ja.film_id
      WHERE ja.status = 'refusal_pending'
      ORDER BY ja.refused_at ASC
    `;
    const [rows] = await db.query(sql);
    return rows;
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
