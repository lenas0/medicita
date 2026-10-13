const express = require('express');
const doctorDao = require('../dao/doctor.dao');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();
// Se reutiliza esta cadena de middleware para proteger las mutaciones del catálogo.
const requireAdmin = [authenticate, requireRole('1')];

router.get('/', asyncHandler(async (request, response) => {
  response.json({ doctors: await doctorDao.listActive() });
}));

router.get('/:doctorId/schedules', asyncHandler(async (request, response) => {
  const doctorId = Number(request.params.doctorId);
  if (!Number.isInteger(doctorId) || doctorId < 1) {
    return response.status(400).json({ error: 'Invalid doctorId.' });
  }
  if (!await doctorDao.findById(doctorId)) return response.status(404).json({ error: 'Doctor not found.' });
  return response.json({ schedules: await doctorDao.listSchedules(doctorId) });
}));

router.get('/:doctorId', asyncHandler(async (request, response) => {
  const doctorId = Number(request.params.doctorId);
  if (!Number.isInteger(doctorId) || doctorId < 1) {
    return response.status(400).json({ error: 'Invalid doctorId.' });
  }
  const doctor = await doctorDao.findById(doctorId);
  if (!doctor || !doctor.doctor_active) return response.status(404).json({ error: 'Doctor not found.' });
  return response.json({ doctor });
}));

router.post('/', ...requireAdmin, asyncHandler(async (request, response) => {
  const { firstNames, lastNames, specialty, description, consultationFee } = request.body;
  if (
    typeof firstNames !== 'string' || !firstNames.trim() || firstNames.length > 80 ||
    typeof lastNames !== 'string' || !lastNames.trim() || lastNames.length > 80 ||
    typeof specialty !== 'string' || !specialty.trim() || specialty.length > 80 ||
    (description != null && typeof description !== 'string') ||
    !Number.isFinite(consultationFee) || consultationFee < 0
  ) return response.status(400).json({ error: 'Invalid doctor data.' });

  const doctor = await doctorDao.createDoctor({
    firstNames: firstNames.trim(), lastNames: lastNames.trim(), specialty: specialty.trim(),
    description, consultationFee
  });
  return response.status(201).json({ doctor });
}));

router.put('/:doctorId', ...requireAdmin, asyncHandler(async (request, response) => {
  const doctorId = Number(request.params.doctorId);
  const { firstNames, lastNames, specialty, description, consultationFee, active } = request.body;
  if (
    !Number.isInteger(doctorId) || doctorId < 1 ||
    typeof firstNames !== 'string' || !firstNames.trim() || firstNames.length > 80 ||
    typeof lastNames !== 'string' || !lastNames.trim() || lastNames.length > 80 ||
    typeof specialty !== 'string' || !specialty.trim() || specialty.length > 80 ||
    (description != null && typeof description !== 'string') ||
    !Number.isFinite(consultationFee) || consultationFee < 0 || typeof active !== 'boolean'
  ) return response.status(400).json({ error: 'Invalid doctor data.' });

  const doctor = await doctorDao.updateDoctor(doctorId, {
    firstNames: firstNames.trim(), lastNames: lastNames.trim(), specialty: specialty.trim(),
    description, consultationFee, active
  });
  if (!doctor) return response.status(404).json({ error: 'Doctor not found.' });
  return response.json({ doctor });
}));

router.post('/:doctorId/schedules', ...requireAdmin, asyncHandler(async (request, response) => {
  const doctorId = Number(request.params.doctorId);
  const { dayOfWeek, startTime, endTime } = request.body;
  if (
    !Number.isInteger(doctorId) || doctorId < 1 ||
    !Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 5 ||
    typeof startTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(startTime) ||
    typeof endTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(endTime) ||
    startTime >= endTime
  ) return response.status(400).json({ error: 'Invalid schedule data.' });
  if (!await doctorDao.findById(doctorId)) return response.status(404).json({ error: 'Doctor not found.' });

  // La base impide registrar más de un intervalo por médico y día.
  const schedule = await doctorDao.addSchedule({ doctorId, dayOfWeek, startTime, endTime });
  return response.status(201).json({ schedule });
}));

module.exports = router;