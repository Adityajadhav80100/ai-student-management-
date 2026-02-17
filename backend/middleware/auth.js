const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');

// Basic auth middleware: verifies token and attaches { userId, role } to req.user
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, secret);
    req.user = {
      userId: decoded.id,
      role: decoded.role,
      name: decoded.name,
      email: decoded.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
