const pool = require('../services/mysql.service');

async function listActive() {
  const [rows] = await pool.execute(
    `SELECT doctor_id, doctor_first_names, doctor_last_names, doctor_specialty,
            doctor_description, doctor_consultation_fee
     FROM doctors
     WHERE doctor_active = TRUE
     ORDER BY doctor_last_names, doctor_first_names`
  );
  return rows;
}

async function findById(doctorId) {
  const [rows] = await pool.execute(
    `SELECT doctor_id, doctor_first_names, doctor_last_names, doctor_specialty,
            doctor_description, doctor_consultation_fee, doctor_active
     FROM doctors
     WHERE doctor_id = ?`,
    [doctorId]
  );
  return rows[0] || null;
}

async function createDoctor({ firstNames, lastNames, specialty, description, consultationFee }) {
  // Tras insertar, devuelve la representación completa consultada por su ID.
  const [result] = await pool.execute(
    `INSERT INTO doctors
       (doctor_first_names, doctor_last_names, doctor_specialty, doctor_description, doctor_consultation_fee)
     VALUES (?, ?, ?, ?, ?)`,
    [firstNames, lastNames, specialty, description || null, consultationFee]
  );
  return findById(result.insertId);
}

async function updateDoctor(doctorId, { firstNames, lastNames, specialty, description, consultationFee, active }) {
  // PUT reemplaza los datos editables del médico; null indica que no existe.
  const [result] = await pool.execute(
    `UPDATE doctors
     SET doctor_first_names = ?, doctor_last_names = ?, doctor_specialty = ?,
         doctor_description = ?, doctor_consultation_fee = ?, doctor_active = ?
     WHERE doctor_id = ?`,
    [firstNames, lastNames, specialty, description || null, consultationFee, active, doctorId]
  );
  return result.affectedRows ? findById(doctorId) : null;
}

async function listSchedules(doctorId) {
  const [rows] = await pool.execute(
    `SELECT schedule_id, doctor_id, schedule_day_of_week, schedule_start_time, schedule_end_time
     FROM doctor_schedules
     WHERE doctor_id = ?
     ORDER BY schedule_day_of_week`,
    [doctorId]
  );
  return rows;
}

async function addSchedule({ doctorId, dayOfWeek, startTime, endTime }) {
  const [result] = await pool.execute(
    `INSERT INTO doctor_schedules
       (doctor_id, schedule_day_of_week, schedule_start_time, schedule_end_time)
     VALUES (?, ?, ?, ?)`,
    [doctorId, dayOfWeek, startTime, endTime]
  );
  const [rows] = await pool.execute(
    `SELECT schedule_id, doctor_id, schedule_day_of_week, schedule_start_time, schedule_end_time
     FROM doctor_schedules WHERE schedule_id = ?`,
    [result.insertId]
  );
  return rows[0];
}

async function isAvailableAt(doctorId, appointmentDatetime) {
  // WEEKDAY() numera lunes como 0; se suma 1 para compararlo con el esquema (1-5).
  const [rows] = await pool.execute(
    `SELECT d.doctor_id, d.doctor_consultation_fee
     FROM doctors d
     JOIN doctor_schedules s ON s.doctor_id = d.doctor_id
     WHERE d.doctor_id = ?
       AND d.doctor_active = TRUE
       AND s.schedule_day_of_week = WEEKDAY(?) + 1
       AND TIME(?) >= s.schedule_start_time
       AND TIME(?) < s.schedule_end_time
       AND ? > NOW()`,
     [doctorId, appointmentDatetime, appointmentDatetime, appointmentDatetime, appointmentDatetime]
  );
  return rows[0] || null;
}

module.exports = { listActive, findById, createDoctor, updateDoctor, listSchedules, addSchedule, isAvailableAt };