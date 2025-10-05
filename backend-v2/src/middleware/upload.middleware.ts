import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import logger from '../utils/logger';

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: Function) => {
    // Create uploads directory if it doesn't exist
    const uploadPath = path.join(process.cwd(), 'uploads');
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: Function) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  // Define allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  }
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => {
  return upload.single(fieldName);
};

// Middleware for multiple files upload
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
  return upload.array(fieldName, maxCount);
};

// Middleware for mixed file uploads
export const uploadFields = (fields: multer.Field[]) => {
  return upload.fields(fields);
};

// Error handling middleware
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    logger.error('Multer error:', error);
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'File Too Large',
          message: 'File size exceeds the 10MB limit',
          timestamp: new Date().toISOString()
        });
      
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Too Many Files',
          message: 'Too many files uploaded. Maximum 5 files allowed',
          timestamp: new Date().toISOString()
        });
      
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: 'Unexpected File',
          message: 'Unexpected file field',
          timestamp: new Date().toISOString()
        });
      
      default:
        return res.status(400).json({
          success: false,
          error: 'Upload Error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
    }
  }
  
  if (error.message.includes('File type')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid File Type',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
  
  next(error);
};

export default upload;
