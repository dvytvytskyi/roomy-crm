import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ConflictCheckRequest {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  excludeReservationId?: string; // Для випадку оновлення існуючої резервації
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingReservations: Array<{
    id: string;
    checkIn: Date;
    checkOut: Date;
    guestName: string;
    source: string;
    status: string;
  }>;
}

export class ConflictCheckService {
  /**
   * Перевіряє чи є конфлікт дат для нової резервації
   */
  public async checkForConflicts(request: ConflictCheckRequest): Promise<ConflictCheckResult> {
    try {
      const { propertyId, checkIn, checkOut, excludeReservationId } = request;

      console.log(`🔍 Checking conflicts for property ${propertyId} from ${checkIn.toISOString()} to ${checkOut.toISOString()}`);

      // Створюємо умову для виключення резервації при оновленні
      const excludeCondition = excludeReservationId ? { id: { not: excludeReservationId } } : {};

      // Знаходимо всі підтверджені резервації, які перетинаються з новими датами
      const conflictingReservations = await prisma.reservations.findMany({
        where: {
          property_id: propertyId,
          status: {
            in: ['CONFIRMED', 'CHECKED_IN'] // Тільки активні резервації
          },
          ...excludeCondition,
          // Формула перетину дат: (start1 < end2) AND (end1 > start2)
          AND: [
            {
              check_in: {
                lt: checkOut
              }
            },
            {
              check_out: {
                gt: checkIn
              }
            }
          ]
        },
        select: {
          id: true,
          check_in: true,
          check_out: true,
          guest_name: true,
          source: true,
          status: true
        },
        orderBy: {
          check_in: 'asc'
        }
      });

      const hasConflict = conflictingReservations.length > 0;

      const result: ConflictCheckResult = {
        hasConflict,
        conflictingReservations: conflictingReservations.map(reservation => ({
          id: reservation.id,
          checkIn: reservation.check_in,
          checkOut: reservation.check_out,
          guestName: reservation.guest_name || 'Unknown Guest',
          source: reservation.source,
          status: reservation.status
        }))
      };

      if (hasConflict) {
        console.log(`❌ Conflict found: ${conflictingReservations.length} overlapping reservations`);
        conflictingReservations.forEach(conflict => {
          console.log(`  - ${conflict.guest_name} (${conflict.source}) ${conflict.check_in.toISOString().split('T')[0]} to ${conflict.check_out.toISOString().split('T')[0]}`);
        });
      } else {
        console.log(`✅ No conflicts found for the requested dates`);
      }

      return result;
    } catch (error) {
      console.error('❌ Error checking for conflicts:', error);
      throw new Error('Failed to check for conflicts');
    }
  }

  /**
   * Перевіряє доступність квартири в певному періоді
   */
  public async checkAvailability(
    propertyId: string,
    checkIn: Date,
    checkOut: Date,
    excludeReservationId?: string
  ): Promise<boolean> {
    const result = await this.checkForConflicts({
      propertyId,
      checkIn,
      checkOut,
      excludeReservationId
    });

    return !result.hasConflict;
  }

  /**
   * Отримує всі доступні періоди для квартири в межах дат
   */
  public async getAvailablePeriods(
    propertyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ start: Date; end: Date }>> {
    try {
      // Отримуємо всі підтверджені резервації в періоді
      const reservations = await prisma.reservations.findMany({
        where: {
          property_id: propertyId,
          status: {
            in: ['CONFIRMED', 'CHECKED_IN']
          },
          AND: [
            {
              check_in: {
                lt: endDate
              }
            },
            {
              check_out: {
                gt: startDate
              }
            }
          ]
        },
        select: {
          check_in: true,
          check_out: true
        },
        orderBy: {
          check_in: 'asc'
        }
      });

      // Знаходимо доступні періоди між резерваціями
      const availablePeriods: Array<{ start: Date; end: Date }> = [];
      let currentDate = new Date(startDate);

      for (const reservation of reservations) {
        // Якщо поточна дата менше за дату заїзду резервації
        if (currentDate < reservation.check_in) {
          availablePeriods.push({
            start: new Date(currentDate),
            end: new Date(reservation.check_in)
          });
        }
        
        // Переміщуємося на дату виїзду резервації
        currentDate = new Date(reservation.check_out);
      }

      // Додаємо останній доступний період, якщо він є
      if (currentDate < endDate) {
        availablePeriods.push({
          start: new Date(currentDate),
          end: new Date(endDate)
        });
      }

      return availablePeriods;
    } catch (error) {
      console.error('❌ Error getting available periods:', error);
      throw new Error('Failed to get available periods');
    }
  }

  /**
   * Отримує статистику завантаженості квартири
   */
  public async getOccupancyStats(
    propertyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalDays: number;
    occupiedDays: number;
    availableDays: number;
    occupancyRate: number;
  }> {
    try {
      const reservations = await prisma.reservations.findMany({
        where: {
          property_id: propertyId,
          status: {
            in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT']
          },
          AND: [
            {
              check_in: {
                lt: endDate
              }
            },
            {
              check_out: {
                gt: startDate
              }
            }
          ]
        },
        select: {
          check_in: true,
          check_out: true
        }
      });

      // Розраховуємо загальну кількість днів
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Розраховуємо зайняті дні
      let occupiedDays = 0;
      reservations.forEach(reservation => {
        const reservationStart = new Date(Math.max(reservation.check_in.getTime(), startDate.getTime()));
        const reservationEnd = new Date(Math.min(reservation.check_out.getTime(), endDate.getTime()));
        const days = Math.ceil((reservationEnd.getTime() - reservationStart.getTime()) / (1000 * 60 * 60 * 24));
        occupiedDays += Math.max(0, days);
      });

      const availableDays = totalDays - occupiedDays;
      const occupancyRate = totalDays > 0 ? (occupiedDays / totalDays) * 100 : 0;

      return {
        totalDays,
        occupiedDays,
        availableDays,
        occupancyRate: Math.round(occupancyRate * 100) / 100
      };
    } catch (error) {
      console.error('❌ Error getting occupancy stats:', error);
      throw new Error('Failed to get occupancy stats');
    }
  }
}

export const conflictCheckService = new ConflictCheckService();
