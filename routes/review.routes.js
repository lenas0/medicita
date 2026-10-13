const express = require('express');
const reviewDao = require('../dao/review.dao');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/doctor/:doctorId', asyncHandler(async (request, response) => {
  const doctorId = Number(request.params.doctorId);
  if (!Number.isInteger(doctorId) || doctorId < 1) return response.status(400).json({ error: 'Invalid doctorId.' });
  return response.json({ reviews: await reviewDao.listForDoctor(doctorId) });
}));

router.post('/appointments/:appointmentId', authenticate, requireRole('2'), asyncHandler(async (request, response) => {
  const appointmentId = Number(request.params.appointmentId);
  const { rating, comment } = request.body;
  if (
    !Number.isInteger(appointmentId) || appointmentId < 1 ||
    !Number.isInteger(rating) || rating < 1 || rating > 5 ||
    (comment != null && (typeof comment !== 'string' || comment.length > 500))
  ) return response.status(400).json({ error: 'Invalid review data.' });
  // Primero se verifica la propiedad; el DAO exige además que la cita esté completada.
  if (!await reviewDao.isOwnedByUser(appointmentId, Number(request.auth.sub))) {
    return response.status(404).json({ error: 'Completed appointment not found.' });
  }

  const review = await reviewDao.create({ appointmentId, rating, comment });
  if (!review) return response.status(409).json({ error: 'Only completed appointments can be reviewed.' });
  return response.status(201).json({ review });
}));

module.exports = router;