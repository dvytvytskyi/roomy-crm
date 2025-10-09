import { Router } from 'express';
import { AirbnbController } from '../controllers/airbnb.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/v2/integrations/airbnb/import-from-url
 * @desc    Import property from Airbnb URL
 * @access  Private (JWT required - ADMIN, MANAGER, OWNER)
 * @body    { "url": "https://www.airbnb.com/rooms/...", "ownerId": "user-id", "agentId": "agent-id" (optional) }
 * @return  { success: true, data: { property: PropertyDto, airbnbData: {...} }, message: string }
 */
router.post('/import-from-url', authenticateToken, AirbnbController.importFromUrl);

/**
 * @route   POST /api/v2/integrations/airbnb/validate-url
 * @desc    Validate if a URL is a valid Airbnb listing URL
 * @access  Private (JWT required)
 * @body    { "url": "https://www.airbnb.com/rooms/..." }
 * @return  { success: true, data: { isValid: boolean, listingId: string | null, url: string }, message: string }
 */
router.post('/validate-url', authenticateToken, AirbnbController.validateUrl);

/**
 * @route   POST /api/v2/integrations/airbnb/preview
 * @desc    Preview Airbnb listing data without creating property (ADMIN/MANAGER only)
 * @access  Private (JWT required - ADMIN, MANAGER)
 * @body    { "url": "https://www.airbnb.com/rooms/..." }
 * @return  { success: true, data: AirbnbListingData, message: string }
 */
router.post('/preview', authenticateToken, AirbnbController.preview);

export default router;

