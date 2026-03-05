import pool from "../config/database.js";

class PartnerModel {
  async getAll() {
    const [rows] = await pool.query(
      `SELECT id, name, logo, logo_key, url, display_order, created_at 
       FROM partners 
       ORDER BY display_order ASC, name ASC`
    );
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.query(
      `SELECT id, name, logo, logo_key, url, display_order, created_at, updated_at 
       FROM partners WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async create(data) {
    const { name, logo, logo_key = null, url, display_order = 0 } = data;
    const [result] = await pool.query(
      `INSERT INTO partners (name, logo, logo_key, url, display_order) VALUES (?, ?, ?, ?, ?)`,
      [name, logo, logo_key, url, display_order]
    );
    return { id: result.insertId, name, logo, logo_key, url, display_order };
  }

  async update(id, data) {
    const { name, logo, logo_key, url, display_order } = data;
    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push("name = ?"); values.push(name); }
    if (logo !== undefined) { updates.push("logo = ?"); values.push(logo); }
    if (logo_key !== undefined) { updates.push("logo_key = ?"); values.push(logo_key); }
    if (url !== undefined) { updates.push("url = ?"); values.push(url); }
    if (display_order !== undefined) { updates.push("display_order = ?"); values.push(display_order); }

    if (updates.length === 0) return this.getById(id);

    values.push(id);
    const [result] = await pool.query(
      `UPDATE partners SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0 ? this.getById(id) : null;
  }

  async delete(id) {
    const [result] = await pool.query(`DELETE FROM partners WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }
}

export default new PartnerModel();