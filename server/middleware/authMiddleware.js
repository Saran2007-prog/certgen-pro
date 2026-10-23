const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to verify JWT token in Authorization header.
 * Expected format: Authorization: Bearer <token>
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'certgen_default_jwt_secret_key_2026';

    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Contains { id, email, role }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
