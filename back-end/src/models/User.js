import pool from "../config/database.js";

/**
 * User Model - For Jury and Admin accounts only
 */
class UserModel {
  async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM users WHERE id = ?",
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  }

  async create(userData) {
    try {
      const { name, email, password } = userData;

      const [result] = await pool.execute(
        `INSERT INTO users (name, email, password, created_at)
         VALUES (?, ?, ?, NOW())`,
        [name, email, password]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getAll() {
    try {
      const [rows] = await pool.execute(
        `SELECT u.id, u.name, u.email, u.created_at,
                GROUP_CONCAT(r.role_name) as roles
         FROM users u
         LEFT JOIN user_roles ur ON u.id = ur.user_id
         LEFT JOIN roles r ON ur.role_id = r.id
         GROUP BY u.id`
      );
      return rows;
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  async getRoleIds(userId) {
    try {
      const [rows] = await pool.execute(
        "SELECT role_id FROM user_roles WHERE user_id = ?",
        [userId]
      );
      return rows.map((row) => row.role_id);
    } catch (error) {
      console.error("Error getting user roles:", error);
      throw error;
    }
  }

  async assignRole(userId, roleId) {
    try {
      await pool.execute(
        "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
        [userId, roleId]
      );
    } catch (error) {
      console.error("Error assigning role to user:", error);
      throw error;
    }
  }

  async removeRole(userId, roleId) {
    try {
      await pool.execute(
        "DELETE FROM user_roles WHERE user_id = ? AND role_id = ?",
        [userId, roleId]
      );
    } catch (error) {
      console.error("Error removing role from user:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await pool.execute("DELETE FROM users WHERE id = ?", [id]);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
}

export default new UserModel();
