import { Router } from 'express';
import { PricingCalendarController } from '../controllers/pricing-calendar.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route GET /api/v2/calendar/pricing
 * @desc Get bulk pricing data for all properties within date range
 * @access Private (JWT required)
 * @query startDate - Start date (YYYY-MM-DD)
 * @query endDate - End date (YYYY-MM-DD)
 */
router.get('/pricing', authenticateToken, (req, res, next) => PricingCalendarController.getBulkPricing(req, res, next));

export default router;

