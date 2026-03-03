import db from "../config/database.js";

// ─── Helper ───────────────────────────────────────────────────────────────────
/**
 * Split an array into chunks of at most `size` elements.
 * @param {any[]} arr
 * @param {number} size
 * @returns {any[][]}
 */
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// ─── In-memory preview store ──────────────────────────────────────────────────
// Keyed by a token returned to the client on preview.
// The client must send this token back when calling generate to confirm.
const previewStore = new Map();
const PREVIEW_TTL_MS = 10 * 60 * 1000; // 10 minutes

function storePreview(token, data) {
  previewStore.set(token, { data, expiresAt: Date.now() + PREVIEW_TTL_MS });
}

function consumePreview(token) {
  const entry = previewStore.get(token);
  if (!entry) return null;
  previewStore.delete(token);
  if (Date.now() > entry.expiresAt) return null;
  return entry.data;
}

function generateToken() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// ─── Periodic cleanup of expired previews ────────────────────────────────────
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of previewStore) {
    if (now > v.expiresAt) previewStore.delete(k);
  }
}, 60_000);


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/distribution/stats
// ─────────────────────────────────────────────────────────────────────────────
export const getDistributionStats = async (req, res) => {
  try {
    const [[{ filmCount }]] = await db.query(
      "SELECT COUNT(*) AS filmCount FROM films WHERE status = 'approved'"
    );

    const [[{ assignmentCount }]] = await db.query(
      "SELECT COUNT(*) AS assignmentCount FROM jury_assignments"
    );

    const [juries] = await db.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        COUNT(ja.film_id)                                              AS assigned_films,
        SUM(CASE WHEN jr.id IS NOT NULL THEN 1 ELSE 0 END)            AS rated,
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
      data: { filmCount, assignmentCount, juryCount: juries.length, juries },
    });
  } catch (error) {
    console.error("getDistributionStats error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des statistiques",
    });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/distribution/preview
// Body: { R: number, Lmax: number }
//
// Returns a preview token + summary. The super-jury reviews and then calls
// /distribution/generate with { previewToken } to confirm.
// ─────────────────────────────────────────────────────────────────────────────
export const previewDistribution = async (req, res) => {
  try {
    const R    = parseInt(req.body.R,    10);
    const Lmax = parseInt(req.body.Lmax, 10);

    if (!R || R < 1 || !Lmax || Lmax < 1) {
      return res.status(400).json({
        success: false,
        message: "R et Lmax doivent être des entiers positifs",
      });
    }

    const [films] = await db.query(
      "SELECT id FROM films WHERE status = 'approved' ORDER BY id"
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
        message: "Aucun film approuvé ou aucun membre de jury trouvé",
      });
    }

    const totalNeeded   = films.length * R;
    const totalCapacity = juries.length * Lmax;

    if (totalCapacity < totalNeeded) {
      return res.status(400).json({
        success: false,
        feasible: false,
        message: `Impossible : il faut ${totalNeeded} assignations mais la capacité est ${totalCapacity} (${juries.length} jurys × ${Lmax})`,
        data: { totalNeeded, totalCapacity, filmCount: films.length, juryCount: juries.length, R, Lmax },
      });
    }

    // ── Simulate distribution ──────────────────────────────────────────────
    const assignments = new Map(juries.map((j) => [j.id, []]));
    const filmQueue   = films.flatMap((f) => Array(R).fill(f.id));

    for (const filmId of filmQueue) {
      const sorted = [...juries].sort(
        (a, b) => assignments.get(a.id).length - assignments.get(b.id).length
      );
      for (const jury of sorted) {
        const list = assignments.get(jury.id);
        if (list.length < Lmax && !list.includes(filmId)) {
          list.push(filmId);
          break;
        }
      }
    }

    const counts = juries.map((j) => assignments.get(j.id).length);
    const total  = counts.reduce((a, b) => a + b, 0);
    const min    = Math.min(...counts);
    const max    = Math.max(...counts);
    const avg    = (total / counts.length).toFixed(1);

    // Per-jury breakdown for display
    const juryBreakdown = juries.map((j) => ({
      id:         j.id,
      name:       j.name,
      filmCount:  assignments.get(j.id).length,
    }));

    // ── Store snapshot for later confirmation ──────────────────────────────
    const token = generateToken();
    storePreview(token, {
      R, Lmax,
      filmIds:  films.map((f) => f.id),
      juries,
      assignmentsMap: Object.fromEntries(
        [...assignments.entries()].map(([k, v]) => [k, v])
      ),
    });

    return res.status(200).json({
      success:  true,
      feasible: true,
      message:  "Prévisualisation prête. Approuvez avec le token fourni.",
      previewToken: token,
      expiresInSeconds: PREVIEW_TTL_MS / 1000,
      data: {
        total, filmCount: films.length, juryCount: juries.length,
        R, Lmax, min, max, avg, juryBreakdown,
      },
    });
  } catch (error) {
    console.error("previewDistribution error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la prévisualisation",
    });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/distribution/generate
