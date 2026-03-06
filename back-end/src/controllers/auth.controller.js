import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import { sendPasswordReset } from "../services/email.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "24h";

const normalizeRoleIds = (rolesRaw) => {
  if (!Array.isArray(rolesRaw)) return [];
  return rolesRaw.map((r) => Number(r?.role_id ?? r?.id ?? r)).filter((n) => Number.isFinite(n));
};

// ─── Register ────────────────────────────────────────────────

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, name } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, name });

    await User.assignRole(user.id, 1);

    const rolesRaw = await User.getRoleIds(user.id);
    const roles = normalizeRoleIds(rolesRaw);

    const token = jwt.sign(
      { userId: user.id, email: user.email, roles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _password, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      data: { user: userWithoutPassword, token },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Error creating user" });
  }
};

// ─── Login ───────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const rolesRaw = await User.getRoleIds(user.id);
    const roles = normalizeRoleIds(rolesRaw);

    const token = jwt.sign(
      { userId: user.id, email: user.email, roles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _password, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        must_reset_password: user.must_reset_password === 1, // ← flag 1ère connexion jury
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Error during login" });
  }
};

// ─── Get Profile ─────────────────────────────────────────────

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { password: _password, ...userWithoutPassword } = user;
    return res.status(200).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ success: false, message: "Error retrieving profile" });
  }
};

// ─── Forgot Password ─────────────────────────────────────────

export const forgotPassword = async (req, res) => {
  try {
    const { email, lang = "fr" } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email requis" });
    }

    // Réponse identique qu'il existe ou non pour ne pas révéler les comptes
    const genericResponse = {
      success: true,
      message: lang === "fr"
        ? "Si cet email existe, un lien de réinitialisation a été envoyé."
        : "If this email exists, a reset link has been sent.",
    };

    const user = await User.findByEmail(email);
    if (!user) return res.json(genericResponse);

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await User.createPasswordResetToken(user.id, token, expiresAt);

    // Envoyer l'email (fire & forget — ne pas bloquer la réponse si échec)
    sendPasswordReset({ to: email, name: user.name, token, lang }).catch((err) =>
      console.error("Email send error:", err)
    );

    return res.json(genericResponse);
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// ─── Reset Password (lien magique) ───────────────────────────

export const resetPassword = async (req, res) => {
  try {
    const { token, password, lang = "fr" } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token et mot de passe requis" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: lang === "fr"
          ? "Le mot de passe doit contenir au moins 8 caractères"
          : "Password must be at least 8 characters",
      });
    }

    const resetToken = await User.findValidResetToken(token);
    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: lang === "fr" ? "Lien invalide ou expiré" : "Invalid or expired link",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updatePassword(resetToken.user_id, hashedPassword);
    await User.invalidateResetToken(token);

    return res.json({
      success: true,
      message: lang === "fr"
        ? "Mot de passe mis à jour avec succès"
        : "Password successfully updated",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// ─── Change Password (1ère connexion jury / profil) ───────────

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, lang = "fr" } = req.body;
    const userId = req.user?.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Champs requis" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: lang === "fr"
          ? "Le nouveau mot de passe doit contenir au moins 8 caractères"
          : "New password must be at least 8 characters",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: lang === "fr"
          ? "Le nouveau mot de passe doit être différent"
          : "New password must be different",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({
        success: false,
        message: lang === "fr" ? "Mot de passe actuel incorrect" : "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(userId, hashedPassword);

    return res.json({
      success: true,
      message: lang === "fr" ? "Mot de passe changé avec succès" : "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};