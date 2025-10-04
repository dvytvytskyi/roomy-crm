import { Request, Response, NextFunction } from 'express';
import { ReservationOrchestratorService } from '../services/reservation-orchestrator.service';
import { BaseController } from './BaseController';
import { AuthenticatedRequest } from '../types/dto';
import { logger } from '../utils/logger';

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
      const reservationId = req.params.id;
      const currentUser = req.user;

      if (!currentUser) {
        OrchestratorController.validationError(res, 'Authentication required');
        return;
      }

      if (!reservationId) {
        OrchestratorController.validationError(res, 'Reservation ID is required');
        return;
      }

      logger.info(`Orchestrator: Confirming reservation ${reservationId} by user ${currentUser.email}`);

      const result = await ReservationOrchestratorService.confirm(currentUser, reservationId);

      if (result && result.success) {
        OrchestratorController.success(res, result.data, result.message);
      } else {
        OrchestratorController.error(res, result?.message || 'Unknown error', result?.statusCode || 500);
      }
    } catch (error) {
      logger.error('Orchestrator Controller Error:', error);
      OrchestratorController.error(res, 'Internal server error', 500);
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
      const reservationId = req.params.id;
      const currentUser = req.user;
      const { reason } = req.body;

      if (!currentUser) {
        OrchestratorController.validationError(res, 'Authentication required');
        return;
      }

      if (!reservationId) {
        OrchestratorController.validationError(res, 'Reservation ID is required');
        return;
      }

      logger.info(`Orchestrator: Cancelling reservation ${reservationId} by user ${currentUser.email}`);

      const result = await ReservationOrchestratorService.cancel(currentUser, reservationId, reason);

      if (result && result.success) {
        OrchestratorController.success(res, result.data, result.message);
      } else {
        OrchestratorController.error(res, result?.message || 'Unknown error', result?.statusCode || 500);
      }
    } catch (error) {
      logger.error('Orchestrator Controller Error:', error);
      OrchestratorController.error(res, 'Internal server error', 500);
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
      const reservationId = req.params.id;
      const currentUser = req.user;

      if (!currentUser) {
        OrchestratorController.validationError(res, 'Authentication required');
        return;
      }

      if (!reservationId) {
        OrchestratorController.validationError(res, 'Reservation ID is required');
        return;
      }

      // This would typically fetch the current status and any pending orchestrator operations
      // For now, we'll return a simple status response
      const statusResponse = {
        reservationId,
        orchestratorStatus: 'READY',
        availableActions: ['confirm', 'cancel'],
        lastUpdated: new Date().toISOString()
      };

      OrchestratorController.success(res, statusResponse, 'Orchestrator status retrieved');
    } catch (error) {
      logger.error('Orchestrator Controller Error:', error);
      OrchestratorController.error(res, 'Internal server error', 500);
    }
  }
}
