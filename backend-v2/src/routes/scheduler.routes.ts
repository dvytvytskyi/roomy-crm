import { Router } from 'express';
import { SchedulerController } from '../controllers/scheduler.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All scheduler routes require authentication
router.use(authenticateToken);

// Get scheduler events (reservations and manual blocks)
router.get('/events', SchedulerController.getEvents);

// Create manual block
router.post('/blocks', SchedulerController.createBlock);

export default router;
