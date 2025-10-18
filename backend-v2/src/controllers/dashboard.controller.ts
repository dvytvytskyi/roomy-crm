import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DashboardController {
  /**
   * @route   GET /api/v2/dashboard/stats
   * @desc    Get dashboard statistics
   * @access  Private (JWT required)
   */
  public static async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('Dashboard stats endpoint called');
      
      // Start with simple data and add complexity step by step
      
      // Get real data for Unit Statistics
      console.log('Getting total units...');
      const totalUnits = await prisma.properties.count({
        where: { is_active: true }
      });
      console.log('Total units:', totalUnits);

      // For now, let's use a simple calculation for empty units
      // TODO: Implement proper empty units calculation
      const emptyUnits = Math.max(0, totalUnits - 5); // Simple mock for now
      const occupancyRate = totalUnits > 0 ? Math.round(((totalUnits - emptyUnits) / totalUnits) * 100) : 0;

      const dashboardStats = {
        occupancy: {
          totalUnits,
          emptyUnits,
          occupancyRate
        },
        operations: {
          checkInsToday: await prisma.reservations.count({
            where: {
              check_in: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999))
              },
              status: {
                in: ['CONFIRMED', 'CHECKED_IN']
              }
            }
          }),
          checkOutsToday: await prisma.reservations.count({
            where: {
              check_out: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999))
              },
              status: {
                in: ['CONFIRMED', 'CHECKED_OUT']
              }
            }
          }),
          maintenanceInProgress: await prisma.tasks.count({
            where: {
              type: 'MAINTENANCE',
              status: {
                in: ['SCHEDULED', 'IN_PROGRESS']
              },
              is_active: true
            }
          })
        },
        birthdays: {
          today: await DashboardController.getBirthdaysToday(),
          thisWeek: await DashboardController.getBirthdaysThisWeek()
        },
        alerts: {
          dtcmPermitsExpiring: await DashboardController.getDTCMExpiringCount(),
          utilitiesReminders: 0, // TODO: Add utilities field to properties schema
          dtcmExpiringUnits: await DashboardController.getDTCMExpiringUnits(),
          utilitiesPaymentReminders: []
        }
      };

      console.log('Dashboard stats prepared:', JSON.stringify(dashboardStats, null, 2));

      res.status(200).json({
        success: true,
        data: dashboardStats,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('Error getting dashboard stats:', error);
      console.error('Error stack:', error.stack);
      
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve dashboard statistics',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Helper methods for birthday calculations
  private static async getBirthdaysToday(): Promise<{ count: number; details: any[] }> {
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const users = await prisma.User.findMany({
      where: {
        date_of_birth: {
          not: null
        },
        is_active: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        date_of_birth: true
      }
    });

    const todayBirthdays = users.filter(user => {
      if (!user.date_of_birth) return false;
      const userBirthday = user.date_of_birth;
      const userBirthdayStr = `${String(userBirthday.getMonth() + 1).padStart(2, '0')}-${String(userBirthday.getDate()).padStart(2, '0')}`;
      return userBirthdayStr === todayStr;
    });

    return {
      count: todayBirthdays.length,
      details: todayBirthdays.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        birthday: user.date_of_birth
      }))
    };
  }

  private static async getBirthdaysThisWeek(): Promise<{ count: number; details: any[] }> {
    const today = new Date();
    const weekFromNow = new Date(today);
    weekFromNow.setDate(today.getDate() + 7);

    const users = await prisma.User.findMany({
      where: {
        date_of_birth: {
          not: null
        },
        is_active: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        date_of_birth: true
      }
    });

    const weekBirthdays = users.filter(user => {
      if (!user.date_of_birth) return false;
      const userBirthday = new Date(user.date_of_birth);
      userBirthday.setFullYear(today.getFullYear()); // Set to current year
      return userBirthday >= today && userBirthday <= weekFromNow;
    });

    return {
      count: weekBirthdays.length,
      details: weekBirthdays.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        birthday: user.date_of_birth
      }))
    };
  }

  // Helper methods for DTCM alerts
  private static async getDTCMExpiringCount(): Promise<number> {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return await prisma.properties.count({
      where: {
        dtcm_license_expiry: {
          lte: sevenDaysFromNow,
          gte: new Date()
        },
        is_active: true
      }
    });
  }

  private static async getDTCMExpiringUnits(): Promise<string[]> {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringProperties = await prisma.properties.findMany({
      where: {
        dtcm_license_expiry: {
          lte: sevenDaysFromNow,
          gte: new Date()
        },
        is_active: true
      },
      select: {
        id: true,
        name: true,
        dtcm_license_expiry: true
      }
    });

    return expiringProperties.map(prop => 
      `${prop.name} (expires: ${prop.dtcm_license_expiry?.toLocaleDateString('uk-UA')})`
    );
  }
}
