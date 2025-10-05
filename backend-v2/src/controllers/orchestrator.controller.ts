import { Response, NextFunction } from 'express';
import { ReservationOrchestratorService } from '../services/reservation-orchestrator.service';
import { BaseController } from './BaseController';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

export class OrchestratorController extends BaseController {
  /**
   * Confirm a reservation
   * POST /api/v2/orchestrator/reservations/:id/confirm
   */
  public static async confirmReservation(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const reservationId = req.params['id'];
      const currentUser = req.user;

      if (!currentUser) {
        // Повертаємо і одразу виходимо з функції
        return OrchestratorController.validationError(res, ['Authentication required']);
      }

      if (!reservationId) {
        // Повертаємо і одразу виходимо
        return OrchestratorController.validationError(res, ['Reservation ID is required']);
      }

      logger.info(`Orchestrator: Confirming reservation ${reservationId} by user ${currentUser.email}`);

      // Весь виклик сервісу обертаємо в try...catch
      // Це єдине місце, де може виникнути помилка бізнес-логіки
      const result = await ReservationOrchestratorService.confirm(currentUser as any, reservationId);

      // Якщо ми дійшли до цього рядка, значить сервіс виконав свою роботу успішно
      logger.info(`Orchestrator: Service call completed successfully. Sending success response.`);
      OrchestratorController.success(res, result.data, result.message);

    } catch (error: any) {
      // Тут ми ловимо ВСІ помилки, що сталися вище, включаючи помилки з сервісу
      logger.error('Orchestrator Controller caught an error:', { 
        message: error.message, 
        stack: error.stack 
      });
      
      // Перевіряємо, чи це наша кастомна помилка, чи щось інше
      const errorMessage = error.message || 'Internal server error';
      const statusCode = error.statusCode || 500; // Якщо у помилки є статус-код, використовуємо його

      OrchestratorController.error(res, errorMessage, statusCode);
    }
  }

  /**
   * Cancel a reservation
   * POST /api/v2/orchestrator/reservations/:id/cancel
   */
  public static async cancelReservation(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const reservationId = req.params['id'];
      const currentUser = req.user;
      const { reason } = req.body;

      if (!currentUser) {
        return OrchestratorController.validationError(res, ['Authentication required']);
      }

      if (!reservationId) {
        return OrchestratorController.validationError(res, ['Reservation ID is required']);
      }

      logger.info(`Orchestrator: Cancelling reservation ${reservationId} by user ${currentUser.email}`);

      const result = await ReservationOrchestratorService.cancel(currentUser as any, reservationId, reason);

      logger.info(`Orchestrator: Service call completed successfully. Sending success response.`);
      OrchestratorController.success(res, result.data, result.message);

    } catch (error: any) {
      logger.error('Orchestrator Controller caught an error:', { 
        message: error.message, 
        stack: error.stack 
      });
      
      const errorMessage = error.message || 'Internal server error';
      const statusCode = error.statusCode || 500;

      OrchestratorController.error(res, errorMessage, statusCode);
    }
  }

  /**
   * Check-in a reservation
   * POST /api/v2/orchestrator/reservations/:id/checkin
   */
  public static async checkInReservation(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const reservationId = req.params['id'];
      const currentUser = req.user;

      if (!currentUser) {
        return OrchestratorController.validationError(res, ['Authentication required']);
      }

      if (!reservationId) {
        return OrchestratorController.validationError(res, ['Reservation ID is required']);
      }

      logger.info(`Orchestrator: Checking in reservation ${reservationId} by user ${currentUser.email}`);

      const result = await ReservationOrchestratorService.checkIn(currentUser as any, reservationId);

      logger.info(`Orchestrator: Service call completed successfully. Sending success response.`);
      OrchestratorController.success(res, result.data, result.message);

    } catch (error: any) {
      logger.error('Orchestrator Controller caught an error:', { 
        message: error.message, 
        stack: error.stack 
      });
      
      const errorMessage = error.message || 'Internal server error';
      const statusCode = error.statusCode || 500;

      OrchestratorController.error(res, errorMessage, statusCode);
    }
  }

  /**
   * Get orchestrator status for a reservation
   * GET /api/v2/orchestrator/reservations/:id/status
   */
  public static async getReservationStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const reservationId = req.params['id'];
      const currentUser = req.user;

      if (!currentUser) {
        OrchestratorController.validationError(res, ['Authentication required']);
        return;
      }

      if (!reservationId) {
        OrchestratorController.validationError(res, ['Reservation ID is required']);
        return;
      }

      // This would typically fetch the current status and any pending orchestrator operations
      // For now, we'll return a simple status response
      const statusResponse = {
        reservationId,
        orchestratorStatus: 'READY',
        availableActions: ['confirm', 'cancel', 'checkin'],
        lastUpdated: new Date().toISOString()
      };

      OrchestratorController.success(res, statusResponse, 'Orchestrator status retrieved');
    } catch (error) {
      logger.error('Orchestrator Controller Error:', error);
      OrchestratorController.error(res, 'Internal server error', 500);
    }
  }
}
