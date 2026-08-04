import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBirthData } from '../middleware/birthDataValidation.js';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Validates birth data (date, time, place) before processing
 */
router.post('/register', validateBirthData, register);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', login);

/**
 * GET /api/auth/me
 * Get current user profile (requires authentication)
 */
router.get('/me', authMiddleware, getCurrentUser);

export default router;
