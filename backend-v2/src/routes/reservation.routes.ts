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
 * @route   GET /api/v2/reservations/stats
 * @desc    Get reservation statistics
 * @access  Private (JWT required) - ADMIN, MANAGER, OWNER, AGENT can access
 */
router.get('/stats', ReservationController.getReservationStats);

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

/**
 * @route   PUT /api/v2/reservations/:id/dates
 * @desc    Update reservation dates with availability check
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID
 */
router.put('/:id/dates', ReservationController.updateReservationDates);

// ============================================
// NOTES MANAGEMENT
// ============================================

/**
 * @route   POST /api/v2/reservations/:id/notes
 * @desc    Add note to reservation
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID
 */
router.post('/:id/notes', ReservationController.addNote);

/**
 * @route   PUT /api/v2/reservations/:id/notes/:noteId
 * @desc    Update reservation note
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID, noteId - Note ID
 */
router.put('/:id/notes/:noteId', ReservationController.updateNote);

/**
 * @route   DELETE /api/v2/reservations/:id/notes/:noteId
 * @desc    Delete reservation note
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID, noteId - Note ID
 */
router.delete('/:id/notes/:noteId', ReservationController.deleteNote);

// ============================================
// PAYMENTS MANAGEMENT
// ============================================

/**
 * @route   POST /api/v2/reservations/:id/payments
 * @desc    Add payment to reservation
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID
 */
router.post('/:id/payments', ReservationController.addPayment);

/**
 * @route   DELETE /api/v2/reservations/:id/payments/:paymentId
 * @desc    Delete payment from reservation
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID, paymentId - Payment ID
 */
router.delete('/:id/payments/:paymentId', ReservationController.deletePayment);

// ============================================
// ADJUSTMENTS MANAGEMENT
// ============================================

/**
 * @route   POST /api/v2/reservations/:id/adjustments
 * @desc    Add adjustment (discount/fee) to reservation
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID
 */
router.post('/:id/adjustments', ReservationController.addAdjustment);

/**
 * @route   DELETE /api/v2/reservations/:id/adjustments/:adjustmentId
 * @desc    Delete adjustment from reservation
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID, adjustmentId - Adjustment ID
 */
router.delete('/:id/adjustments/:adjustmentId', ReservationController.deleteAdjustment);

// ============================================
// COMMUNICATIONS MANAGEMENT
// ============================================

/**
 * @route   POST /api/v2/reservations/:id/communications
 * @desc    Send communication to guest (email/sms)
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID
 */
router.post('/:id/communications', ReservationController.sendCommunication);

/**
 * @route   GET /api/v2/reservations/:id/communications
 * @desc    Get all communications for reservation
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID
 */
router.get('/:id/communications', ReservationController.getCommunications);

// ============================================
// INVOICES MANAGEMENT
// ============================================

/**
 * @route   POST /api/v2/reservations/:id/invoices
 * @desc    Generate invoice for reservation
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID
 */
router.post('/:id/invoices', ReservationController.generateInvoice);

/**
 * @route   GET /api/v2/reservations/:id/invoices
 * @desc    Get all invoices for reservation
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID
 */
router.get('/:id/invoices', ReservationController.getInvoices);

// ============================================
// PRICING MANAGEMENT
// ============================================

/**
 * @route   PUT /api/v2/reservations/:id/pricing
 * @desc    Update reservation pricing
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID
 */
router.put('/:id/pricing', ReservationController.updatePricing);

// ============================================
// STATUS OPERATIONS (using Orchestrator)
// ============================================

/**
 * @route   PUT /api/v2/reservations/:id/confirm
 * @desc    Confirm reservation (creates tasks, sends notifications)
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID
 */
router.put('/:id/confirm', ReservationController.confirmReservation);

/**
 * @route   PUT /api/v2/reservations/:id/cancel
 * @desc    Cancel reservation (handles refunds, cancels tasks)
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID
 */
router.put('/:id/cancel', ReservationController.cancelReservation);

/**
 * @route   PUT /api/v2/reservations/:id/check-in
 * @desc    Check-in guest
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID
 */
router.put('/:id/check-in', ReservationController.checkInReservation);

/**
 * @route   PUT /api/v2/reservations/:id/check-out
 * @desc    Check-out guest
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID
 */
router.put('/:id/check-out', ReservationController.checkOutReservation);

/**
 * @route   PUT /api/v2/reservations/:id/no-show
 * @desc    Mark reservation as no-show
 * @access  Private (JWT required) - RBAC handled in service layer
 * @params  id - Reservation ID
 */
router.put('/:id/no-show', ReservationController.markAsNoShow);

export default router;
