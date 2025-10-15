import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, CurrentUser } from '../types/auth.types';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class DashboardController {
  /**
   * @route   GET /api/v2/dashboard/stats
   * @desc    Get dashboard statistics
   * @access  Private (JWT required)
   */
  public static async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser: CurrentUser = req.user!;

      logger.info(`Getting dashboard stats for user ${currentUser.email}`);

      // Get today's date and 7 days from now
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);
      sevenDaysFromNow.setHours(23, 59, 59, 999);

      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      thirtyDaysFromNow.setHours(23, 59, 59, 999);

      // Parallel queries for better performance
      const [
        totalUnits,
        emptyUnits,
        checkInsToday,
        checkOutsToday,
        maintenanceInProgress,
        todayBirthdays,
        weekBirthdays,
        dtcmExpiringSoon,
        utilitiesReminders
      ] = await Promise.all([
        // Total number of units
        prisma.property.count({
          where: { is_active: true }
        }),

        // Empty units (no reservations for more than 7 nights)
        prisma.property.count({
          where: {
            is_active: true,
            reservations: {
              none: {
                OR: [
                  {
                    check_in_date: { lte: sevenDaysFromNow },
                    check_out_date: { gte: today }
                  },
                  {
                    check_in_date: { lte: today },
                    check_out_date: { gte: today }
                  }
                ]
              }
            }
          }
        }),

        // Check-ins today
        prisma.reservation.count({
          where: {
            check_in_date: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            },
            status: { in: ['CONFIRMED', 'CHECKED_IN'] }
          }
        }),

        // Check-outs today
        prisma.reservation.count({
          where: {
            check_out_date: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            },
            status: { in: ['CHECKED_IN', 'CHECKED_OUT'] }
          }
        }),

        // Maintenance tasks in progress
        prisma.task.count({
          where: {
            type: 'MAINTENANCE',
            status: 'IN_PROGRESS',
            is_active: true
          }
        }),

        // Today's birthdays (Staff, Guests, Owners)
        prisma.user.count({
          where: {
            date_of_birth: {
              not: null
            },
            OR: [
              {
                role: 'AGENT',
                date_of_birth: {
                  gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                  lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
                }
              },
              {
                role: 'GUEST',
                date_of_birth: {
                  gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                  lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
                }
              },
              {
                role: 'OWNER',
                date_of_birth: {
                  gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                  lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
                }
              }
            ]
          }
        }),

        // Birthdays within 7 days (Staff, Guests, Owners)
        prisma.user.count({
          where: {
            date_of_birth: {
              not: null
            },
            OR: [
              {
                role: 'AGENT',
                date_of_birth: {
                  gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                  lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
                }
              },
              {
                role: 'GUEST',
                date_of_birth: {
                  gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                  lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
                }
              },
              {
                role: 'OWNER',
                date_of_birth: {
                  gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                  lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
                }
              }
            ]
          }
        }),

        // DTCM permits expiring within 7 days (mock data for now)
        prisma.property.count({
          where: {
            // Mock condition - in real app this would be based on actual permit data
            id: { in: [] } // Empty for now
          }
        }),

        // Utilities payment reminders (mock data for now)
        prisma.property.count({
          where: {
            // Mock condition - in real app this would be based on actual utility data
            id: { in: [] } // Empty for now
          }
        })
      ]);

      // Get detailed birthday information
      const todayBirthdayDetails = await prisma.user.findMany({
        where: {
          date_of_birth: {
            not: null
          },
          OR: [
            {
              role: 'AGENT',
              date_of_birth: {
                gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
              }
            },
            {
              role: 'GUEST',
              date_of_birth: {
                gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
              }
            },
            {
              role: 'OWNER',
              date_of_birth: {
                gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
              }
            }
          ]
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          date_of_birth: true
        }
      });

      const weekBirthdayDetails = await prisma.user.findMany({
        where: {
          date_of_birth: {
            not: null
          },
          OR: [
            {
              role: 'AGENT',
              date_of_birth: {
                gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
              }
            },
            {
              role: 'GUEST',
              date_of_birth: {
                gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
              }
            },
            {
              role: 'OWNER',
              date_of_birth: {
                gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
              }
            }
          ]
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          date_of_birth: true
        }
      });

      const dashboardStats = {
        occupancy: {
          totalUnits,
          emptyUnits,
          occupancyRate: totalUnits > 0 ? Math.round(((totalUnits - emptyUnits) / totalUnits) * 100) : 0
        },
        operations: {
          checkInsToday,
          checkOutsToday,
          maintenanceInProgress
        },
        birthdays: {
          today: {
            count: todayBirthdays,
            details: todayBirthdayDetails
          },
          thisWeek: {
            count: weekBirthdays,
            details: weekBirthdayDetails
          }
        },
        alerts: {
          dtcmPermitsExpiring: dtcmExpiringSoon,
          utilitiesReminders
        }
      };

      await prisma.$disconnect();

      res.status(200).json({
        success: true,
        data: dashboardStats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error getting dashboard stats:', error);
      await prisma.$disconnect();
      
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve dashboard statistics',
        timestamp: new Date().toISOString()
      });
    }
  }
}
