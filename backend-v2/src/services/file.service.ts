import { PrismaClient } from '@prisma/client';
import { BaseService } from './BaseService';
import { ServiceResponse } from '../types';
import { CurrentUser } from '../types/dto';
import logger from '../utils/logger';
import path from 'path';
import fs from 'fs';

export interface FileUploadDto {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string;
  entityType: string;
  entityId: string;
  isPublic?: boolean;
}

export interface TaskAttachmentDto {
  taskId: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

export class FileService extends BaseService {
  private static instance: FileService;

  private constructor() {
    super();
  }

  public static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  /**
   * Save file upload record to database
   */
  public static async saveFileUpload(
    currentUser: CurrentUser,
    data: FileUploadDto
  ): Promise<ServiceResponse<any>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[File Upload] Saving file upload record for user ${currentUser.email}`);

      // Generate unique ID
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Save to file_uploads table
      const fileUpload = await prisma.file_uploads.create({
        data: {
          id: fileId,
          filename: data.filename,
          original_name: data.originalName,
          mime_type: data.mimeType,
          size: data.size,
          s3_key: data.filePath, // Using filePath as s3_key for now
          url: `/uploads/${data.filename}`, // Local file URL
          bucket: 'local', // Local storage
          uploaded_by: currentUser.id,
          entity_type: data.entityType,
          entity_id: data.entityId,
          is_public: data.isPublic || false
        }
      });

      // Create audit log
      const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await prisma.audit_logs.create({
        data: {
          id: auditId,
          entity_type: 'FILE_UPLOAD',
          entity_id: fileUpload.id,
          action: 'CREATE',
          user_id: currentUser.id,
          changes: {
            filename: data.filename,
            originalName: data.originalName,
            entityType: data.entityType,
            entityId: data.entityId,
            fileSize: data.size
          },
          ip_address: '127.0.0.1',
          user_agent: 'File Upload API'
        }
      });

      await prisma.$disconnect();

      const result = {
        id: fileUpload.id,
        filename: fileUpload.filename,
        originalName: fileUpload.original_name,
        mimeType: fileUpload.mime_type,
        size: fileUpload.size,
        url: fileUpload.url,
        entityType: fileUpload.entity_type,
        entityId: fileUpload.entity_id,
        isPublic: fileUpload.is_public,
        createdAt: fileUpload.created_at.toISOString()
      };

      logger.info(`[File Upload END] File upload record saved: ${fileUpload.id}`);
      return FileService.prototype.success(result, 'File upload record saved successfully');
    } catch (error) {
      logger.error('Error saving file upload record:', error);
      return FileService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Save task attachment record to database
   */
  public static async saveTaskAttachment(
    currentUser: CurrentUser,
    data: TaskAttachmentDto
  ): Promise<ServiceResponse<any>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Task Attachment] Saving task attachment for user ${currentUser.email}`);

      // Verify task exists and user has access
      const task = await prisma.tasks.findFirst({
        where: {
          id: data.taskId,
          // Add RBAC checks based on user role
          ...(currentUser.role === 'AGENT' ? { assigned_to: currentUser.id } : {}),
          ...(currentUser.role === 'OWNER' ? { 
            property: { owner_id: currentUser.id } 
          } : {})
        }
      });

      if (!task && currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        await prisma.$disconnect();
        return FileService.prototype.error('Forbidden', 'Access denied to this task', 403);
      }

