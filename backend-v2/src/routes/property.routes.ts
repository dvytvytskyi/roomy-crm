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

export default router;
