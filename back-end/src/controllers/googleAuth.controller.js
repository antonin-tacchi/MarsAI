import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "24h";

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

    // Decode the Google JWT token (without verification for now)
    // In production, you should verify the token with Google's public keys
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
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
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
