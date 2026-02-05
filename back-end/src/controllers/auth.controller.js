import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "24h";

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

    // Single query: fetch user + roles via JOIN (was 2 separate queries)
    const userWithRoles = await User.findByIdWithRoles(user.id);
    const roles = userWithRoles?.roles || [];

    const token = jwt.sign(
      { userId: user.id, email: user.email, roles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _password, roles: _roles, ...userWithoutPassword } = userWithRoles || user;

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

    // Single query: fetch user + roles via JOIN (was 2 separate queries)
    const user = await User.findByEmailWithRoles(email);
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

    const roles = user.roles || [];

    const token = jwt.sign(
      { userId: user.id, email: user.email, roles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _password, roles: _roles, ...userWithoutPassword } = user;

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
