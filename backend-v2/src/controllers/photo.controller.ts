import { Request, Response, NextFunction } from 'express';
import { S3Service } from '../services/s3.service';
import { FileService } from '../services/file.service';
import { CurrentUser } from '../types/dto';
import logger from '../utils/logger';
import multer from 'multer';

interface AuthenticatedRequest extends Request {
  user?: CurrentUser;
}

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export class PhotoController {
  /**
   * Upload photo for property
   * @route POST /api/v2/properties/:propertyId/photos
   * @access Private (JWT required)
   */
  public static uploadPhoto = [
    // Додаємо middleware для логування перед multer
    (req: Request, res: Response, next: NextFunction) => {
      console.log('🔍 [PhotoController] Request received BEFORE multer:', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        hasFile: !!req.file
      });
      next();
    },
    upload.single('photo'),
    async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const propertyId = req.params.propertyId;
        logger.info(`[PhotoController] === PHOTO UPLOAD START for property ${propertyId} ===`);

        const currentUser = req.user!;
        
        // 1. Перевірка, чи Multer відпрацював
        if (!req.file) {
          logger.error('[PhotoController] Multer did not process the file. req.file is undefined.');
          res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'No photo file provided',
            timestamp: new Date().toISOString()
          });
          return;
        }
        
        const file = req.file;
        logger.info('[PhotoController] Multer processed the file successfully:', {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          bufferLength: file.buffer?.length
        });

        // 2. Виклик S3Service
        logger.info('[PhotoController] Calling S3Service to upload to AWS...');
        const s3Service = new S3Service();
        const key = s3Service.generatePropertyPhotoKey(propertyId, file.originalname);
        
        const s3Result = await s3Service.uploadFile(
          file.buffer,
          key,
          {
            contentType: file.mimetype,
            isPublic: true,
          }
        );
        logger.info('[PhotoController] S3Service returned successfully:', s3Result);

        // 3. Виклик FileService
        logger.info('[PhotoController] Calling FileService to save metadata to DB...');
        const dbFile = await FileService.saveFileUpload(currentUser, {
          filename: key,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          filePath: s3Result.url,
          entityType: 'PROPERTY',
          entityId: propertyId,
          isPublic: true,
        });
        logger.info('[PhotoController] FileService saved metadata successfully:', dbFile);

        if (!dbFile.success) {
          // If database save fails, delete from S3
          logger.error('[PhotoController] Database save failed, cleaning up S3...');
          await s3Service.deleteFile(key);
          
          res.status(dbFile.statusCode || 500).json({
            success: false,
            error: dbFile.error,
            message: dbFile.message,
            timestamp: new Date().toISOString()
          });
          return;
        }

        logger.info(`[PhotoController] === PHOTO UPLOAD END for property ${propertyId} ===`);
        res.status(201).json({
          success: true,
          data: {
            id: dbFile.data.id,
            url: s3Result.url,
            key: key,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
          },
          message: 'Photo uploaded successfully',
          timestamp: new Date().toISOString()
        });

      } catch (error: any) {
        // 4. Логування помилки
        logger.error('[PhotoController] CRITICAL ERROR during photo upload:', {
          message: error.message,
          stack: error.stack,
          // Якщо це помилка AWS SDK, вона матиме специфічні поля
          code: error.code,
          requestId: error.requestId,
          statusCode: error.statusCode,
          error: error
        });
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'Failed to upload photo.',
          timestamp: new Date().toISOString()
        });
      }
    }
  ];

  /**
   * Get all photos for a property
   * @route GET /api/v2/properties/:propertyId/photos
   * @access Private (JWT required)
   */
  public static async getPhotos(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const { propertyId } = req.params;

      logger.info(`[PhotoController] Getting photos for property ${propertyId} by user ${currentUser.email}`);

      const result = await FileService.getEntityFiles(currentUser, 'PROPERTY', propertyId);

      if (!result.success) {
        res.status(result.statusCode || 500).json({
          success: false,
          error: result.error,
          message: result.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Filter only image files
      const photos = result.data.filter(file => file.mimeType.startsWith('image/'));

      res.status(200).json({
        success: true,
        data: photos,
        message: 'Photos retrieved successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('[PhotoController] Error getting photos:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while fetching photos',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Delete a photo
   * @route DELETE /api/v2/properties/:propertyId/photos/:photoId
   * @access Private (JWT required)
   */
  public static async deletePhoto(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const { photoId } = req.params;

      logger.info(`[PhotoController] Deleting photo ${photoId} by user ${currentUser.email}`);

      // Get file info first
      const fileResult = await FileService.getEntityFiles(currentUser, 'PROPERTY', '');
      if (!fileResult.success) {
        res.status(fileResult.statusCode || 500).json({
          success: false,
          error: fileResult.error,
          message: fileResult.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      const file = fileResult.data.find(f => f.id === photoId);
      if (!file) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Photo not found',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Delete from S3 if configured
      const s3Service = new S3Service();
      if (s3Service.isConfigured()) {
        try {
          await s3Service.deleteFile(file.filename);
        } catch (error) {
          logger.warn(`[PhotoController] Failed to delete from S3: ${error}`);
          // Continue with database deletion even if S3 deletion fails
        }
      }

      // Delete from database
      const deleteResult = await FileService.deleteFile(currentUser, photoId);

      if (!deleteResult.success) {
        res.status(deleteResult.statusCode || 500).json({
          success: false,
          error: deleteResult.error,
          message: deleteResult.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { id: photoId },
        message: 'Photo deleted successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('[PhotoController] Error deleting photo:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while deleting the photo',
        timestamp: new Date().toISOString()
      });
    }
  }
}
