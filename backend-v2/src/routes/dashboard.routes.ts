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

/**
 * @route   GET /api/v2/dashboard/test
 * @desc    Test endpoint without auth
 * @access  Public
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Dashboard test endpoint works!' });
});

/**
 * @route   GET /api/v2/dashboard/test-auth
 * @desc    Test endpoint with auth
 * @access  Private (JWT required)
 */
router.get('/test-auth', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Dashboard test auth endpoint works!',
    user: req.user?.email 
  });
});

export default router;
