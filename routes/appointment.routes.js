const express = require('express');
const appointmentDao = require('../dao/appointment.dao');
const doctorDao = require('../dao/doctor.dao');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();
// Todas las rutas de citas exigen identidad; cada operación limita además el rol.
router.use(authenticate);

router.get('/me', requireRole('2'), asyncHandler(async (request, response) => {
  response.json({ appointments: await appointmentDao.listForUser(Number(request.auth.sub)) });
}));

router.get('/admin/today', requireRole('1'), asyncHandler(async (request, response) => {
  response.json({ appointments: await appointmentDao.listToday() });
}));

router.post('/', requireRole('2'), asyncHandler(async (request, response) => {
  const { doctorId, appointmentDatetime, reason } = request.body;
  if (
    !Number.isInteger(doctorId) || doctorId < 1 ||
    typeof appointmentDatetime !== 'string' ||
    !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(appointmentDatetime) ||
    (reason != null && (typeof reason !== 'string' || reason.length > 255))
  ) return response.status(400).json({ error: 'Invalid appointment data; use YYYY-MM-DD HH:mm:ss.' });

  // Comprueba horario y fecha futura antes de crear; el DAO vuelve a comprobar que el médico siga activo.
  const doctor = await doctorDao.isAvailableAt(doctorId, appointmentDatetime);
  if (!doctor) return response.status(409).json({ error: 'Doctor is inactive or unavailable at that time.' });

  const appointment = await appointmentDao.create({
    userId: Number(request.auth.sub), doctorId, appointmentDatetime, reason
  });
  if (!appointment) return response.status(409).json({ error: 'Doctor is no longer available.' });
  return response.status(201).json({ appointment });
}));

router.patch('/:appointmentId/cancel', requireRole('2'), asyncHandler(async (request, response) => {
  const appointmentId = Number(request.params.appointmentId);
  if (!Number.isInteger(appointmentId) || appointmentId < 1) {
    return response.status(400).json({ error: 'Invalid appointmentId.' });
  }
  // El DAO solo cancela citas programadas pertenecientes al paciente autenticado.
  const canceled = await appointmentDao.cancelForUser(appointmentId, Number(request.auth.sub));
  if (!canceled) return response.status(404).json({ error: 'Scheduled appointment not found.' });
  return response.json({ message: 'Appointment canceled.' });
}));

router.patch('/:appointmentId/status', requireRole('1'), asyncHandler(async (request, response) => {
  const appointmentId = Number(request.params.appointmentId);
  const { status } = request.body;
  if (!Number.isInteger(appointmentId) || appointmentId < 1 || !['completed', 'canceled'].includes(status)) {
    return response.status(400).json({ error: 'Invalid appointmentId or status.' });
  }
  // El cambio administrativo solo se aplica a citas que aún están programadas.
  const updated = await appointmentDao.updateStatus(appointmentId, status);
  if (!updated) return response.status(404).json({ error: 'Scheduled appointment not found.' });
  return response.json({ message: 'Appointment status updated.', status });
}));

module.exports = router;