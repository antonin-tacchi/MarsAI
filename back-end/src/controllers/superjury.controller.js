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
    return res.status(500).json({ success: false, message: error.message || "Erreur lors de la récupération des statistiques" });
  }
};

/**
 * POST /api/admin/distribution/preview
 * Body: { R: number, Lmax: number }
 * Returns a preview of how the distribution would look (from scratch)
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
        message: `Impossible: need ${totalNeeded} assignments but capacity is ${totalCapacity} (${juries.length} juries × ${Lmax})`,
      });
    }

    // Simulate full distribution from scratch
    const assignments = new Map();
    juries.forEach((j) => assignments.set(j.id, []));

    const filmQueue = [];
    for (const film of films) {
      for (let i = 0; i < R; i++) {
        filmQueue.push(film.id);
      }
    }

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

    return res.status(200).json({
      success: true,
      data: {
        total,
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
    return res.status(500).json({ success: false, message: error.message || "Erreur lors de la prévisualisation" });
  }
};

/**
 * POST /api/admin/distribution/generate
 * Body: { R: number, Lmax: number }
 * Replaces all jury_assignments with a fresh distribution
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

    // Clear existing assignments and rebuild from scratch
    await db.query("DELETE FROM jury_assignments");

    // Round-robin distribution
    const assignments = new Map();
    juries.forEach((j) => assignments.set(j.id, []));

    const filmQueue = [];
    for (const film of films) {
      for (let i = 0; i < R; i++) {
        filmQueue.push(film.id);
      }
    }

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

    // Insert all assignments
    const rows = [];
    for (const [juryId, filmIds] of assignments) {
      for (const filmId of filmIds) {
        rows.push([juryId, filmId]);
      }
    }

    if (rows.length > 0) {
      await db.query(
        "INSERT INTO jury_assignments (jury_id, film_id) VALUES ?",
        [rows]
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
        total: rows.length,
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
    return res.status(500).json({ success: false, message: error.message || "Erreur lors de la génération de la distribution" });
  }
};
