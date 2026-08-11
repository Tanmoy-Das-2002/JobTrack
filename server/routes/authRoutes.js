import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login existing user & return JWT token
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user profile (Protected)
 */
router.get('/me', protect, getMe);

export default router;
