import { PrismaClient } from '@prisma/client';
import { CurrentUser } from '../types';
import logger from '../utils/logger';

export interface AnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  period?: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  propertyId?: string;
  viewMode?: 'chart' | 'table';
  dataType?: string;
  format?: 'csv' | 'pdf' | 'excel';
}

export interface AnalyticsOverview {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  occupancyRate: number;
  totalUnits: number;
  activeReservations: number;
  averageStayDuration: number;
  revenueGrowth: number;
  expenseGrowth: number;
  profitGrowth: number;
  occupancyGrowth: number;
}

export interface FinancialAnalytics {
  revenue: {
    total: number;
    byUnit: Array<{
      unit: string;
      revenue: number;
      percentage: number;
    }>;
    bySource: Array<{
      source: string;
      revenue: number;
      percentage: number;
    }>;
    trends: Array<{
      month: string;
      revenue: number;
    }>;
  };
  expenses: {
    total: number;
    categories: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    byUnit: Array<{
      unit: string;
      expenses: number;
    }>;
  };
  profit: {
    net: number;
    byUnit: Array<{
      unit: string;
      profit: number;
      margin: number;
    }>;
  };
}

export interface UnitAnalytics {
  performance: Array<{
    unit: string;
    revenue: number;
    expenses: number;
    profit: number;
    occupancyRate: number;
    revenuePerNight: number;
    totalNights: number;
    avgStayDuration: number;
  }>;
}

export interface OwnerAnalytics {
  profitability: Array<{
    owner: string;
    units: string[];
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    unitsCount: number;
    avgRevenuePerUnit: number;
  }>;
}

export interface ReservationAnalytics {
  trends: {
    monthly: Array<{
      month: string;
      reservations: number;
      cancellations: number;
      net: number;
    }>;
  };
  status: {
    confirmed: number;
    pending: number;
    cancelled: number;
    completed: number;
    total: number;
    cancellationRate: number;
    confirmationRate: number;
  };
}

export interface AgentAnalytics {
  performance: Array<{
    agent: string;
    unitsReferred: number;
    totalRevenue: number;
    totalPayouts: number;
    commissionRate: number;
    avgRevenuePerUnit: number;
    lastReferral: string;
    status: string;
  }>;
}

export interface AnalyticsReport {
  id: number;
  name: string;
  description: string;
  type: string;
  lastGenerated: string;
  frequency: string;
  recipients: string[];
}

export class AnalyticsService {
  /**
   * Get analytics overview
   */
  public static async getAnalyticsOverview(currentUser: CurrentUser, filters: AnalyticsFilters): Promise<AnalyticsOverview> {
    try {
      logger.info('Getting analytics overview with filters:', filters);
      const prisma = new PrismaClient();

      // Build where clause
      const where: any = {
        userId: currentUser.userId
      };

      if (filters.dateFrom && filters.dateTo) {
        where.createdAt = {
          gte: new Date(filters.dateFrom),
          lte: new Date(filters.dateTo)
        };
      }

      if (filters.propertyId) {
        where.propertyId = filters.propertyId;
      }

      // Get current period data
      const [
        totalRevenue,
        totalExpenses,
        totalUnits,
        activeReservations,
        completedReservations
      ] = await Promise.all([
        // Total revenue from completed transactions
        prisma.transactions.aggregate({
          where: {
            ...where,
            type: { in: ['PAYMENT', 'REVENUE'] },
            status: 'COMPLETED'
          },
          _sum: { amount: true }
        }),

        // Total expenses
        prisma.transactions.aggregate({
          where: {
            ...where,
            type: { in: ['EXPENSE', 'FEE'] },
            status: 'COMPLETED'
          },
          _sum: { amount: true }
        }),

        // Total units
        prisma.property.count({
          where: { userId: currentUser.userId }
        }),

        // Active reservations
        prisma.reservation.count({
          where: {
            property: { userId: currentUser.userId },
            status: { in: ['CONFIRMED', 'CHECKED_IN'] },
            checkIn: { lte: new Date() },
            checkOut: { gte: new Date() }
          }
        }),

        // Completed reservations for average stay duration
        prisma.reservation.findMany({
          where: {
            property: { userId: currentUser.userId },
            status: 'COMPLETED',
            ...(filters.dateFrom && filters.dateTo ? {
              createdAt: {
                gte: new Date(filters.dateFrom),
                lte: new Date(filters.dateTo)
              }
            } : {})
          },
          select: {
            checkIn: true,
            checkOut: true
          }
        })
      ]);

      // Calculate previous period for growth comparison
      const previousPeriodData = await this.getPreviousPeriodData(currentUser, filters);

      // Calculate metrics
      const revenue = Number(totalRevenue._sum.amount) || 0;
      const expenses = Number(totalExpenses._sum.amount) || 0;
      const netProfit = revenue - expenses;

      // Calculate average stay duration
      const totalNights = completedReservations.reduce((sum, res) => {
        const nights = Math.ceil((res.checkOut.getTime() - res.checkIn.getTime()) / (1000 * 60 * 60 * 24));
        return sum + nights;
      }, 0);
      const averageStayDuration = completedReservations.length > 0 ? totalNights / completedReservations.length : 0;

      // Calculate occupancy rate (simplified)
      const occupancyRate = totalUnits > 0 ? Math.min((activeReservations / totalUnits) * 100, 100) : 0;

      // Calculate growth percentages
      const revenueGrowth = previousPeriodData.revenue > 0 
        ? ((revenue - previousPeriodData.revenue) / previousPeriodData.revenue) * 100 
        : 0;
      const expenseGrowth = previousPeriodData.expenses > 0 
        ? ((expenses - previousPeriodData.expenses) / previousPeriodData.expenses) * 100 
        : 0;
      const profitGrowth = previousPeriodData.netProfit > 0 
        ? ((netProfit - previousPeriodData.netProfit) / previousPeriodData.netProfit) * 100 
        : 0;
      const occupancyGrowth = previousPeriodData.occupancyRate > 0 
        ? ((occupancyRate - previousPeriodData.occupancyRate) / previousPeriodData.occupancyRate) * 100 
        : 0;

      await prisma.$disconnect();

      return {
        totalRevenue: revenue,
        totalExpenses: expenses,
        netProfit,
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        totalUnits,
        activeReservations,
        averageStayDuration: Math.round(averageStayDuration * 10) / 10,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        expenseGrowth: Math.round(expenseGrowth * 10) / 10,
        profitGrowth: Math.round(profitGrowth * 10) / 10,
        occupancyGrowth: Math.round(occupancyGrowth * 10) / 10
      };
    } catch (error) {
      logger.error('Error getting analytics overview:', error);
      await prisma.$disconnect();
      throw error;
    }
  }

