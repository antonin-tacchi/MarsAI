// src/repositories/catalogStats.repository.js
import pool from "../config/database.js";

function buildWhere(filters) {
  const where = [];
  const params = [];
  let needsCategoryJoin = false;

  if (filters?.q) {
    // Use FULLTEXT index instead of LIKE '%...%' for better performance
    where.push("MATCH(f.title, f.description) AGAINST(? IN BOOLEAN MODE)");
    params.push(`*${filters.q}*`);
  }

  if (filters?.countries?.length) {
    where.push(`f.country IN (${filters.countries.map(() => "?").join(",")})`);
    params.push(...filters.countries);
  }

  if (filters?.categories?.length) {
    needsCategoryJoin = true;
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
    needsCategoryJoin,
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
    const { whereSql, params, needsCategoryJoin } = buildWhere(filters);
    const orderBy = buildOrderBy(sort);

    // Optimization: skip category JOIN in COUNT when not filtering by category
    const categoryJoin = needsCategoryJoin
      ? `LEFT JOIN film_categories fc ON fc.film_id = f.id
         LEFT JOIN categories c ON c.id = fc.category_id`
      : "";

    // COUNT
    const [countRows] = await pool.query(
      `SELECT COUNT(DISTINCT f.id) AS total
       FROM films f
       ${categoryJoin}
       ${whereSql}`,
      params
    );

    const total = countRows?.[0]?.total ?? 0;

    // DATA - always JOIN for category display
    const [rows] = await pool.query(
      `SELECT
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
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  }

  // ---------- STATS ----------

  static async countAll() {
    // Simple COUNT(*) on PK - very fast, uses clustered index
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS count FROM films`
    );
    return rows?.[0]?.count ?? 0;
  }

  static async countByCategory() {
    // LEFT JOIN ensures categories with 0 films still appear.
    // Uses PK indexes on categories and film_categories.
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
    // Uses idx_films_country for the GROUP BY operation
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
