import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization ?? "";
    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token missing.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Payload JWT -> req.user
    req.user = decoded;

    // Debug utile (à enlever plus tard)
    // console.log("JWT decoded:", decoded);

    return next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
