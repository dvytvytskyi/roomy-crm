import { Request, Response, NextFunction } from 'express';
import { uploadSingle, handleUploadError } from '../middleware/upload.middleware';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';

export class FileController {
  // Upload file endpoint
  public static uploadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded',
          message: 'Please select a file to upload',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { folder, ownerId } = req.body;
      
      // Generate file info
      const fileInfo = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path,
        key: `${folder || 'documents'}/${ownerId || 'unknown'}/${req.file.filename}`,
        url: `/uploads/${req.file.filename}`
      };

      logger.info(`File uploaded successfully: ${fileInfo.filename}`);

      res.status(200).json({
        success: true,
        data: fileInfo,
        message: 'File uploaded successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error uploading file:', error);
      next(error);
    }
  };

  // Get signed URL for file download
  public static getSignedUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.query;
      
      if (!key) {
        res.status(400).json({
          success: false,
          error: 'Missing key parameter',
          message: 'File key is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // For now, we'll return a simple URL since we're using local storage
      // In production, you would generate a signed URL for S3 or similar
      // Extract filename from key (key format: folder/ownerId/filename)
      const keyParts = (key as string).split('/');
      const filename = keyParts[keyParts.length - 1];
      const filePath = path.join(process.cwd(), 'uploads', filename);
      
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          error: 'File not found',
          message: 'The requested file does not exist',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const signedUrl = `http://localhost:3002/uploads/${key}`;
      
      res.status(200).json({
        success: true,
        data: {
          url: signedUrl,
          key: key
        },
        message: 'Signed URL generated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error generating signed URL:', error);
      next(error);
    }
  };

  // Delete file endpoint
  public static deleteFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.params;
      
      if (!key) {
        res.status(400).json({
          success: false,
          error: 'Missing key parameter',
          message: 'File key is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Extract filename from key (key format: folder/ownerId/filename)
      const keyParts = key.split('/');
      const filename = keyParts[keyParts.length - 1];
      const filePath = path.join(process.cwd(), 'uploads', filename);
      
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          error: 'File not found',
          message: 'The requested file does not exist',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Delete the file
      fs.unlinkSync(filePath);
      
      logger.info(`File deleted successfully: ${key}`);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error deleting file:', error);
      next(error);
    }
  };
}
