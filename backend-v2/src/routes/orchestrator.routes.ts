import { Router } from 'express';
import { OrchestratorController } from '../controllers/orchestrator.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All orchestrator routes require authentication
router.use(authenticateToken);

/**
 * @route POST /api/v2/orchestrator/reservations/:id/confirm
 * @desc Confirm a reservation (trigger the saga workflow)
 * @access Private (ADMIN, MANAGER, AGENT)
 */
router.post('/reservations/:id/confirm', OrchestratorController.confirmReservation);

/**
 * @route POST /api/v2/orchestrator/reservations/:id/cancel
 * @desc Cancel a reservation (trigger the cancellation saga workflow)
 * @access Private (ADMIN, MANAGER, AGENT)
 */
router.post('/reservations/:id/cancel', OrchestratorController.cancelReservation);

/**
 * @route GET /api/v2/orchestrator/reservations/:id/status
 * @desc Get orchestrator status for a reservation
 * @access Private (All authenticated users)
 */
router.get('/reservations/:id/status', OrchestratorController.getReservationStatus);

export default router;
