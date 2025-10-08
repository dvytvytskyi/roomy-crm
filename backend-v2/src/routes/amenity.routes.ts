import { Router } from 'express';
import { AmenityController } from '../controllers/amenity.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route GET /api/v2/amenities
 * @desc Get all amenities with pagination and filtering
 * @access Private
 * @query page, limit, category, search
 */
router.get('/', AmenityController.getAllAmenities);

/**
 * @route GET /api/v2/amenities/categories
 * @desc Get all amenity categories
 * @access Private
 */
router.get('/categories', AmenityController.getCategories);

/**
 * @route GET /api/v2/amenities/:id
 * @desc Get amenity by ID
 * @access Private
 */
router.get('/:id', AmenityController.getAmenityById);

/**
 * @route POST /api/v2/amenities
 * @desc Create new amenity
 * @access Private (ADMIN, MANAGER only)
 */
router.post('/', AmenityController.createAmenity);

/**
 * @route PUT /api/v2/amenities/:id
 * @desc Update amenity
 * @access Private (ADMIN, MANAGER only)
 */
router.put('/:id', AmenityController.updateAmenity);

/**
 * @route DELETE /api/v2/amenities/:id
 * @desc Delete amenity
 * @access Private (ADMIN, MANAGER only)
 */
router.delete('/:id', AmenityController.deleteAmenity);

export default router;
