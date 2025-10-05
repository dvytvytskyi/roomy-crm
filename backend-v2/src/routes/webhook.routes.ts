import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();

// Payment webhook endpoint
router.post('/payment', WebhookController.paymentWebhook);

// Generic webhook endpoint for future integrations
router.post('/generic', WebhookController.genericWebhook);

export default router;
