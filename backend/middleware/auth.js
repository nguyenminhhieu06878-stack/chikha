const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = db.prepare('SELECT id, email, full_name, phone, role FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(403).json({
        error: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        error: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        error: 'Token expired'
      });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Authentication failed' 
    });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required' 
    });
  }
  next();
};

// Optional authentication (for guest users)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = db.prepare('SELECT id, email, full_name, phone, role FROM users WHERE id = ?').get(decoded.id);
        
        if (user) {
          req.user = user;
        }
      } catch (err) {
        // Invalid token, continue as guest
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for guest users
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};
