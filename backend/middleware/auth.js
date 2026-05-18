const jwt    = require('jsonwebtoken');
const db     = require('../models/db');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'Unauthorized — no token' });

    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const [[user]] = await db.query(
      'SELECT id, name, email, role, is_verified FROM users WHERE id = ?',
      [payload.id]
    );
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const token   = header.split(' ')[1];
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const [[user]] = await db.query(
        'SELECT id, name, email, role FROM users WHERE id = ?', [payload.id]
      );
      req.user = user || null;
    }
  } catch (_) { /* ignored */ }
  next();
};

module.exports = { authenticate, isAdmin, optionalAuth };
