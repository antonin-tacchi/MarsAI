import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "24h";

const normalizeRoleIds = (rolesRaw) => {
  if (!Array.isArray(rolesRaw)) return [];
  return rolesRaw.map((r) => Number(r?.role_id ?? r?.id ?? r)).filter((n) => Number.isFinite(n));
};

/**
 * Verify Google token and authenticate user
 * Uses Google Identity Services (OAuth 2.0)
 */
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required"
      });
    }

    // SECURITY WARNING: This decodes the token without verification
    // For production, install google-auth-library:
    //   npm install google-auth-library
    // And verify the token:
    //   import { OAuth2Client } from 'google-auth-library';
    //   const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    //   const ticket = await client.verifyIdToken({
    //     idToken: credential,
    //     audience: process.env.GOOGLE_CLIENT_ID,
    //   });
    //   const payload = ticket.getPayload();
    const decodedToken = jwt.decode(credential);

    if (!decodedToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google credential"
      });
    }

    const { email, name, picture, sub: googleId } = decodedToken;

    // Check if user exists
    let user = await User.findByEmail(email);

    if (!user) {
      // Create new user
      user = await User.create({
        email,
        name,
        password: `google_${googleId}_${Date.now()}`, // Random password (user won't use it)
      });

      // Assign default role: director (1)
      await User.assignRole(user.id, 1);
    }

    // Get user roles
    const rolesRaw = await User.getRoleIds(user.id);
    const roles = normalizeRoleIds(rolesRaw);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, roles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "Google authentication successful",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      message: "Error during Google authentication"
    });
  }
};
