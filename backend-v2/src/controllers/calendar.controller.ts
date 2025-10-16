import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import icalGenerator from 'ical-generator';

const prisma = new PrismaClient();

export class CalendarController {
  /**
   * Обробляє OPTIONS запити для CORS
   * OPTIONS /api/properties/:propertyId/calendar.ics
   */
  public async handleOptions(req: Request, res: Response): Promise<void> {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).send();
  }

  /**
   * Експортує календар доступності для квартири в форматі iCal
   * GET /api/properties/:propertyId/calendar.ics
   */
  public async exportPropertyCalendar(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;

      console.log(`📅 Exporting calendar for property ${propertyId}`);

      // Перевіряємо, чи існує квартира
      const property = await prisma.properties.findUnique({
        where: { id: propertyId }
      });

      if (!property) {
        res.status(404).json({ error: 'Property not found' });
        return;
      }

      // Отримуємо всі підтверджені резервації для цієї квартири
      const reservations = await prisma.reservations.findMany({
        where: {
          property_id: propertyId,
          status: 'CONFIRMED'
        },
        orderBy: {
          check_in: 'asc'
        }
      });

      console.log(`📊 Found ${reservations.length} confirmed reservations`);

      // Створюємо iCal календар
      const calendar = icalGenerator({
        name: `${property.name} - Availability Calendar`,
        description: `Availability calendar for ${property.name}`,
        prodId: {
          company: 'Roomy Property Management',
          product: 'Calendar Exporter',
          language: 'EN'
        },
        timezone: 'Europe/Kiev'
      });

      // Додаємо кожну резервацію як подію
      reservations.forEach((reservation) => {
        const event = calendar.createEvent({
          id: reservation.external_id || reservation.id,
          start: reservation.check_in,
          end: reservation.check_out,
          summary: `Booked - ${reservation.guest_name || 'Guest'}`,
          description: `Reservation from ${reservation.source}\nGuest: ${reservation.guest_name || 'Unknown'}\nGuests: ${reservation.guests}`,
          status: 'CONFIRMED',
          busyStatus: 'BUSY',
          transparency: 'OPAQUE'
        });

        // Додаємо UID для уникнення дублікатів
        event.uid(reservation.external_id || reservation.id);
      });

      // Якщо немає резервацій, додаємо тестову подію для валідності календаря
      if (reservations.length === 0) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        calendar.createEvent({
          id: 'test-event-' + propertyId,
          start: today,
          end: tomorrow,
          summary: 'Calendar Sync Test',
          description: 'This is a test event to ensure calendar validity. This event will not block any dates.',
          status: 'TENTATIVE',
          busyStatus: 'FREE',
          transparency: 'TRANSPARENT'
        });
      }

      // Встановлюємо заголовки для iCal файлу
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${property.name.replace(/[^a-zA-Z0-9]/g, '_')}_calendar.ics"`);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('ngrok-skip-browser-warning', 'true');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');

      // Відправляємо iCal файл
      const icalString = calendar.toString();
      res.send(icalString);

      console.log(`✅ Calendar exported successfully for property ${propertyId}`);
    } catch (error) {
      console.error('❌ Error exporting calendar:', error);
      res.status(500).json({ 
        error: 'Failed to export calendar',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Оновлює iCal export URL для квартири
   * PUT /api/properties/:propertyId/calendar-url
   */
  public async updateCalendarUrl(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      const { ical_export_url } = req.body;

      console.log(`📝 Updating calendar URL for property ${propertyId}`);

      const property = await prisma.properties.update({
        where: { id: propertyId },
        data: {
          ical_export_url: ical_export_url
        }
      });

      res.json({
        success: true,
        data: property,
        message: 'Calendar URL updated successfully'
      });

      console.log(`✅ Calendar URL updated for property ${propertyId}`);
    } catch (error) {
      console.error('❌ Error updating calendar URL:', error);
      res.status(500).json({ 
        error: 'Failed to update calendar URL',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Додає iCal import URLs для квартири
   * PUT /api/properties/:propertyId/calendar-imports
   */
  public async updateImportUrls(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      const { airbnb_ical_import_url, booking_ical_import_url } = req.body;

      console.log(`📝 Updating import URLs for property ${propertyId}`);

      const property = await prisma.properties.update({
        where: { id: propertyId },
        data: {
          airbnb_ical_import_url: airbnb_ical_import_url || null,
          booking_ical_import_url: booking_ical_import_url || null
        }
      });

      res.json({
        success: true,
        data: property,
        message: 'Import URLs updated successfully'
      });

      console.log(`✅ Import URLs updated for property ${propertyId}`);
    } catch (error) {
      console.error('❌ Error updating import URLs:', error);
      res.status(500).json({ 
        error: 'Failed to update import URLs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Ручний запуск імпорту (для адміністратора)
   * POST /api/calendar/import
   */
  public async manualImport(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔄 Manual calendar import triggered');

      // Імпортуємо з усіх джерел
      const { icalImporterService } = await import('../services/ical-importer.service');
      await icalImporterService.manualImport();

      res.json({
        success: true,
        message: 'Manual import completed successfully'
      });

      console.log('✅ Manual import completed');
    } catch (error) {
      console.error('❌ Error during manual import:', error);
      res.status(500).json({ 
        error: 'Failed to run manual import',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const calendarController = new CalendarController();
