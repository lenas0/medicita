const jwt = require('jsonwebtoken');

function authenticate(request, response, next) {
  const authorization = request.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return response.status(401).json({ error: 'Authentication required.' });
  }

  try {
    request.auth = jwt.verify(token, getJwtSecret());
    return next();
  } catch (error) {
    return response.status(401).json({ error: 'Invalid or expired token.' });
  }
}

function requireRole(role) {
  return (request, response, next) => {
    if (!request.auth || request.auth.role !== role) {
      return response.status(403).json({ error: 'Insufficient permissions.' });
    }

    return next();
  };
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters.');
  }
  return secret;
}

module.exports = { authenticate, requireRole, getJwtSecret };