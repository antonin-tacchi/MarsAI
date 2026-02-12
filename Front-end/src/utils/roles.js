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
