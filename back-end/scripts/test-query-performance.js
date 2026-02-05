/**
 * MarsAI - Database Query Performance Test
 *
 * Tests all critical queries with EXPLAIN analysis and timing.
 * Run: node --env-file=.env scripts/test-query-performance.js
 *
 * Requires: MySQL database with marsai schema loaded + optimize-indexes.sql applied.
 */

import pool from "../src/config/database.js";

// ─── Helpers ──────────────────────────────────────────────────

const DIVIDER = "─".repeat(70);

function formatMs(ms) {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

async function timeQuery(label, sql, params = []) {
  const start = performance.now();
  const [rows] = await pool.query(sql, params);
  const elapsed = performance.now() - start;
  console.log(`  [${formatMs(elapsed)}] ${label} → ${rows.length} row(s)`);
  return { rows, elapsed };
}

async function explainQuery(label, sql, params = []) {
  console.log(`\n${DIVIDER}`);
  console.log(`EXPLAIN: ${label}`);
  console.log(DIVIDER);

  const [explain] = await pool.query(`EXPLAIN ${sql}`, params);

  // Display EXPLAIN in a readable format
  for (const row of explain) {
    console.log(`  table: ${row.table || "-"}`);
    console.log(`    type: ${row.type}  |  possible_keys: ${row.possible_keys || "NULL"}`);
    console.log(`    key: ${row.key || "NULL"}  |  key_len: ${row.key_len || "-"}  |  rows: ${row.rows}`);
    console.log(`    Extra: ${row.Extra || "-"}`);
    console.log();
  }

  return explain;
}

// ─── Test Suites ──────────────────────────────────────────────

async function testIndexes() {
  console.log("\n\n========================================");
  console.log("  1. VERIFY INDEXES EXIST");
  console.log("========================================\n");

  const tables = ["films", "users", "user_roles", "film_categories", "categories",
                  "email_logs", "events", "invitations", "jury_ratings", "awards"];

  for (const table of tables) {
    try {
      const [indexes] = await pool.query(`SHOW INDEX FROM ${table}`);
      const indexNames = [...new Set(indexes.map((i) => i.Key_name))];
      console.log(`  ${table}: ${indexNames.join(", ")}`);
    } catch {
      console.log(`  ${table}: (table not found)`);
    }
  }
}

async function testCatalogQueries() {
  console.log("\n\n========================================");
  console.log("  2. CATALOG QUERIES (findAll)");
  console.log("========================================");

  // 2a. Default catalog query: WHERE status = 'approved' ORDER BY created_at DESC
  const defaultSql = `
    SELECT f.id, f.title, f.country, c.name AS category,
           f.poster_url, f.thumbnail_url, f.ai_tools_used, f.created_at
    FROM films f
    LEFT JOIN film_categories fc ON fc.film_id = f.id
    LEFT JOIN categories c ON c.id = fc.category_id
    WHERE f.status = ?
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?`;

  await explainQuery("Default catalog (status + created_at sort)", defaultSql, ["approved", 20, 0]);
  await timeQuery("Default catalog query", defaultSql, ["approved", 20, 0]);

  // 2b. Count query without category filter (optimized: no JOINs)
  const countNoJoinSql = `
    SELECT COUNT(DISTINCT f.id) AS total
    FROM films f
    WHERE f.status = ?`;

  await explainQuery("Count WITHOUT category JOIN", countNoJoinSql, ["approved"]);
  await timeQuery("Count without JOIN", countNoJoinSql, ["approved"]);

  // 2c. Count query with category filter (needs JOINs)
  const countWithJoinSql = `
    SELECT COUNT(DISTINCT f.id) AS total
    FROM films f
    LEFT JOIN film_categories fc ON fc.film_id = f.id
    LEFT JOIN categories c ON c.id = fc.category_id
    WHERE f.status = ? AND c.id IN (?, ?)`;

  await explainQuery("Count WITH category JOIN", countWithJoinSql, ["approved", 1, 2]);
  await timeQuery("Count with category JOIN", countWithJoinSql, ["approved", 1, 2]);

  // 2d. Search with FULLTEXT
  const fulltextSql = `
    SELECT f.id, f.title
    FROM films f
    WHERE f.status = ? AND MATCH(f.title, f.description) AGAINST(? IN BOOLEAN MODE)
    LIMIT ?`;

  await explainQuery("FULLTEXT search", fulltextSql, ["approved", "*film*", 20]);
  await timeQuery("FULLTEXT search", fulltextSql, ["approved", "*film*", 20]);

  // 2e. Sort by title (uses idx_films_title)
  const titleSortSql = `
    SELECT f.id, f.title
    FROM films f
    WHERE f.status = ?
    ORDER BY f.title ASC
    LIMIT ? OFFSET ?`;

  await explainQuery("Sort by title ASC", titleSortSql, ["approved", 20, 0]);
  await timeQuery("Sort by title ASC", titleSortSql, ["approved", 20, 0]);

  // 2f. Filter by country (uses idx_films_country)
  const countrySql = `
    SELECT f.id, f.title, f.country
    FROM films f
    WHERE f.status = ? AND f.country IN (?, ?)
    ORDER BY f.created_at DESC
    LIMIT ?`;

  await explainQuery("Filter by country", countrySql, ["approved", "France", "USA", 20]);
  await timeQuery("Filter by country", countrySql, ["approved", "France", "USA", 20]);
}

async function testAuthQueries() {
  console.log("\n\n========================================");
  console.log("  3. AUTH QUERIES (login/register)");
  console.log("========================================");

  // 3a. findByEmailWithRoles - single JOIN query (optimized)
  const emailRolesSql = `
    SELECT u.*, GROUP_CONCAT(ur.role_id) AS role_ids
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    WHERE u.email = ?
    GROUP BY u.id`;

  await explainQuery("findByEmailWithRoles (optimized login)", emailRolesSql, ["admin@marsai.com"]);
  await timeQuery("findByEmailWithRoles", emailRolesSql, ["admin@marsai.com"]);

  // 3b. Original: findByEmail (separate query)
  const emailSql = `SELECT * FROM users WHERE email = ?`;
  await explainQuery("findByEmail (original)", emailSql, ["admin@marsai.com"]);
  await timeQuery("findByEmail (original)", emailSql, ["admin@marsai.com"]);

  // 3c. Original: getRoleIds (separate query)
  const rolesSql = `SELECT role_id FROM user_roles WHERE user_id = ?`;
  await explainQuery("getRoleIds (original)", rolesSql, [1]);
  await timeQuery("getRoleIds", rolesSql, [1]);

  // 3d. Comparison: 1 query vs 2 queries
  console.log("\n  --- Comparison: Optimized (1 query) vs Original (2 queries) ---");
  const { elapsed: optimized } = await timeQuery("Optimized (1 query)", emailRolesSql, ["admin@marsai.com"]);
  const { elapsed: q1 } = await timeQuery("Original query 1", emailSql, ["admin@marsai.com"]);
  const { elapsed: q2 } = await timeQuery("Original query 2", rolesSql, [1]);
  console.log(`  → Optimized: ${formatMs(optimized)} vs Original: ${formatMs(q1 + q2)} (${((1 - optimized / (q1 + q2)) * 100).toFixed(0)}% faster)`);
}

async function testRateLimitQuery() {
  console.log("\n\n========================================");
  console.log("  4. RATE LIMIT QUERY (countRecentByEmail)");
  console.log("========================================");

  // Uses composite index (director_email, created_at)
  const rateLimitSql = `
    SELECT COUNT(*) AS total
    FROM films
    WHERE director_email = ?
      AND created_at >= (NOW() - INTERVAL ? MINUTE)`;

  await explainQuery("countRecentByEmail", rateLimitSql, ["test@example.com", 60]);
  await timeQuery("countRecentByEmail", rateLimitSql, ["test@example.com", 60]);
}

async function testStatsQueries() {
  console.log("\n\n========================================");
  console.log("  5. STATS QUERIES");
  console.log("========================================");

  const countAllSql = `SELECT COUNT(*) AS count FROM films`;
  await explainQuery("countAll", countAllSql);
  await timeQuery("countAll", countAllSql);

  const byCategorySql = `
    SELECT c.id AS categoryId, c.name AS name, COUNT(DISTINCT fc.film_id) AS count
    FROM categories c
    LEFT JOIN film_categories fc ON fc.category_id = c.id
    GROUP BY c.id, c.name
    ORDER BY count DESC`;

  await explainQuery("countByCategory", byCategorySql);
  await timeQuery("countByCategory", byCategorySql);

  const byCountrySql = `
    SELECT COALESCE(NULLIF(TRIM(f.country), ''), 'Unknown') AS country, COUNT(*) AS count
    FROM films f
    GROUP BY COALESCE(NULLIF(TRIM(f.country), ''), 'Unknown')
    ORDER BY count DESC`;

  await explainQuery("countByCountry", byCountrySql);
  await timeQuery("countByCountry", byCountrySql);

  const byAiToolSql = `
    SELECT COALESCE(NULLIF(TRIM(ai_tools_used), ''), 'Unknown') AS tool, COUNT(*) AS count
    FROM films
    GROUP BY COALESCE(NULLIF(TRIM(ai_tools_used), ''), 'Unknown')
    ORDER BY count DESC`;

  await explainQuery("countByAiTool", byAiToolSql);
  await timeQuery("countByAiTool", byAiToolSql);
}

async function testFindById() {
  console.log("\n\n========================================");
  console.log("  6. FIND BY ID (PK lookup)");
  console.log("========================================");

  const filmByIdSql = `SELECT * FROM films WHERE id = ? LIMIT 1`;
  await explainQuery("Film.findById", filmByIdSql, [1]);
  await timeQuery("Film.findById", filmByIdSql, [1]);

  const userByIdSql = `SELECT * FROM users WHERE id = ?`;
  await explainQuery("User.findById", userByIdSql, [1]);
  await timeQuery("User.findById", userByIdSql, [1]);
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║     MarsAI - Database Query Performance Test            ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(`\nDatabase: ${process.env.DB_NAME || "marsai"}`);
  console.log(`Host: ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 3306}`);

  try {
    // Verify connection
    const [connTest] = await pool.query("SELECT 1 AS ok");
    if (!connTest[0]?.ok) throw new Error("Connection failed");
    console.log("Connection: OK\n");

    await testIndexes();
    await testCatalogQueries();
    await testAuthQueries();
    await testRateLimitQuery();
    await testStatsQueries();
    await testFindById();

    console.log(`\n\n${DIVIDER}`);
    console.log("  ALL TESTS COMPLETED");
    console.log(DIVIDER);
  } catch (error) {
    console.error("\nTest failed:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.error("  → MySQL is not running or not reachable.");
    }
    if (error.code === "ER_NO_SUCH_TABLE") {
      console.error("  → Table missing. Run BDD/marsai.sql + BDD/optimize-indexes.sql first.");
    }
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
