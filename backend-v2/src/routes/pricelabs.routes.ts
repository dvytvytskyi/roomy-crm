import { Router } from 'express';
import { PricelabsController } from '../controllers/pricelabs.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/v2/integrations/pricelabs/prices/:id
 * @desc    Get current price for a property from PriceLabs
 * @access  Private (JWT required)
 * @params  id - Property ID
 */
router.get('/prices/:id', authenticateToken, PricelabsController.getCurrentPrice);

export default router;
