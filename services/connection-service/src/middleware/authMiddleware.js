const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'agnector-jwt-secret-change-in-production';

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = { userId: 'guest-user', email: 'guest@agnector.local' };
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    req.user = { userId: 'guest-user', email: 'guest@agnector.local' };
    next();
  }
};
