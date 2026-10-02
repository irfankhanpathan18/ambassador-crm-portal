const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'nxtwave_ambassador_crm_secret_key_2026';

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch fresh user from DB
    const user = db.prepare('SELECT id, name, email, role, status FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User no longer exists' });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({ error: 'Forbidden: Account is inactive' });
    }

    req.user = user;

    if (user.role === 'AMBASSADOR') {
      const ambassador = db.prepare('SELECT id, college, referral_code FROM ambassadors WHERE user_id = ?').get(user.id);
      if (ambassador) {
        req.user.ambassadorId = ambassador.id;
        req.user.college = ambassador.college;
        req.user.referralCode = ambassador.referral_code;
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
}

function requireAmbassador(req, res, next) {
  if (!req.user || req.user.role !== 'AMBASSADOR') {
    return res.status(403).json({ error: 'Forbidden: Ambassador access required' });
  }
  next();
}

module.exports = {
  JWT_SECRET,
  verifyToken,
  requireAdmin,
  requireAmbassador
};
