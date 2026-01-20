import pool from "../config/database.js";

/**
 * User Model - MySQL database operations
 */
class UserModel {
  /**
   * Find user by email
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
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

  /**
   * Find user by ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
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

  /**
   * Create new user
   * @param {Object} userData - User data
   * @param {string} userData.name - Full name
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Hashed password
   * @param {string} [userData.bio] - User bio
   * @param {string} [userData.country] - Country
   * @param {string} [userData.school] - School/Institution
   * @returns {Promise<Object>}
   */
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

      // Return the created user
      return await this.findById(result.insertId);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  /**
   * Get all users
   * @returns {Promise<Array>}
   */
  async getAll() {
    try {
      const [rows] = await pool.execute("SELECT * FROM users");
      return rows;
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  /**
   * Update user
   * @param {number} id
   * @param {Object} userData
   * @returns {Promise<Object|null>}
   */
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
}

export default new UserModel();
