import db from "../config/database.js";

export default class Invitation {
  static async create({ email, role_id, token, expires_at, invited_by }) {
    const sql = `
      INSERT INTO invitations (email, role_id, token, expires_at, invited_by, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await db.query(sql, [email, role_id, token, expires_at, invited_by]);
    return {
      id: result.insertId,
      email,
      role_id,
      token,
      expires_at,
      invited_by,
    };
  }

  static async findByToken(token) {
    const sql = `
      SELECT i.*, r.role_name
      FROM invitations i
      LEFT JOIN roles r ON i.role_id = r.id
      WHERE i.token = ?
    `;
    const [rows] = await db.query(sql, [token]);
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const sql = `SELECT * FROM invitations WHERE email = ? AND used_at IS NULL`;
    const [rows] = await db.query(sql, [email]);
    return rows[0] || null;
  }

  static async findAllPending() {
    const sql = `
      SELECT i.*, r.role_name, u.name as invited_by_name
      FROM invitations i
      LEFT JOIN roles r ON i.role_id = r.id
      LEFT JOIN users u ON i.invited_by = u.id
      WHERE i.used_at IS NULL
      ORDER BY i.created_at DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async markAsUsed(id) {
    const sql = `UPDATE invitations SET used_at = NOW() WHERE id = ?`;
    await db.query(sql, [id]);
  }

  static async delete(id) {
    const sql = `DELETE FROM invitations WHERE id = ?`;
    const [result] = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async isExpired(invitation) {
    if (!invitation) return true;
    if (invitation.used_at) return true;
    return new Date(invitation.expires_at) < new Date();
  }
}
