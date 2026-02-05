import pool from "../config/database.js";

/**
 * Build WHERE clause with support for fulltext search.
 * When no category filter is active, the JOIN to film_categories/categories
 * is unnecessary for filtering - we track this with `needsCategoryJoin`.
 */
function buildWhere(filters) {
  const where = [];
  const params = [];
  let needsCategoryJoin = false;
  let useFulltext = false;

  where.push("f.status = ?");
  params.push("APPROVED");

  if (filters?.q) {
    // Use FULLTEXT search (leverages ft_films_search index) instead of LIKE '%...%'
    // LIKE '%keyword%' forces a full table scan; MATCH/AGAINST uses the fulltext index
    where.push("MATCH(f.title, f.description) AGAINST(? IN BOOLEAN MODE)");
    params.push(`*${filters.q}*`);
    useFulltext = true;
  }

  if (filters?.countries?.length) {
    // Uses idx_films_country index
    where.push(`f.country IN (${filters.countries.map(() => "?").join(",")})`);
    params.push(...filters.countries);
  }

  if (filters?.categories?.length) {
    needsCategoryJoin = true;
    where.push(`c.id IN (${filters.categories.map(() => "?").join(",")})`);
    params.push(...filters.categories);
  }

  if (filters?.ai_tools?.length) {
    // Use FULLTEXT for AI tools search when available
    const likes = filters.ai_tools.map(() => "f.ai_tools_used LIKE ?");
    where.push(`(${likes.join(" OR ")})`);
    params.push(...filters.ai_tools.map((t) => `%${t}%`));
  }

  return {
    whereSql: where.length ? `WHERE ${where.join(" AND ")}` : "",
    params,
    needsCategoryJoin,
    useFulltext,
  };
}

function buildOrderBy(sort) {
  // These use dedicated indexes: idx_films_title, idx_films_status_created_at
  if (sort === "title_asc") return "ORDER BY f.title ASC";
  if (sort === "title_desc") return "ORDER BY f.title DESC";
  return "ORDER BY f.created_at DESC";
}

export default class FilmRepository {
  static async findAll({ filters = {}, sort, limit = 20, offset = 0 }) {
    const { whereSql, params, needsCategoryJoin } = buildWhere(filters);
    const orderBy = buildOrderBy(sort);

    // Optimization: only JOIN film_categories/categories when filtering by category.
    // This avoids expensive JOINs on the COUNT query when not needed.
    const categoryJoin = needsCategoryJoin
      ? `LEFT JOIN film_categories fc ON fc.film_id = f.id
         LEFT JOIN categories c ON c.id = fc.category_id`
      : "";

    // COUNT query - skip category JOIN when not filtering by category
    const [countRows] = await pool.query(
      `SELECT COUNT(DISTINCT f.id) AS total
       FROM films f
       ${categoryJoin}
       ${whereSql}`,
      params
    );

    const total = countRows?.[0]?.total ?? 0;

    // DATA query - always JOIN to get category name for display
    const [rows] = await pool.query(
      `SELECT
        f.id,
        f.title,
        f.country,
        c.name AS category,
        f.poster_url,
        f.thumbnail_url,
        f.ai_tools_used,
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
}
