import { PrismaClient } from '@prisma/client';
import ical from 'node-ical';
import cron from 'node-cron';

const prisma = new PrismaClient();

export class ICalImporterService {
  private isRunning = false;

  constructor() {
    // Запускаємо імпорт кожні 5 хвилин
    cron.schedule('*/5 * * * *', () => {
      this.importFromAllSources();
    });
    
    console.log('📅 iCal Importer Service started - will run every 5 minutes');
  }

  /**
   * Імпортує бронювання з усіх налаштованих iCal джерел
   */
  public async importFromAllSources(): Promise<void> {
    if (this.isRunning) {
      console.log('⏳ iCal import already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('🔄 Starting iCal import from all sources...');

    try {
      // Отримуємо всі квартири з налаштованими iCal URLs
      const properties = await prisma.properties.findMany({
        where: {
          OR: [
            { airbnb_ical_import_url: { not: null } },
            { booking_ical_import_url: { not: null } }
          ]
        }
      });

      console.log(`📊 Found ${properties.length} properties with iCal URLs`);

      for (const property of properties) {
        // Імпортуємо з Airbnb
        if (property.airbnb_ical_import_url) {
          await this.importFromICal(
            property.id,
            property.airbnb_ical_import_url,
            'AIRBNB'
          );
        }

        // Імпортуємо з Booking.com
        if (property.booking_ical_import_url) {
          await this.importFromICal(
            property.id,
            property.booking_ical_import_url,
            'BOOKING'
          );
        }
      }

      console.log('✅ iCal import completed successfully');
    } catch (error) {
      console.error('❌ Error during iCal import:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Імпортує бронювання з одного iCal URL
   */
  private async importFromICal(
    propertyId: string,
    icalUrl: string,
    source: 'AIRBNB' | 'BOOKING'
  ): Promise<void> {
    try {
      console.log(`📥 Importing from ${source} for property ${propertyId}`);
      
      // Завантажуємо iCal файл
      const icalData = await this.fetchICalData(icalUrl);
      
      // Парсимо iCal
      const events = ical.parseICS(icalData);
      
      let importedCount = 0;
      let updatedCount = 0;

      for (const [uid, event] of Object.entries(events)) {
        if (event.type === 'VEVENT') {
          const result = await this.processEvent(event, propertyId, source);
          if (result === 'imported') importedCount++;
          if (result === 'updated') updatedCount++;
        }
      }

      console.log(`✅ ${source} import completed: ${importedCount} new, ${updatedCount} updated`);
    } catch (error) {
      console.error(`❌ Error importing from ${source}:`, error);
    }
  }

  /**
   * Обробляє одну подію з iCal файлу
   */
  private async processEvent(
    event: any,
    propertyId: string,
    source: 'AIRBNB' | 'BOOKING'
  ): Promise<'imported' | 'updated' | 'skipped'> {
    try {
      const externalId = event.uid;
      const checkIn = new Date(event.start);
      const checkOut = new Date(event.end);
      
      // Перевіряємо, чи існує вже така резервація
      const existingReservation = await prisma.reservations.findFirst({
        where: {
          external_id: externalId,
          property_id: propertyId
        }
      });

      const reservationData = {
        property_id: propertyId,
        check_in: checkIn,
        check_out: checkOut,
        guests: 1, // Дефолтне значення, можна витягти з опису
        total_amount: 0, // Дефолтне значення
        status: 'CONFIRMED' as const,
        source: source,
        external_id: externalId,
        guest_name: event.summary || `Guest from ${source}`,
        guest_email: null,
        guest_phone: null,
        special_requests: event.description || null,
        notes: `Imported from ${source} iCal`,
        updated_at: new Date()
      };

      if (existingReservation) {
        // Оновлюємо існуючу резервацію
        await prisma.reservations.update({
          where: { id: existingReservation.id },
          data: reservationData
        });
        return 'updated';
      } else {
        // Створюємо нову резервацію
        const reservationId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await prisma.reservations.create({
          data: {
            ...reservationData,
            id: reservationId,
            reservation_id: reservationId,
            created_at: new Date()
          }
        });
        return 'imported';
      }
    } catch (error) {
      console.error(`❌ Error processing event ${event.uid}:`, error);
      return 'skipped';
    }
  }

  /**
   * Завантажує iCal дані з URL
   */
  private async fetchICalData(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Roomy-Calendar-Importer/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error(`❌ Error fetching iCal from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Ручний запуск імпорту (для тестування)
   */
  public async manualImport(): Promise<void> {
    console.log('🔄 Manual iCal import triggered');
    await this.importFromAllSources();
  }
}

// Експортуємо singleton instance
export const icalImporterService = new ICalImporterService();
