import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Apply JWT authentication to all property routes
router.use(authenticateToken);

/**
 * @route   GET /api/v2/properties
 * @desc    Get all properties with role-based access control
 * @access  Private (JWT required)
 * @query   page, limit, search, type, status, ownerId, agentId
 */
router.get('/', PropertyController.getAllProperties);

/**
 * @route   GET /api/v2/properties/stats
 * @desc    Get property statistics
 * @access  Private (JWT required) - ADMIN, MANAGER, OWNER, AGENT can access
 */
router.get('/stats', PropertyController.getPropertyStats);

/**
 * @route   GET /api/v2/properties/available
 * @desc    Get available properties (without owners)
 * @access  Private (JWT required) - ADMIN, MANAGER can access
 */
router.get('/available', PropertyController.getAvailableProperties);

/**
 * @route   POST /api/v2/properties
 * @desc    Create new property
 * @access  Private (JWT required) - ADMIN, MANAGER, OWNER can create
 */
router.post('/', PropertyController.createProperty);

/**
 * @route   GET /api/v2/properties/:id
 * @desc    Get property by ID with role-based access control
 * @access  Private (JWT required)
 * @params  id - Property ID
 */
router.get('/:id', PropertyController.getPropertyById);

/**
 * @route   PUT /api/v2/properties/:id
 * @desc    Update property by ID with role-based access control
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Property ID
 */
router.put('/:id', PropertyController.updateProperty);

/**
 * @route   PUT /api/v2/properties/:id/marketing
 * @desc    Update property marketing information
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Property ID
 */
router.put('/:id/marketing', PropertyController.updatePropertyMarketing);

/**
 * @route   PUT /api/v2/properties/:id/availability
 * @desc    Update property availability information
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Property ID
 */
router.put('/:id/availability', PropertyController.updatePropertyAvailability);

/**
 * @route   DELETE /api/v2/properties/:id
 * @desc    Delete (deactivate) property by ID
 * @access  Private (JWT required) - Only ADMIN and MANAGER can deactivate
 * @params  id - Property ID
 */
router.delete('/:id', PropertyController.deleteProperty);

export default router;
