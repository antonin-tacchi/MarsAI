import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "24h";

const normalizeRoleIds = (rolesRaw) => {
  if (!Array.isArray(rolesRaw)) return [];
  return rolesRaw.map((r) => Number(r?.role_id ?? r?.id ?? r)).filter((n) => Number.isFinite(n));
};

/**
 * Login user (Jury/Admin only)
 */
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    const rolesRaw = await User.getRoleIds(user.id);
    const roles = normalizeRoleIds(rolesRaw);

    // Only allow Jury (1) and Admin (2) to login
    if (roles.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé. Compte non autorisé.",
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, roles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _password, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      data: {
        user: { ...userWithoutPassword, roles },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Erreur lors de la connexion" });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Non authentifié" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    const roles = await User.getRoleIds(userId);
    const { password: _password, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      data: { ...userWithoutPassword, roles },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ success: false, message: "Erreur lors de la récupération du profil" });
  }
};

/**
 * Create a new user (Admin only)
 */
export const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Un utilisateur avec cet email existe déjà",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    // Assign role (1 = Jury, 2 = Admin)
    const roleId = role === "admin" ? 2 : 1;
    await User.assignRole(user.id, roleId);

    const { password: _password, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      data: { ...userWithoutPassword, role: role || "jury" },
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ success: false, message: "Erreur lors de la création de l'utilisateur" });
  }
};

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ success: false, message: "Erreur lors de la récupération des utilisateurs" });
  }
};

/**
 * Delete a user (Admin only)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    // Prevent admin from deleting themselves
    if (parseInt(id) === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Vous ne pouvez pas supprimer votre propre compte",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    await User.delete(id);

    return res.status(200).json({
      success: true,
      message: "Utilisateur supprimé avec succès",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ success: false, message: "Erreur lors de la suppression de l'utilisateur" });
  }
};
