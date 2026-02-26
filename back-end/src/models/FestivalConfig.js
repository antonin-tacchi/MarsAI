import db from "../config/database.js";

export default class FestivalConfig {
  static async getActive() {
    const [rows] = await db.query(
      `
      SELECT id, submission_start, submission_end, event_date, location, is_active
      FROM festival_config
      WHERE is_active = 1
      ORDER BY id DESC
      LIMIT 1
      `
    );
    return rows?.[0] || null;
  }
}