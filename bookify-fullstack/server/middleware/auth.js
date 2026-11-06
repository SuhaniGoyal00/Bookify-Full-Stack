const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
  } catch (_) { /* Guest access is allowed for browsing/cart. */ }
  next();
}
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Please sign in to continue.' });
  next();
}
module.exports = { optionalAuth, requireAuth };
