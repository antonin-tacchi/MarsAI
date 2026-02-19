import pool from "../config/database.js";
import bcrypt from "bcryptjs";
import Film from "../models/Film.js";
import { canChangeFilmStatus } from "../services/filmStatus.service.js";
import { sendRejectionEmail } from "../services/email.service.js";

// ─── USERS ──────────────────────────────────────────────────

export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.id, u.name, u.email, u.created_at,
             GROUP_CONCAT(ur.role_id) AS role_ids
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    const data = users.map((u) => ({
      ...u,
      roles: u.role_ids ? u.role_ids.split(",").map(Number) : [],
    }));

    return res.json({ success: true, data });
  } catch (error) {
    console.error("getAllUsers error:", error);
    return res.status(500).json({ success: false, message: error.message || "Erreur lors de la récupération des utilisateurs" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, roles } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email and password are required",
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())",
      [name, email, hashed]
    );

    const userId = result.insertId;

    const roleList = Array.isArray(roles) && roles.length > 0 ? roles : [1];
    for (const roleId of roleList) {
      await pool.query(
        "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
        [userId, roleId]
      );
    }

    return res.status(201).json({
      success: true,
      data: { id: userId, name, email, roles: roleList },
    });
  } catch (error) {
    console.error("createUser error:", error);
    return res.status(500).json({ success: false, message: error.message || "Erreur lors de la création de l'utilisateur" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (!userId) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    const { name, email, password, roles } = req.body;

    const [existing] = await pool.query("SELECT id FROM users WHERE id = ?", [
      userId,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updates = [];
    const values = [];

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (password) {
      updates.push("password = ?");
      values.push(await bcrypt.hash(password, 10));
    }

    if (updates.length > 0) {
      values.push(userId);
      await pool.query(
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        values
      );
    }

    if (Array.isArray(roles)) {
      await pool.query("DELETE FROM user_roles WHERE user_id = ?", [userId]);
      for (const roleId of roles) {
        await pool.query(
          "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
          [userId, roleId]
        );
      }
    }

    return res.json({ success: true, message: "User updated" });
  } catch (error) {
    console.error("updateUser error:", error);
    return res.status(500).json({ success: false, message: error.message || "Erreur lors de la mise à jour de l'utilisateur" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (!userId) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    await pool.query("DELETE FROM user_roles WHERE user_id = ?", [userId]);
    await pool.query("DELETE FROM jury_ratings WHERE user_id = ?", [userId]);
    await pool.query("DELETE FROM jury_assignments WHERE jury_id = ?", [userId]);
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("deleteUser error:", error);
    return res.status(500).json({ success: false, message: error.message || "Erreur lors de la suppression de l'utilisateur" });
  }
};

// ─── FILMS ──────────────────────────────────────────────────

export const getAdminFilms = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    const sortField = req.query.sortField || "created_at";
    const sortOrder = req.query.sortOrder || "DESC";
    const status = req.query.status || undefined;

    const { rows, count } = await Film.findAll({
      limit,
      offset,
      sortField,
      sortOrder,
      status,
    });

    return res.json({
      success: true,
      pagination: {
        totalItems: count,
        totalPages: Math.max(1, Math.ceil(count / limit)),
        currentPage: page,
        itemsPerPage: limit,
      },
      data: rows,
    });
  } catch (error) {
    console.error("getAdminFilms error:", error);
    return res.status(500).json({ success: false, message: error.message || "Erreur lors de la récupération des films" });
  }
};

export const updateFilmStatusAdmin = async (req, res) => {
  try {
    const filmId = parseInt(req.params.id, 10);
    if (!filmId) {
      return res.status(400).json({ success: false, message: "Invalid film ID" });
    }

    const { status, rejection_reason } = req.body;

    const newStatus = (status || "").trim();
    if (!["pending", "approved", "rejected"].includes(newStatus)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const film = await Film.findById(filmId);
    if (!film) {
      return res.status(404).json({ success: false, message: "Film not found" });
    }

    if (!canChangeFilmStatus(film.status, newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Transition not allowed: ${film.status} → ${newStatus}`,
      });
    }

    if (newStatus === "rejected" && !rejection_reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const userId = req.user?.userId;
    const updated = await Film.updateStatus(filmId, newStatus, userId, rejection_reason || null);

    if (newStatus === "rejected") {
      sendRejectionEmail(updated, rejection_reason).catch((err) =>
        console.error("Rejection email failed:", err.message)
      );
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("updateFilmStatusAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Échec de la mise à jour du statut du film",
    });
  }
};

export const deleteFilm = async (req, res) => {
  try {
    const filmId = parseInt(req.params.id, 10);
    if (!filmId) {
      return res.status(400).json({ success: false, message: "Invalid film ID" });
    }

    await pool.query("DELETE FROM jury_ratings WHERE film_id = ?", [filmId]);
    await pool.query("DELETE FROM jury_assignments WHERE film_id = ?", [filmId]);
    await pool.query("DELETE FROM film_categories WHERE film_id = ?", [filmId]);
    const [result] = await pool.query("DELETE FROM films WHERE id = ?", [filmId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Film not found" });
    }

    return res.json({ success: true, message: "Film deleted" });
  } catch (error) {
    console.error("deleteFilm error:", error);
    return res.status(500).json({ success: false, message: error.message || "Erreur lors de la suppression du film" });
  }
};
