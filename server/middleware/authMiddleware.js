import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect private REST API endpoints.
 * Verifies the JWT sent in the Authorization header (Bearer <token>).
 */
export const protect = async (req, res, next) => {
  let token;

  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET environment variable is missing.');
    return res.status(500).json({ message: 'Server configuration error: JWT_SECRET missing' });
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from 'Bearer <token>' string
      token = req.headers.authorization.split(' ')[1];

      // Verify token signature & payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Query user in MongoDB Atlas
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no bearer token provided' });
  }
};
