import { getCurrentUser, getToken } from "../services/authService";
const ADMIN_KEYS = new Set(["admin", "administrator", "ROLE_ADMIN", "1"]);
const JURY_KEYS = new Set(["jury", "ROLE_JURY", "2"]);

function normalizeRole(r) {
  if (r == null) return "";
  if (typeof r === "number") return String(r);
  if (typeof r === "string") return r.trim();
  if (typeof r === "object") {
    if (r.name) return String(r.name).trim();
    if (r.id != null) return String(r.id);
  }
  return "";
}

function safeParseJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function decodeJwtPayload(token) {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");

    const json = atob(padded);
    return safeParseJson(json);
  } catch {
    return null;
  }
}

/**
 * Returns the numeric role IDs from the JWT token and/or user object.
 * Backend roles: 1 = Jury, 2 = Admin, 3 = Super Jury
 */
export function getUserRoleIds(user = getCurrentUser()) {
  const token = getToken();
  const payload = decodeJwtPayload(token);
  const rolesFromUser = Array.isArray(user?.roles) ? user.roles : [];
  const rolesFromJwt = Array.isArray(payload?.roles) ? payload.roles : [];

  const ids = new Set();
  [...rolesFromUser, ...rolesFromJwt].forEach((r) => {
    const n = Number(r?.role_id ?? r?.id ?? r);
    if (Number.isFinite(n)) ids.add(n);
  });

  return [...ids];
}

export function isAdminOrJury(user = getCurrentUser()) {
  const token = getToken();
  const payload = decodeJwtPayload(token);
  const rolesFromUser = Array.isArray(user?.roles) ? user.roles : [];
  const maybeSingle =
    user?.role ?? user?.role_name ?? user?.role_id ?? null;
  const rolesFromJwt = Array.isArray(payload?.roles) ? payload.roles : [];

  const allRoles = [
    ...rolesFromUser,
    ...(maybeSingle != null ? [maybeSingle] : []),
    ...rolesFromJwt,
  ].map(normalizeRole);

  return allRoles.some((r) => ADMIN_KEYS.has(r) || JURY_KEYS.has(r));
}

/**
 * Returns the profile route and translation key based on the user's highest role.
 * Priority: Admin (2) > Super Jury (3) > Jury (1) > Director (authenticated)
 * Returns null if user is not logged in.
 */
export function getProfileRoute(user = getCurrentUser()) {
  const roles = getUserRoleIds(user);

  if (roles.includes(2)) return { path: "/profile-admin", labelKey: "footer.adminSpace" };
  if (roles.includes(3)) return { path: "/profile-superjury", labelKey: "footer.superJurySpace" };
  if (roles.includes(1)) return { path: "/profile-jury", labelKey: "footer.jurySpace" };

  // Authenticated user with director role (no special role)
  if (getToken()) return { path: "/profile-director", labelKey: "footer.directorSpace" };

  return null;
}
