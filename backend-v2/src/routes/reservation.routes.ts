import { Router } from 'express';
import { ReservationController } from '../controllers/reservation.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Apply JWT authentication to all reservation routes
router.use(authenticateToken);

/**
 * @route   GET /api/v2/reservations
 * @desc    Get all reservations with role-based access control
 * @access  Private (JWT required)
 * @query   page, limit, search, status, propertyId, guestId, agentId, dateFrom, dateTo
 */
router.get('/', ReservationController.getAllReservations);

/**
 * @route   POST /api/v2/reservations
 * @desc    Create new reservation
 * @access  Private (JWT required) - ADMIN, MANAGER, AGENT can create
 */
router.post('/', ReservationController.createReservation);

/**
 * @route   GET /api/v2/reservations/:id
 * @desc    Get reservation by ID with role-based access control
 * @access  Private (JWT required)
 * @params  id - Reservation ID
 */
router.get('/:id', ReservationController.getReservationById);

/**
 * @route   PUT /api/v2/reservations/:id
 * @desc    Update reservation by ID with role-based access control
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID
 */
router.put('/:id', ReservationController.updateReservation);

export default router;
