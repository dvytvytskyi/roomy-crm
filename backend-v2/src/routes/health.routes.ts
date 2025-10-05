import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();

// Health check routes (no authentication required)
router.get('/', HealthController.getHealth);
router.get('/detailed', HealthController.getDetailedHealth);
router.get('/sentry-test', HealthController.testSentry);

export default router;
