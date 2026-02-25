import JuryList from "../models/JuryList.js";

// ─── SUPER JURY / ADMIN endpoints ────────────────────────

/**
 * GET /api/admin/lists
 * Get all jury lists (for Super Jury management)
 */
export const getAllLists = async (req, res) => {
  try {
    const lists = await JuryList.findAll();
    return res.json({ success: true, data: lists });
  } catch (error) {
    console.error("getAllLists error:", error);
    return res.status(500).json({ success: false, message: error.message || "Erreur" });
  }
};

/**
 * GET /api/admin/lists/:id
 * Get a single list with films and juries
 */
export const getListById = async (req, res) => {
  try {
    const listId = parseInt(req.params.id, 10);
    if (!listId) return res.status(400).json({ success: false, message: "Invalid list ID" });

    const list = await JuryList.findById(listId);
    if (!list) return res.status(404).json({ success: false, message: "Liste introuvable" });

    return res.json({ success: true, data: list });
  } catch (error) {
    console.error("getListById error:", error);
    return res.status(500).json({ success: false, message: error.message || "Erreur" });
  }
};

/**
 * POST /api/admin/lists
 * Create a new jury list
 */
export const createList = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Le nom est requis" });
    }

    const id = await JuryList.create({
      name: name.trim(),
      description: description?.trim() || null,
      createdBy: req.user.userId,
    });

    return res.status(201).json({ success: true, data: { id, name: name.trim() } });
  } catch (error) {
    console.error("createList error:", error);
    return res.status(500).json({ success: false, message: error.message || "Erreur" });
  }
};

/**
 * PUT /api/admin/lists/:id
 * Update list name/description
 */
export const updateList = async (req, res) => {
  try {
    const listId = parseInt(req.params.id, 10);
    if (!listId) return res.status(400).json({ success: false, message: "Invalid list ID" });

    const { name, description } = req.body;
    const updated = await JuryList.update(listId, { name, description });

    if (!updated) return res.status(404).json({ success: false, message: "Liste introuvable" });

    return res.json({ success: true, message: "Liste mise à jour" });
  } catch (error) {
    console.error("updateList error:", error);
    return res.status(500).json({ success: false, message: error.message || "Erreur" });
  }
};

/**
 * DELETE /api/admin/lists/:id
 * Delete a list
 */
export const deleteList = async (req, res) => {
  try {
    const listId = parseInt(req.params.id, 10);
    if (!listId) return res.status(400).json({ success: false, message: "Invalid list ID" });

    const deleted = await JuryList.delete(listId);
    if (!deleted) return res.status(404).json({ success: false, message: "Liste introuvable" });

    return res.json({ success: true, message: "Liste supprimée" });
  } catch (error) {
    console.error("deleteList error:", error);
    return res.status(500).json({ success: false, message: error.message || "Erreur" });
  }
};

/**
 * POST /api/admin/lists/:id/films
 * Add films to a list
 * Body: { filmIds: [1, 2, 3] }
 */
export const addFilmsToList = async (req, res) => {
  try {
    const listId = parseInt(req.params.id, 10);
    if (!listId) return res.status(400).json({ success: false, message: "Invalid list ID" });

    const { filmIds } = req.body;
    if (!Array.isArray(filmIds) || filmIds.length === 0) {
      return res.status(400).json({ success: false, message: "filmIds requis" });
    }

    const added = await JuryList.addFilms(listId, filmIds.map(Number));
    return res.json({ success: true, data: { added } });
  } catch (error) {
    console.error("addFilmsToList error:", error);
    return res.status(500).json({ success: false, message: error.message || "Erreur" });
  }
};

/**
 * DELETE /api/admin/lists/:id/films
 * Remove films from a list
 * Body: { filmIds: [1, 2, 3] }
 */
export const removeFilmsFromList = async (req, res) => {
  try {
    const listId = parseInt(req.params.id, 10);
    if (!listId) return res.status(400).json({ success: false, message: "Invalid list ID" });

    const { filmIds } = req.body;
    if (!Array.isArray(filmIds) || filmIds.length === 0) {
      return res.status(400).json({ success: false, message: "filmIds requis" });
    }

    const removed = await JuryList.removeFilms(listId, filmIds.map(Number));
    return res.json({ success: true, data: { removed } });
  } catch (error) {
    console.error("removeFilmsFromList error:", error);
    return res.status(500).json({ success: false, message: error.message || "Erreur" });
  }
};

/**
 * POST /api/admin/lists/:id/assign
 * Assign list to jury members (also creates individual film assignments)
 * Body: { juryIds: [1, 2, 3] }
 */
export const assignListToJuries = async (req, res) => {
  try {
    const listId = parseInt(req.params.id, 10);
    if (!listId) return res.status(400).json({ success: false, message: "Invalid list ID" });

    const { juryIds } = req.body;
    if (!Array.isArray(juryIds) || juryIds.length === 0) {
      return res.status(400).json({ success: false, message: "juryIds requis" });
    }

    const assigned = await JuryList.assignToJuries(listId, juryIds.map(Number), req.user.userId);
    return res.json({ success: true, data: { assigned } });
  } catch (error) {
    console.error("assignListToJuries error:", error);
    return res.status(500).json({ success: false, message: error.message || "Erreur" });
  }
};

/**
 * DELETE /api/admin/lists/:id/assign
 * Remove jury members from a list
 * Body: { juryIds: [1, 2, 3] }
 */
export const removeJuriesFromList = async (req, res) => {
  try {
    const listId = parseInt(req.params.id, 10);
    if (!listId) return res.status(400).json({ success: false, message: "Invalid list ID" });

    const { juryIds } = req.body;
    if (!Array.isArray(juryIds) || juryIds.length === 0) {
      return res.status(400).json({ success: false, message: "juryIds requis" });
    }

    const removed = await JuryList.removeJuries(listId, juryIds.map(Number));
    return res.json({ success: true, data: { removed } });
  } catch (error) {
    console.error("removeJuriesFromList error:", error);
    return res.status(500).json({ success: false, message: error.message || "Erreur" });
  }
};

// ─── JURY endpoints ──────────────────────────────────────

/**
 * GET /api/jury/lists
 * Get lists assigned to the current jury member
 */
export const getMyLists = async (req, res) => {
  try {
    const juryId = req.user?.userId;
    if (!juryId) return res.status(401).json({ success: false, message: "Unauthenticated" });

    const lists = await JuryList.findByJuryId(juryId);
    return res.json({ success: true, data: lists });
  } catch (error) {
    console.error("getMyLists error:", error);
    return res.status(500).json({ success: false, message: error.message || "Erreur" });
  }
};
