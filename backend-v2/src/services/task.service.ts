import { PrismaClient, Prisma } from '@prisma/client';
import { BaseService } from './BaseService';
import { ServiceResponse } from '../types';
import { CurrentUser, TaskQueryParams, PaginatedResponse, CreateTaskDto, UpdateTaskDto, TaskResponseDto, TaskWithDetailsDto, TaskStatsDto, UpdateTaskStatusDto, CreateTaskCommentDto, UpdateTaskChecklistItemDto, CreateTaskChecklistItemDto } from '../types/dto';
import logger from '../utils/logger';

export class TaskService extends BaseService {
  private static instance: TaskService;

  private constructor() {
    super();
  }

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  /**
   * Find all tasks with role-based access control
   */
  public static async findAll(currentUser: CurrentUser, queryParams: TaskQueryParams): Promise<ServiceResponse<PaginatedResponse<TaskWithDetailsDto>>> {
    try {
      const prisma = new PrismaClient();
      const { page = 1, limit = 10, search, type, status, priority, propertyId, assignedTo, createdBy, scheduledDateFrom, scheduledDateTo } = queryParams;
      const offset = (page - 1) * limit;

      // Build where clause based on user role
      let where: any = {};

      switch (currentUser.role) {
        case 'ADMIN':
        case 'MANAGER':
          // ADMIN and MANAGER can see all tasks
          break;
        
        case 'AGENT':
          // AGENT can see tasks for properties they manage
          where = {
            OR: [
              { assigned_to: currentUser.id },
              { property: { agent_id: currentUser.id } }
            ]
          };
          break;
        
        case 'OWNER':
          // OWNER can see tasks for their properties
          where = {
            property: { owner_id: currentUser.id }
          };
          break;
        
        case 'GUEST':
        default:
          // GUEST cannot see tasks
          await prisma.$disconnect();
          return TaskService.prototype.error('Forbidden', 'GUEST role cannot access tasks', 403);
      }

      // Add filters
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { property: { name: { contains: search, mode: 'insensitive' } } }
        ];
      }

      if (type) {
        where.type = type;
      }

      if (status && status.length > 0) {
        where.status = { in: status };
      }

      if (priority && priority.length > 0) {
        where.priority = { in: priority };
      }

      if (propertyId) {
        where.property_id = propertyId;
      }

      if (assignedTo) {
        where.assigned_to = assignedTo;
      }

      if (createdBy) {
        where.created_by = createdBy;
      }

      if (scheduledDateFrom || scheduledDateTo) {
        where.scheduled_date = {};
        if (scheduledDateFrom) {
          where.scheduled_date.gte = new Date(scheduledDateFrom);
        }
        if (scheduledDateTo) {
          where.scheduled_date.lte = new Date(scheduledDateTo);
        }
      }

      // Add is_active filter
      where.is_active = true;

      // Get total count
      const total = await prisma.tasks.count({ where });

