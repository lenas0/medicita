const pool = require('../services/mysql.service');

async function findByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT user_id, user_first_names, user_last_names, user_email,
            user_password_hash, user_role, user_phone
     FROM users
     WHERE user_email = ?`,
    [email]
  );
  return rows[0] || null;
}

async function findById(userId) {
  const [rows] = await pool.execute(
    `SELECT user_id, user_first_names, user_last_names, user_email,
            user_role, user_phone
     FROM users
     WHERE user_id = ?`,
    [userId]
  );
  return rows[0] || null;
}

async function createPatient({ firstNames, lastNames, email, passwordHash, phone }) {
  // El rol se fija en SQL para que el registro público solo cree pacientes.
  const [result] = await pool.execute(
    `INSERT INTO users
       (user_first_names, user_last_names, user_email, user_password_hash, user_role, user_phone)
     VALUES (?, ?, ?, ?, '2', ?)`,
    [firstNames, lastNames, email, passwordHash, phone || null]
  );
  return findById(result.insertId);
}

module.exports = { findByEmail, findById, createPatient };