  /**
   * Get previous period data for growth comparison
   */
  private static async getPreviousPeriodData(currentUser: CurrentUser, filters: AnalyticsFilters): Promise<{
    revenue: number;
    expenses: number;
    netProfit: number;
    occupancyRate: number;
  }> {
    try {
      const prisma = new PrismaClient();
      let previousDateFrom: Date;
      let previousDateTo: Date;

      if (filters.dateFrom && filters.dateTo) {
        const currentPeriodStart = new Date(filters.dateFrom);
        const currentPeriodEnd = new Date(filters.dateTo);
        const periodLength = currentPeriodEnd.getTime() - currentPeriodStart.getTime();
        
        previousDateTo = new Date(currentPeriodStart.getTime() - 1);
        previousDateFrom = new Date(previousDateTo.getTime() - periodLength);
      } else {
        // Default to previous month
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthEnd = new Date(currentMonthStart.getTime() - 1);
        const previousMonthStart = new Date(previousMonthEnd.getFullYear(), previousMonthEnd.getMonth(), 1);
        
        previousDateFrom = previousMonthStart;
        previousDateTo = previousMonthEnd;
      }

      const where: any = {
        userId: currentUser.userId,
        createdAt: {
          gte: previousDateFrom,
          lte: previousDateTo
        }
      };

      if (filters.propertyId) {
        where.propertyId = filters.propertyId;
      }

      const [revenue, expenses, totalUnits, activeReservations] = await Promise.all([
        prisma.transactions.aggregate({
          where: {
            ...where,
            type: { in: ['PAYMENT', 'REVENUE'] },
            status: 'COMPLETED'
          },
          _sum: { amount: true }
        }),
        prisma.transactions.aggregate({
          where: {
            ...where,
            type: { in: ['EXPENSE', 'FEE'] },
            status: 'COMPLETED'
          },
          _sum: { amount: true }
        }),
        prisma.property.count({
          where: { userId: currentUser.userId }
        }),
        prisma.reservation.count({
          where: {
            property: { userId: currentUser.userId },
            status: { in: ['CONFIRMED', 'CHECKED_IN'] },
            checkIn: { lte: previousDateTo },
            checkOut: { gte: previousDateFrom }
          }
        })
      ]);

      const revenueAmount = Number(revenue._sum.amount) || 0;
      const expensesAmount = Number(expenses._sum.amount) || 0;
      const netProfit = revenueAmount - expensesAmount;
      const occupancyRate = totalUnits > 0 ? Math.min((activeReservations / totalUnits) * 100, 100) : 0;

      return {
        revenue: revenueAmount,
        expenses: expensesAmount,
        netProfit,
        occupancyRate
      };
    } catch (error) {
      logger.error('Error getting previous period data:', error);
      return {
        revenue: 0,
        expenses: 0,
        netProfit: 0,
        occupancyRate: 0
      };
    }
  }

