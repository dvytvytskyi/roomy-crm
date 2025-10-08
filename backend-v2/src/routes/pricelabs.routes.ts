import { Router } from 'express';
import { PricelabsController } from '../controllers/pricelabs.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/v2/integrations/pricelabs/test
 * @desc    Test endpoint to verify service is working
 * @access  Private (JWT required)
 */
router.get('/test', authenticateToken, PricelabsController.test);

/**
 * @route   GET /api/v2/integrations/pricelabs/debug
 * @desc    Debug endpoint to check API key configuration
 * @access  Private (JWT required)
 */
router.get('/debug', authenticateToken, PricelabsController.debug);


/**
 * @route   GET /api/v2/integrations/pricelabs/prices/:id
 * @desc    Get current price for a property from PriceLabs
 * @access  Private (JWT required)
 * @params  id - PriceLabs listing ID (pricelabId)
 */
router.get('/prices/:id', authenticateToken, PricelabsController.getCurrentPrice);

export default router;
