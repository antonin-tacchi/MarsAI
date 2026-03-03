import db from "../config/database.js";

export default class JuryList {
  /**
   * Create a new jury list
   */
  static async create({ name, description, createdBy }) {
    const [result] = await db.query(
      "INSERT INTO jury_lists (name, description, created_by) VALUES (?, ?, ?)",
      [name, description || null, createdBy]
    );
    return result.insertId;
  }

  /**
   * Get all lists (for Super Jury / Admin)
   */
  static async findAll() {
    const [rows] = await db.query(`
      SELECT
        jl.id,
        jl.name,
        jl.description,
        jl.created_by,
        jl.created_at,
        u.name AS creator_name,
        COUNT(DISTINCT jlf.film_id) AS film_count,
        COUNT(DISTINCT jla.jury_id) AS jury_count
      FROM jury_lists jl
      LEFT JOIN users u ON u.id = jl.created_by
      LEFT JOIN jury_list_films jlf ON jlf.list_id = jl.id
      LEFT JOIN jury_list_assignments jla ON jla.list_id = jl.id
      GROUP BY jl.id
      ORDER BY jl.created_at DESC
    `);
    return rows;
  }

  /**
   * Get a single list with its films and assigned jury members
   */
  static async findById(listId) {
    const [[list]] = await db.query(
      `SELECT jl.*, u.name AS creator_name
       FROM jury_lists jl
       LEFT JOIN users u ON u.id = jl.created_by
       WHERE jl.id = ?`,
      [listId]
    );
    if (!list) return null;

    const [films] = await db.query(
      `SELECT f.id, f.title, f.country, f.director_firstname, f.director_lastname,
              f.poster_url, f.thumbnail_url, f.youtube_url, f.status
       FROM jury_list_films jlf
       INNER JOIN films f ON f.id = jlf.film_id
       WHERE jlf.list_id = ?
       ORDER BY f.title`,
      [listId]
    );

    const [juries] = await db.query(
      `SELECT u.id, u.name, u.email, jla.assigned_at
       FROM jury_list_assignments jla
       INNER JOIN users u ON u.id = jla.jury_id
       WHERE jla.list_id = ?
       ORDER BY u.name`,
      [listId]
    );

    return { ...list, films, juries };
  }

  /**
   * Update list name/description
   */
  static async update(listId, { name, description }) {
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }

    if (updates.length === 0) return false;

    values.push(listId);
    const [result] = await db.query(
      `UPDATE jury_lists SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  /**
   * Delete a list (cascades to jury_list_films and jury_list_assignments)
   */
  static async delete(listId) {
    // DELETE propre — UPDATE SET NULL laissait des lignes (jury_id, film_id) orphelines
    // qui bloquaient silencieusement les INSERT IGNORE à la régénération
    await db.query("DELETE FROM jury_assignments WHERE list_id = ?", [listId]);
    const [result] = await db.query("DELETE FROM jury_lists WHERE id = ?", [listId]);
    return result.affectedRows > 0;
  }

  /**
   * Add films to a list
   */
  static async addFilms(listId, filmIds) {
    if (!filmIds.length) return 0;
    const values = filmIds.map((fid) => [listId, fid]);
    const [result] = await db.query(
      "INSERT IGNORE INTO jury_list_films (list_id, film_id) VALUES ?",
      [values]
    );
    return result.affectedRows;
  }

  /**
   * Remove films from a list
   */
  static async removeFilms(listId, filmIds) {
    if (!filmIds.length) return 0;
    const [result] = await db.query(
      "DELETE FROM jury_list_films WHERE list_id = ? AND film_id IN (?)",
      [listId, filmIds]
    );
    return result.affectedRows;
  }

  /**
   * Assign a list to jury members (+ create individual jury_assignments for each film)
   */
  static async assignToJuries(listId, juryIds, assignedBy) {
    if (!juryIds.length) return 0;

    // Insert list assignments
    const listValues = juryIds.map((jid) => [listId, jid, assignedBy]);
    await db.query(
      "INSERT IGNORE INTO jury_list_assignments (list_id, jury_id, assigned_by) VALUES ?",
      [listValues]
    );

    // Get films in this list
    const [films] = await db.query(
      "SELECT film_id FROM jury_list_films WHERE list_id = ?",
      [listId]
    );

    if (films.length === 0) return 0;

    // Create individual film assignments for each jury member
    const assignmentValues = [];
    for (const jid of juryIds) {
      for (const { film_id } of films) {
        assignmentValues.push([jid, film_id, listId, assignedBy]);
      }
    }

    const [result] = await db.query(
      "INSERT IGNORE INTO jury_assignments (jury_id, film_id, list_id, assigned_by) VALUES ?",
      [assignmentValues]
    );

    return result.affectedRows;
  }

  /**
   * Remove jury members from a list assignment
   */
  static async removeJuries(listId, juryIds) {
    if (!juryIds.length) return 0;

    // Remove list assignments
    await db.query(
      "DELETE FROM jury_list_assignments WHERE list_id = ? AND jury_id IN (?)",
      [listId, juryIds]
    );

    // Remove individual film assignments linked to this list
    const [result] = await db.query(
      "DELETE FROM jury_assignments WHERE list_id = ? AND jury_id IN (?)",
      [listId, juryIds]
    );

    return result.affectedRows;
  }

  /**
   * Get lists assigned to a specific jury member (with stats)
   */
  static async findByJuryId(juryId) {
    const [rows] = await db.query(`
      SELECT
        jl.id,
        jl.name,
        jl.description,
        jl.created_at,
        jla.assigned_at,
        COUNT(DISTINCT jlf.film_id) AS film_count,
        COUNT(DISTINCT CASE WHEN ja.status = 'active' AND jr.id IS NOT NULL THEN ja.film_id END) AS rated_count,
        COUNT(DISTINCT CASE WHEN ja.status = 'active' AND jr.id IS NULL THEN ja.film_id END) AS unrated_count,
        COUNT(DISTINCT CASE WHEN ja.status = 'refused' THEN ja.film_id END) AS refused_count
      FROM jury_list_assignments jla
      INNER JOIN jury_lists jl ON jl.id = jla.list_id
      LEFT JOIN jury_list_films jlf ON jlf.list_id = jl.id
      LEFT JOIN jury_assignments ja ON ja.list_id = jl.id AND ja.jury_id = ?
      LEFT JOIN jury_ratings jr ON jr.film_id = ja.film_id AND jr.user_id = ?
      WHERE jla.jury_id = ?
      GROUP BY jl.id, jla.assigned_at
      ORDER BY jla.assigned_at DESC
    `, [juryId, juryId, juryId]);

    return rows;
  }
}
