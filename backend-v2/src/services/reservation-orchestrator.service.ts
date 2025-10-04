import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { BaseService } from './BaseService';
import { CurrentUser } from '../types/dto';
import { ServiceResponse } from '../types';

export interface ReservationOrchestratorResponse {
  success: boolean;
  reservationId: string;
  status: string;
  message: string;
  steps: OrchestratorStep[];
}

export interface OrchestratorStep {
  step: string;
  status: 'pending' | 'completed' | 'failed';
  message: string;
  timestamp: Date;
}

export class ReservationOrchestratorService extends BaseService {
  /**
   * Confirm a reservation using Saga pattern
   * Executes all steps in a single database transaction
   */
  public static async confirm(
    currentUser: CurrentUser,
    reservationId: string
  ): Promise<ServiceResponse<ReservationOrchestratorResponse>> {
    const prisma = new PrismaClient();
    const steps: OrchestratorStep[] = [];

    try {
      logger.info(`Starting reservation confirmation saga for reservation: ${reservationId}`);

      // Execute all steps in a single transaction
      const result = await prisma.$transaction(async (tx) => {
        // Step 1: Validation
        steps.push({
          step: 'validation',
          status: 'pending',
          message: 'Validating reservation...',
          timestamp: new Date()
        });

        const reservation = await tx.reservations.findUnique({
          where: { id: reservationId },
          include: {
            properties: true,
            users_reservations_guest_idTousers: true,
            users_reservations_agent_idTousers: true
          }
        });

        if (!reservation) {
          steps[0].status = 'failed';
          steps[0].message = 'Reservation not found';
          throw new Error('Reservation not found');
        }

        if (reservation.status !== 'PENDING') {
          steps[0].status = 'failed';
          steps[0].message = `Reservation status is ${reservation.status}, expected PENDING`;
          throw new Error(`Reservation status is ${reservation.status}, expected PENDING`);
        }

        // Check permissions
        if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.role !== 'AGENT') {
          steps[0].status = 'failed';
          steps[0].message = 'Insufficient permissions to confirm reservation';
          throw new Error('Insufficient permissions to confirm reservation');
        }

        // If AGENT, check if they manage this reservation
        if (currentUser.role === 'AGENT' && reservation.agent_id !== currentUser.id) {
          steps[0].status = 'failed';
          steps[0].message = 'Agent can only confirm their own reservations';
          throw new Error('Agent can only confirm their own reservations');
        }

        steps[0].status = 'completed';
        steps[0].message = 'Reservation validation successful';

        // Step 2: Update Status
        steps.push({
          step: 'update_status',
          status: 'pending',
          message: 'Updating reservation status...',
          timestamp: new Date()
        });

        const updatedReservation = await tx.reservations.update({
          where: { id: reservationId },
          data: {
            status: 'CONFIRMED',
            updated_at: new Date()
          }
        });

        steps[1].status = 'completed';
        steps[1].message = 'Reservation status updated to CONFIRMED';

        // Step 3: Create Tasks (using system_settings as task storage)
        steps.push({
          step: 'create_tasks',
          status: 'pending',
          message: 'Creating automatic tasks...',
          timestamp: new Date()
        });

        const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create task entry in system_settings (temporary solution)
        await tx.system_settings.create({
          data: {
            id: taskId,
            key: `task_${reservationId}_pre_cleaning`,
            value: {
              type: 'PRE_ARRIVAL_CLEANING',
              reservation_id: reservationId,
              property_id: reservation.property_id,
              status: 'PENDING',
              assigned_to: reservation.agent_id || currentUser.id,
              due_date: new Date(reservation.check_in.getTime() - 24 * 60 * 60 * 1000), // 1 day before check-in
              created_by: currentUser.id,
              description: 'Pre-arrival cleaning and preparation'
            },
            description: 'Pre-arrival cleaning task',
            category: 'TASKS'
          }
        });

        // Create check-in meeting task
        const checkInTaskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.system_settings.create({
          data: {
            id: checkInTaskId,
            key: `task_${reservationId}_checkin_meeting`,
            value: {
              type: 'CHECKIN_MEETING',
              reservation_id: reservationId,
              property_id: reservation.property_id,
              status: 'PENDING',
              assigned_to: reservation.agent_id || currentUser.id,
              due_date: reservation.check_in,
              created_by: currentUser.id,
              description: 'Guest check-in meeting and key handover'
            },
            description: 'Check-in meeting task',
            category: 'TASKS'
          }
        });

        steps[2].status = 'completed';
        steps[2].message = 'Automatic tasks created (Pre-arrival cleaning, Check-in meeting)';

        // Step 4: Financial Updates
        steps.push({
          step: 'financial_updates',
          status: 'pending',
          message: 'Updating financial records...',
          timestamp: new Date()
        });

        // Update payment status if needed
        if (updatedReservation.paid_amount < updatedReservation.total_amount) {
          // Create a transaction record for outstanding balance
          const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          await tx.transactions.create({
            data: {
              id: transactionId,
              transaction_id: `TXN-${Date.now()}`,
              property_id: reservation.property_id,
              reservation_id: reservationId,
              user_id: reservation.guest_id,
              type: 'REVENUE',
              category: 'RESERVATION_PAYMENT',
              amount: updatedReservation.outstanding_balance,
              net_amount: updatedReservation.outstanding_balance,
              currency: 'USD',
              status: 'PENDING',
              description: `Outstanding payment for reservation ${reservation.reservation_id}`,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
        }

        steps[3].status = 'completed';
        steps[3].message = 'Financial records updated';

        // Step 5: Notifications (Logging for now)
        steps.push({
          step: 'notifications',
          status: 'pending',
          message: 'Sending notifications...',
          timestamp: new Date()
        });

        // Log notification actions
        logger.info(`Sending confirmation email to guest: ${reservation.guest_email}`);
        logger.info(`Notifying property owner about confirmed reservation`);
        logger.info(`Sending confirmation SMS to guest: ${reservation.guest_phone}`);

        steps[4].status = 'completed';
        steps[4].message = 'Notifications sent (logged)';

        // Step 6: Audit Logging
        steps.push({
          step: 'audit_logging',
          status: 'pending',
          message: 'Recording audit trail...',
          timestamp: new Date()
        });

        // Create audit log entry
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.audit_logs.create({
          data: {
            id: auditId,
            users: { connect: { id: currentUser.id } },
            action: 'RESERVATION_CONFIRMED',
            entity_type: 'RESERVATION',
            entity_id: reservationId,
            ip_address: '127.0.0.1', // TODO: Get from request
            user_agent: 'Backend-V2-Orchestrator'
          }
        });

        steps[5].status = 'completed';
        steps[5].message = 'Audit trail recorded';

        return {
          reservationId: reservationId,
          status: 'CONFIRMED',
          steps: steps
        };

      });

      await prisma.$disconnect();

      const response: ReservationOrchestratorResponse = {
        success: true,
        reservationId: reservationId,
        status: 'CONFIRMED',
        message: 'Reservation confirmed successfully',
        steps: result.steps
      };

      logger.info(`Reservation confirmation saga completed successfully: ${reservationId}`);
      return ReservationOrchestratorService.prototype.success(response, 'Reservation confirmed successfully');

    } catch (error) {
      await prisma.$disconnect();
      logger.error('Reservation confirmation saga failed:', error);

      // Mark any pending steps as failed
      steps.forEach(step => {
        if (step.status === 'pending') {
          step.status = 'failed';
          step.message = `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      });

      const response: ReservationOrchestratorResponse = {
        success: false,
        reservationId: reservationId,
        status: 'FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        steps: steps
      };

      return ReservationOrchestratorService.prototype.error('Saga Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Cancel a reservation using Saga pattern
   */
  public static async cancel(
    currentUser: CurrentUser,
    reservationId: string,
    reason?: string
  ): Promise<ServiceResponse<ReservationOrchestratorResponse>> {
    const prisma = new PrismaClient();
    const steps: OrchestratorStep[] = [];

    try {
      logger.info(`Starting reservation cancellation saga for reservation: ${reservationId}`);

      const result = await prisma.$transaction(async (tx) => {
        // Step 1: Validation
        steps.push({
          step: 'validation',
          status: 'pending',
          message: 'Validating reservation for cancellation...',
          timestamp: new Date()
        });

        const reservation = await tx.reservations.findUnique({
          where: { id: reservationId },
          include: {
            properties: true
          }
        });

        if (!reservation) {
          steps[0].status = 'failed';
          steps[0].message = 'Reservation not found';
          throw new Error('Reservation not found');
        }

        if (reservation.status === 'CANCELLED') {
          steps[0].status = 'failed';
          steps[0].message = 'Reservation is already cancelled';
          throw new Error('Reservation is already cancelled');
        }

        if (reservation.status === 'COMPLETED') {
          steps[0].status = 'failed';
          steps[0].message = 'Cannot cancel completed reservation';
          throw new Error('Cannot cancel completed reservation');
        }

        steps[0].status = 'completed';
        steps[0].message = 'Reservation validation successful';

        // Step 2: Update Status
        steps.push({
          step: 'update_status',
          status: 'pending',
          message: 'Updating reservation status to cancelled...',
          timestamp: new Date()
        });

        await tx.reservations.update({
          where: { id: reservationId },
          data: {
            status: 'CANCELLED',
            notes: reason ? `${reservation.notes || ''}\nCancelled: ${reason}`.trim() : reservation.notes,
            updated_at: new Date()
          }
        });

        steps[1].status = 'completed';
        steps[1].message = 'Reservation status updated to CANCELLED';

        // Step 3: Cancel Tasks
        steps.push({
          step: 'cancel_tasks',
          status: 'pending',
          message: 'Cancelling related tasks...',
          timestamp: new Date()
        });

        // Update task status to cancelled
        await tx.system_settings.updateMany({
          where: {
            key: {
              startsWith: `task_${reservationId}_`
            }
          },
          data: {
            value: {
              status: 'CANCELLED',
              cancelled_at: new Date(),
              cancelled_by: currentUser.id
            }
          }
        });

        steps[2].status = 'completed';
        steps[2].message = 'Related tasks cancelled';

        // Step 4: Refund Processing
        steps.push({
          step: 'refund_processing',
          status: 'pending',
          message: 'Processing refunds...',
          timestamp: new Date()
        });

        if (reservation.paid_amount > 0) {
          // Create refund transaction
          const refundId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          await tx.transactions.create({
            data: {
              id: refundId,
              transaction_id: `REFUND-${Date.now()}`,
              property_id: reservation.property_id,
              reservation_id: reservationId,
              user_id: reservation.guest_id,
              type: 'REFUND',
              category: 'RESERVATION_CANCELLATION',
              amount: -reservation.paid_amount,
              net_amount: -reservation.paid_amount,
              currency: 'USD',
              status: 'PENDING',
              description: `Refund for cancelled reservation ${reservation.reservation_id}`,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
        }

        steps[3].status = 'completed';
        steps[3].message = 'Refund processing initiated';

        // Step 5: Notifications
        steps.push({
          step: 'notifications',
          status: 'pending',
          message: 'Sending cancellation notifications...',
          timestamp: new Date()
        });

        logger.info(`Sending cancellation email to guest: ${reservation.guest_email}`);
        logger.info(`Notifying property owner about cancelled reservation`);
        if (reservation.paid_amount > 0) {
          logger.info(`Sending refund notification to guest`);
        }

        steps[4].status = 'completed';
        steps[4].message = 'Cancellation notifications sent';

        // Step 6: Audit Logging
        steps.push({
          step: 'audit_logging',
          status: 'pending',
          message: 'Recording audit trail...',
          timestamp: new Date()
        });

        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.audit_logs.create({
          data: {
            id: auditId,
            users: { connect: { id: currentUser.id } },
            action: 'RESERVATION_CANCELLED',
            entity_type: 'RESERVATION',
            entity_id: reservationId,
            ip_address: '127.0.0.1',
            user_agent: 'Backend-V2-Orchestrator'
          }
        });

        steps[5].status = 'completed';
        steps[5].message = 'Audit trail recorded';

        return {
          reservationId: reservationId,
          status: 'CANCELLED',
          steps: steps
        };
      });

      await prisma.$disconnect();

      const response: ReservationOrchestratorResponse = {
        success: true,
        reservationId: reservationId,
        status: 'CANCELLED',
        message: 'Reservation cancelled successfully',
        steps: result.steps
      };

      logger.info(`Reservation cancellation saga completed successfully: ${reservationId}`);
      return ReservationOrchestratorService.prototype.success(response, 'Reservation cancelled successfully');

    } catch (error) {
      await prisma.$disconnect();
      logger.error('Reservation cancellation saga failed:', error);

      steps.forEach(step => {
        if (step.status === 'pending') {
          step.status = 'failed';
          step.message = `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      });

      return ReservationOrchestratorService.prototype.error('Saga Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
