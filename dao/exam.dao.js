const pool = require('../services/mysql.service');

async function listForAppointmentAndUser(appointmentId, userId) {
  // La unión valida propiedad en la misma consulta que recupera los resultados.
  const [rows] = await pool.execute(
    `SELECT e.exam_id, e.appointment_id, e.exam_name, e.exam_type, e.exam_date,
            e.exam_value, e.exam_unit, e.exam_quantitative_result,
            e.exam_qualitative_result, e.exam_report, e.exam_image_url
     FROM exams e
     JOIN appointments a ON a.appointment_id = e.appointment_id
     WHERE e.appointment_id = ? AND a.user_id = ?
     ORDER BY e.exam_date DESC, e.exam_id DESC`,
    [appointmentId, userId]
  );
  return rows;
}

async function create({ appointmentId, name, type, date, value, unit, quantitativeResult, qualitativeResult, report, imageUrl }) {
  // El router prepara los campos aplicables al tipo y deja el resto como null.
  const [result] = await pool.execute(
    `INSERT INTO exams
       (appointment_id, exam_name, exam_type, exam_date, exam_value, exam_unit,
        exam_quantitative_result, exam_qualitative_result, exam_report, exam_image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [appointmentId, name, type, date, value, unit, quantitativeResult, qualitativeResult, report, imageUrl]
  );
  const [rows] = await pool.execute(
    `SELECT exam_id, appointment_id, exam_name, exam_type, exam_date, exam_value,
            exam_unit, exam_quantitative_result, exam_qualitative_result,
            exam_report, exam_image_url
     FROM exams WHERE exam_id = ?`,
    [result.insertId]
  );
  return rows[0];
}

async function appointmentExists(appointmentId) {
  const [rows] = await pool.execute(
    `SELECT appointment_id FROM appointments WHERE appointment_id = ?`,
    [appointmentId]
  );
  return rows.length > 0;
}

module.exports = { listForAppointmentAndUser, create, appointmentExists };