// Body: { previewToken: string }   ← must come from a previous /preview call
//
// The super-jury reviews the preview, then sends the token to confirm.
// ─────────────────────────────────────────────────────────────────────────────
export const generateDistribution = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { previewToken } = req.body;

    if (!previewToken) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: "previewToken manquant. Lancez d'abord /distribution/preview et approuvez le résultat.",
      });
    }

    const preview = consumePreview(previewToken);
    if (!preview) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: "Token de prévisualisation invalide ou expiré. Relancez /distribution/preview.",
      });
    }

    const { R, Lmax, juries, assignmentsMap } = preview;
    const assignedBy = req.user.userId;

    await connection.beginTransaction();

    // Clear all existing assignments
    await connection.query("DELETE FROM jury_assignments");

    const nowLabel     = new Date().toISOString().slice(0, 19).replace("T", " ");
    const createdLists = [];

    for (const jury of juries) {
      const filmIds = assignmentsMap[jury.id] || [];
      if (filmIds.length === 0) continue;

      // 1) Create list
      const listName        = `AUTO - ${jury.name} - ${nowLabel}`;
      const listDescription = `Distribution auto (R=${R}, Lmax=${Lmax}) pour ${jury.name}`;
      const [listRes]       = await connection.query(
        "INSERT INTO jury_lists (name, description, created_by) VALUES (?, ?, ?)",
        [listName, listDescription, assignedBy]
      );
      const listId = listRes.insertId;

      // 2) Films → list
      const listFilmValues = filmIds.map((fid) => [listId, fid]);
      await connection.query(
        "INSERT IGNORE INTO jury_list_films (list_id, film_id) VALUES ?",
        [listFilmValues]
      );

      // 3) Assign list → jury
      await connection.query(
        "INSERT IGNORE INTO jury_list_assignments (list_id, jury_id, assigned_by) VALUES (?, ?, ?)",
        [listId, jury.id, assignedBy]
      );

      // 4) jury_assignments with list_id
      const assignmentValues = filmIds.map((fid) => [jury.id, fid, listId, assignedBy]);
      await connection.query(
        "INSERT IGNORE INTO jury_assignments (jury_id, film_id, list_id, assigned_by) VALUES ?",
        [assignmentValues]
      );

      createdLists.push({ listId, juryId: jury.id, juryName: jury.name, filmCount: filmIds.length });
    }

    await connection.commit();
    connection.release();

    const counts = juries.map((j) => (assignmentsMap[j.id] || []).length);
    const total  = counts.reduce((a, b) => a + b, 0);
    const min    = Math.min(...counts);
    const max    = Math.max(...counts);
    const avg    = (total / counts.length).toFixed(1);

    return res.status(200).json({
      success: true,
      message: "Distribution générée avec succès",
      data: { total, juryCount: juries.length, R, Lmax, min, max, avg, createdLists },
    });
  } catch (error) {
    try { await connection.rollback(); } catch { /* ignore */ }
    connection.release();
    console.error("generateDistribution error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la génération de la distribution",
    });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/lists/rotation/preview
