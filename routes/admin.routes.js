const express = require('express');
const adminDao = require('../dao/admin.dao');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();
// Todas las operaciones administrativas requieren sesión y rol de administrador.
router.use(authenticate, requireRole('1'));

router.get('/patients', asyncHandler(async (request, response) => {
  response.json({ patients: await adminDao.listPatients() });
}));

router.get('/reports/income', asyncHandler(async (request, response) => {
  const { from, to } = request.query;
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  // El rango es inclusivo por día; el DAO aplica el límite superior exclusivo.
  if (typeof from !== 'string' || typeof to !== 'string' || !datePattern.test(from) || !datePattern.test(to) || from > to) {
    return response.status(400).json({ error: 'Provide valid from and to dates (YYYY-MM-DD).' });
  }
  return response.json(await adminDao.getIncomeReport({ from, to }));
}));

module.exports = router;