      // Save to task_attachments table
      const taskAttachment = await prisma.task_attachments.create({
        data: {
          task_id: data.taskId,
          filename: data.filename,
          original_name: data.originalName,
          file_path: data.filePath,
          file_size: data.fileSize,
          mime_type: data.mimeType,
          uploaded_by: currentUser.id
        },
        include: {
          task: {
            select: {
              id: true,
              title: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      // Create audit log
      const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await prisma.audit_logs.create({
        data: {
          id: auditId,
          entity_type: 'TASK_ATTACHMENT',
          entity_id: taskAttachment.id,
          action: 'CREATE',
          user_id: currentUser.id,
          changes: {
            taskId: data.taskId,
            filename: data.filename,
            originalName: data.originalName,
            fileSize: data.fileSize
          },
          ip_address: '127.0.0.1',
          user_agent: 'Task Attachment API'
        }
      });

      await prisma.$disconnect();

      const result = {
        id: taskAttachment.id,
        taskId: taskAttachment.task_id,
        filename: taskAttachment.filename,
        originalName: taskAttachment.original_name,
        filePath: taskAttachment.file_path,
        fileSize: taskAttachment.file_size,
        mimeType: taskAttachment.mime_type,
        uploadedBy: {
          id: taskAttachment.user.id,
          name: `${taskAttachment.user.firstName} ${taskAttachment.user.lastName}`
        },
        createdAt: taskAttachment.created_at.toISOString()
      };

      logger.info(`[Task Attachment END] Task attachment saved: ${taskAttachment.id}`);
      return FileService.prototype.success(result, 'Task attachment saved successfully');
    } catch (error) {
      logger.error('Error saving task attachment:', error);
      return FileService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Get file uploads for an entity
   */
  public static async getEntityFiles(
    currentUser: CurrentUser,
    entityType: string,
    entityId: string
  ): Promise<ServiceResponse<any[]>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Get Entity Files] Getting files for ${entityType}:${entityId} for user ${currentUser.email}`);

      // Build where clause based on user role
      let where: any = {
        entity_type: entityType,
        entity_id: entityId
      };

      // Add RBAC checks
      if (currentUser.role === 'GUEST') {
        where.uploaded_by = currentUser.id;
      } else if (currentUser.role === 'AGENT') {
        // Agents can see files they uploaded or files for properties they manage
        where.OR = [
          { uploaded_by: currentUser.id },
          { entity_type: 'PROPERTY', entity: { agent_id: currentUser.id } }
        ];
      } else if (currentUser.role === 'OWNER') {
        // Owners can see files they uploaded or files for their properties
        where.OR = [
          { uploaded_by: currentUser.id },
          { entity_type: 'PROPERTY', entity: { owner_id: currentUser.id } }
        ];
      }
      // ADMIN and MANAGER can see all files

      const files = await prisma.file_uploads.findMany({
        where,
        orderBy: {
          created_at: 'desc'
        }
      });

      await prisma.$disconnect();

      const result = files.map(file => ({
        id: file.id,
        filename: file.filename,
        originalName: file.original_name,
        mimeType: file.mime_type,
        size: file.size,
        url: file.url,
        isPublic: file.is_public,
        uploadedBy: file.uploaded_by,
        createdAt: file.created_at.toISOString()
      }));

      logger.info(`[Get Entity Files END] Retrieved ${result.length} files for user ${currentUser.email}`);
      return FileService.prototype.success(result, 'Files retrieved successfully');
    } catch (error) {
      logger.error('Error getting entity files:', error);
      return FileService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Get single file by ID
   */
  public static async getFile(
    currentUser: CurrentUser,
    fileId: string
  ): Promise<ServiceResponse<any>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Get File] Getting file ${fileId} for user ${currentUser.email}`);

      // Build where clause based on user role
      let where: any = {
        id: fileId
      };

      // Add RBAC checks
      if (currentUser.role === 'GUEST') {
        where.uploaded_by = currentUser.id;
      } else if (currentUser.role === 'AGENT') {
        // Agents can see files they uploaded or files for properties they manage
        where.OR = [
          { uploaded_by: currentUser.id },
          { entity_type: 'PROPERTY', entity: { agent_id: currentUser.id } }
        ];
      } else if (currentUser.role === 'OWNER') {
        // Owners can see files they uploaded or files for their properties
        where.OR = [
          { uploaded_by: currentUser.id },
          { entity_type: 'PROPERTY', entity: { owner_id: currentUser.id } }
        ];
      }
      // ADMIN and MANAGER can see all files

      const file = await prisma.file_uploads.findFirst({
        where
      });

      await prisma.$disconnect();

      if (!file) {
        return FileService.prototype.notFound('File not found');
      }

      const result = {
        id: file.id,
        filename: file.filename,
        originalName: file.original_name,
        mimeType: file.mime_type,
        size: file.size,
        filePath: file.url,
        entityType: file.entity_type,
        entityId: file.entity_id,
        uploadedBy: file.uploaded_by,
        uploadDate: file.created_at,
        isPublic: file.is_public
      };

      logger.info(`[Get File END] Retrieved file ${fileId} for user ${currentUser.email}`);
      return FileService.prototype.success(result, 'File retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving file:', error);
      return FileService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Delete a file upload
   */
  public static async deleteFile(
    currentUser: CurrentUser,
    fileId: string
  ): Promise<ServiceResponse<any>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Delete File] Deleting file ${fileId} for user ${currentUser.email}`);

      // Find the file
      const file = await prisma.file_uploads.findUnique({
        where: { id: fileId }
      });

      if (!file) {
        await prisma.$disconnect();
        return FileService.prototype.error('Not Found', 'File not found', 404);
      }

      // Check permissions
      if (currentUser.role === 'GUEST' && file.uploaded_by !== currentUser.id) {
        await prisma.$disconnect();
        return FileService.prototype.error('Forbidden', 'Access denied to this file', 403);
      }

      // Delete physical file
      const filePath = path.join(process.cwd(), 'uploads', file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete database record
      await prisma.file_uploads.delete({
        where: { id: fileId }
      });

      // Create audit log
      const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await prisma.audit_logs.create({
        data: {
          id: auditId,
          entity_type: 'FILE_UPLOAD',
          entity_id: fileId,
          action: 'DELETE',
          user_id: currentUser.id,
          changes: {
            filename: file.filename,
            originalName: file.original_name
          },
          ip_address: '127.0.0.1',
          user_agent: 'File Delete API'
        }
      });

      await prisma.$disconnect();

      logger.info(`[Delete File END] File deleted: ${fileId}`);
      return FileService.prototype.success({ id: fileId }, 'File deleted successfully');
    } catch (error) {
      logger.error('Error deleting file:', error);
      return FileService.prototype.handleDatabaseError(error);
    }
  }
}
