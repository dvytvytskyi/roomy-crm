"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservationRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const reservationController_1 = require("../controllers/reservationController");
const validateRequest_1 = require("../middleware/validateRequest");
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const router = (0, express_1.Router)();
exports.reservationRoutes = router;
router.use(authenticate_1.authenticate);
const createReservationValidation = [
    (0, express_validator_1.body)('propertyId')
        .notEmpty()
        .withMessage('Property ID is required')
        .isString()
        .withMessage('Property ID must be a string'),
    (0, express_validator_1.body)('guestId')
        .notEmpty()
        .withMessage('Guest ID is required')
        .isString()
        .withMessage('Guest ID must be a string'),
    (0, express_validator_1.body)('checkIn')
        .notEmpty()
        .withMessage('Check-in date is required')
        .isISO8601()
        .withMessage('Check-in date must be a valid ISO 8601 date'),
    (0, express_validator_1.body)('checkOut')
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
    (0, express_validator_1.body)('guestCount')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Guest count must be a positive integer'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'MODIFIED'])
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('paymentStatus')
        .optional()
        .isIn(['UNPAID', 'PARTIALLY_PAID', 'FULLY_PAID', 'REFUNDED', 'PENDING_REFUND'])
        .withMessage('Invalid payment status'),
    (0, express_validator_1.body)('guestStatus')
        .optional()
        .isIn(['UPCOMING', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW', 'CANCELLED'])
        .withMessage('Invalid guest status'),
    (0, express_validator_1.body)('source')
        .optional()
        .isIn(['DIRECT', 'AIRBNB', 'BOOKING_COM', 'VRBO', 'OTHER'])
        .withMessage('Invalid source'),
    (0, express_validator_1.body)('specialRequests')
        .optional()
        .isString()
        .withMessage('Special requests must be a string'),
    (0, express_validator_1.body)('externalId')
        .optional()
        .isString()
        .withMessage('External ID must be a string'),
    (0, express_validator_1.body)('paidAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Paid amount must be a non-negative number')
];
const updateReservationValidation = [
    (0, express_validator_1.param)('id')
        .notEmpty()
        .withMessage('Reservation ID is required')
        .isString()
        .withMessage('Reservation ID must be a string'),
    (0, express_validator_1.body)('checkIn')
        .optional()
        .isISO8601()
        .withMessage('Check-in date must be a valid ISO 8601 date'),
    (0, express_validator_1.body)('checkOut')
        .optional()
        .isISO8601()
        .withMessage('Check-out date must be a valid ISO 8601 date'),
    (0, express_validator_1.body)('guestCount')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Guest count must be a positive integer'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'MODIFIED'])
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('paymentStatus')
        .optional()
        .isIn(['UNPAID', 'PARTIALLY_PAID', 'FULLY_PAID', 'REFUNDED', 'PENDING_REFUND'])
        .withMessage('Invalid payment status'),
    (0, express_validator_1.body)('guestStatus')
        .optional()
        .isIn(['UPCOMING', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW', 'CANCELLED'])
        .withMessage('Invalid guest status'),
    (0, express_validator_1.body)('specialRequests')
        .optional()
        .isString()
        .withMessage('Special requests must be a string'),
    (0, express_validator_1.body)('paidAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Paid amount must be a non-negative number')
];
const statusUpdateValidation = [
    (0, express_validator_1.param)('id')
        .notEmpty()
        .withMessage('Reservation ID is required')
        .isString()
        .withMessage('Reservation ID must be a string'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'MODIFIED'])
        .withMessage('Invalid status'),
    (0, express_validator_1.body)('paymentStatus')
        .optional()
        .isIn(['UNPAID', 'PARTIALLY_PAID', 'FULLY_PAID', 'REFUNDED', 'PENDING_REFUND'])
        .withMessage('Invalid payment status'),
    (0, express_validator_1.body)('guestStatus')
        .optional()
        .isIn(['UPCOMING', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW', 'CANCELLED'])
        .withMessage('Invalid guest status')
];
const idValidation = [
    (0, express_validator_1.param)('id')
        .notEmpty()
        .withMessage('Reservation ID is required')
        .isString()
        .withMessage('Reservation ID must be a string')
];
const queryValidation = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('status')
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
    (0, express_validator_1.query)('source')
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
    (0, express_validator_1.query)('checkInFrom')
        .optional()
        .isISO8601()
        .withMessage('Check-in from date must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('checkInTo')
        .optional()
        .isISO8601()
        .withMessage('Check-in to date must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('minAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum amount must be a non-negative number'),
    (0, express_validator_1.query)('maxAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum amount must be a non-negative number'),
    (0, express_validator_1.query)('guestName')
        .optional()
        .isString()
        .withMessage('Guest name must be a string')
];
const calendarQueryValidation = [
    (0, express_validator_1.query)('propertyId')
        .optional()
        .isString()
        .withMessage('Property ID must be a string'),
    (0, express_validator_1.query)('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date')
];
const availablePropertiesValidation = [
    (0, express_validator_1.query)('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('guests')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Guests must be a positive integer')
];
router.get('/', (0, authorize_1.authorize)(['ADMIN', 'MANAGER', 'AGENT']), queryValidation, validateRequest_1.validateRequest, reservationController_1.getReservations);
router.get('/calendar', (0, authorize_1.authorize)(['ADMIN', 'MANAGER', 'AGENT', 'OWNER']), calendarQueryValidation, validateRequest_1.validateRequest, reservationController_1.getReservationCalendar);
router.get('/stats', (0, authorize_1.authorize)(['ADMIN', 'MANAGER', 'AGENT']), calendarQueryValidation, validateRequest_1.validateRequest, reservationController_1.getReservationStats);
router.get('/sources', (0, authorize_1.authorize)(['ADMIN', 'MANAGER', 'AGENT']), reservationController_1.getReservationSources);
router.get('/available-properties', (0, authorize_1.authorize)(['ADMIN', 'MANAGER', 'AGENT']), availablePropertiesValidation, validateRequest_1.validateRequest, reservationController_1.getAvailableProperties);
router.get('/:id', (0, authorize_1.authorize)(['ADMIN', 'MANAGER', 'AGENT', 'OWNER']), idValidation, validateRequest_1.validateRequest, reservationController_1.getReservationById);
router.post('/', (0, authorize_1.authorize)(['ADMIN', 'MANAGER', 'AGENT']), createReservationValidation, validateRequest_1.validateRequest, reservationController_1.createReservation);
router.put('/:id', (0, authorize_1.authorize)(['ADMIN', 'MANAGER', 'AGENT']), updateReservationValidation, validateRequest_1.validateRequest, reservationController_1.updateReservation);
router.delete('/:id', (0, authorize_1.authorize)(['ADMIN', 'MANAGER', 'AGENT']), idValidation, validateRequest_1.validateRequest, reservationController_1.deleteReservation);
router.put('/:id/status', (0, authorize_1.authorize)(['ADMIN', 'MANAGER', 'AGENT']), statusUpdateValidation, validateRequest_1.validateRequest, reservationController_1.updateReservationStatus);
router.put('/:id/check-in', (0, authorize_1.authorize)(['ADMIN', 'MANAGER', 'AGENT']), idValidation, validateRequest_1.validateRequest, reservationController_1.checkInGuest);
router.put('/:id/check-out', (0, authorize_1.authorize)(['ADMIN', 'MANAGER', 'AGENT']), idValidation, validateRequest_1.validateRequest, reservationController_1.checkOutGuest);
router.put('/:id/no-show', (0, authorize_1.authorize)(['ADMIN', 'MANAGER', 'AGENT']), idValidation, validateRequest_1.validateRequest, reservationController_1.markAsNoShow);
//# sourceMappingURL=reservationRoutes.js.map