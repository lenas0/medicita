const pool = require('../services/mysql.service');

async function create({ appointmentId, rating, comment }) {
  // La inserción condicionada exige cita completada incluso si su estado cambia tras validar la ruta.
  const [result] = await pool.execute(
    `INSERT INTO reviews (appointment_id, review_rating, review_comment)
     SELECT a.appointment_id, ?, ?
     FROM appointments a
     WHERE a.appointment_id = ? AND a.appointment_status = 'completed'`,
    [rating, comment || null, appointmentId]
  );
  if (!result.affectedRows) return null;
  const [rows] = await pool.execute(
    `SELECT review_id, appointment_id, review_rating, review_comment, review_created_at
     FROM reviews WHERE review_id = ?`,
    [result.insertId]
  );
  return rows[0] || null;
}

async function listForDoctor(doctorId) {
  const [rows] = await pool.execute(
    `SELECT r.review_id, r.review_rating, r.review_comment, r.review_created_at
     FROM reviews r
     JOIN appointments a ON a.appointment_id = r.appointment_id
     WHERE a.doctor_id = ?
     ORDER BY r.review_created_at DESC`,
    [doctorId]
  );
  return rows;
}

async function isOwnedByUser(appointmentId, userId) {
  // Se usa antes de crear la reseña para ocultar citas que pertenecen a otra cuenta.
  const [rows] = await pool.execute(
    `SELECT appointment_id FROM appointments WHERE appointment_id = ? AND user_id = ?`,
    [appointmentId, userId]
  );
  return rows.length > 0;
}

module.exports = { create, listForDoctor, isOwnedByUser };