      // Get tasks with relations
      const tasks = await prisma.tasks.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              country: true,
            }
          },
          assigned_user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          checklist_items: {
            orderBy: { order: 'asc' }
          },
          comments: {
            orderBy: { created_at: 'desc' },
            take: 5, // Get latest 5 comments
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            }
          },
          attachments: {
            orderBy: { created_at: 'desc' },
            take: 5, // Get latest 5 attachments
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            }
          },
          _count: {
            select: {
              comments: true,
              checklist_items: true,
              attachments: true,
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      });

      await prisma.$disconnect();

      // Transform to DTOs
      const taskDtos: TaskWithDetailsDto[] = tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        type: task.type,
        status: task.status,
        priority: task.priority,
        propertyId: task.property_id,
        assignedTo: task.assigned_to,
        createdBy: task.created_by,
        scheduledDate: task.scheduled_date?.toISOString(),
        completedDate: task.completed_date?.toISOString(),
        estimatedDuration: task.estimated_duration,
        actualDuration: task.actual_duration,
        cost: task.cost ? Number(task.cost) : undefined,
        notes: task.notes,
        isActive: task.is_active,
        createdAt: task.created_at.toISOString(),
        updatedAt: task.updated_at.toISOString(),
        property: task.property ? {
          id: task.property.id,
          name: task.property.name,
          address: task.property.address,
          city: task.property.city,
          country: task.property.country,
        } : undefined,
        assignedUser: task.assigned_user ? {
          id: task.assigned_user.id,
          firstName: task.assigned_user.firstName,
          lastName: task.assigned_user.lastName,
          email: task.assigned_user.email,
        } : undefined,
        creator: task.creator ? {
          id: task.creator.id,
          firstName: task.creator.firstName,
          lastName: task.creator.lastName,
          email: task.creator.email,
        } : undefined,
        checklistItems: task.checklist_items.map(item => ({
          id: item.id,
          item: item.item,
          completed: item.completed,
          order: item.order,
          createdAt: item.created_at.toISOString(),
        })),
        comments: task.comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          type: comment.type,
          createdAt: comment.created_at.toISOString(),
          user: {
            id: comment.user.id,
            firstName: comment.user.firstName,
            lastName: comment.user.lastName,
            email: comment.user.email,
          },
        })),
        attachments: task.attachments.map(attachment => ({
          id: attachment.id,
          filename: attachment.filename,
          originalName: attachment.original_name,
          filePath: attachment.file_path,
          fileSize: attachment.file_size,
          mimeType: attachment.mime_type,
          createdAt: attachment.created_at.toISOString(),
          uploadedBy: {
            id: attachment.user.id,
            firstName: attachment.user.firstName,
            lastName: attachment.user.lastName,
            email: attachment.user.email,
          },
        })),
        _count: task._count,
      }));

      const pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      };

      logger.info(`Tasks retrieved: ${taskDtos.length} tasks, page ${page}`);
      return TaskService.prototype.success({ data: taskDtos, pagination }, 'Tasks retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving tasks:', error);
      return TaskService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Find task by ID with role-based access control
   */
  public static async findById(currentUser: CurrentUser, id: string): Promise<ServiceResponse<TaskWithDetailsDto>> {
    try {
      const prisma = new PrismaClient();

      // Build where clause based on user role
      let where: any = { id, is_active: true };

      switch (currentUser.role) {
        case 'ADMIN':
        case 'MANAGER':
          // ADMIN and MANAGER can see all tasks
          break;
        
        case 'AGENT':
          // AGENT can see tasks for properties they manage or assigned to them
          where.OR = [
            { assigned_to: currentUser.id },
            { property: { agent_id: currentUser.id } }
          ];
          break;
        
        case 'OWNER':
          // OWNER can see tasks for their properties
          where.property = { owner_id: currentUser.id };
          break;
        
        case 'GUEST':
        default:
          // GUEST cannot see tasks
          await prisma.$disconnect();
          return TaskService.prototype.error('Forbidden', 'GUEST role cannot access tasks', 403);
      }

      const task = await prisma.tasks.findFirst({
        where,
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              country: true,
            }
          },
          assigned_user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          checklist_items: {
            orderBy: { order: 'asc' }
          },
          comments: {
            orderBy: { created_at: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            }
          },
          attachments: {
            orderBy: { created_at: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                }
              }
            }
          },
          _count: {
            select: {
              comments: true,
              checklist_items: true,
              attachments: true,
            }
          }
        }
      });

      await prisma.$disconnect();

      if (!task) {
        return TaskService.prototype.error('Not Found', 'Task not found', 404);
      }

      // Transform to DTO
      const taskDto: TaskWithDetailsDto = {
        id: task.id,
        title: task.title,
        description: task.description,
        type: task.type,
        status: task.status,
        priority: task.priority,
        propertyId: task.property_id,
        assignedTo: task.assigned_to,
        createdBy: task.created_by,
        scheduledDate: task.scheduled_date?.toISOString(),
        completedDate: task.completed_date?.toISOString(),
        estimatedDuration: task.estimated_duration,
        actualDuration: task.actual_duration,
        cost: task.cost ? Number(task.cost) : undefined,
        notes: task.notes,
        isActive: task.is_active,
        createdAt: task.created_at.toISOString(),
        updatedAt: task.updated_at.toISOString(),
        property: task.property ? {
          id: task.property.id,
          name: task.property.name,
          address: task.property.address,
          city: task.property.city,
          country: task.property.country,
        } : undefined,
        assignedUser: task.assigned_user ? {
          id: task.assigned_user.id,
          firstName: task.assigned_user.firstName,
          lastName: task.assigned_user.lastName,
          email: task.assigned_user.email,
        } : undefined,
        creator: task.creator ? {
          id: task.creator.id,
          firstName: task.creator.firstName,
          lastName: task.creator.lastName,
          email: task.creator.email,
        } : undefined,
        checklistItems: task.checklist_items.map(item => ({
          id: item.id,
          item: item.item,
          completed: item.completed,
          order: item.order,
          createdAt: item.created_at.toISOString(),
        })),
        comments: task.comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          type: comment.type,
          createdAt: comment.created_at.toISOString(),
          user: {
            id: comment.user.id,
            firstName: comment.user.firstName,
            lastName: comment.user.lastName,
            email: comment.user.email,
          },
        })),
        attachments: task.attachments.map(attachment => ({
          id: attachment.id,
          filename: attachment.filename,
          originalName: attachment.original_name,
          filePath: attachment.file_path,
          fileSize: attachment.file_size,
          mimeType: attachment.mime_type,
          createdAt: attachment.created_at.toISOString(),
          uploadedBy: {
            id: attachment.user.id,
            firstName: attachment.user.firstName,
            lastName: attachment.user.lastName,
            email: attachment.user.email,
          },
        })),
        _count: task._count,
      };

      logger.info(`Task retrieved: ${task.title}`);
      return TaskService.prototype.success(taskDto, 'Task retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving task:', error);
      return TaskService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Create new task
   */
  public static async create(currentUser: CurrentUser, data: CreateTaskDto): Promise<ServiceResponse<TaskResponseDto>> {
    try {
      const prisma = new PrismaClient();

      // Validate permissions
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.role !== 'AGENT') {
        await prisma.$disconnect();
        return TaskService.prototype.error('Forbidden', 'Only ADMIN, MANAGER, and AGENT can create tasks', 403);
      }

      // Verify property exists
      const property = await prisma.properties.findUnique({
        where: { id: data.propertyId },
      });

      if (!property) {
        await prisma.$disconnect();
        return TaskService.prototype.error('Not Found', 'Property not found', 404);
      }

      // If AGENT, they can only create tasks for properties they manage
      if (currentUser.role === 'AGENT' && property.agent_id !== currentUser.id) {
        await prisma.$disconnect();
        return TaskService.prototype.error('Forbidden', 'AGENT can only create tasks for their managed properties', 403);
      }

      // Verify assigned user exists if provided
      if (data.assignedTo) {
        const assignedUser = await prisma.user.findUnique({
          where: { id: data.assignedTo },
        });

        if (!assignedUser) {
          await prisma.$disconnect();
          return TaskService.prototype.error('Not Found', 'Assigned user not found', 404);
        }
      }

      logger.info(`[Task Creation] Starting task creation: ${data.title}`);

      // Create task in transaction with audit logging
      const result = await prisma.$transaction(async (tx) => {
        logger.info(`[Task Creation Step 1/3] Creating task record...`);
        
        // Create task
        const task = await tx.tasks.create({
          data: {
            title: data.title,
            description: data.description,
            type: data.type,
            priority: data.priority || 'NORMAL',
            property_id: data.propertyId,
            assigned_to: data.assignedTo,
            created_by: currentUser.id,
            scheduled_date: data.scheduledDate ? new Date(data.scheduledDate) : null,
            estimated_duration: data.estimatedDuration,
            cost: data.cost ? new Prisma.Decimal(data.cost) : null,
            notes: data.notes,
          },
        });

        logger.info(`[Task Creation Step 2/3] Creating checklist items...`);

        // Create checklist items if provided
        if (data.checklistItems && data.checklistItems.length > 0) {
          await tx.task_checklist_items.createMany({
            data: data.checklistItems.map((item, index) => ({
              task_id: task.id,
              item: item,
              completed: false,
              order: index,
            })),
          });
        }

        logger.info(`[Task Creation Step 3/3] Creating audit log...`);

        // Create audit log
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.audit_logs.create({
          data: {
            id: auditId,
            user_id: currentUser.id,
            action: 'TASK_CREATED',
            entity_type: 'TASK',
            entity_id: task.id,
            ip_address: '127.0.0.1',
            user_agent: 'Backend-V2-TaskService',
            changes: {
              created_by: currentUser.email,
              task_title: data.title,
              task_type: data.type,
              property_id: data.propertyId,
              assigned_to: data.assignedTo,
              scheduled_date: data.scheduledDate,
              checklist_items_count: data.checklistItems?.length || 0
            }
          }
        });

        logger.info(`[Task Creation END] Task created successfully: ${task.id}`);
        return task;
      });

      await prisma.$disconnect();

      // Return the created task with full details
      const taskResult = await TaskService.findById(currentUser, result.id);
      if (!taskResult.success || !taskResult.data) {
        return TaskService.prototype.error('Error', 'Failed to retrieve created task', 500);
      }

      logger.info(`Task created successfully: ${result.title} by ${currentUser.email}`);
      return TaskService.prototype.success(taskResult.data, 'Task created successfully');
    } catch (error) {
      logger.error('Error creating task:', error);
      return TaskService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Update task
   */
  public static async update(currentUser: CurrentUser, id: string, data: UpdateTaskDto): Promise<ServiceResponse<TaskResponseDto>> {
    try {
      const prisma = new PrismaClient();

      // Check if task exists
      const existingTask = await prisma.tasks.findUnique({
        where: { id },
        include: { property: true }
      });

      if (!existingTask) {
        await prisma.$disconnect();
        return TaskService.prototype.error('Not Found', 'Task not found', 404);
      }

      // Check permissions
      const canEdit = currentUser.role === 'ADMIN' || 
                     currentUser.role === 'MANAGER' || 
                     (currentUser.role === 'AGENT' && existingTask.property.agent_id === currentUser.id) ||
                     (currentUser.role === 'OWNER' && existingTask.property.owner_id === currentUser.id) ||
                     existingTask.assigned_to === currentUser.id;

      if (!canEdit) {
        await prisma.$disconnect();
        return TaskService.prototype.error('Forbidden', 'You do not have permission to edit this task', 403);
      }

      // Verify assigned user exists if changing
      if (data.assignedTo && data.assignedTo !== existingTask.assigned_to) {
        const assignedUser = await prisma.user.findUnique({
          where: { id: data.assignedTo },
        });

        if (!assignedUser) {
          await prisma.$disconnect();
          return TaskService.prototype.error('Not Found', 'Assigned user not found', 404);
        }
      }

      logger.info(`[Task Update] Starting task update: ${existingTask.title}`);

      // Update task in transaction with audit logging
      const result = await prisma.$transaction(async (tx) => {
        logger.info(`[Task Update Step 1/2] Updating task record...`);
        
        // Build update data
        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.priority !== undefined) updateData.priority = data.priority;
        if (data.assignedTo !== undefined) updateData.assigned_to = data.assignedTo;
        if (data.scheduledDate !== undefined) updateData.scheduled_date = data.scheduledDate ? new Date(data.scheduledDate) : null;
        if (data.completedDate !== undefined) updateData.completed_date = data.completedDate ? new Date(data.completedDate) : null;
        if (data.estimatedDuration !== undefined) updateData.estimated_duration = data.estimatedDuration;
        if (data.actualDuration !== undefined) updateData.actual_duration = data.actualDuration;
        if (data.cost !== undefined) updateData.cost = data.cost ? new Prisma.Decimal(data.cost) : null;
        if (data.notes !== undefined) updateData.notes = data.notes;

        // Update task
        const updatedTask = await tx.tasks.update({
          where: { id },
          data: {
            ...updateData,
            updated_at: new Date(),
          },
        });

        logger.info(`[Task Update Step 2/2] Creating audit log...`);

        // Create audit log
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.audit_logs.create({
          data: {
            id: auditId,
            user_id: currentUser.id,
            action: 'TASK_UPDATED',
            entity_type: 'TASK',
            entity_id: id,
            ip_address: '127.0.0.1',
            user_agent: 'Backend-V2-TaskService',
            changes: {
              updated_by: currentUser.email,
              updated_fields: Object.keys(updateData),
              task_title: existingTask.title,
              old_values: updateData,
              new_values: updateData
            }
          }
        });

        logger.info(`[Task Update END] Task updated successfully: ${updatedTask.title}`);
        return updatedTask;
      });

      await prisma.$disconnect();

      // Return the updated task with full details
      const taskResult = await TaskService.findById(currentUser, id);
      if (!taskResult.success || !taskResult.data) {
        return TaskService.prototype.error('Error', 'Failed to retrieve updated task', 500);
      }

      logger.info(`Task updated successfully: ${result.title} by ${currentUser.email}`);
      return TaskService.prototype.success(taskResult.data, 'Task updated successfully');
    } catch (error) {
      logger.error('Error updating task:', error);
      return TaskService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Delete task (soft delete)
   */
  public static async delete(currentUser: CurrentUser, id: string): Promise<ServiceResponse<TaskResponseDto>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Task Deletion] Starting task deletion for ID: ${id}`);

      // Check if task exists
      const existingTask = await prisma.tasks.findUnique({
        where: { id },
        include: { property: true }
      });

      if (!existingTask) {
        await prisma.$disconnect();
        return TaskService.prototype.error('Not Found', 'Task not found', 404);
      }

      // Check permissions - only ADMIN and MANAGER can delete tasks
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        await prisma.$disconnect();
        return TaskService.prototype.error('Forbidden', 'Only ADMIN and MANAGER can delete tasks', 403);
      }

      // Check if task is already deleted
      if (!existingTask.is_active) {
        await prisma.$disconnect();
        return TaskService.prototype.error('Bad Request', 'Task is already deleted', 400);
      }

      // Soft delete task in transaction with audit logging
      const result = await prisma.$transaction(async (tx) => {
        logger.info(`[Task Deletion Step 1/2] Deactivating task...`);
        
        // Soft delete task
        const deletedTask = await tx.tasks.update({
          where: { id },
          data: {
            is_active: false,
          },
        });

        logger.info(`[Task Deletion Step 2/2] Creating audit log...`);

        // Create audit log
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.audit_logs.create({
          data: {
            id: auditId,
            user_id: currentUser.id,
            action: 'TASK_DELETED',
            entity_type: 'TASK',
            entity_id: id,
            ip_address: '127.0.0.1',
            user_agent: 'Backend-V2-TaskService',
            changes: {
              deleted_by: currentUser.email,
              task_title: existingTask.title,
              action: 'deleted',
              reason: 'Task deleted by admin'
            }
          }
        });

        logger.info(`[Task Deletion END] Task deleted successfully: ${deletedTask.title}`);
        return deletedTask;
      });

      await prisma.$disconnect();

      const taskResponse: TaskResponseDto = {
        id: result.id,
        title: result.title,
        description: result.description,
        type: result.type,
        status: result.status,
        priority: result.priority,
        propertyId: result.property_id,
        assignedTo: result.assigned_to,
        createdBy: result.created_by,
        scheduledDate: result.scheduled_date?.toISOString(),
        completedDate: result.completed_date?.toISOString(),
        estimatedDuration: result.estimated_duration,
        actualDuration: result.actual_duration,
        cost: result.cost ? Number(result.cost) : undefined,
        notes: result.notes,
        isActive: result.is_active,
        createdAt: result.created_at.toISOString(),
        updatedAt: result.updated_at.toISOString(),
      };

      logger.info(`Task deleted successfully: ${result.title} by ${currentUser.email}`);
      return TaskService.prototype.success(taskResponse, 'Task deleted successfully');
    } catch (error) {
      logger.error('Error deleting task:', error);
      return TaskService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Get task statistics
   */
  public static async getStats(currentUser: CurrentUser): Promise<ServiceResponse<TaskStatsDto>> {
    try {
      const prisma = new PrismaClient();

      // Build where clause based on user role
      let where: any = { is_active: true };

      switch (currentUser.role) {
        case 'ADMIN':
        case 'MANAGER':
          // ADMIN and MANAGER can see all tasks
          break;
        
        case 'AGENT':
          // AGENT can see tasks for properties they manage or assigned to them
          where.OR = [
            { assigned_to: currentUser.id },
            { property: { agent_id: currentUser.id } }
          ];
          break;
        
        case 'OWNER':
          // OWNER can see tasks for their properties
          where.property = { owner_id: currentUser.id };
          break;
        
        case 'GUEST':
        default:
          // GUEST cannot see tasks
          await prisma.$disconnect();
          return TaskService.prototype.error('Forbidden', 'GUEST role cannot access task statistics', 403);
      }

      // Get statistics
      const [
        totalTasks,
        scheduledTasks,
        inProgressTasks,
        completedTasks,
        cancelledTasks,
        onHoldTasks,
        overdueTasks
      ] = await Promise.all([
        prisma.tasks.count({ where }),
        prisma.tasks.count({ where: { ...where, status: 'SCHEDULED' } }),
        prisma.tasks.count({ where: { ...where, status: 'IN_PROGRESS' } }),
        prisma.tasks.count({ where: { ...where, status: 'COMPLETED' } }),
        prisma.tasks.count({ where: { ...where, status: 'CANCELLED' } }),
        prisma.tasks.count({ where: { ...where, status: 'ON_HOLD' } }),
        prisma.tasks.count({ 
          where: { 
            ...where, 
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
            scheduled_date: { lt: new Date() }
          } 
        })
      ]);

      await prisma.$disconnect();

      const stats: TaskStatsDto = {
        totalTasks,
        scheduledTasks,
        inProgressTasks,
        completedTasks,
        cancelledTasks,
        onHoldTasks,
        overdueTasks
      };

      logger.info(`Task statistics retrieved for user ${currentUser.email}`);
      return TaskService.prototype.success(stats, 'Task statistics retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving task statistics:', error);
      return TaskService.prototype.handleDatabaseError(error);
    }
  }
}
