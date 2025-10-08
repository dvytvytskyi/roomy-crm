import { Router } from 'express';
import { PhotoController } from '../controllers/photo.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route GET /api/v2/properties/:propertyId/photos
 * @desc Get all photos for a specific property
 * @access Private (JWT required)
 */
router.get('/:propertyId/photos', authenticateToken, PhotoController.getPhotos);

/**
 * @route POST /api/v2/properties/:propertyId/photos
 * @desc Upload a photo for a specific property
 * @access Private (JWT required)
 */
router.post('/:propertyId/photos', 
  (req, res, next) => {
    console.log('🔍 [PhotoRoutes] POST /:propertyId/photos route hit:', {
      method: req.method,
      url: req.url,
      propertyId: req.params.propertyId
    });
    next();
  },
  authenticateToken, 
  PhotoController.uploadPhoto
);

/**
 * @route DELETE /api/v2/properties/:propertyId/photos/:photoId
 * @desc Delete a photo for a specific property
 * @access Private (JWT required)
 */
router.delete('/:propertyId/photos/:photoId', authenticateToken, PhotoController.deletePhoto);

export default router;
