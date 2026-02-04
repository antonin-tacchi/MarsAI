import pool from "../config/database.js";

function buildWhere(filters) {
  const where = [];
  const params = [];

  where.push("f.status = ?");
  params.push("APPROVED");

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
    params.push(...filters.ai_tools.map(t => `%${t}%`));
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
  static async findAll({ filters = {}, sort, limit = 20, offset = 0 }) {
    const { whereSql, params } = buildWhere(filters);
    const orderBy = buildOrderBy(sort);

    // COUNT
    const [countRows] = await pool.query(
      `
      SELECT COUNT(DISTINCT f.id) AS total
      FROM films f
      JOIN film_categories fc ON fc.film_id = f.id
      JOIN categories c ON c.id = fc.category_id
      ${whereSql}
      `,
      params
    );

    const total = countRows?.[0]?.total || 0;

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
        f.created_at
      FROM films f
      JOIN film_categories fc ON fc.film_id = f.id
      JOIN categories c ON c.id = fc.category_id
      ${whereSql}
      ${orderBy}
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    return { rows, total };
  }
}
