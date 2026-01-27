import pool from "../config/database.js";
import crypto from "crypto";

/**
 * Invitation Model - Manage admin/jury invitations
 */
class InvitationModel {
  /**
   * Create a new invitation
   */
  async create({ email, name, roleId, invitedBy }) {
    try {
      // Generate a unique token
      const token = crypto.randomBytes(32).toString("hex");

      // Expires in 7 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const [result] = await pool.execute(
        `INSERT INTO invitations (email, name, role_id, token, invited_by, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [email, name, roleId, token, invitedBy, expiresAt]
      );

      return {
        id: result.insertId,
        email,
        name,
        roleId,
        token,
        expiresAt,
      };
    } catch (error) {
      console.error("Error creating invitation:", error);
      throw error;
    }
  }

  /**
   * Find invitation by token
   */
  async findByToken(token) {
    try {
      const [rows] = await pool.execute(
        `SELECT i.*, r.role_name, u.name as invited_by_name
         FROM invitations i
         JOIN roles r ON i.role_id = r.id
         JOIN users u ON i.invited_by = u.id
         WHERE i.token = ?`,
        [token]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error finding invitation by token:", error);
      throw error;
    }
  }

  /**
   * Find invitation by email
   */
  async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM invitations WHERE email = ? AND accepted_at IS NULL`,
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error finding invitation by email:", error);
      throw error;
    }
  }

  /**
   * Check if invitation is valid (not expired and not accepted)
   */
  async isValid(token) {
    try {
      const invitation = await this.findByToken(token);
      if (!invitation) return false;
      if (invitation.accepted_at) return false;
      if (new Date(invitation.expires_at) < new Date()) return false;
      return true;
    } catch (error) {
      console.error("Error checking invitation validity:", error);
      return false;
    }
  }

  /**
   * Mark invitation as accepted
   */
  async markAccepted(token) {
    try {
      await pool.execute(
        `UPDATE invitations SET accepted_at = NOW() WHERE token = ?`,
        [token]
      );
    } catch (error) {
      console.error("Error marking invitation as accepted:", error);
      throw error;
    }
  }

  /**
   * Get all pending invitations (for admin)
   */
  async getPending() {
    try {
      const [rows] = await pool.execute(
        `SELECT i.*, r.role_name, u.name as invited_by_name
         FROM invitations i
         JOIN roles r ON i.role_id = r.id
         JOIN users u ON i.invited_by = u.id
         WHERE i.accepted_at IS NULL AND i.expires_at > NOW()
         ORDER BY i.created_at DESC`
      );
      return rows;
    } catch (error) {
      console.error("Error getting pending invitations:", error);
      throw error;
    }
  }

  /**
   * Delete an invitation
   */
  async delete(id) {
    try {
      await pool.execute("DELETE FROM invitations WHERE id = ?", [id]);
    } catch (error) {
      console.error("Error deleting invitation:", error);
      throw error;
    }
  }

  /**
   * Delete expired invitations
   */
  async deleteExpired() {
    try {
      await pool.execute(
        "DELETE FROM invitations WHERE expires_at < NOW() AND accepted_at IS NULL"
      );
    } catch (error) {
      console.error("Error deleting expired invitations:", error);
      throw error;
    }
  }
}

export default new InvitationModel();
