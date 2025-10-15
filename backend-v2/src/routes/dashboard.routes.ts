import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/v2/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private (JWT required)
 */
router.get('/stats', authenticateToken, DashboardController.getDashboardStats);

export default router;
