// src/middleware/authorize.middleware.js

/**
 * authorize(minRole)
 *
 * Roles:
 * 1 = director
 * 2 = jury
 * 3 = admin
 */
export const authorize = (minRole = 1) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthenticated",
      });
    }

    const roleId = Number(req.user.role_id);

    if (!roleId) {
      return res.status(401).json({
        success: false,
        message: "Unauthenticated",
      });
    }

    if (roleId < minRole) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    return next();
  };
};
