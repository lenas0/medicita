const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const userDao = require('../dao/user.dao');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate, getJwtSecret } = require('../middleware/auth.middleware');

const router = express.Router();
// Limita intentos tanto de registro como de inicio de sesión
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false
});

function createToken(user) {
  // El token conserva el identificador y rol hasta que expire.
  return jwt.sign(
    { sub: String(user.user_id), role: user.user_role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

function publicUser(user) {
  // Nunca incluir el hash de contraseña en la respuesta pública.
  return {
    userId: user.user_id,
    firstNames: user.user_first_names,
    lastNames: user.user_last_names,
    email: user.user_email,
    role: user.user_role,
    phone: user.user_phone
  };
}

router.post('/register', authLimiter, asyncHandler(async (request, response) => {
  const { firstNames, lastNames, email, password, phone } = request.body;
  if (
    typeof firstNames !== 'string' || !firstNames.trim() || firstNames.length > 80 ||
    typeof lastNames !== 'string' || !lastNames.trim() || lastNames.length > 80 ||
    typeof email !== 'string' || email.length > 120 ||
    typeof password !== 'string' || password.length < 8 || password.length > 72 ||
    (phone != null && (typeof phone !== 'string' || phone.length > 20))
  ) {
    return response.status(400).json({ error: 'Invalid registration data.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return response.status(400).json({ error: 'Invalid email address.' });
  }

  if (await userDao.findByEmail(normalizedEmail)) {
    return response.status(409).json({ error: 'Email is already registered.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  // El DAO asigna el rol de paciente; el registro público no crea administradores.
  const user = await userDao.createPatient({
    firstNames: firstNames.trim(),
    lastNames: lastNames.trim(),
    email: normalizedEmail,
    passwordHash,
    phone: phone?.trim()
  });

  return response.status(201).json({ user: publicUser(user), token: createToken(user) });
}));

router.post('/login', authLimiter, asyncHandler(async (request, response) => {
  const { email, password } = request.body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    return response.status(400).json({ error: 'Email and password are required.' });
  }

  const user = await userDao.findByEmail(email.trim().toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.user_password_hash))) {
    return response.status(401).json({ error: 'Invalid email or password.' });
  }

  return response.json({ user: publicUser(user), token: createToken(user) });
}));

router.get('/me', authenticate, asyncHandler(async (request, response) => {
  const user = await userDao.findById(Number(request.auth.sub));
  if (!user) return response.status(404).json({ error: 'User not found.' });
  return response.json({ user: publicUser(user) });
}));

module.exports = router;