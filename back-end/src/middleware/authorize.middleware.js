export const authorize = (allowedRoles = []) => {
  const allowed = allowedRoles.map(Number);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    const roles = Array.isArray(req.user.roles) ? req.user.roles.map(Number) : [];

    if (roles.length === 0) {
      return res.status(403).json({ success: false, message: "Forbidden (no roles in token)" });
    }

    const hasAccess = roles.some((r) => allowed.includes(r));

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return next();
  };
};