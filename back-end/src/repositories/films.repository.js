import pool from "../config/database.js";
import Film from "../models/Film.js";

function buildWhere(filters) {
  const where = [];
  const params = [];

  // IMPORTANT : catalogue public => filtre par status "APPROVED" (adapte)
  where.push("f.status = ?");
  params.push("APPROVED");

  if (filters.q) {
    where.push("(f.title LIKE ? OR f.description LIKE ?)");
    params.push(`%${filters.q}%`, `%${filters.q}%`);
  }

  if (filters.countries?.length) {
    where.push(`f.country IN (${filters.countries.map(() => "?").join(",")})`);
    params.push(...filters.countries);
  }

  if (filters.categories?.length) {
    // si tu as category (string). Sinon category_id.
    where.push(`f.category IN (${filters.categories.map(() => "?").join(",")})`);
    params.push(...filters.categories);
  }

  if (filters.ai_tools?.length) {
    // Si ai_tools_used est une string libre, on fait un OR de LIKE.
    // (Idéalement, tu normalises plus tard en table film_ai_tools)
    const likes = filters.ai_tools.map(() => "f.ai_tools_used LIKE ?");
    where.push(`(${likes.join(" OR ")})`);
    params.push(...filters.ai_tools.map(t => `%${t}%`));
  }

  return { whereSql: where.length ? `WHERE ${where.join(" AND ")}` : "", params };
}

function buildOrderBy(sort) {
  if (sort === "title_asc") return "ORDER BY f.title ASC";
  if (sort === "title_desc") return "ORDER BY f.title DESC";
  return "ORDER BY f.created_at DESC";
}

export default class FilmRepository {
  static async findAll({ filters, sort, limit, offset }) {
    const { whereSql, params } = buildWhere(filters);
    const orderBy = buildOrderBy(sort);

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM films f ${whereSql}`,
      params
    );
    const total = countRows?.[0]?.total || 0;

    const [rows] = await pool.query(
      `
      SELECT
        f.id, f.title, f.country, f.category,
        f.poster_url, f.thumbnail_url,
        f.ai_tools_used, f.created_at
      FROM films f
      ${whereSql}
      ${orderBy}
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    return {
      total,
      items: rows.map(Film.toPublicDTO), // mapping centralisé dans le Model
    };
  }
}
