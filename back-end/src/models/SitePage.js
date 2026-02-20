import db from "../config/database.js";

export default class SitePage {
  // Get page content by slug (public)
  static async findBySlug(slug) {
    const [rows] = await db.query(
      "SELECT slug, content_fr, content_en, updated_at FROM site_pages WHERE slug = ?",
      [slug]
    );
    return rows?.[0] || null;
  }

  // Update page content (admin only)
  static async update(slug, contentFr, contentEn, userId) {
    // Upsert: insert if not exists, update if exists
    const sql = `
      INSERT INTO site_pages (slug, content_fr, content_en, updated_by, updated_at)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        content_fr = VALUES(content_fr),
        content_en = VALUES(content_en),
        updated_by = VALUES(updated_by),
        updated_at = NOW()
    `;

    const frJson = typeof contentFr === "string" ? contentFr : JSON.stringify(contentFr);
    const enJson = typeof contentEn === "string" ? contentEn : JSON.stringify(contentEn);

    await db.query(sql, [slug, frJson, enJson, userId]);

    return this.findBySlug(slug);
  }
}
