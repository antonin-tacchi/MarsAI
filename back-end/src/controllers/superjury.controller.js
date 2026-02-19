import db from "../config/database.js";

/**
 * GET /api/admin/distribution/stats
 * Returns current distribution state: films, assignments, per-jury breakdown
 */
export const getDistributionStats = async (req, res) => {
  try {
    // Count approved films
    const [[{ filmCount }]] = await db.query(
      "SELECT COUNT(*) AS filmCount FROM films WHERE status = 'approved'"
    );

    // Count total assignments
    const [[{ assignmentCount }]] = await db.query(
      "SELECT COUNT(*) AS assignmentCount FROM jury_assignments"
    );

    // Get jury members (role 1) with their assignment stats
    const [juries] = await db.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        COUNT(ja.film_id) AS assigned_films,
        SUM(CASE WHEN jr.id IS NOT NULL THEN 1 ELSE 0 END) AS rated,
        SUM(CASE WHEN jr.id IS NULL AND ja.film_id IS NOT NULL THEN 1 ELSE 0 END) AS remaining
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id AND ur.role_id = 1
      LEFT JOIN jury_assignments ja ON u.id = ja.jury_id
      LEFT JOIN jury_ratings jr ON jr.film_id = ja.film_id AND jr.user_id = u.id
      GROUP BY u.id, u.name, u.email
      ORDER BY u.name
    `);

    return res.status(200).json({
      success: true,
      data: {
        filmCount,
        assignmentCount,
        juryCount: juries.length,
        juries,
      },
    });
  } catch (error) {
    console.error("getDistributionStats error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/admin/distribution/preview
 * Body: { R: number, Lmax: number }
 * Returns a preview of how the distribution would look
 */
export const previewDistribution = async (req, res) => {
  try {
    const R = parseInt(req.body.R, 10);
    const Lmax = parseInt(req.body.Lmax, 10);

    if (!R || R < 1 || !Lmax || Lmax < 1) {
      return res.status(400).json({
        success: false,
        message: "R and Lmax must be positive integers",
      });
    }

    // Get approved films
    const [films] = await db.query(
      "SELECT id FROM films WHERE status = 'approved'"
    );

    // Get jury members (role 1)
    const [juries] = await db.query(`
      SELECT u.id, u.name
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id AND ur.role_id = 1
      ORDER BY u.name
    `);

    if (films.length === 0 || juries.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No approved films or no jury members found",
      });
    }

    // Load existing assignments
    const [existingRows] = await db.query(
      "SELECT jury_id, film_id FROM jury_assignments"
    );

    const existing = new Map();
    juries.forEach((j) => existing.set(j.id, new Set()));
    for (const row of existingRows) {
      if (existing.has(row.jury_id)) {
        existing.get(row.jury_id).add(row.film_id);
      }
    }

    // Build per-jury list (existing + new to add)
    const assignments = new Map();
    juries.forEach((j) => assignments.set(j.id, [...existing.get(j.id)]));

    // Count existing assignments per film
    const filmAssignCount = new Map();
    films.forEach((f) => filmAssignCount.set(f.id, 0));
    for (const row of existingRows) {
      if (filmAssignCount.has(row.film_id)) {
        filmAssignCount.set(row.film_id, filmAssignCount.get(row.film_id) + 1);
      }
    }

    // Only queue films that still need more assignments to reach R
    const filmQueue = [];
    for (const film of films) {
      const still = R - (filmAssignCount.get(film.id) || 0);
      for (let i = 0; i < still; i++) {
        filmQueue.push(film.id);
      }
    }

    // Check feasibility with remaining capacity
    const usedCapacity = juries.reduce((s, j) => s + assignments.get(j.id).length, 0);
    const remainingCapacity = juries.length * Lmax - usedCapacity;

    if (remainingCapacity < filmQueue.length) {
      return res.status(400).json({
        success: false,
        message: `Impossible: need ${filmQueue.length} new assignments but remaining capacity is ${remainingCapacity}`,
      });
    }

    // Round-robin on what's missing
    for (const filmId of filmQueue) {
      const sortedJuries = [...juries].sort(
        (a, b) => assignments.get(a.id).length - assignments.get(b.id).length
      );

      for (const jury of sortedJuries) {
        const juryFilms = assignments.get(jury.id);
        if (juryFilms.length < Lmax && !juryFilms.includes(filmId)) {
          juryFilms.push(filmId);
          break;
        }
      }
    }

    const counts = juries.map((j) => assignments.get(j.id).length);
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    const avg = (counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(1);
    const total = counts.reduce((a, b) => a + b, 0);
    const newAssignments = total - existingRows.length;

    return res.status(200).json({
      success: true,
      data: {
        total,
        newAssignments,
        existing: existingRows.length,
        juryCount: juries.length,
        filmCount: films.length,
        R,
        Lmax,
        min,
        max,
        avg,
      },
    });
  } catch (error) {
    console.error("previewDistribution error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * POST /api/admin/distribution/generate
 * Body: { R: number, Lmax: number }
 * Creates actual jury_assignments rows
 */
export const generateDistribution = async (req, res) => {
  try {
    const R = parseInt(req.body.R, 10);
    const Lmax = parseInt(req.body.Lmax, 10);

    if (!R || R < 1 || !Lmax || Lmax < 1) {
      return res.status(400).json({
        success: false,
        message: "R and Lmax must be positive integers",
      });
    }

    const [films] = await db.query(
      "SELECT id FROM films WHERE status = 'approved'"
    );
    const [juries] = await db.query(`
      SELECT u.id, u.name
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id AND ur.role_id = 1
      ORDER BY u.name
    `);

    if (films.length === 0 || juries.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No approved films or no jury members found",
      });
    }

    const totalNeeded = films.length * R;
    const totalCapacity = juries.length * Lmax;

    if (totalCapacity < totalNeeded) {
      return res.status(400).json({
        success: false,
        message: `Impossible: need ${totalNeeded} assignments but capacity is ${totalCapacity}`,
      });
    }

    // Load existing assignments so we keep them and only add what's missing
    const [existingRows] = await db.query(
      "SELECT jury_id, film_id FROM jury_assignments"
    );

    const existing = new Map();
    juries.forEach((j) => existing.set(j.id, new Set()));
    for (const row of existingRows) {
      if (existing.has(row.jury_id)) {
        existing.get(row.jury_id).add(row.film_id);
      }
    }

    // Build per-jury list (existing + new)
    const assignments = new Map();
    juries.forEach((j) => assignments.set(j.id, [...existing.get(j.id)]));

    // Count how many juries each film is already assigned to
    const filmAssignCount = new Map();
    films.forEach((f) => filmAssignCount.set(f.id, 0));
    for (const row of existingRows) {
      if (filmAssignCount.has(row.film_id)) {
        filmAssignCount.set(row.film_id, filmAssignCount.get(row.film_id) + 1);
      }
    }

    // Only queue films that still need more jury assignments to reach R
    const filmQueue = [];
    for (const film of films) {
      const still = R - (filmAssignCount.get(film.id) || 0);
      for (let i = 0; i < still; i++) {
        filmQueue.push(film.id);
      }
    }

    // Round-robin: assign to jury with fewest films, respecting Lmax
    for (const filmId of filmQueue) {
      const sortedJuries = [...juries].sort(
        (a, b) => assignments.get(a.id).length - assignments.get(b.id).length
      );

      for (const jury of sortedJuries) {
        const juryFilms = assignments.get(jury.id);
        if (juryFilms.length < Lmax && !juryFilms.includes(filmId)) {
          juryFilms.push(filmId);
          break;
        }
      }
    }

    // Only insert truly new assignments (not already in DB)
    const newRows = [];
    for (const [juryId, filmIds] of assignments) {
      const alreadyHas = existing.get(juryId);
      for (const filmId of filmIds) {
        if (!alreadyHas.has(filmId)) {
          newRows.push([juryId, filmId]);
        }
      }
    }

    if (newRows.length > 0) {
      await db.query(
        "INSERT INTO jury_assignments (jury_id, film_id) VALUES ?",
        [newRows]
      );
    }

    const counts = juries.map((j) => assignments.get(j.id).length);
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    const avg = (counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(1);

    return res.status(200).json({
      success: true,
      message: "Distribution generated successfully",
      data: {
        total: newRows.length + existingRows.length,
        newAssignments: newRows.length,
        juryCount: juries.length,
        R,
        Lmax,
        min,
        max,
        avg,
      },
    });
  } catch (error) {
    console.error("generateDistribution error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
