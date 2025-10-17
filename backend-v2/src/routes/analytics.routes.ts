import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all analytics routes
router.use(authenticateToken);

// Analytics overview routes
router.get('/overview', AnalyticsController.getAnalyticsOverview);
router.get('/financials', AnalyticsController.getFinancialAnalytics);
router.get('/units', AnalyticsController.getUnitsAnalytics);
router.get('/owners', AnalyticsController.getOwnersAnalytics);
router.get('/reservations', AnalyticsController.getReservationsAnalytics);
router.get('/agents', AnalyticsController.getAgentsAnalytics);

// Reports routes
router.get('/reports', AnalyticsController.getReports);
router.post('/reports/generate', AnalyticsController.generateReport);
router.post('/export', AnalyticsController.exportAnalytics);

export default router;
