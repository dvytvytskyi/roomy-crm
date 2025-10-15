import { Router } from 'express';
import { PublicController } from '../controllers/public.controller';

const router = Router();

/**
 * PUBLIC ROUTES - No authentication required
 * These endpoints are accessible to anyone and are used by the public website
 * 
 * 🔒 SECURITY: Only safe, non-confidential data is returned
 * 📋 DATA FILTERING: Owner info, financial data, internal notes are excluded
 * ✅ SAFE FOR PUBLIC: Property details, availability, booking requests
 */

/**
 * @route   GET /api/v2/public/properties
 * @desc    Get all active and published properties for public listing
 * @access  Public (no authentication required)
 * @query   page, limit, checkIn, checkOut, minOccupancy, search, type
 * @security Only returns safe data - no owner info, financial details, or internal notes
 */
router.get('/properties', PublicController.getPublicProperties);

/**
 * @route   GET /api/v2/public/properties/:id
 * @desc    Get property details by ID for public view
 * @access  Public (no authentication required)
 * @params  id - Property ID
 * @security Only returns safe data - no owner info, financial details, or internal notes
 */
router.get('/properties/:id', PublicController.getPropertyDetails);

/**
 * @route   GET /api/v2/public/properties/:id/availability
 * @desc    Get property availability calendar
 * @access  Public (no authentication required)
 * @params  id - Property ID
 * @query   startDate, endDate - ISO date strings (YYYY-MM-DD)
 * @security Only returns blocked dates, no reservation details or guest information
 */
router.get('/properties/:id/availability', PublicController.getPropertyAvailability);

/**
 * @route   POST /api/v2/public/reservations/check-availability
 * @desc    Check if property is available for specific dates
 * @access  Public (no authentication required)
 * @body    propertyId, checkIn, checkOut
 * @security Only returns availability status, no personal data
 */
router.post('/reservations/check-availability', PublicController.checkAvailability);

/**
 * @route   POST /api/v2/public/reservations
 * @desc    Create a new reservation (booking request)
 * @access  Public (no authentication required)
 * @body    propertyId, checkIn, checkOut, guestInfo, numberOfGuests, etc.
 * @security Creates guest user if needed, all bookings start as PENDING for review
 */
router.post('/reservations', PublicController.createReservation);

export default router;
