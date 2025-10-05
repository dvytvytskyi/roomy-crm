import express from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/v2/settings - Get all settings
router.get('/', SettingsController.getAll);

// GET /api/v2/settings/:key - Get setting by key
router.get('/:key', SettingsController.getByKey);

// PUT /api/v2/settings/:key - Update setting by key
router.put('/:key', SettingsController.updateByKey);

// POST /api/v2/settings/initialize - Initialize default settings
router.post('/initialize', SettingsController.initialize);

export default router;