  /**
   * Get financial analytics
   */
  public static async getFinancialAnalytics(currentUser: CurrentUser, filters: AnalyticsFilters): Promise<FinancialAnalytics> {
    try {
      logger.info('Getting financial analytics with filters:', filters);
      const prisma = new PrismaClient();

      // Build where clause
      const where: any = {
        userId: currentUser.userId
      };

      if (filters.dateFrom && filters.dateTo) {
        where.createdAt = {
          gte: new Date(filters.dateFrom),
          lte: new Date(filters.dateTo)
        };
      }

      if (filters.propertyId) {
        where.propertyId = filters.propertyId;
      }

      // Get revenue by unit
      const revenueByUnit = await prisma.transactions.groupBy({
        by: ['propertyId'],
        where: {
          ...where,
          type: { in: ['PAYMENT', 'REVENUE'] },
          status: 'COMPLETED'
        },
        _sum: { amount: true },
        _count: true
      });

      // Get property names
      const propertyIds = revenueByUnit.map(item => item.propertyId).filter(Boolean);
      const properties = await prisma.property.findMany({
        where: {
          id: { in: propertyIds },
          userId: currentUser.userId
        },
        select: { id: true, name: true }
      });

      const propertyMap = new Map(properties.map(p => [p.id, p.name]));

      const totalRevenue = revenueByUnit.reduce((sum, item) => sum + (Number(item._sum.amount) || 0), 0);

      // Format revenue by unit
      const revenueByUnitFormatted = revenueByUnit.map(item => ({
        unit: propertyMap.get(item.propertyId || '') || 'Unknown Property',
        revenue: Number(item._sum.amount) || 0,
        percentage: totalRevenue > 0 ? ((Number(item._sum.amount) || 0) / totalRevenue) * 100 : 0
      }));

      // Get expenses by category (simplified)
      const expensesByCategory = await prisma.transactions.groupBy({
        by: ['type'],
        where: {
          ...where,
          type: { in: ['EXPENSE', 'FEE'] },
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      });

      const totalExpenses = expensesByCategory.reduce((sum, item) => sum + (Number(item._sum.amount) || 0), 0);

      // Format expenses by category
      const expensesByCategoryFormatted = expensesByCategory.map(item => ({
        category: item.type === 'EXPENSE' ? 'Operating Expenses' : 'Platform Fees',
        amount: Number(item._sum.amount) || 0,
        percentage: totalExpenses > 0 ? ((Number(item._sum.amount) || 0) / totalExpenses) * 100 : 0
      }));

      // Mock data for revenue by source and trends (would need additional tables)
      const revenueBySource = [
        { source: 'Airbnb', revenue: totalRevenue * 0.4, percentage: 40.0 },
        { source: 'Booking.com', revenue: totalRevenue * 0.3, percentage: 30.0 },
        { source: 'Direct', revenue: totalRevenue * 0.2, percentage: 20.0 },
        { source: 'VRBO', revenue: totalRevenue * 0.1, percentage: 10.0 }
      ];

      const revenueTrends = [
        { month: 'Jan', revenue: totalRevenue * 0.8 },
        { month: 'Feb', revenue: totalRevenue * 0.9 },
        { month: 'Mar', revenue: totalRevenue }
      ];

      await prisma.$disconnect();

      return {
        revenue: {
          total: totalRevenue,
          byUnit: revenueByUnitFormatted,
          bySource: revenueBySource,
          trends: revenueTrends
        },
        expenses: {
          total: totalExpenses,
          categories: expensesByCategoryFormatted,
          byUnit: revenueByUnitFormatted.map(item => ({
            unit: item.unit,
            expenses: item.revenue * 0.4 // Simplified: 40% of revenue as expenses
          }))
        },
        profit: {
          net: totalRevenue - totalExpenses,
          byUnit: revenueByUnitFormatted.map(item => ({
            unit: item.unit,
            profit: item.revenue - (item.revenue * 0.4),
            margin: item.revenue > 0 ? ((item.revenue - (item.revenue * 0.4)) / item.revenue) * 100 : 0
          }))
        }
      };
    } catch (error) {
      logger.error('Error getting financial analytics:', error);
      await prisma.$disconnect();
      throw error;
    }
  }

  /**
   * Get units analytics
   */
  public static async getUnitsAnalytics(currentUser: CurrentUser, filters: AnalyticsFilters): Promise<UnitAnalytics> {
    try {
      logger.info('Getting units analytics with filters:', filters);
      const prisma = new PrismaClient();

      // Get properties with their performance data
      const properties = await prisma.property.findMany({
        where: { userId: currentUser.userId },
        include: {
          transactions: {
            where: {
              status: 'COMPLETED',
              ...(filters.dateFrom && filters.dateTo ? {
                createdAt: {
                  gte: new Date(filters.dateFrom),
                  lte: new Date(filters.dateTo)
                }
              } : {})
            }
          },
          reservations: {
            where: {
              status: 'COMPLETED',
              ...(filters.dateFrom && filters.dateTo ? {
                createdAt: {
                  gte: new Date(filters.dateFrom),
                  lte: new Date(filters.dateTo)
                }
              } : {})
            }
          }
        }
      });

      const performance = properties.map(property => {
        const revenue = property.transactions
          .filter(t => ['PAYMENT', 'REVENUE'].includes(t.type))
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const expenses = property.transactions
          .filter(t => ['EXPENSE', 'FEE'].includes(t.type))
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const profit = revenue - expenses;
        
        // Calculate occupancy rate (simplified)
        const totalNights = property.reservations.reduce((sum, r) => {
          const nights = Math.ceil((r.checkOut.getTime() - r.checkIn.getTime()) / (1000 * 60 * 60 * 24));
          return sum + nights;
        }, 0);
        
        const daysInPeriod = filters.dateFrom && filters.dateTo 
          ? Math.ceil((new Date(filters.dateTo).getTime() - new Date(filters.dateFrom).getTime()) / (1000 * 60 * 60 * 24))
          : 30; // Default to 30 days
        
        const occupancyRate = (totalNights / daysInPeriod) * 100;
        
        const avgStayDuration = property.reservations.length > 0 
          ? totalNights / property.reservations.length 
          : 0;

        return {
          unit: property.name,
          revenue,
          expenses,
          profit,
          occupancyRate: Math.min(occupancyRate, 100),
          revenuePerNight: totalNights > 0 ? revenue / totalNights : 0,
          totalNights,
          avgStayDuration
        };
      });

      await prisma.$disconnect();

      return { performance };
    } catch (error) {
      logger.error('Error getting units analytics:', error);
      await prisma.$disconnect();
      throw error;
    }
  }

  /**
   * Get owners analytics (simplified - would need owner relationships)
   */
  public static async getOwnersAnalytics(currentUser: CurrentUser, filters: AnalyticsFilters): Promise<OwnerAnalytics> {
    try {
      logger.info('Getting owners analytics with filters:', filters);

      // For now, return mock data since we don't have owner relationships in the schema
      const mockData: OwnerAnalytics = {
        profitability: [
          {
            owner: 'John Smith',
            units: ['Luxury Apartment Downtown Dubai'],
            totalRevenue: 12000,
            totalExpenses: 6000,
            netProfit: 6000,
            profitMargin: 50.0,
            unitsCount: 1,
            avgRevenuePerUnit: 12000
          },
          {
            owner: 'Sarah Johnson',
            units: ['Beach Villa Palm Jumeirah'],
            totalRevenue: 15000,
            totalExpenses: 7500,
            netProfit: 7500,
            profitMargin: 50.0,
            unitsCount: 1,
            avgRevenuePerUnit: 15000
          }
        ]
      };

      return mockData;
    } catch (error) {
      logger.error('Error getting owners analytics:', error);
      throw error;
    }
  }

  /**
   * Get reservations analytics
   */
  public static async getReservationsAnalytics(currentUser: CurrentUser, filters: AnalyticsFilters): Promise<ReservationAnalytics> {
    try {
      logger.info('Getting reservations analytics with filters:', filters);
      const prisma = new PrismaClient();

      // Build where clause
      const where: any = {
        property: { userId: currentUser.userId }
      };

      if (filters.dateFrom && filters.dateTo) {
        where.createdAt = {
          gte: new Date(filters.dateFrom),
          lte: new Date(filters.dateTo)
        };
      }

      if (filters.propertyId) {
        where.propertyId = filters.propertyId;
      }

      // Get reservation status counts
      const statusCounts = await prisma.reservation.groupBy({
        by: ['status'],
        where,
        _count: true
      });

      const statusMap = new Map(statusCounts.map(item => [item.status, item._count]));
      
      const confirmed = statusMap.get('CONFIRMED') || 0;
      const pending = statusMap.get('PENDING') || 0;
      const cancelled = statusMap.get('CANCELLED') || 0;
      const completed = statusMap.get('COMPLETED') || 0;
      const total = confirmed + pending + cancelled + completed;

      const cancellationRate = total > 0 ? (cancelled / total) * 100 : 0;
      const confirmationRate = total > 0 ? (confirmed / total) * 100 : 0;

      // Mock monthly trends (would need more complex aggregation)
      const monthlyTrends = [
        { month: 'Jan', reservations: Math.floor(total * 0.8), cancellations: Math.floor(cancelled * 0.8), net: Math.floor((total - cancelled) * 0.8) },
        { month: 'Feb', reservations: Math.floor(total * 0.9), cancellations: Math.floor(cancelled * 0.9), net: Math.floor((total - cancelled) * 0.9) },
        { month: 'Mar', reservations: total, cancellations: cancelled, net: total - cancelled }
      ];

      await prisma.$disconnect();

      return {
        trends: {
          monthly: monthlyTrends
        },
        status: {
          confirmed,
          pending,
          cancelled,
          completed,
          total,
          cancellationRate: Math.round(cancellationRate * 10) / 10,
          confirmationRate: Math.round(confirmationRate * 10) / 10
        }
      };
    } catch (error) {
      logger.error('Error getting reservations analytics:', error);
      await prisma.$disconnect();
      throw error;
    }
  }

  /**
   * Get agents analytics (simplified - would need agent relationships)
   */
  public static async getAgentsAnalytics(currentUser: CurrentUser, filters: AnalyticsFilters): Promise<AgentAnalytics> {
    try {
      logger.info('Getting agents analytics with filters:', filters);

      // For now, return mock data since we don't have agent relationships in the schema
      const mockData: AgentAnalytics = {
        performance: [
          {
            agent: 'John Smith',
            unitsReferred: 3,
            totalRevenue: 36000,
            totalPayouts: 3600,
            commissionRate: 10.0,
            avgRevenuePerUnit: 12000,
            lastReferral: '2024-01-15',
            status: 'active'
          },
          {
            agent: 'Sarah Johnson',
            unitsReferred: 2,
            totalRevenue: 24000,
            totalPayouts: 2400,
            commissionRate: 10.0,
            avgRevenuePerUnit: 12000,
            lastReferral: '2024-01-10',
            status: 'active'
          }
        ]
      };

      return mockData;
    } catch (error) {
      logger.error('Error getting agents analytics:', error);
      throw error;
    }
  }

  /**
   * Get reports (mock data)
   */
  public static async getReports(currentUser: CurrentUser): Promise<AnalyticsReport[]> {
    try {
      logger.info('Getting reports for user:', currentUser.email);

      // Return mock data for now
      const mockReports: AnalyticsReport[] = [
        {
          id: 1,
          name: 'Monthly Revenue Report',
          description: 'Comprehensive monthly revenue analysis',
          type: 'revenue',
          lastGenerated: new Date().toISOString().split('T')[0],
          frequency: 'monthly',
          recipients: [currentUser.email, 'finance@roomy.com']
        },
        {
          id: 2,
          name: 'Property Performance Report',
          description: 'Individual property performance metrics',
          type: 'performance',
          lastGenerated: new Date().toISOString().split('T')[0],
          frequency: 'weekly',
          recipients: [currentUser.email]
        }
      ];

      return mockReports;
    } catch (error) {
      logger.error('Error getting reports:', error);
      throw error;
    }
  }

  /**
   * Generate report (mock implementation)
   */
  public static async generateReport(currentUser: CurrentUser, reportData: any): Promise<any> {
    try {
      logger.info('Generating report for user:', currentUser.email, reportData);

      // Mock implementation
      return {
        reportId: Date.now(),
        reportName: reportData.reportName,
        generatedAt: new Date().toISOString(),
        downloadUrl: `/api/analytics/reports/${Date.now()}/download`
      };
    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Export analytics (mock implementation)
   */
  public static async exportAnalytics(currentUser: CurrentUser, exportData: any): Promise<any> {
    try {
      logger.info('Exporting analytics for user:', currentUser.email, exportData);

      // Mock implementation
      if (exportData.format === 'csv') {
        return 'csv,data,here\n1,2,3\n4,5,6';
      } else {
        return {
          exportId: Date.now(),
          format: exportData.format,
          generatedAt: new Date().toISOString(),
          downloadUrl: `/api/analytics/export/${Date.now()}/download`
        };
      }
    } catch (error) {
      logger.error('Error exporting analytics:', error);
      throw error;
    }
  }
}
