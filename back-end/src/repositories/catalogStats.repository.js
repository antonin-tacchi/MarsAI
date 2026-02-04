// src/repositories/films.repository.js
import pool from "../config/database.js";

function buildWhere(filters) {
  const where = [];
  const params = [];

  // NOTE: on ne filtre plus par status (on compte tout)
  // Si tu veux filtrer plus tard, tu le rajouteras côté endpoint.

  if (filters?.q) {
    where.push("(f.title LIKE ? OR f.description LIKE ?)");
    params.push(`%${filters.q}%`, `%${filters.q}%`);
  }

  if (filters?.countries?.length) {
    where.push(`f.country IN (${filters.countries.map(() => "?").join(",")})`);
    params.push(...filters.countries);
  }

  if (filters?.categories?.length) {
    where.push(`c.id IN (${filters.categories.map(() => "?").join(",")})`);
    params.push(...filters.categories);
  }

  if (filters?.ai_tools?.length) {
    const likes = filters.ai_tools.map(() => "f.ai_tools_used LIKE ?");
    where.push(`(${likes.join(" OR ")})`);
    params.push(...filters.ai_tools.map((t) => `%${t}%`));
  }

  return {
    whereSql: where.length ? `WHERE ${where.join(" AND ")}` : "",
    params,
  };
}

function buildOrderBy(sort) {
  if (sort === "title_asc") return "ORDER BY f.title ASC";
  if (sort === "title_desc") return "ORDER BY f.title DESC";
  return "ORDER BY f.created_at DESC";
}

export default class FilmRepository {
  // ---------- CATALOG LIST ----------
  static async findAll({ filters = {}, sort, limit = 20, offset = 0 }) {
    const { whereSql, params } = buildWhere(filters);
    const orderBy = buildOrderBy(sort);

    // COUNT (avec JOIN catégorie si tu filtres categories)
    const [countRows] = await pool.query(
      `
      SELECT COUNT(DISTINCT f.id) AS total
      FROM films f
      LEFT JOIN film_categories fc ON fc.film_id = f.id
      LEFT JOIN categories c ON c.id = fc.category_id
      ${whereSql}
      `,
      params
    );

    const total = countRows?.[0]?.total ?? 0;

    // DATA
    const [rows] = await pool.query(
      `
      SELECT
        f.id,
        f.title,
        f.country,
        c.name AS category,
        f.poster_url,
        f.thumbnail_url,
        f.ai_tools_used,
        f.status,
        f.created_at
      FROM films f
      LEFT JOIN film_categories fc ON fc.film_id = f.id
      LEFT JOIN categories c ON c.id = fc.category_id
      ${whereSql}
      ${orderBy}
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    return { rows, total };
  }

  // ---------- STATS (catalog) ----------
  static async countAll() {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS count
      FROM films
    `);
    return rows?.[0]?.count ?? 0;
  }

  static async countByCategory() {
    // Compte tous les films liés à chaque catégorie.
    // Note: si un film est dans plusieurs catégories, il comptera dans chacune (logique).
    const [rows] = await pool.query(`
      SELECT
        c.id AS categoryId,
        c.name AS name,
        COUNT(DISTINCT fc.film_id) AS count
      FROM categories c
      LEFT JOIN film_categories fc ON fc.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `);
    return rows;
  }

  static async countByCountry() {
    const [rows] = await pool.query(`
      SELECT
        COALESCE(NULLIF(TRIM(f.country), ''), 'Unknown') AS country,
        COUNT(*) AS count
      FROM films f
      GROUP BY COALESCE(NULLIF(TRIM(f.country), ''), 'Unknown')
      ORDER BY count DESC
    `);
    return rows;
  }

static async countByAiTool() {
  const [rows] = await pool.query(`
    SELECT
      COALESCE(NULLIF(TRIM(ai_tools_used), ''), 'Unknown') AS tool,
      COUNT(*) AS count
    FROM films
    GROUP BY COALESCE(NULLIF(TRIM(ai_tools_used), ''), 'Unknown')
    ORDER BY count DESC
  `);
  return rows;
}

}
