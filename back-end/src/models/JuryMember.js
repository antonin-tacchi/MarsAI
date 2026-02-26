import db from "../config/database.js";

/* Récupérer tous les membres du jury (ordre alphabétique) */
export const findAll = async () => {
  const [rows] = await db.query(`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.profile_picture,
      u.role_title,
      u.bio,
      u.created_at
    FROM users u
    INNER JOIN user_roles ur ON u.id = ur.user_id
    WHERE ur.role_id = 1
    ORDER BY u.name ASC
  `);
  return rows;
};

export const findById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.profile_picture,
      u.role_title,
      u.bio,
      u.created_at
    FROM users u
    INNER JOIN user_roles ur ON u.id = ur.user_id
    WHERE ur.role_id = 1 AND u.id = ?
  `, [id]);
  
  return rows[0] || null;
};

export const updateProfile = async (id, updates) => {
  const fields = [];
  const values = [];

  // Uniquement les champs modifiables
  if (updates.profile_picture !== undefined) {
    fields.push('profile_picture = ?');
    values.push(updates.profile_picture);
  }
  if (updates.role_title !== undefined) {
    fields.push('role_title = ?');
    values.push(updates.role_title);
  }
  if (updates.bio !== undefined) {
    fields.push('bio = ?');
    values.push(updates.bio);
  }

  if (fields.length === 0) {
    throw new Error('Aucun champ à mettre à jour');
  }

  values.push(id);

  const [result] = await db.query(`
    UPDATE users 
    SET ${fields.join(', ')}
    WHERE id = ?
  `, values);

  return result.affectedRows > 0;
};

/* Vérifier si un utilisateur est un jury */
export const isJuryMember = async (id) => {
  const [rows] = await db.query(`
    SELECT u.id 
    FROM users u
    INNER JOIN user_roles ur ON u.id = ur.user_id
    WHERE ur.role_id = 1 AND u.id = ?
  `, [id]);
  
  return rows.length > 0;
};

/* Compter le nombre total de membres du jury */
export const count = async () => {
  const [rows] = await db.query(`
    SELECT COUNT(*) as total
    FROM users u
    INNER JOIN user_roles ur ON u.id = ur.user_id
    WHERE ur.role_id = 1
  `);
  
  return rows[0].total;
};