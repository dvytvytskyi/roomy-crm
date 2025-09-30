import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { 
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  updateReservationStatus,
  checkInGuest,
  checkOutGuest,
  markAsNoShow,
  getReservationCalendar,
  getReservationStats,
  getReservationSources,
  getAvailableProperties
} from '../controllers/reservationController';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation schemas
const createReservationValidation = [
  body('propertyId')
    .notEmpty()
    .withMessage('Property ID is required')
    .isString()
    .withMessage('Property ID must be a string'),
  body('guestId')
    .notEmpty()
    .withMessage('Guest ID is required')
    .isString()
    .withMessage('Guest ID must be a string'),
  body('checkIn')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isISO8601()
    .withMessage('Check-in date must be a valid ISO 8601 date'),
  body('checkOut')
    .notEmpty()
    .withMessage('Check-out date is required')
    .isISO8601()
    .withMessage('Check-out date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.checkIn)) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  body('guestCount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Guest count must be a positive integer'),
  body('status')
    .optional()
    .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'MODIFIED'])
    .withMessage('Invalid status'),
  body('paymentStatus')
    .optional()
    .isIn(['UNPAID', 'PARTIALLY_PAID', 'FULLY_PAID', 'REFUNDED', 'PENDING_REFUND'])
    .withMessage('Invalid payment status'),
  body('guestStatus')
    .optional()
    .isIn(['UPCOMING', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW', 'CANCELLED'])
    .withMessage('Invalid guest status'),
  body('source')
    .optional()
    .isIn(['DIRECT', 'AIRBNB', 'BOOKING_COM', 'VRBO', 'OTHER'])
    .withMessage('Invalid source'),
  body('specialRequests')
    .optional()
    .isString()
    .withMessage('Special requests must be a string'),
  body('externalId')
    .optional()
    .isString()
    .withMessage('External ID must be a string'),
  body('paidAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Paid amount must be a non-negative number')
];

const updateReservationValidation = [
  param('id')
    .notEmpty()
    .withMessage('Reservation ID is required')
    .isString()
    .withMessage('Reservation ID must be a string'),
  body('checkIn')
    .optional()
    .isISO8601()
    .withMessage('Check-in date must be a valid ISO 8601 date'),
  body('checkOut')
    .optional()
    .isISO8601()
    .withMessage('Check-out date must be a valid ISO 8601 date'),
  body('guestCount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Guest count must be a positive integer'),
  body('status')
    .optional()
    .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'MODIFIED'])
    .withMessage('Invalid status'),
  body('paymentStatus')
    .optional()
    .isIn(['UNPAID', 'PARTIALLY_PAID', 'FULLY_PAID', 'REFUNDED', 'PENDING_REFUND'])
    .withMessage('Invalid payment status'),
  body('guestStatus')
    .optional()
    .isIn(['UPCOMING', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW', 'CANCELLED'])
    .withMessage('Invalid guest status'),
  body('specialRequests')
    .optional()
    .isString()
    .withMessage('Special requests must be a string'),
  body('paidAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Paid amount must be a non-negative number')
];

const statusUpdateValidation = [
  param('id')
    .notEmpty()
    .withMessage('Reservation ID is required')
    .isString()
    .withMessage('Reservation ID must be a string'),
  body('status')
    .optional()
    .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'MODIFIED'])
    .withMessage('Invalid status'),
  body('paymentStatus')
    .optional()
    .isIn(['UNPAID', 'PARTIALLY_PAID', 'FULLY_PAID', 'REFUNDED', 'PENDING_REFUND'])
    .withMessage('Invalid payment status'),
  body('guestStatus')
    .optional()
    .isIn(['UPCOMING', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW', 'CANCELLED'])
    .withMessage('Invalid guest status')
];

const idValidation = [
  param('id')
    .notEmpty()
    .withMessage('Reservation ID is required')
    .isString()
    .withMessage('Reservation ID must be a string')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const statuses = value.split(',');
        const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'MODIFIED'];
        for (const status of statuses) {
          if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}`);
          }
        }
      }
      return true;
    }),
  query('source')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const sources = value.split(',');
        const validSources = ['DIRECT', 'AIRBNB', 'BOOKING_COM', 'VRBO', 'OTHER'];
        for (const source of sources) {
          if (!validSources.includes(source)) {
            throw new Error(`Invalid source: ${source}`);
          }
        }
      }
      return true;
    }),
  query('checkInFrom')
    .optional()
    .isISO8601()
    .withMessage('Check-in from date must be a valid ISO 8601 date'),
  query('checkInTo')
    .optional()
    .isISO8601()
    .withMessage('Check-in to date must be a valid ISO 8601 date'),
  query('minAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum amount must be a non-negative number'),
  query('maxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum amount must be a non-negative number'),
  query('guestName')
    .optional()
    .isString()
    .withMessage('Guest name must be a string')
];

const calendarQueryValidation = [
  query('propertyId')
    .optional()
    .isString()
    .withMessage('Property ID must be a string'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
];

const availablePropertiesValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('guests')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Guests must be a positive integer')
];

// Routes

/**
 * @route   GET /api/reservations
 * @desc    Get all reservations with optional filters
 * @access  Private (Admin, Manager, Agent)
 */
router.get(
  '/',
  authorize(['ADMIN', 'MANAGER', 'AGENT']),
  queryValidation,
  validateRequest,
  getReservations
);

/**
 * @route   GET /api/reservations/calendar
 * @desc    Get reservation calendar view
 * @access  Private (Admin, Manager, Agent, Owner)
 */
router.get(
  '/calendar',
  authorize(['ADMIN', 'MANAGER', 'AGENT', 'OWNER']),
  calendarQueryValidation,
  validateRequest,
  getReservationCalendar
);

/**
 * @route   GET /api/reservations/stats
 * @desc    Get reservation statistics
 * @access  Private (Admin, Manager, Agent)
 */
router.get(
  '/stats',
  authorize(['ADMIN', 'MANAGER', 'AGENT']),
  calendarQueryValidation,
  validateRequest,
  getReservationStats
);

/**
 * @route   GET /api/reservations/sources
 * @desc    Get reservation sources
 * @access  Private (Admin, Manager, Agent)
 */
router.get(
  '/sources',
  authorize(['ADMIN', 'MANAGER', 'AGENT']),
  getReservationSources
);

/**
 * @route   GET /api/reservations/available-properties
 * @desc    Get available properties for reservation
 * @access  Private (Admin, Manager, Agent)
 */
router.get(
  '/available-properties',
  authorize(['ADMIN', 'MANAGER', 'AGENT']),
  availablePropertiesValidation,
  validateRequest,
  getAvailableProperties
);

/**
 * @route   GET /api/reservations/:id
 * @desc    Get reservation by ID
 * @access  Private (Admin, Manager, Agent, Owner)
 */
router.get(
  '/:id',
  authorize(['ADMIN', 'MANAGER', 'AGENT', 'OWNER']),
  idValidation,
  validateRequest,
  getReservationById
);

/**
 * @route   POST /api/reservations
 * @desc    Create new reservation
 * @access  Private (Admin, Manager, Agent)
 */
router.post(
  '/',
  authorize(['ADMIN', 'MANAGER', 'AGENT']),
  createReservationValidation,
  validateRequest,
  createReservation
);

/**
 * @route   PUT /api/reservations/:id
 * @desc    Update reservation
 * @access  Private (Admin, Manager, Agent)
 */
router.put(
  '/:id',
  authorize(['ADMIN', 'MANAGER', 'AGENT']),
  updateReservationValidation,
  validateRequest,
  updateReservation
);

/**
 * @route   DELETE /api/reservations/:id
 * @desc    Delete/Cancel reservation
 * @access  Private (Admin, Manager, Agent)
 */
router.delete(
  '/:id',
  authorize(['ADMIN', 'MANAGER', 'AGENT']),
  idValidation,
  validateRequest,
  deleteReservation
);

/**
 * @route   PUT /api/reservations/:id/status
 * @desc    Update reservation status
 * @access  Private (Admin, Manager, Agent)
 */
router.put(
  '/:id/status',
  authorize(['ADMIN', 'MANAGER', 'AGENT']),
  statusUpdateValidation,
  validateRequest,
  updateReservationStatus
);

/**
 * @route   PUT /api/reservations/:id/check-in
 * @desc    Check-in guest
 * @access  Private (Admin, Manager, Agent)
 */
router.put(
  '/:id/check-in',
  authorize(['ADMIN', 'MANAGER', 'AGENT']),
  idValidation,
  validateRequest,
  checkInGuest
);

/**
 * @route   PUT /api/reservations/:id/check-out
 * @desc    Check-out guest
 * @access  Private (Admin, Manager, Agent)
 */
router.put(
  '/:id/check-out',
  authorize(['ADMIN', 'MANAGER', 'AGENT']),
  idValidation,
  validateRequest,
  checkOutGuest
);

/**
 * @route   PUT /api/reservations/:id/no-show
 * @desc    Mark as no-show
 * @access  Private (Admin, Manager, Agent)
 */
router.put(
  '/:id/no-show',
  authorize(['ADMIN', 'MANAGER', 'AGENT']),
  idValidation,
  validateRequest,
  markAsNoShow
);

export { router as reservationRoutes };
