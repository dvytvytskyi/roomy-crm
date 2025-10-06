import express from 'express';
import { FileController } from '../controllers/file.controller';
import { uploadSingle, handleUploadError } from '../middleware/upload.middleware';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Upload file endpoint
router.post('/upload', 
  authenticateToken,
  uploadSingle('file'),
  handleUploadError,
  FileController.uploadFile
);

// Get signed URL for file download
router.get('/signed-url', 
  authenticateToken,
  FileController.getSignedUrl
);

// Delete file endpoint
router.delete('/:key', 
  authenticateToken,
  FileController.deleteFile
);

export default router;
