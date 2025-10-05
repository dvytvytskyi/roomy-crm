import { PrismaClient, Prisma } from '@prisma/client';
import { BaseService } from './BaseService';
import { ServiceResponse } from '../types';
import { CurrentUser, TaskWithDetailsDto } from '../types/dto';
import logger from '../utils/logger';

export class TaskStateMachineService extends BaseService {
  private static instance: TaskStateMachineService;

  private constructor() {
    super();
  }

  public static getInstance(): TaskStateMachineService {
    if (!TaskStateMachineService.instance) {
      TaskStateMachineService.instance = new TaskStateMachineService();
    }
    return TaskStateMachineService.instance;
  }

  /**
   * Update task status with state machine logic
   */
  public static async updateStatus(
    currentUser: CurrentUser, 
    taskId: string, 
    newStatus: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD',
    notes?: string
  ): Promise<ServiceResponse<TaskWithDetailsDto>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Task State Machine] Starting status update for task ${taskId} to ${newStatus}`);

      // Get current task
      const currentTask = await prisma.tasks.findUnique({
        where: { id: taskId, is_active: true },
        include: {
          property: true,
          assigned_user: true,
          creator: true
        }
      });

      if (!currentTask) {
        await prisma.$disconnect();
        return TaskStateMachineService.prototype.error('Not Found', 'Task not found', 404);
      }

      // Check permissions
      const canUpdate = currentUser.role === 'ADMIN' || 
                       currentUser.role === 'MANAGER' || 
                       (currentUser.role === 'AGENT' && currentTask.property.agent_id === currentUser.id) ||
                       (currentUser.role === 'OWNER' && currentTask.property.owner_id === currentUser.id) ||
                       currentTask.assigned_to === currentUser.id;

      if (!canUpdate) {
        await prisma.$disconnect();
        return TaskStateMachineService.prototype.error('Forbidden', 'You do not have permission to update this task status', 403);
      }

      // Validate state transition
      const isValidTransition = TaskStateMachineService.validateStateTransition(currentTask.status, newStatus);
      if (!isValidTransition) {
        await prisma.$disconnect();
        return TaskStateMachineService.prototype.error('Bad Request', `Invalid state transition from ${currentTask.status} to ${newStatus}`, 400);
      }

      // Execute state transition with side effects
      const result = await prisma.$transaction(async (tx) => {
        logger.info(`[Task State Machine Step 1/4] Validating state transition...`);
        
        // Update task status
        const updateData: any = {
          status: newStatus,
          updated_at: new Date()
        };

        // Add completion date if completing
        if (newStatus === 'COMPLETED') {
          updateData.completed_date = new Date();
        }

        // Clear completion date if moving away from completed
        if (currentTask.status === 'COMPLETED' && newStatus !== 'COMPLETED') {
          updateData.completed_date = null;
        }

        const updatedTask = await tx.tasks.update({
          where: { id: taskId },
          data: updateData,
        });

        logger.info(`[Task State Machine Step 2/4] Executing status-specific logic...`);

        // Execute status-specific logic
        await TaskStateMachineService.executeStatusLogic(tx, currentTask, newStatus, currentUser);

        logger.info(`[Task State Machine Step 3/4] Creating status update comment...`);

        // Create status update comment if notes provided
        if (notes) {
          await tx.task_comments.create({
            data: {
              task_id: taskId,
              user_id: currentUser.id,
              content: `Status changed to ${newStatus}${notes ? `: ${notes}` : ''}`,
              type: 'status_update'
            }
          });
        }

        logger.info(`[Task State Machine Step 4/4] Creating audit log...`);

        // Create audit log
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.audit_logs.create({
          data: {
            id: auditId,
            user_id: currentUser.id,
            action: 'TASK_STATUS_UPDATED',
            entity_type: 'TASK',
            entity_id: taskId,
            ip_address: '127.0.0.1',
            user_agent: 'Backend-V2-TaskStateMachineService',
            changes: {
              updated_by: currentUser.email,
              old_status: currentTask.status,
              new_status: newStatus,
              task_title: currentTask.title,
              notes: notes || null
            }
          }
        });

        logger.info(`[Task State Machine END] Status updated successfully: ${currentTask.title} -> ${newStatus}`);
        return updatedTask;
      });

      await prisma.$disconnect();

      // Return the updated task with full details
      const taskResult = await prisma.tasks.findUnique({
        where: { id: taskId },
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

      if (!taskResult) {
        return TaskStateMachineService.prototype.error('Error', 'Failed to retrieve updated task', 500);
      }

      // Transform to DTO
      const taskDto: TaskWithDetailsDto = {
        id: taskResult.id,
        title: taskResult.title,
        description: taskResult.description,
        type: taskResult.type,
        status: taskResult.status,
        priority: taskResult.priority,
        propertyId: taskResult.property_id,
        assignedTo: taskResult.assigned_to,
        createdBy: taskResult.created_by,
        scheduledDate: taskResult.scheduled_date?.toISOString(),
        completedDate: taskResult.completed_date?.toISOString(),
        estimatedDuration: taskResult.estimated_duration,
        actualDuration: taskResult.actual_duration,
        cost: taskResult.cost ? Number(taskResult.cost) : undefined,
        notes: taskResult.notes,
        isActive: taskResult.is_active,
        createdAt: taskResult.created_at.toISOString(),
        updatedAt: taskResult.updated_at.toISOString(),
        property: taskResult.property ? {
          id: taskResult.property.id,
          name: taskResult.property.name,
          address: taskResult.property.address,
          city: taskResult.property.city,
          country: taskResult.property.country,
        } : undefined,
        assignedUser: taskResult.assigned_user ? {
          id: taskResult.assigned_user.id,
          firstName: taskResult.assigned_user.firstName,
          lastName: taskResult.assigned_user.lastName,
          email: taskResult.assigned_user.email,
        } : undefined,
        creator: taskResult.creator ? {
          id: taskResult.creator.id,
          firstName: taskResult.creator.firstName,
          lastName: taskResult.creator.lastName,
          email: taskResult.creator.email,
        } : undefined,
        checklistItems: taskResult.checklist_items.map(item => ({
          id: item.id,
          item: item.item,
          completed: item.completed,
          order: item.order,
          createdAt: item.created_at.toISOString(),
        })),
        comments: taskResult.comments.map(comment => ({
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
        attachments: taskResult.attachments.map(attachment => ({
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
        _count: taskResult._count,
      };

      logger.info(`Task status updated successfully: ${result.title} -> ${newStatus} by ${currentUser.email}`);
      return TaskStateMachineService.prototype.success(taskDto, 'Task status updated successfully');
    } catch (error) {
      logger.error('Error updating task status:', error);
      return TaskStateMachineService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Validate state transition
   */
  private static validateStateTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: { [key: string]: string[] } = {
      'SCHEDULED': ['IN_PROGRESS', 'CANCELLED', 'ON_HOLD'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELLED', 'ON_HOLD'],
      'COMPLETED': ['IN_PROGRESS', 'CANCELLED'], // Allow reopening completed tasks
      'CANCELLED': ['SCHEDULED'], // Allow rescheduling cancelled tasks
      'ON_HOLD': ['IN_PROGRESS', 'CANCELLED', 'SCHEDULED']
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Execute status-specific logic and side effects
   */
  private static async executeStatusLogic(
    tx: Prisma.TransactionClient,
    task: any,
    newStatus: string,
    currentUser: CurrentUser
  ): Promise<void> {
    switch (newStatus) {
      case 'COMPLETED':
        // When a cleaning task is completed, update property readiness
        if (task.type === 'CLEANING') {
          logger.info(`[Status Logic] Updating property readiness for cleaning completion`);
          
          // Update property isReadyForCheckIn flag
          await tx.properties.update({
            where: { id: task.property_id },
            data: { 
              // Note: isReadyForCheckIn doesn't exist in current schema
              // This would need to be added to the properties table
              // For now, we'll log this requirement
            }
          });

          // Check if all cleaning tasks for this property are completed
          const pendingCleaningTasks = await tx.tasks.count({
            where: {
              property_id: task.property_id,
              type: 'CLEANING',
              status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
              is_active: true
            }
          });

          if (pendingCleaningTasks === 0) {
            logger.info(`[Status Logic] All cleaning tasks completed for property ${task.property_id}`);
            // Could trigger property ready for check-in notification
          }
        }
        break;

      case 'IN_PROGRESS':
        // When a task starts, could trigger notifications or updates
        if (task.type === 'MAINTENANCE') {
          logger.info(`[Status Logic] Maintenance task started - could trigger property unavailable status`);
          // Could update property availability or send notifications
        }
        break;

      case 'CANCELLED':
        // When a task is cancelled, could trigger rescheduling or notifications
        logger.info(`[Status Logic] Task cancelled - could trigger rescheduling logic`);
        break;

      case 'ON_HOLD':
        // When a task is put on hold, could trigger notifications
        logger.info(`[Status Logic] Task put on hold - could trigger stakeholder notifications`);
        break;

      default:
        logger.info(`[Status Logic] No specific logic for status: ${newStatus}`);
        break;
    }
  }
}
