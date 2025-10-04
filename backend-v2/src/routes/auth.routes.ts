import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken, authRateLimit } from '../middleware/auth.middleware';

const router = Router();

/**
 * Authentication Routes
 * Base path: /api/v2/auth
 */

/**
 * POST /api/v2/auth/login
 * User login endpoint
 * Rate limited to prevent brute force attacks
 */
router.post('/login', authRateLimit(5, 15 * 60 * 1000), AuthController.login);

/**
 * GET /api/v2/auth/me
 * Get current user profile
 * Requires authentication
 */
router.get('/me', authenticateToken, AuthController.getProfile);

/**
 * POST /api/v2/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * POST /api/v2/auth/logout
 * User logout endpoint
 * Requires authentication
 */
router.post('/logout', authenticateToken, AuthController.logout);

/**
 * PUT /api/v2/auth/change-password
 * Change user password
 * Requires authentication
 */
router.put('/change-password', authenticateToken, AuthController.changePassword);

/**
 * GET /api/v2/auth/verify
 * Verify JWT token
 */
router.get('/verify', AuthController.verifyToken);

export default router;
