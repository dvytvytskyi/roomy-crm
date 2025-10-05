import { PrismaClient, Prisma } from '@prisma/client';
import logger from '../utils/logger';
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
    logger.info(`[Saga START] Confirming reservation ${reservationId}`);
    try {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        logger.info(`[Saga Step 1/7] Validating...`);
        const reservation = await tx.reservations.findUnique({
          where: { id: reservationId },
          include: {
            properties: true,
            users_reservations_guest_idTousers: true,
            users_reservations_agent_idTousers: true
          }
        });

        if (!reservation) {
          throw new Error('Reservation not found');
        }
        
        logger.info(`[Saga Step 1/7] Reservation found. Status: ${reservation.status}`);

        if (reservation.status !== 'PENDING') {
          throw new Error(`Reservation is not in PENDING state. Current status: ${reservation.status}`);
        }

        // Check permissions
        if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.role !== 'AGENT') {
          throw new Error('Insufficient permissions to confirm reservation');
        }

        // If AGENT, check if they manage this reservation
        if (currentUser.role === 'AGENT' && reservation.agent_id !== currentUser.id) {
          throw new Error('Agent can only confirm their own reservations');
        }

        logger.info(`[Saga Step 2/7] Updating status...`);
        const updatedReservation = await tx.reservations.update({
          where: { id: reservationId },
          data: {
            status: 'CONFIRMED',
            updated_at: new Date()
          }
        });

        logger.info(`[Saga Step 3/7] Creating task...`);
        const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const preArrivalCleaningData = {
          id: taskId,
          key: `task_${reservationId}_pre_cleaning`,
          value: {
            type: 'PRE_ARRIVAL_CLEANING',
            reservation_id: reservationId,
            property_id: reservation.property_id,
            status: 'PENDING',
            assigned_to: reservation.agent_id || currentUser.id,
            due_date: new Date(reservation.check_in.getTime() - 24 * 60 * 60 * 1000),
            created_by: currentUser.id,
            description: 'Pre-arrival cleaning and preparation'
          },
          description: 'Pre-arrival cleaning task',
          category: 'TASKS',
          updated_at: new Date()
        };
        
        await tx.system_settings.create({ data: preArrivalCleaningData });

        logger.info(`[Saga Step 4/7] Creating check-in task...`);
        const checkInTaskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const checkInMeetingData = {
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
          category: 'TASKS',
          updated_at: new Date()
        };
        
        await tx.system_settings.create({ data: checkInMeetingData });

        logger.info(`[Saga Step 5/7] Processing financial updates...`);
        if (updatedReservation.paid_amount < updatedReservation.total_amount) {
          const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          const transactionData = {
            id: transactionId,
            transaction_id: `TXN-${Date.now()}`,
            property_id: reservation.property_id,
            reservation_id: reservationId,
            user_id: reservation.guest_id,
            type: 'REVENUE' as const,
            category: 'RESERVATION_PAYMENT',
            amount: updatedReservation.outstanding_balance,
            net_amount: updatedReservation.outstanding_balance,
            currency: 'USD',
            status: 'PENDING' as const,
            description: `Outstanding payment for reservation ${reservation.reservation_id}`,
            created_at: new Date(),
            updated_at: new Date()
          };
          
          await tx.transactions.create({ data: transactionData });
        }

        logger.info(`[Saga Step 6/7] Creating audit log...`);
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const auditData = {
          id: auditId,
          user_id: currentUser.id,
          action: 'RESERVATION_CONFIRMED',
          entity_type: 'RESERVATION',
          entity_id: reservationId,
          ip_address: '127.0.0.1',
          user_agent: 'Backend-V2-Orchestrator'
        };
        
        await tx.audit_logs.create({ data: auditData });

        logger.info(`[Saga END] Transaction successful.`);
        
        const response: ReservationOrchestratorResponse = {
          success: true,
          reservationId: reservationId,
          status: 'CONFIRMED',
          message: 'Reservation confirmed successfully',
          steps: []
        };
        
        return { success: true, data: response, message: 'Reservation confirmed successfully.' };
      });
      await prisma.$disconnect();
      return result;
    } catch (error: any) {
      await prisma.$disconnect();
      logger.error(`[Saga FAILED] Error during reservation confirmation for ${reservationId}:`, {
        message: error.message,
        stack: error.stack,
        // Якщо це помилка Prisma, вона матиме додаткові корисні поля
        code: error.code,
        meta: error.meta,
      });
      // Викидаємо помилку далі, щоб контролер її зловив
      throw new Error('Failed to confirm reservation due to an internal error.'); 
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
    logger.info(`[Saga START] Cancelling reservation ${reservationId}`);
    try {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        logger.info(`[Saga Step 1/5] Validating reservation for cancellation...`);
        const reservation = await tx.reservations.findUnique({
          where: { id: reservationId },
          include: {
            properties: true
          }
        });

        if (!reservation) {
          throw new Error('Reservation not found');
        }

        if (reservation.status === 'CANCELLED') {
          throw new Error('Reservation is already cancelled');
        }

        if (reservation.status === 'CHECKED_OUT') {
          throw new Error('Cannot cancel completed reservation');
        }

        logger.info(`[Saga Step 2/5] Updating reservation status to CANCELLED...`);
        const updatedReservation = await tx.reservations.update({
          where: { id: reservationId },
          data: {
            status: 'CANCELLED',
            notes: reason ? `${reservation.notes || ''}\nCancelled: ${reason}`.trim() : reservation.notes,
            updated_at: new Date()
          }
        });

        logger.info(`[Saga Step 3/5] Cancelling related tasks...`);
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

        logger.info(`[Saga Step 4/5] Processing refunds...`);
        if (reservation.paid_amount > 0) {
          const refundId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          await tx.transactions.create({
            data: {
              id: refundId,
              transaction_id: `REFUND-${Date.now()}`,
              property_id: reservation.property_id,
              reservation_id: reservationId,
              user_id: reservation.guest_id,
              type: 'REFUND' as const,
              category: 'RESERVATION_CANCELLATION',
              amount: -reservation.paid_amount,
              net_amount: -reservation.paid_amount,
              currency: 'USD',
              status: 'PENDING' as const,
              description: `Refund for cancelled reservation ${reservation.reservation_id}`,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
        }

        logger.info(`[Saga Step 5/5] Creating audit log...`);
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.audit_logs.create({
          data: {
            id: auditId,
            user_id: currentUser.id,
            action: 'RESERVATION_CANCELLED',
            entity_type: 'RESERVATION',
            entity_id: reservationId,
            ip_address: '127.0.0.1',
            user_agent: 'Backend-V2-Orchestrator'
          }
        });

        logger.info(`[Saga END] Transaction successful.`);
        
        const response: ReservationOrchestratorResponse = {
          success: true,
          reservationId: reservationId,
          status: 'CANCELLED',
          message: 'Reservation cancelled successfully',
          steps: []
        };
        
        return { success: true, data: response, message: 'Reservation cancelled successfully.' };
      });
      await prisma.$disconnect();
      return result;
    } catch (error: any) {
      await prisma.$disconnect();
      logger.error(`[Saga FAILED] Error during reservation cancellation for ${reservationId}:`, {
        message: error.message,
        stack: error.stack,
        code: error.code,
        meta: error.meta,
      });
      throw new Error('Failed to cancel reservation due to an internal error.'); 
    }
  }

  /**
   * Check-in a reservation
   */
  public static async checkIn(
    currentUser: CurrentUser,
    reservationId: string
  ): Promise<ServiceResponse<ReservationOrchestratorResponse>> {
    const prisma = new PrismaClient();
    logger.info(`[Saga START] Checking in reservation ${reservationId}`);
    try {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        logger.info(`[Saga Step 1/3] Validating reservation for check-in...`);
        const reservation = await tx.reservations.findUnique({
          where: { id: reservationId }
        });

        if (!reservation) {
          throw new Error('Reservation not found');
        }

        if (reservation.status !== 'CONFIRMED') {
          throw new Error(`Reservation must be CONFIRMED to check in. Current status: ${reservation.status}`);
        }

        logger.info(`[Saga Step 2/3] Updating reservation status to CHECKED_IN...`);
        const updatedReservation = await tx.reservations.update({
          where: { id: reservationId },
          data: {
            status: 'CHECKED_IN',
            updated_at: new Date()
          }
        });

        logger.info(`[Saga Step 3/3] Creating audit log...`);
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.audit_logs.create({
          data: {
            id: auditId,
            user_id: currentUser.id,
            action: 'RESERVATION_CHECKED_IN',
            entity_type: 'RESERVATION',
            entity_id: reservationId,
            ip_address: '127.0.0.1',
            user_agent: 'Backend-V2-Orchestrator'
          }
        });

        logger.info(`[Saga END] Transaction successful.`);
        
        const response: ReservationOrchestratorResponse = {
          success: true,
          reservationId: reservationId,
          status: 'CHECKED_IN',
          message: 'Reservation checked in successfully',
          steps: []
        };
        
        return { success: true, data: response, message: 'Reservation checked in successfully.' };
      });
      await prisma.$disconnect();
      return result;
    } catch (error: any) {
      await prisma.$disconnect();
      logger.error(`[Saga FAILED] Error during reservation check-in for ${reservationId}:`, {
        message: error.message,
        stack: error.stack,
        code: error.code,
        meta: error.meta,
      });
      throw new Error('Failed to check in reservation due to an internal error.'); 
    }
  }
}
