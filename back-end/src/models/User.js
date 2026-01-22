import pool from "../config/database.js";

/**
 * User Model - MySQL database operations
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
      const {
        name,
        email,
        password,
        bio = null,
        country = null,
        school = null,
      } = userData;

      const [result] = await pool.execute(
        `INSERT INTO users (name, email, password, bio, country, school, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [name, email, password, bio, country, school]
      );

      return await this.findById(result.insertId);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getAll() {
    try {
      const [rows] = await pool.execute("SELECT * FROM users");
      return rows;
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  async update(id, userData) {
    try {
      const fields = [];
      const values = [];

      Object.keys(userData).forEach((key) => {
        if (userData[key] !== undefined && key !== "id") {
          fields.push(`${key} = ?`);
          values.push(userData[key]);
        }
      });

      if (fields.length === 0) {
        return await this.findById(id);
      }

      values.push(id);

      await pool.execute(
        `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
        values
      );

      return await this.findById(id);
    } catch (error) {
      console.error("Error updating user:", error);
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
}

export default new UserModel();
