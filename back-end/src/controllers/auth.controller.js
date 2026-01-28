import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import Invitation from "../models/Invitation.js";
import { sendInvitationEmail } from "../services/email.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "24h";

const normalizeRoleIds = (rolesRaw) => {
  if (!Array.isArray(rolesRaw)) return [];
  return rolesRaw.map((r) => Number(r?.role_id ?? r?.id ?? r)).filter((n) => Number.isFinite(n));
};

/**
 * Register a new user
 */
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

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    // By default : director (1)
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

/**
 * Login user
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
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
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
      data: { user: userWithoutPassword, token },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Error during login" });
  }
};

/**
 * Get current user profile
 */
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

/**
 * Send invitation (Admin only)
 */
export const sendInvitation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, role_id } = req.body;
    const invitedBy = req.user?.userId;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Un utilisateur avec cet email existe deja",
      });
    }

    // Check if invitation already exists
    const existingInvite = await Invitation.findByEmail(email);
    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: "Une invitation a deja ete envoyee a cet email",
      });
    }

    // Create invitation token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const invitation = await Invitation.create({
      email,
      role_id,
      token,
      expires_at: expiresAt,
      invited_by: invitedBy,
    });

    // Get role name for email
    const roleNames = { 1: "Jury", 2: "Admin", 3: "Super Jury" };
    const roleName = roleNames[role_id] || "Membre";

    // Send email
    await sendInvitationEmail(email, token, roleName);

    return res.status(201).json({
      success: true,
      message: "Invitation envoyee avec succes",
      data: { email, role_id },
    });
  } catch (error) {
    console.error("Send invitation error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi de l'invitation",
    });
  }
};

/**
 * Get pending invitations (Admin only)
 */
export const getPendingInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.findAllPending();
    return res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    console.error("Get invitations error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la recuperation des invitations",
    });
  }
};

/**
 * Delete invitation (Admin only)
 */
export const deleteInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Invitation.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Invitation non trouvee",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Invitation supprimee",
    });
  } catch (error) {
    console.error("Delete invitation error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression",
    });
  }
};

/**
 * Verify invitation token (Public)
 */
export const verifyInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findByToken(token);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation non trouvee",
      });
    }

    if (await Invitation.isExpired(invitation)) {
      return res.status(400).json({
        success: false,
        message: "Cette invitation a expire",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        email: invitation.email,
        role_name: invitation.role_name,
      },
    });
  } catch (error) {
    console.error("Verify invitation error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la verification",
    });
  }
};

/**
 * Accept invitation and create account (Public)
 */
export const acceptInvitation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token } = req.params;
    const { name, password } = req.body;

    const invitation = await Invitation.findByToken(token);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation non trouvee",
      });
    }

    if (await Invitation.isExpired(invitation)) {
      return res.status(400).json({
        success: false,
        message: "Cette invitation a expire",
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: invitation.email,
      password: hashedPassword,
      name,
    });

    // Assign role from invitation
    await User.assignRole(user.id, invitation.role_id);

    // Mark invitation as used
    await Invitation.markAsUsed(invitation.id);

    // Generate token
    const rolesRaw = await User.getRoleIds(user.id);
    const roles = normalizeRoleIds(rolesRaw);

    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, roles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _password, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      message: "Compte cree avec succes",
      data: { user: userWithoutPassword, token: jwtToken },
    });
  } catch (error) {
    console.error("Accept invitation error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la creation du compte",
    });
  }
};
