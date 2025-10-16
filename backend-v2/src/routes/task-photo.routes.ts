import { Router } from 'express';
import { TaskPhotoController } from '../controllers/task-photo.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All task photo routes require authentication
router.use(authenticateToken);

// Task photo operations
router.get('/:taskId/photos', TaskPhotoController.getTaskPhotos);
router.post('/:taskId/photos', TaskPhotoController.uploadPhoto);
router.delete('/:taskId/photos/:photoId', TaskPhotoController.deletePhoto);
router.get('/:taskId/photos/:photoId/download', TaskPhotoController.getDownloadUrl);

export default router;
