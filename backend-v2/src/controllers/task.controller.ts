import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { TaskStateMachineService } from '../services/task-state-machine.service';
import { FileService } from '../services/file.service';
import { AuthenticatedRequest, CurrentUser } from '../types';
import { TaskQueryParams, CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto, CreateTaskCommentDto, UpdateTaskChecklistItemDto, CreateTaskChecklistItemDto } from '../types/dto';
import logger from '../utils/logger';

export class TaskController {
  /**
   * Get all tasks with pagination and filters
   */
  public static async getTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const queryParams: TaskQueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        type: req.query.type as string,
        status: req.query.status ? (Array.isArray(req.query.status) ? req.query.status as string[] : [req.query.status as string]) : undefined,
        priority: req.query.priority ? (Array.isArray(req.query.priority) ? req.query.priority as string[] : [req.query.priority as string]) : undefined,
        propertyId: req.query.propertyId as string,
        assignedTo: req.query.assignedTo as string,
        createdBy: req.query.createdBy as string,
        scheduledDateFrom: req.query.scheduledDateFrom as string,
        scheduledDateTo: req.query.scheduledDateTo as string,
      };

      logger.info(`Getting tasks for user ${currentUser.email} with params:`, queryParams);

      const result = await TaskService.findAll(currentUser, queryParams);

      if (!result.success) {
        res.status(result.statusCode || 500).json({
          success: false,
          error: result.error,
          message: result.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in getTasks controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while retrieving tasks',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get task by ID
   */
  public static async getTaskById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const taskId = req.params['id'];

      if (!taskId) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Task ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info(`Getting task ${taskId} for user ${currentUser.email}`);

      const result = await TaskService.findById(currentUser, taskId);

      if (!result.success) {
        res.status(result.statusCode || 500).json({
          success: false,
          error: result.error,
          message: result.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in getTaskById controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while retrieving the task',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Create new task
   */
  public static async createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const taskData: CreateTaskDto = req.body;

      // Validation
      if (!taskData.title || !taskData.type || !taskData.propertyId) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Title, type, and propertyId are required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!['CLEANING', 'MAINTENANCE'].includes(taskData.type)) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Type must be either CLEANING or MAINTENANCE',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (taskData.priority && !['LOW', 'NORMAL', 'HIGH', 'URGENT'].includes(taskData.priority)) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Priority must be LOW, NORMAL, HIGH, or URGENT',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (taskData.cost && (isNaN(taskData.cost) || taskData.cost < 0)) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Cost must be a positive number',
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info(`Creating task "${taskData.title}" for user ${currentUser.email}`);

      const result = await TaskService.create(currentUser, taskData);

      if (!result.success) {
        res.status(result.statusCode || 500).json({
          success: false,
          error: result.error,
          message: result.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: result.data,
        message: 'Task created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in createTask controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while creating the task',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update task
   */
  public static async updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const taskId = req.params['id'];
      const updateData: UpdateTaskDto = req.body;

      if (!taskId) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Task ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validation
      if (updateData.priority && !['LOW', 'NORMAL', 'HIGH', 'URGENT'].includes(updateData.priority)) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Priority must be LOW, NORMAL, HIGH, or URGENT',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (updateData.cost && (isNaN(updateData.cost) || updateData.cost < 0)) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Cost must be a positive number',
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info(`Updating task ${taskId} for user ${currentUser.email}`);

      const result = await TaskService.update(currentUser, taskId, updateData);

      if (!result.success) {
        res.status(result.statusCode || 500).json({
          success: false,
          error: result.error,
          message: result.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: 'Task updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in updateTask controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while updating the task',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Delete task (soft delete)
   */
  public static async deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const taskId = req.params['id'];

      if (!taskId) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Task ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info(`Deleting task ${taskId} for user ${currentUser.email}`);

      const result = await TaskService.delete(currentUser, taskId);

      if (!result.success) {
        res.status(result.statusCode || 500).json({
          success: false,
          error: result.error,
          message: result.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: 'Task deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in deleteTask controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while deleting the task',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update task status using state machine
   */
  public static async updateTaskStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const taskId = req.params['id'];
      const { status, notes }: UpdateTaskStatusDto = req.body;

      if (!taskId) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Task ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!status || !['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD'].includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Valid status is required (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, ON_HOLD)',
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info(`Updating task ${taskId} status to ${status} for user ${currentUser.email}`);

      const result = await TaskStateMachineService.updateStatus(currentUser, taskId, status, notes);

      if (!result.success) {
        res.status(result.statusCode || 500).json({
          success: false,
          error: result.error,
          message: result.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        message: 'Task status updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in updateTaskStatus controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while updating the task status',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get task statistics
   */
  public static async getTaskStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;

      logger.info(`Getting task statistics for user ${currentUser.email}`);

      const result = await TaskService.getStats(currentUser);

      if (!result.success) {
        res.status(result.statusCode || 500).json({
          success: false,
          error: result.error,
          message: result.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in getTaskStats controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while retrieving task statistics',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Add comment to task
   */
  public static async addTaskComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const taskId = req.params['id'];
      const { content, type = 'user' }: CreateTaskCommentDto = req.body;

      if (!taskId) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Task ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!content || content.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Comment content is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info(`Adding comment to task ${taskId} for user ${currentUser.email}`);

      // This would need to be implemented in TaskService
      res.status(501).json({
        success: false,
        error: 'Not Implemented',
        message: 'Task comments functionality will be implemented in the next phase',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in addTaskComment controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while adding the comment',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update checklist item
   */
  public static async updateChecklistItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const taskId = req.params['id'];
      const itemId = req.params['itemId'];
      const { completed }: UpdateTaskChecklistItemDto = req.body;

      if (!taskId || !itemId) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Task ID and Item ID are required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (typeof completed !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Completed status must be a boolean',
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info(`Updating checklist item ${itemId} for task ${taskId} for user ${currentUser.email}`);

      // This would need to be implemented in TaskService
      res.status(501).json({
        success: false,
        error: 'Not Implemented',
        message: 'Task checklist functionality will be implemented in the next phase',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in updateChecklistItem controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while updating the checklist item',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Upload attachment to task
   */
  public static async uploadTaskAttachment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;
      const taskId = req.params['id'];

      if (!taskId) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Task ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'No file uploaded',
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info(`Uploading attachment to task ${taskId} for user ${currentUser.email}`);

      // Prepare file data
      const fileData = {
        taskId: taskId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      };

      // Save to database
      const result = await FileService.saveTaskAttachment(currentUser, fileData);

      if (!result.success) {
        res.status(result.statusCode || 500).json({
          success: false,
          error: result.error,
          message: result.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: result.data,
        message: 'Task attachment uploaded successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in uploadTaskAttachment controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while uploading the attachment',
        timestamp: new Date().toISOString()
      });
    }
  }
}
