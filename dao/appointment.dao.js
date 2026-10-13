const pool = require('../services/mysql.service');

async function create({ userId, doctorId, appointmentDatetime, reason }) {
  // Se copia la tarifa vigente al crear la cita para conservar el importe histórico.
  const [result] = await pool.execute(
    `INSERT INTO appointments
       (user_id, doctor_id, appointment_datetime, appointment_fee, appointment_reason)
     SELECT ?, doctor_id, ?, doctor_consultation_fee, ?
     FROM doctors
     WHERE doctor_id = ? AND doctor_active = TRUE`,
    [userId, appointmentDatetime, reason || null, doctorId]
  );
  if (!result.affectedRows) return null;
  return findByIdForUser(result.insertId, userId);
}

async function findByIdForUser(appointmentId, userId) {
  // La condición por usuario limita la lectura a la cita de su propietario.
  const [rows] = await pool.execute(
    `SELECT a.appointment_id, a.user_id, a.doctor_id, a.appointment_datetime,
            a.appointment_fee, a.appointment_reason, a.appointment_status,
            d.doctor_first_names, d.doctor_last_names, d.doctor_specialty
     FROM appointments a
     JOIN doctors d ON d.doctor_id = a.doctor_id
     WHERE a.appointment_id = ? AND a.user_id = ?`,
    [appointmentId, userId]
  );
  return rows[0] || null;
}

async function listForUser(userId) {
  const [rows] = await pool.execute(
    `SELECT a.appointment_id, a.doctor_id, a.appointment_datetime,
            a.appointment_fee, a.appointment_reason, a.appointment_status,
            d.doctor_first_names, d.doctor_last_names, d.doctor_specialty
     FROM appointments a
     JOIN doctors d ON d.doctor_id = a.doctor_id
     WHERE a.user_id = ?
     ORDER BY a.appointment_datetime DESC`,
    [userId]
  );
  return rows;
}

async function listToday() {
  const [rows] = await pool.execute(
    `SELECT a.appointment_id, a.appointment_datetime, a.appointment_fee,
            a.appointment_status, a.appointment_reason,
            u.user_id, u.user_first_names, u.user_last_names, u.user_email,
            d.doctor_id, d.doctor_first_names, d.doctor_last_names, d.doctor_specialty
     FROM appointments a
     JOIN users u ON u.user_id = a.user_id
     JOIN doctors d ON d.doctor_id = a.doctor_id
     WHERE DATE(a.appointment_datetime) = CURDATE()
     ORDER BY a.appointment_datetime`
  );
  return rows;
}

async function cancelForUser(appointmentId, userId) {
  // La actualización condicional impide cancelar citas ajenas o ya finalizadas.
  const [result] = await pool.execute(
    `UPDATE appointments SET appointment_status = 'canceled'
     WHERE appointment_id = ? AND user_id = ? AND appointment_status = 'scheduled'`,
    [appointmentId, userId]
  );
  return result.affectedRows > 0;
}

async function updateStatus(appointmentId, status) {
  // Solo se permite la transición desde el estado programado.
  const [result] = await pool.execute(
    `UPDATE appointments SET appointment_status = ?
     WHERE appointment_id = ? AND appointment_status = 'scheduled'`,
    [status, appointmentId]
  );
  return result.affectedRows > 0;
}

module.exports = { create, findByIdForUser, listForUser, listToday, cancelForUser, updateStatus };