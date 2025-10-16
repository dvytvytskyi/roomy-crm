import { Router } from 'express';
import { calendarController } from '../controllers/calendar.controller';

const router = Router();

// Calendar export routes
router.options('/properties/:propertyId/calendar.ics', calendarController.handleOptions.bind(calendarController));
router.get('/properties/:propertyId/calendar.ics', calendarController.exportPropertyCalendar.bind(calendarController));

// Calendar management routes (require authentication in production)
router.put('/properties/:propertyId/calendar-url', calendarController.updateCalendarUrl.bind(calendarController));
router.put('/properties/:propertyId/calendar-imports', calendarController.updateImportUrls.bind(calendarController));

// Manual import trigger (for administrators)
router.post('/import', calendarController.manualImport.bind(calendarController));

export default router;
