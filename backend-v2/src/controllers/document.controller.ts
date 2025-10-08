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
    fileSize: 50 * 1024 * 1024, // 50MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    // Accept common document types
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: PDF, Word, Excel, Text, Images'));
    }
  },
});

export class DocumentController {
  /**
   * Upload document for property
   * @route POST /api/v2/properties/:propertyId/documents
   * @access Private (JWT required)
   */
  public static uploadDocument = [
    upload.single('document'),
    async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const propertyId = req.params.propertyId;
        logger.info(`[DocumentController] === DOCUMENT UPLOAD START for property ${propertyId} ===`);

        const currentUser = req.user!;
        
        if (!req.file) {
          logger.error('[DocumentController] No document file provided');
          res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'No document file provided',
            timestamp: new Date().toISOString()
          });
          return;
        }
        
        const file = req.file;
        const { documentType, title } = req.body;

        logger.info('[DocumentController] File received:', {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          documentType,
          title
        });

        // Upload to S3
        const s3Service = S3Service.getInstance();
        const key = s3Service.generateDocumentKey('property', propertyId, file.originalname);
        
        const s3Result = await s3Service.uploadFile(
          file.buffer,
          key,
          {
            contentType: file.mimetype,
            isPublic: false, // Documents are private by default
          }
        );
        
        logger.info('[DocumentController] S3 upload successful:', s3Result);

        // Save metadata to database
        const dbFile = await FileService.saveFileUpload(currentUser, {
          filename: key,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          filePath: s3Result.url || key,
          entityType: 'PROPERTY',
          entityId: propertyId,
          isPublic: false,
          metadata: {
            documentType: documentType || 'OTHER',
            title: title || file.originalname
          }
        });

        if (!dbFile.success) {
          logger.error('[DocumentController] Database save failed, cleaning up S3...');
          await s3Service.deleteFile(key);
          
          res.status(dbFile.statusCode || 500).json({
            success: false,
            error: dbFile.error,
            message: dbFile.message,
            timestamp: new Date().toISOString()
          });
          return;
        }

        logger.info(`[DocumentController] === DOCUMENT UPLOAD END for property ${propertyId} ===`);
        
        res.status(201).json({
          success: true,
          data: {
            id: dbFile.data.id,
            key: key,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            documentType: documentType || 'OTHER',
            title: title || file.originalname,
            uploadedBy: currentUser.name || currentUser.email,
            uploadedByEmail: currentUser.email,
            uploadDate: new Date().toISOString()
          },
          message: 'Document uploaded successfully',
          timestamp: new Date().toISOString()
        });

      } catch (error: any) {
        logger.error('[DocumentController] CRITICAL ERROR during document upload:', {
          message: error.message,
          stack: error.stack,
          code: error.code,
          error: error
        });
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'Failed to upload document.',
          timestamp: new Date().toISOString()
        });
      }
    }
  ];

  /**
   * Get all documents for a property
   * @route GET /api/v2/properties/:propertyId/documents
   * @access Private (JWT required)
   */
  public static async getDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const { propertyId } = req.params;

      logger.info(`[DocumentController] Getting documents for property ${propertyId}`);

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

      // Filter only document files (exclude photos)
      const documents = result.data.map(file => ({
        id: file.id,
        title: file.metadata?.title || file.originalName,
        fileName: file.originalName,
        uploadDate: file.createdAt,
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: file.metadata?.documentType || 'OTHER',
        uploadedBy: file.uploadedBy || 'Unknown',
        uploadedByEmail: file.uploadedByEmail || '',
        url: file.filePath,
        key: file.filename,
        mimeType: file.mimeType
      }));

      res.status(200).json({
        success: true,
        data: documents,
        message: 'Documents retrieved successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('[DocumentController] Error getting documents:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while fetching documents',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Delete a document
   * @route DELETE /api/v2/properties/:propertyId/documents/:documentId
   * @access Private (JWT required)
   */
  public static async deleteDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const { propertyId, documentId } = req.params;

      logger.info(`[DocumentController] Deleting document ${documentId} for property ${propertyId}`);

      // Get file info first
      const fileResult = await FileService.getEntityFiles(currentUser, 'PROPERTY', propertyId);
      if (!fileResult.success) {
        res.status(fileResult.statusCode || 500).json({
          success: false,
          error: fileResult.error,
          message: fileResult.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      const file = fileResult.data.find(f => f.id === documentId);
      if (!file) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Document not found',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Delete from S3 if configured
      const s3Service = S3Service.getInstance();
      if (s3Service.isConfigured()) {
        try {
          await s3Service.deleteFile(file.filename);
        } catch (error) {
          logger.warn(`[DocumentController] Failed to delete from S3: ${error}`);
        }
      }

      // Delete from database
      const deleteResult = await FileService.deleteFile(currentUser, documentId);

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
        data: { id: documentId },
        message: 'Document deleted successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('[DocumentController] Error deleting document:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while deleting the document',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get download URL for a document (signed URL for S3)
   * @route GET /api/v2/properties/:propertyId/documents/:documentId/download
   * @access Private (JWT required)
   */
  public static async getDownloadUrl(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user!;
      const { propertyId, documentId } = req.params;

      logger.info(`[DocumentController] Getting download URL for document ${documentId}`);

      // Get file info
      const fileResult = await FileService.getEntityFiles(currentUser, 'PROPERTY', propertyId);
      if (!fileResult.success) {
        res.status(fileResult.statusCode || 500).json({
          success: false,
          error: fileResult.error,
          message: fileResult.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      const file = fileResult.data.find(f => f.id === documentId);
      if (!file) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Document not found',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Generate signed URL for S3
      const s3Service = S3Service.getInstance();
      let downloadUrl: string;

      if (s3Service.isConfigured()) {
        downloadUrl = await s3Service.getSignedUrl(file.filename, 3600); // 1 hour
      } else {
        // Fallback to direct URL if S3 not configured
        downloadUrl = file.filePath;
      }

      res.status(200).json({
        success: true,
        data: {
          url: downloadUrl,
          filename: file.originalName,
          expiresIn: 3600
        },
        message: 'Download URL generated successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('[DocumentController] Error getting download URL:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while generating download URL',
        timestamp: new Date().toISOString()
      });
    }
  }
}

