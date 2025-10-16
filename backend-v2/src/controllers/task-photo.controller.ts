import { Request, Response, NextFunction } from 'express';
import { S3Service } from '../services/s3.service';
import { FileService } from '../services/file.service';
import { CurrentUser } from '../types/dto';
import logger from '../utils/logger';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user?: CurrentUser;
}

// Configure multer for memory storage - optimized for photos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for photos
  },
  fileFilter: (req, file, cb) => {
    // Accept only image types
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed (JPEG, PNG, GIF, WebP)'));
    }
  },
});

export class TaskPhotoController {
  /**
   * Upload photo for maintenance task
   * @route POST /api/v2/tasks/:taskId/photos
   * @access Private (JWT required)
   */
  public static uploadPhoto = [
    upload.single('photo'),
    async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const currentUser: CurrentUser = req.user!;
        const taskId = req.params.taskId;

        if (!req.file) {
          res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'No photo file provided',
            timestamp: new Date().toISOString()
          });
          return;
        }

        if (!taskId) {
          res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Task ID is required',
            timestamp: new Date().toISOString()
          });
          return;
        }

        logger.info(`Uploading photo for task ${taskId} by user ${currentUser.email}`);

        // Verify task exists and user has access
        const prisma = new PrismaClient();
        const task = await prisma.tasks.findUnique({
          where: { id: taskId, is_active: true },
          include: { property: true }
        });

        if (!task) {
          await prisma.$disconnect();
          res.status(404).json({
            success: false,
            error: 'Not Found',
            message: 'Task not found',
            timestamp: new Date().toISOString()
          });
          return;
        }

        // Generate unique filename
        const fileExtension = FileService.getFileExtension(req.file.originalname);
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileName = `task-${taskId}-photo-${timestamp}-${randomString}${fileExtension}`;
        
        // Create S3 key
        const s3Key = `maintenance-tasks/${taskId}/photos/${fileName}`;

        // Upload to S3
        const uploadResult = await S3Service.uploadFile(
          req.file.buffer,
          s3Key,
          req.file.mimetype,
          {
            taskId: taskId,
            uploadedBy: currentUser.id,
            uploadedAt: new Date().toISOString(),
            originalName: req.file.originalname
          }
        );

        if (!uploadResult.success) {
          await prisma.$disconnect();
          res.status(500).json({
            success: false,
            error: 'Upload Failed',
            message: 'Failed to upload photo to storage',
            timestamp: new Date().toISOString()
          });
          return;
        }

        // Save photo record to database
        const photoRecord = await prisma.task_photos.create({
          data: {
            id: `photo-${timestamp}-${randomString}`,
            task_id: taskId,
            file_name: fileName,
            original_name: req.file.originalname,
            file_size: req.file.size,
            mime_type: req.file.mimetype,
            s3_key: s3Key,
            s3_url: uploadResult.data?.url || '',
            uploaded_by: currentUser.id,
            uploaded_at: new Date(),
            is_active: true
          }
        });

        await prisma.$disconnect();

        logger.info(`Photo uploaded successfully for task ${taskId}: ${fileName}`);

        res.json({
          success: true,
          data: {
            id: photoRecord.id,
            fileName: photoRecord.file_name,
            originalName: photoRecord.original_name,
            fileSize: photoRecord.file_size,
            mimeType: photoRecord.mime_type,
            s3Url: photoRecord.s3_url,
            uploadedBy: photoRecord.uploaded_by,
            uploadedAt: photoRecord.uploaded_at
          },
          message: 'Photo uploaded successfully',
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        logger.error('Error in uploadPhoto controller:', error);
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while uploading the photo',
          timestamp: new Date().toISOString()
        });
      }
    }
  ];

  /**
   * Get all photos for a maintenance task
   * @route GET /api/v2/tasks/:taskId/photos
   * @access Private (JWT required)
   */
  public static async getTaskPhotos(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const taskId = req.params.taskId;

      if (!taskId) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Task ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info(`Getting photos for task ${taskId} by user ${currentUser.email}`);

      const prisma = new PrismaClient();
      
      // Verify task exists
      const task = await prisma.tasks.findUnique({
        where: { id: taskId, is_active: true }
      });

      if (!task) {
        await prisma.$disconnect();
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Task not found',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Get photos
      const photos = await prisma.task_photos.findMany({
        where: { 
          task_id: taskId, 
          is_active: true 
        },
        orderBy: { uploaded_at: 'desc' },
        include: {
          uploaded_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          }
        }
      });

      await prisma.$disconnect();

      const photosData = photos.map(photo => ({
        id: photo.id,
        fileName: photo.file_name,
        originalName: photo.original_name,
        fileSize: photo.file_size,
        mimeType: photo.mime_type,
        s3Url: photo.s3_url,
        uploadedBy: {
          id: photo.uploaded_by_user?.id,
          name: photo.uploaded_by_user ? `${photo.uploaded_by_user.first_name} ${photo.uploaded_by_user.last_name}` : 'Unknown',
          email: photo.uploaded_by_user?.email
        },
        uploadedAt: photo.uploaded_at
      }));

      res.json({
        success: true,
        data: photosData,
        message: 'Photos retrieved successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error in getTaskPhotos controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while retrieving photos',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Delete photo from maintenance task
   * @route DELETE /api/v2/tasks/:taskId/photos/:photoId
   * @access Private (JWT required)
   */
  public static async deletePhoto(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const taskId = req.params.taskId;
      const photoId = req.params.photoId;

      if (!taskId || !photoId) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Task ID and Photo ID are required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info(`Deleting photo ${photoId} for task ${taskId} by user ${currentUser.email}`);

      const prisma = new PrismaClient();
      
      // Get photo record
      const photo = await prisma.task_photos.findUnique({
        where: { 
          id: photoId,
          task_id: taskId,
          is_active: true 
        }
      });

      if (!photo) {
        await prisma.$disconnect();
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Photo not found',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Delete from S3
      if (photo.s3_key) {
        const deleteResult = await S3Service.deleteFile(photo.s3_key);
        if (!deleteResult.success) {
          logger.warn(`Failed to delete photo from S3: ${photo.s3_key}`);
        }
      }

      // Mark as deleted in database
      await prisma.task_photos.update({
        where: { id: photoId },
        data: { 
          is_active: false,
          deleted_at: new Date(),
          deleted_by: currentUser.id
        }
      });

      await prisma.$disconnect();

      logger.info(`Photo deleted successfully: ${photoId}`);

      res.json({
        success: true,
        message: 'Photo deleted successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error in deletePhoto controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while deleting the photo',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get download URL for photo
   * @route GET /api/v2/tasks/:taskId/photos/:photoId/download
   * @access Private (JWT required)
   */
  public static async getDownloadUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const taskId = req.params.taskId;
      const photoId = req.params.photoId;

      if (!taskId || !photoId) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Task ID and Photo ID are required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const prisma = new PrismaClient();
      
      // Get photo record
      const photo = await prisma.task_photos.findUnique({
        where: { 
          id: photoId,
          task_id: taskId,
          is_active: true 
        }
      });

      if (!photo) {
        await prisma.$disconnect();
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Photo not found',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await prisma.$disconnect();

      // Generate signed URL for download
      const downloadUrl = await S3Service.getSignedUrl(photo.s3_key, 3600); // 1 hour expiry

      res.json({
        success: true,
        data: {
          downloadUrl: downloadUrl,
          fileName: photo.original_name,
          fileSize: photo.file_size,
          mimeType: photo.mime_type
        },
        message: 'Download URL generated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error in getDownloadUrl controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while generating download URL',
        timestamp: new Date().toISOString()
      });
    }
  }
}
