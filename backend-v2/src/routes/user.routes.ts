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
 * GET /api/v2/users/stats
 * Get user statistics
 * Requires ADMIN or MANAGER role
 */
router.get('/stats', requireManagerOrAdmin, UserController.getUserStats);


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
 * GET /api/v2/users/:id/stats
 * Get user detail statistics
 * Uses RBAC - access control based on user role and relationships
 */
router.get('/:id/stats', UserController.getUserDetailStats);

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

/**
 * GET /api/v2/users/:id/properties
 * Get properties owned by user
 * Uses RBAC - access control based on user role and relationships
 */
router.get('/:id/properties', UserController.getUserProperties);

/**
 * POST /api/v2/users/:id/properties
 * Link property to user (set owner_id)
 * Requires MANAGER or ADMIN role
 */
router.post('/:id/properties', requireManagerOrAdmin, UserController.linkPropertyToUser);

/**
 * DELETE /api/v2/users/:id/properties/:propertyId
 * Unlink property from user (remove owner_id)
 * Requires MANAGER or ADMIN role
 */
router.delete('/:id/properties/:propertyId', requireManagerOrAdmin, UserController.unlinkPropertyFromUser);

/**
 * GET /api/v2/users/:id/bank-accounts
 * Get bank accounts for user
 * Uses RBAC - access control based on user role and relationships
 */
router.get('/:id/bank-accounts', UserController.getUserBankAccounts);

/**
 * POST /api/v2/users/:id/bank-accounts
 * Create bank account for user
 * Uses RBAC - access control based on user role and relationships
 */
router.post('/:id/bank-accounts', UserController.createUserBankAccount);

/**
 * PUT /api/v2/users/:id/bank-accounts/:accountId
 * Update bank account for user
 * Uses RBAC - access control based on user role and relationships
 */
router.put('/:id/bank-accounts/:accountId', UserController.updateUserBankAccount);

/**
 * DELETE /api/v2/users/:id/bank-accounts/:accountId
 * Delete bank account for user
 * Uses RBAC - access control based on user role and relationships
 */
router.delete('/:id/bank-accounts/:accountId', UserController.deleteUserBankAccount);

/**
 * GET /api/v2/users/:id/transactions
 * Get transactions for user
 * Uses RBAC - access control based on user role and relationships
 */
router.get('/:id/transactions', UserController.getUserTransactions);

/**
 * POST /api/v2/users/:id/transactions
 * Create transaction for user (Cash Payment)
 * Uses RBAC - access control based on user role and relationships
 */
router.post('/:id/transactions', UserController.createUserTransaction);

/**
 * GET /api/v2/users/:id/documents
 * Get documents for user
 * Uses RBAC - access control based on user role and relationships
 */
router.get('/:id/documents', UserController.getUserDocuments);

/**
 * POST /api/v2/users/:id/documents
 * Create document for user
 * Uses RBAC - access control based on user role and relationships
 */
router.post('/:id/documents', UserController.createUserDocument);

/**
 * PUT /api/v2/users/:id/documents/:documentId
 * Update document for user
 * Uses RBAC - access control based on user role and relationships
 */
router.put('/:id/documents/:documentId', UserController.updateUserDocument);

/**
 * DELETE /api/v2/users/:id/documents/:documentId
 * Delete document for user
 * Uses RBAC - access control based on user role and relationships
 */
router.delete('/:id/documents/:documentId', UserController.deleteUserDocument);

/**
 * GET /api/v2/users/:id/activity-log
 * Get activity log for user
 * Uses RBAC - access control based on user role and relationships
 */
router.get('/:id/activity-log', UserController.getUserActivityLog);

/**
 * POST /api/v2/users/:id/activity-log
 * Create activity log entry for user
 * Uses RBAC - access control based on user role and relationships
 */
router.post('/:id/activity-log', UserController.createUserActivityLog);

export default router;
