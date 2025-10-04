/**
 * Task Orchestrator - Automatic Task Creation and Management
 * 
 * Automatically creates and manages tasks based on business events:
 * - Reservation confirmations
 * - Check-in/check-out processes
 * - Property maintenance schedules
 * - Cleaning workflows
 * - Inspection cycles
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

class TaskOrchestrator {
  constructor() {
    this.prisma = new PrismaClient();
    this.taskTemplates = new Map();
    this.setupTaskTemplates();
  }

  /**
   * Setup task templates for different scenarios
   */
  setupTaskTemplates() {
    // Pre-arrival cleaning task template
    this.taskTemplates.set('PRE_ARRIVAL_CLEANING', {
      type: 'CLEANING',
      title: 'Pre-arrival cleaning for {guestName}',
      description: 'Clean property before guest arrival on {checkInDate}',
      priority: 'HIGH',
      cost: 150,
      tags: ['cleaning', 'pre-arrival'],
      scheduledOffset: -24 * 60 * 60 * 1000, // 1 day before
      assigneeRole: 'CLEANER'
    });

    // Post-departure cleaning task template
    this.taskTemplates.set('POST_DEPARTURE_CLEANING', {
      type: 'CLEANING',
      title: 'Post-departure cleaning for {guestName}',
      description: 'Clean property after guest departure on {checkOutDate}',
      priority: 'HIGH',
      cost: 150,
      tags: ['cleaning', 'post-departure'],
      scheduledOffset: 2 * 60 * 60 * 1000, // 2 hours after
      assigneeRole: 'CLEANER'
    });

    // Check-in task template
    this.taskTemplates.set('CHECK_IN', {
      type: 'CHECK_IN',
      title: 'Check-in for {guestName}',
      description: 'Meet guest for check-in at {checkInDate}',
      priority: 'HIGH',
      tags: ['check-in', 'guest-meeting'],
      scheduledOffset: 0,
      assigneeRole: 'AGENT'
    });

    // Check-out task template
    this.taskTemplates.set('CHECK_OUT', {
      type: 'CHECK_OUT',
      title: 'Check-out for {guestName}',
      description: 'Meet guest for check-out at {checkOutDate}',
      priority: 'HIGH',
      tags: ['check-out', 'guest-meeting'],
      scheduledOffset: 0,
      assigneeRole: 'AGENT'
    });

    // Property inspection task template
    this.taskTemplates.set('PROPERTY_INSPECTION', {
      type: 'INSPECTION',
      title: 'Property inspection - {propertyName}',
      description: 'Regular property inspection and maintenance check',
      priority: 'MEDIUM',
      cost: 100,
      tags: ['inspection', 'maintenance'],
      scheduledOffset: 0,
      assigneeRole: 'MAINTENANCE_STAFF'
    });

    // Maintenance task template
    this.taskTemplates.set('MAINTENANCE', {
      type: 'MAINTENANCE',
      title: 'Maintenance - {propertyName}',
      description: 'Scheduled maintenance for {propertyName}',
      priority: 'MEDIUM',
      cost: 200,
      tags: ['maintenance', 'scheduled'],
      scheduledOffset: 0,
      assigneeRole: 'MAINTENANCE_STAFF'
    });
  }

  /**
   * Create tasks for reservation confirmation
   */
  async createReservationTasks(reservation) {
    try {
      const tasks = [];

      // Create pre-arrival cleaning task
      const preCleaningTask = await this.createTaskFromTemplate(
        'PRE_ARRIVAL_CLEANING',
        reservation,
        reservation.property
      );
      if (preCleaningTask.success) {
        tasks.push(preCleaningTask.data);
      }

      // Create check-in task
      const checkInTask = await this.createTaskFromTemplate(
        'CHECK_IN',
        reservation,
        reservation.property
      );
      if (checkInTask.success) {
        tasks.push(checkInTask.data);
      }

      // Create check-out task
      const checkOutTask = await this.createTaskFromTemplate(
        'CHECK_OUT',
        reservation,
        reservation.property
      );
      if (checkOutTask.success) {
        tasks.push(checkOutTask.data);
      }

      // Create post-departure cleaning task
      const postCleaningTask = await this.createTaskFromTemplate(
        'POST_DEPARTURE_CLEANING',
        reservation,
        reservation.property
      );
      if (postCleaningTask.success) {
        tasks.push(postCleaningTask.data);
      }

      logger.info(`Created ${tasks.length} tasks for reservation ${reservation.id}`);
      
      return {
        success: true,
        data: tasks,
        message: `Created ${tasks.length} tasks for reservation`
      };

    } catch (error) {
      logger.error(`Error creating reservation tasks: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create reservation tasks'
      };
    }
  }

  /**
   * Create task from template
   */
  async createTaskFromTemplate(templateName, reservation, property) {
    try {
      const template = this.taskTemplates.get(templateName);
      if (!template) {
        throw new Error(`Task template not found: ${templateName}`);
      }

      // Calculate scheduled date based on offset
      const baseDate = new Date(reservation.checkInDate);
      if (templateName.includes('CHECK_OUT') || templateName.includes('POST_DEPARTURE')) {
        baseDate.setTime(new Date(reservation.checkOutDate).getTime());
      }

      const scheduledDate = new Date(baseDate.getTime() + template.scheduledOffset);

      // Find assignee based on role
      const assignee = await this.findAssigneeByRole(template.assigneeRole, property.id);

      // Replace template variables
      const title = this.replaceVariables(template.title, {
        guestName: reservation.guestName,
        propertyName: property.name,
        checkInDate: new Date(reservation.checkInDate).toLocaleDateString(),
        checkOutDate: new Date(reservation.checkOutDate).toLocaleDateString()
      });

      const description = this.replaceVariables(template.description, {
        guestName: reservation.guestName,
        propertyName: property.name,
        checkInDate: new Date(reservation.checkInDate).toLocaleDateString(),
        checkOutDate: new Date(reservation.checkOutDate).toLocaleDateString()
      });

      // Create the task
      const task = await this.prisma.task.create({
        data: {
          propertyId: property.id,
          reservationId: reservation.id,
          assigneeId: assignee?.id,
          type: template.type,
          title,
          description,
          status: 'PENDING',
          priority: template.priority,
          scheduledDate,
          cost: template.cost,
          estimatedCost: template.cost,
          tags: template.tags
        }
      });

      logger.info(`Created task: ${task.title} (${task.id})`);
      
      return {
        success: true,
        data: task,
        message: 'Task created successfully'
      };

    } catch (error) {
      logger.error(`Error creating task from template: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create task from template'
      };
    }
  }

  /**
   * Find assignee by role
   */
  async findAssigneeByRole(role, propertyId) {
    try {
      // For now, return null (no automatic assignment)
      // In a real implementation, this would:
      // 1. Find users with the specified role
      // 2. Check their availability
      // 3. Consider workload balancing
      // 4. Consider proximity to property
      
      logger.info(`Looking for assignee with role: ${role} for property: ${propertyId}`);
      return null;

    } catch (error) {
      logger.error(`Error finding assignee: ${error.message}`);
      return null;
    }
  }

  /**
   * Replace template variables
   */
  replaceVariables(template, data) {
    let result = template;
    
    Object.keys(data).forEach(key => {
      const placeholder = `{${key}}`;
      const value = data[key] || '';
      result = result.replace(new RegExp(placeholder, 'g'), value);
    });

    return result;
  }

  /**
   * Create scheduled maintenance tasks
   */
  async createScheduledMaintenanceTasks(property, scheduleType = 'monthly') {
    try {
      const tasks = [];

      // Create property inspection task
      const inspectionTask = await this.createMaintenanceTask(
        'PROPERTY_INSPECTION',
        property,
        scheduleType
      );
      if (inspectionTask.success) {
        tasks.push(inspectionTask.data);
      }

      // Create general maintenance task
      const maintenanceTask = await this.createMaintenanceTask(
        'MAINTENANCE',
        property,
        scheduleType
      );
      if (maintenanceTask.success) {
        tasks.push(maintenanceTask.data);
      }

      logger.info(`Created ${tasks.length} scheduled maintenance tasks for property ${property.id}`);
      
      return {
        success: true,
        data: tasks,
        message: `Created ${tasks.length} scheduled maintenance tasks`
      };

    } catch (error) {
      logger.error(`Error creating scheduled maintenance tasks: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create scheduled maintenance tasks'
      };
    }
  }

  /**
   * Create maintenance task
   */
  async createMaintenanceTask(templateName, property, scheduleType) {
    try {
      const template = this.taskTemplates.get(templateName);
      if (!template) {
        throw new Error(`Task template not found: ${templateName}`);
      }

      // Calculate scheduled date based on schedule type
      const scheduledDate = new Date();
      switch (scheduleType) {
        case 'weekly':
          scheduledDate.setDate(scheduledDate.getDate() + 7);
          break;
        case 'monthly':
          scheduledDate.setMonth(scheduledDate.getMonth() + 1);
          break;
        case 'quarterly':
          scheduledDate.setMonth(scheduledDate.getMonth() + 3);
          break;
        default:
          scheduledDate.setDate(scheduledDate.getDate() + 30);
      }

      // Find assignee
      const assignee = await this.findAssigneeByRole(template.assigneeRole, property.id);

      // Replace template variables
      const title = this.replaceVariables(template.title, {
        propertyName: property.name
      });

      const description = this.replaceVariables(template.description, {
        propertyName: property.name
      });

      // Create the task
      const task = await this.prisma.task.create({
        data: {
          propertyId: property.id,
          assigneeId: assignee?.id,
          type: template.type,
          title,
          description,
          status: 'PENDING',
          priority: template.priority,
          scheduledDate,
          cost: template.cost,
          estimatedCost: template.cost,
          tags: template.tags
        }
      });

      logger.info(`Created maintenance task: ${task.title} (${task.id})`);
      
      return {
        success: true,
        data: task,
        message: 'Maintenance task created successfully'
      };

    } catch (error) {
      logger.error(`Error creating maintenance task: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create maintenance task'
      };
    }
  }

  /**
   * Complete task and trigger next actions
   */
  async completeTask(taskId, completionData = {}) {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
        include: {
          property: true,
          reservation: true,
          assignee: true
        }
      });

      if (!task) {
        throw new Error('Task not found');
      }

      if (task.status === 'COMPLETED') {
        throw new Error('Task is already completed');
      }

      // Update task status
      const updatedTask = await this.prisma.task.update({
        where: { id: taskId },
        data: {
          status: 'COMPLETED',
          completedDate: new Date(),
          notes: completionData.notes,
          cost: completionData.actualCost || task.cost
        }
      });

      // Trigger next actions based on task type
      await this.triggerNextActions(task, completionData);

      logger.info(`Task completed: ${task.title} (${task.id})`);
      
      return {
        success: true,
        data: updatedTask,
        message: 'Task completed successfully'
      };

    } catch (error) {
      logger.error(`Error completing task: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to complete task'
      };
    }
  }

  /**
   * Trigger next actions after task completion
   */
  async triggerNextActions(task, completionData) {
    try {
      switch (task.type) {
        case 'CLEANING':
          await this.handleCleaningTaskCompletion(task, completionData);
          break;
        case 'CHECK_IN':
          await this.handleCheckInTaskCompletion(task, completionData);
          break;
        case 'CHECK_OUT':
          await this.handleCheckOutTaskCompletion(task, completionData);
          break;
        case 'INSPECTION':
          await this.handleInspectionTaskCompletion(task, completionData);
          break;
        case 'MAINTENANCE':
          await this.handleMaintenanceTaskCompletion(task, completionData);
          break;
        default:
          logger.info(`No specific actions defined for task type: ${task.type}`);
      }

    } catch (error) {
      logger.error(`Error triggering next actions: ${error.message}`);
    }
  }

  /**
   * Handle cleaning task completion
   */
  async handleCleaningTaskCompletion(task, completionData) {
    logger.info(`Cleaning task completed: ${task.title}`);
    
    // In a real implementation, this might:
    // 1. Update property status
    // 2. Send notification to property manager
    // 3. Schedule next cleaning if needed
    // 4. Update property photos
  }

  /**
   * Handle check-in task completion
   */
  async handleCheckInTaskCompletion(task, completionData) {
    logger.info(`Check-in task completed: ${task.title}`);
    
    // In a real implementation, this might:
    // 1. Update reservation status
    // 2. Send welcome message to guest
    // 3. Activate property amenities
    // 4. Start guest stay tracking
  }

  /**
   * Handle check-out task completion
   */
  async handleCheckOutTaskCompletion(task, completionData) {
    logger.info(`Check-out task completed: ${task.title}`);
    
    // In a real implementation, this might:
    // 1. Update reservation status
    // 2. Send thank you message to guest
    // 3. Deactivate property amenities
    // 4. Schedule post-departure cleaning
  }

  /**
   * Handle inspection task completion
   */
  async handleInspectionTaskCompletion(task, completionData) {
    logger.info(`Inspection task completed: ${task.title}`);
    
    // In a real implementation, this might:
    // 1. Generate inspection report
    // 2. Create maintenance tasks if issues found
    // 3. Update property condition status
    // 4. Notify property owner
  }

  /**
   * Handle maintenance task completion
   */
  async handleMaintenanceTaskCompletion(task, completionData) {
    logger.info(`Maintenance task completed: ${task.title}`);
    
    // In a real implementation, this might:
    // 1. Update property maintenance records
    // 2. Schedule next maintenance
    // 3. Update property condition
    // 4. Notify property owner
  }

  /**
   * Get task statistics
   */
  async getTaskStatistics(propertyId = null, dateRange = {}) {
    try {
      const where = {};
      if (propertyId) where.propertyId = propertyId;
      if (dateRange.startDate) where.createdAt = { ...where.createdAt, gte: new Date(dateRange.startDate) };
      if (dateRange.endDate) where.createdAt = { ...where.createdAt, lte: new Date(dateRange.endDate) };

      const [
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        cancelledTasks
      ] = await Promise.all([
        this.prisma.task.count({ where }),
        this.prisma.task.count({ where: { ...where, status: 'COMPLETED' } }),
        this.prisma.task.count({ where: { ...where, status: 'PENDING' } }),
        this.prisma.task.count({ where: { ...where, status: 'IN_PROGRESS' } }),
        this.prisma.task.count({ where: { ...where, status: 'CANCELLED' } })
      ]);

      const statistics = {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        cancelled: cancelledTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      };

      return {
        success: true,
        data: statistics,
        message: 'Task statistics retrieved successfully'
      };

    } catch (error) {
      logger.error(`Error retrieving task statistics: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve task statistics'
      };
    }
  }
}

// Singleton instance
const taskOrchestrator = new TaskOrchestrator();

module.exports = taskOrchestrator;
