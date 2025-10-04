import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken, requireManagerOrAdmin, requireSelfOrAdmin } from '../middleware/auth.middleware';

const router = Router();

/**
 * User Routes
 * Base path: /api/v2/users
 * All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * GET /api/v2/users/test
 * Test endpoint to verify BaseController works
 */
router.get('/test', UserController.test);

/**
 * GET /api/v2/users
 * Get all users with pagination and filtering
 * Uses RBAC - all authenticated users can access, but see different data based on role
 */
router.get('/', UserController.getAllUsers);


/**
 * POST /api/v2/users
 * Create new user
 * Requires MANAGER or ADMIN role
 */
router.post('/', requireManagerOrAdmin, UserController.createUser);

/**
 * GET /api/v2/users/:id
 * Get user by ID
 * Uses RBAC - access control based on user role and relationships
 */
router.get('/:id', UserController.getUserById);

/**
 * PUT /api/v2/users/:id
 * Update user by ID
 * Requires access to own data or ADMIN/MANAGER role
 */
router.put('/:id', requireSelfOrAdmin('id'), UserController.updateUser);

/**
 * DELETE /api/v2/users/:id
 * Delete user by ID
 * Requires ADMIN role only
 */
router.delete('/:id', UserController.deleteUser);

/**
 * PUT /api/v2/users/:id/password
 * Update user password by ID
 * Requires access to own data or ADMIN role
 */
router.put('/:id/password', requireSelfOrAdmin('id'), UserController.updateUserPassword);

export default router;
