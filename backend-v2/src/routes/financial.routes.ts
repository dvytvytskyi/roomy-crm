import { Router } from 'express';
import { FinancialController } from '../controllers/financial.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All financial routes require authentication
router.use(authenticateToken);

// Financial overview
router.get('/overview', FinancialController.getFinancialOverview);

// Analytics endpoints
router.get('/analytics/kpi-overview', FinancialController.getKPIOverview);
router.get('/analytics/units', FinancialController.getUnitsAnalytics);

// Property-specific financial data
router.get('/property/:propertyId', FinancialController.getPropertyFinancialData);

export default router;
