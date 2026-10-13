const pool = require('../services/mysql.service');

async function listPatients() {
  // El filtro evita incluir cuentas administrativas en el listado de pacientes.
  const [rows] = await pool.execute(
    `SELECT user_id, user_first_names, user_last_names, user_email, user_phone
     FROM users
     WHERE user_role = '2'
     ORDER BY user_last_names, user_first_names`
  );
  return rows;
}

async function getIncomeReport({ from, to }) {
  // El informe suma tarifas registradas de citas completadas, no transacciones de pago.
  const [[totalRows], [appointmentRows]] = await Promise.all([
    pool.execute(
      `SELECT COALESCE(SUM(appointment_fee), 0.00) AS total
       FROM appointments
       WHERE appointment_status = 'completed'
         AND appointment_datetime >= ?
         AND appointment_datetime < DATE_ADD(?, INTERVAL 1 DAY)`,
      [from, to]
    ),
    pool.execute(
    `SELECT a.appointment_id, a.appointment_datetime, a.appointment_fee,
            u.user_id, u.user_first_names, u.user_last_names,
            d.doctor_id, d.doctor_first_names, d.doctor_last_names
     FROM appointments a
     JOIN users u ON u.user_id = a.user_id
     JOIN doctors d ON d.doctor_id = a.doctor_id
     WHERE a.appointment_status = 'completed'
       AND a.appointment_datetime >= ?
       AND a.appointment_datetime < DATE_ADD(?, INTERVAL 1 DAY)
     ORDER BY a.appointment_datetime`,
    [from, to]
    )
  ]);
  return {
    total: totalRows[0].total,
    appointments: appointmentRows
  };
}

module.exports = { listPatients, getIncomeReport };