// Body: { R: number, filmsPerList: number }
//
// Returns summary + previewToken. Confirm with /rotation/generate.
// ─────────────────────────────────────────────────────────────────────────────
export const previewRotationLists = async (req, res) => {
  try {
    const R            = Math.max(1, parseInt(req.body.R,            10) || 3);
    const filmsPerList = Math.max(1, parseInt(req.body.filmsPerList, 10) || 50);

    const [films] = await db.query(
      "SELECT id FROM films WHERE status='approved' ORDER BY id"
    );
    const [juries] = await db.query(`
      SELECT u.id, u.name
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id AND ur.role_id = 1
      ORDER BY u.name
    `);

    if (!films.length || !juries.length) {
      return res.status(400).json({
        success: false,
        message: "Aucun film approuvé ou aucun jury trouvé",
      });
    }

    if (R > juries.length) {
      return res.status(400).json({
        success: false,
        message: `R (${R}) ne peut pas être supérieur au nombre de jurys (${juries.length})`,
      });
    }

    const J      = juries.length;
    const byJury = new Map(juries.map((j) => [j.id, []]));

    for (let f = 0; f < films.length; f++) {
      for (let k = 0; k < R; k++) {
        byJury.get(juries[(f + k) % J].id).push(films[f].id);
      }
    }

    const perJuryCounts = juries.map((j) => byJury.get(j.id).length);
    const listsPerJury  = juries.map((j) => chunk(byJury.get(j.id), filmsPerList).length);

    // Per-jury breakdown for display
    const juryBreakdown = juries.map((j) => ({
      id:         j.id,
      name:       j.name,
      filmCount:  byJury.get(j.id).length,
      listCount:  chunk(byJury.get(j.id), filmsPerList).length,
    }));

    // Store for confirmation
    const token = generateToken();
    storePreview(token, {
      R, filmsPerList, juries,
      byJury: Object.fromEntries([...byJury.entries()].map(([k, v]) => [k, v])),
    });

    return res.json({
      success: true,
      feasible: true,
      message: "Prévisualisation prête. Approuvez avec le token fourni.",
      previewToken: token,
      expiresInSeconds: PREVIEW_TTL_MS / 1000,
      data: {
        filmCount:           films.length,
        juryCount:           J,
        R,
        filmsPerList,
        totalAssignments:    films.length * R,
        minAssignedPerJury:  Math.min(...perJuryCounts),
        maxAssignedPerJury:  Math.max(...perJuryCounts),
        avgAssignedPerJury:  (perJuryCounts.reduce((a, b) => a + b, 0) / J).toFixed(1),
        totalLists:          listsPerJury.reduce((a, b) => a + b, 0),
        minListsPerJury:     Math.min(...listsPerJury),
        maxListsPerJury:     Math.max(...listsPerJury),
        juryBreakdown,
      },
    });
  } catch (e) {
    console.error("previewRotationLists error:", e);
    return res.status(500).json({ success: false, message: e.message || "Erreur preview rotation" });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/lists/rotation/generate
// Body: { previewToken: string, cleanupAuto?: boolean }
//
// Must be called after /rotation/preview with the token returned.
// ─────────────────────────────────────────────────────────────────────────────
export const generateRotationLists = async (req, res) => {
  const cx = await db.getConnection();
  try {
    const { previewToken } = req.body;
    const cleanupAuto = req.body.cleanupAuto !== false; // default true
    const assignedBy  = req.user.userId;

    if (!previewToken) {
      cx.release();
      return res.status(400).json({
        success: false,
        message: "previewToken manquant. Lancez d'abord /rotation/preview.",
      });
    }

    const preview = consumePreview(previewToken);
    if (!preview) {
      cx.release();
      return res.status(400).json({
        success: false,
        message: "Token de prévisualisation invalide ou expiré. Relancez /rotation/preview.",
      });
    }

    const { R, filmsPerList, juries, byJury } = preview;

    await cx.beginTransaction();

    // Optional cleanup of previous auto-rotation lists
    if (cleanupAuto) {
      const [autoLists] = await cx.query(
        "SELECT id FROM jury_lists WHERE name LIKE 'AUTO-ROTATION %'"
      );
      const autoIds = autoLists.map((x) => x.id);
      if (autoIds.length) {
        await cx.query("UPDATE jury_assignments SET list_id = NULL WHERE list_id IN (?)", [autoIds]);
        await cx.query("DELETE FROM jury_list_assignments WHERE list_id IN (?)",           [autoIds]);
        await cx.query("DELETE FROM jury_list_films WHERE list_id IN (?)",                 [autoIds]);
        await cx.query("DELETE FROM jury_lists WHERE id IN (?)",                           [autoIds]);
      }
    }

    const createdLists = [];
    const nowLabel     = new Date().toISOString().slice(0, 19).replace("T", " ");

    for (const jury of juries) {
      const filmIds = byJury[jury.id] || [];
      const packs   = chunk(filmIds, filmsPerList);

      for (let idx = 0; idx < packs.length; idx++) {
        const listName = `AUTO-ROTATION ${nowLabel} - ${jury.name} - #${idx + 1}`;
        const listDesc = `Rotation circulaire : R=${R}, filmsPerList=${filmsPerList}`;

        const [listRes] = await cx.query(
          "INSERT INTO jury_lists (name, description, created_by) VALUES (?, ?, ?)",
          [listName, listDesc, assignedBy]
        );
        const listId = listRes.insertId;

        // Films → list
        const valuesFilms = packs[idx].map((fid) => [listId, fid]);
        await cx.query(
          "INSERT IGNORE INTO jury_list_films (list_id, film_id) VALUES ?",
          [valuesFilms]
        );

        // List → jury
        await cx.query(
          "INSERT IGNORE INTO jury_list_assignments (list_id, jury_id, assigned_by) VALUES (?, ?, ?)",
          [listId, jury.id, assignedBy]
        );

        // jury_assignments
        const valuesAssign = packs[idx].map((fid) => [jury.id, fid, listId, assignedBy]);
        await cx.query(
          "INSERT IGNORE INTO jury_assignments (jury_id, film_id, list_id, assigned_by) VALUES ?",
          [valuesAssign]
        );

        createdLists.push({ listId, juryId: jury.id, juryName: jury.name, filmCount: packs[idx].length });
      }
    }

    await cx.commit();
    cx.release();

    return res.json({
      success: true,
      message: "Listes de rotation générées avec succès",
      data: {
        juryCount:  juries.length,
        R,
        filmsPerList,
        totalLists: createdLists.length,
        createdLists,
      },
    });
  } catch (e) {
    try { await cx.rollback(); } catch { /* ignore */ }
    cx.release();
    console.error("generateRotationLists error:", e);
    return res.status(500).json({ success: false, message: e.message || "Erreur génération rotation" });
  }
};