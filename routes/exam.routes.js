const express = require('express');
const examDao = require('../dao/exam.dao');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/appointments/:appointmentId', authenticate, requireRole('2'), asyncHandler(async (request, response) => {
  const appointmentId = Number(request.params.appointmentId);
  if (!Number.isInteger(appointmentId) || appointmentId < 1) return response.status(400).json({ error: 'Invalid appointmentId.' });
  // El DAO filtra también por propietario para no revelar resultados ajenos.
  const exams = await examDao.listForAppointmentAndUser(appointmentId, Number(request.auth.sub));
  return response.json({ exams });
}));

router.post('/', authenticate, requireRole('1'), asyncHandler(async (request, response) => {
  const {
    appointmentId, name, type, date, value, unit,
    quantitativeResult, qualitativeResult, report, imageUrl
  } = request.body;
  const validDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
  const validType = ['numeric', 'qualitative', 'image'].includes(type);
  if (
    !Number.isInteger(appointmentId) || appointmentId < 1 ||
    typeof name !== 'string' || !name.trim() || name.length > 100 ||
    !validDate || !validType
  ) return response.status(400).json({ error: 'Invalid exam data.' });

  if (type === 'numeric' && (!Number.isFinite(value) || typeof unit !== 'string' || !unit.trim())) {
    return response.status(400).json({ error: 'Numeric exams require a value and unit.' });
  }
  if (type === 'qualitative' && !['positive', 'negative'].includes(qualitativeResult)) {
    return response.status(400).json({ error: 'Qualitative exams require a positive or negative result.' });
  }
  if (type === 'image' && (typeof report !== 'string' || !report.trim() || typeof imageUrl !== 'string' || !imageUrl.trim())) {
    return response.status(400).json({ error: 'Image exams require a report and image URL.' });
  }
  // La cita debe existir; los campos persistidos dependen del tipo de examen.
  if (!await examDao.appointmentExists(appointmentId)) {
    return response.status(404).json({ error: 'Appointment not found.' });
  }

  const exam = await examDao.create({
    appointmentId, name: name.trim(), type, date,
    value: type === 'numeric' ? value : null,
    unit: type === 'numeric' ? unit.trim() : null,
    quantitativeResult: type === 'numeric' ? quantitativeResult || null : null,
    qualitativeResult: type === 'qualitative' ? qualitativeResult : null,
    report: type === 'image' ? report : (report || null),
    imageUrl: type === 'image' ? imageUrl : null
  });
  return response.status(201).json({ exam });
}));

module.exports = router;