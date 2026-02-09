import db from "../config/database.js";
import { FILM_STATUS } from "../constants/filmStatus.js";

export default class Film {
  static async countRecentByEmail(email, minutes = 60) {
    const sql = `
      SELECT COUNT(*) AS total
      FROM films
      WHERE director_email = ?
        AND created_at >= (NOW() - INTERVAL ? MINUTE)
    `;
    const [rows] = await db.query(sql, [email, minutes]);
    return rows?.[0]?.total ?? 0;
  }

  static toTinyInt(v) {
    const s = String(v ?? "").trim().toLowerCase();

    if (v === 1 || v === true) return 1;
    if (s === "1" || s === "true" || s === "on") return 1;

    return 0;
  }

  static async create(data) {
    const sql = `
      INSERT INTO films (
        title,
        country,
        description,
        film_url,
        poster_url,
        thumbnail_url,
        ai_tools_used,
        ai_certification,

        director_firstname,
        director_lastname,
        director_email,
        director_bio,
        director_school,
        director_website,
        social_instagram,
        social_youtube,
        social_vimeo,

        status,
        created_at
      )
      VALUES (
        ?, ?, ?,
        ?, ?, ?,
        ?, ?,

        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,

        ?,
        NOW()
      )
    `;

   static async updateStatus(filmId, newStatus) {
    if (!['approved', 'rejected'].includes(newStatus)) {
       throw new Error('Invalid status');
    }

    const sql = `
        UPDATE films
        SET status = ?
        WHERE id = ?
    `;

    const [result] = await db.query(sql, [newStatus, filmId]);

    return result; // tu peux aussi renvoyer affectedRows ou faire un SELECT après
}

    
    const params = [
      data.title,
      data.country,
      data.description,
      data.film_url,
      data.poster_url,
      data.thumbnail_url,

      data.ai_tools_used,
      Film.toTinyInt(data.ai_certification),

      data.director_firstname,
      data.director_lastname,
      data.director_email,
      data.director_bio,
      data.director_school,
      data.director_website,
      data.social_instagram,
      data.social_youtube,
      data.social_vimeo,

      FILM_STATUS.PENDING,
    ];

    const [result] = await db.query(sql, params);

    return {
      id: result.insertId,
      ...data,
      ai_certification: Film.toTinyInt(data.ai_certification),
      status: "pending",
    };
  }
  
  static async findAll({ limit = 20, offset = 0, sortField = "created_at", sortOrder = "DESC" } = {}) {
    const allowedSortFields = new Set([
      "created_at",
      "title",
      "country",
      "id",
    ]);

    const safeField = allowedSortFields.has(sortField) ? sortField : "created_at";
    const safeOrder = String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const safeOffset = Math.max(0, parseInt(offset, 10) || 0);

    const sqlData = `
      SELECT
        f.id,
        f.title,
        f.country,
        f.poster_url,
        f.thumbnail_url,
        f.director_firstname,
        f.director_lastname,
        f.created_at,
        f.ai_tools_used,
        f.status,
        GROUP_CONCAT(c.name SEPARATOR ', ') as categories
      FROM films f
      LEFT JOIN film_categories fc ON f.id = fc.film_id
      LEFT JOIN categories c ON fc.category_id = c.id
      GROUP BY f.id
      ORDER BY f.${safeField} ${safeOrder}
      LIMIT ? OFFSET ?
    `;

    const sqlCount = `SELECT COUNT(*) AS total FROM films`;

    const [rows] = await db.query(sqlData, [safeLimit, safeOffset]);
    const [countResult] = await db.query(sqlCount);

    return {
      rows,
      count: countResult?.[0]?.total ?? 0,
    };
  }

  static async findById(id) {
    const sql = `SELECT * FROM films WHERE id = ? LIMIT 1`;
    const [rows] = await db.query(sql, [id]);
    return rows?.[0] || null;
  }

  static async getStats() {
    // Compte par statut
    const sqlStatus = `
      SELECT status, COUNT(*) as count
      FROM films
      GROUP BY status
    `;

    // Compte par pays
    const sqlCountry = `
      SELECT country, COUNT(*) as count
      FROM films
      WHERE country IS NOT NULL AND country != ''
      GROUP BY country
      ORDER BY count DESC
    `;

    // Compte par outil IA
    const sqlAI = `
      SELECT ai_tools_used
      FROM films
      WHERE ai_tools_used IS NOT NULL AND ai_tools_used != ''
    `;

    // Compte par catégorie
    const sqlCategory = `
      SELECT 
        c.id as category_id,
        c.name as category_name,
        COUNT(fc.film_id) as count
      FROM categories c
      LEFT JOIN film_categories fc ON c.id = fc.category_id
      LEFT JOIN films f ON fc.film_id = f.id
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `;

    const [statusRows] = await db.query(sqlStatus);
    const [countryRows] = await db.query(sqlCountry);
    const [aiRows] = await db.query(sqlAI);
    const [categoryRows] = await db.query(sqlCategory);

    // Compter combien de films utilisent chaque outil IA (liste séparée par des virgules)
    const aiToolsMap = new Map();
    aiRows.forEach(row => {
      const tools = row.ai_tools_used.split(',').map(t => t.trim());
      tools.forEach(tool => {
        aiToolsMap.set(tool, (aiToolsMap.get(tool) || 0) + 1);
      });
    });

    const aiTools = Array.from(aiToolsMap.entries())
      .map(([tool, count]) => ({ tool, count }))
      .sort((a, b) => b.count - a.count);

    return {
      byStatus: statusRows,
      byCountry: countryRows,
      byAITool: aiTools,
      byCategory: categoryRows,
      total: statusRows.reduce((sum, r) => sum + r.count, 0)
    };
  }
}