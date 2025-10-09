import { PrismaClient, Prisma } from '@prisma/client';
import { BaseService } from './BaseService';
import { ServiceResponse } from '../types';
import { CurrentUser } from '../types/dto';
import SettingsService from './settings.service';
import logger from '../utils/logger';

export interface FinancialOverviewDto {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  pendingPayments: number;
  completedTransactions: number;
  averageTransactionAmount: number;
  monthlyGrowth: number;
  topPaymentMethods: Array<{
    method: string;
    count: number;
    totalAmount: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    expenses: number;
    net: number;
  }>;
}

export interface KPIOverviewDto {
  occupancyRate: number;
  averageDailyRate: number;
  revenuePerAvailableRoom: number;
  totalBookings: number;
  cancellationRate: number;
  guestSatisfaction: number;
  propertiesActive: number;
  propertiesOccupied: number;
}

export interface UnitsAnalyticsDto {
  units: Array<{
    id: string;
    name: string;
    address: string;
    revenue: number;
    occupancyRate: number;
    averageDailyRate: number;
    totalBookings: number;
    cancellationRate: number;
    guestSatisfaction: number;
    lastBookingDate?: string;
    nextBookingDate?: string;
  }>;
  totalUnits: number;
  activeUnits: number;
  totalRevenue: number;
  averageOccupancyRate: number;
  averageDailyRate: number;
}

export interface PropertyFinancialDataDto {
  // Revenue
  totalRevenue: number;
  grossRevenue: number;
  netRevenue: number;
  
  // Expenses
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  
  // Profit
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  
  // Distribution
  ownerPayout: number;
  agencyFee: number;
  platformFees: number;
  
  // Metrics
  occupancyRate: number;
  adr: number;
  revpar: number;
  totalBookings: number;
  cancellationRate: number;
  
  // Period
  period: {
    from: string;
    to: string;
    type: 'month' | 'quarter' | 'year' | 'custom';
  };
  
  // Recent data
  recentReservations: Array<{
    id: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    status: string;
    guestName?: string;
  }>;
  
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    description?: string;
    createdAt: string;
  }>;
}

export interface FinancialFilters {
  dateFrom?: string;
  dateTo?: string;
  propertyId?: string;
  transactionType?: string[];
  paymentMethod?: string[];
  status?: string[];
  platform?: string[];
}

export class FinancialService extends BaseService {
  private static instance: FinancialService;

  private constructor() {
    super();
  }

  public static getInstance(): FinancialService {
    if (!FinancialService.instance) {
      FinancialService.instance = new FinancialService();
    }
    return FinancialService.instance;
  }

  /**
   * Get financial overview with aggregated data
   */
  public static async getFinancialOverview(
    currentUser: CurrentUser,
    filters: FinancialFilters = {}
  ): Promise<ServiceResponse<FinancialOverviewDto>> {
    try {
      const prisma = new PrismaClient();

      // Build where clause based on user role and filters
      let where: any = {};

      switch (currentUser.role) {
        case 'ADMIN':
        case 'MANAGER':
          // ADMIN and MANAGER can see all transactions
          break;
        
        case 'AGENT':
          // AGENT can see transactions for properties they manage
          where = {
            OR: [
              { property: { agent_id: currentUser.id } },
              { user_id: currentUser.id }
            ]
          };
          break;
        
        case 'OWNER':
          // OWNER can see transactions for their properties
          where = {
            property: { owner_id: currentUser.id }
          };
          break;
        
        case 'GUEST':
        default:
          // GUEST can only see their own transactions
          where = { user_id: currentUser.id };
      }

      // Add date filters
      if (filters.dateFrom || filters.dateTo) {
        where.created_at = {};
        if (filters.dateFrom) {
          where.created_at.gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          where.created_at.lte = new Date(filters.dateTo);
        }
      }

      // Add other filters
      if (filters.propertyId) {
        where.property_id = filters.propertyId;
      }

      if (filters.transactionType && filters.transactionType.length > 0) {
        where.type = { in: filters.transactionType };
      }

      if (filters.paymentMethod && filters.paymentMethod.length > 0) {
        where.payment_method = { in: filters.paymentMethod };
      }

      if (filters.status && filters.status.length > 0) {
        where.status = { in: filters.status };
      }

      if (filters.platform && filters.platform.length > 0) {
        where.platform = { in: filters.platform };
      }

      logger.info(`[Financial Overview] Starting aggregation for user ${currentUser.email}`);

      // Execute parallel aggregation queries
      const [
        revenueAggregation,
        expensesAggregation,
        pendingAggregation,
        transactionsCount,
        paymentMethodsAggregation,
        monthlyRevenue
      ] = await Promise.all([
        // Total revenue (PAYMENT and REVENUE types)
        prisma.transactions.aggregate({
          where: {
            ...where,
            type: { in: ['PAYMENT', 'REVENUE'] },
            status: 'COMPLETED'
          },
          _sum: { amount: true },
          _avg: { amount: true },
          _count: true
        }),

        // Total expenses (EXPENSE and FEE types)
        prisma.transactions.aggregate({
          where: {
            ...where,
            type: { in: ['EXPENSE', 'FEE'] },
            status: 'COMPLETED'
          },
          _sum: { amount: true }
        }),

        // Pending payments
        prisma.transactions.aggregate({
          where: {
            ...where,
            type: { in: ['PAYMENT', 'REVENUE'] },
            status: 'PENDING'
          },
          _sum: { amount: true },
          _count: true
        }),

        // Total completed transactions
        prisma.transactions.count({
          where: {
            ...where,
            status: 'COMPLETED'
          }
        }),

        // Payment methods aggregation
        prisma.transactions.groupBy({
          by: ['payment_method'],
          where: {
            ...where,
            type: { in: ['PAYMENT', 'REVENUE'] },
            status: 'COMPLETED',
            payment_method: { not: null }
          },
          _sum: { amount: true },
          _count: true,
          orderBy: { _sum: { amount: 'desc' } },
          take: 5
        }),

        // Monthly revenue for growth calculation
        prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', created_at) as month,
            SUM(amount) as revenue,
            SUM(CASE WHEN type IN ('EXPENSE', 'FEE') THEN amount ELSE 0 END) as expenses
          FROM transactions 
          WHERE type IN ('PAYMENT', 'REVENUE')
            AND status = 'COMPLETED'
            AND created_at >= NOW() - INTERVAL '12 months'
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY month DESC
          LIMIT 12
        `
      ]);

      await prisma.$disconnect();

      // Calculate derived metrics
      const totalRevenue = Number(revenueAggregation._sum.amount) || 0;
      const totalExpenses = Number(expensesAggregation._sum.amount) || 0;
      const netIncome = totalRevenue - totalExpenses;
      const pendingPayments = Number(pendingAggregation._sum.amount) || 0;
      const completedTransactions = transactionsCount;
      const averageTransactionAmount = Number(revenueAggregation._avg.amount) || 0;

      // Calculate monthly growth
      let monthlyGrowth = 0;
      if (Array.isArray(monthlyRevenue) && monthlyRevenue.length >= 2) {
        const currentMonth = Number((monthlyRevenue[0] as any).revenue) || 0;
        const previousMonth = Number((monthlyRevenue[1] as any).revenue) || 0;
        if (previousMonth > 0) {
          monthlyGrowth = ((currentMonth - previousMonth) / previousMonth) * 100;
        }
      }

      // Format payment methods
      const topPaymentMethods = paymentMethodsAggregation.map(item => ({
        method: item.payment_method || 'Unknown',
        count: item._count,
        totalAmount: Number(item._sum.amount) || 0
      }));

      // Format monthly revenue
      const revenueByMonth = Array.isArray(monthlyRevenue) ? monthlyRevenue.map((item: any) => ({
        month: new Date(item.month).toISOString().slice(0, 7), // YYYY-MM format
        revenue: Number(item.revenue) || 0,
        expenses: Number(item.expenses) || 0,
        net: (Number(item.revenue) || 0) - (Number(item.expenses) || 0)
      })) : [];

      const overview: FinancialOverviewDto = {
        totalRevenue,
        totalExpenses,
        netIncome,
        pendingPayments,
        completedTransactions,
        averageTransactionAmount,
        monthlyGrowth,
        topPaymentMethods,
        revenueByMonth
      };

      logger.info(`[Financial Overview END] Aggregation completed for user ${currentUser.email}`);
      return FinancialService.prototype.success(overview, 'Financial overview retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving financial overview:', error);
      return FinancialService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Get KPI overview with key performance indicators
   */
  public static async getKPIOverview(
    currentUser: CurrentUser,
    filters: FinancialFilters = {}
  ): Promise<ServiceResponse<KPIOverviewDto>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[KPI Overview] Starting KPI calculation for user ${currentUser.email}`);

      // Build base where clause for reservations
      let reservationWhere: any = {};
      let propertyWhere: any = {};

      switch (currentUser.role) {
        case 'ADMIN':
        case 'MANAGER':
          // Can see all data
          break;
        
        case 'AGENT':
          reservationWhere.property = { agent_id: currentUser.id };
          propertyWhere.agent_id = currentUser.id;
          break;
        
        case 'OWNER':
          reservationWhere.property = { owner_id: currentUser.id };
          propertyWhere.owner_id = currentUser.id;
          break;
        
        case 'GUEST':
        default:
          reservationWhere.guest_id = currentUser.id;
          break;
      }

      // Add date filters
      if (filters.dateFrom || filters.dateTo) {
        if (filters.dateFrom) {
          reservationWhere.check_in = { gte: new Date(filters.dateFrom) };
        }
        if (filters.dateTo) {
          if (reservationWhere.check_in) {
            reservationWhere.check_in.lte = new Date(filters.dateTo);
          } else {
            reservationWhere.check_out = { lte: new Date(filters.dateTo) };
          }
        }
      }

      // Execute parallel queries for KPIs
      const [
        totalBookings,
        cancelledBookings,
        activeProperties,
        averageDailyRate,
        totalRevenue
      ] = await Promise.all([
        // Total bookings
        prisma.reservations.count({
          where: {
            status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] }
          }
        }),

        // Cancelled bookings
        prisma.reservations.count({
          where: {
            status: 'CANCELLED'
          }
        }),

        // Active properties
        prisma.properties.count({
          where: {
            is_active: true,
            is_published: true
          }
        }),

        // Average daily rate
        prisma.reservations.aggregate({
          where: {
            status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] }
          },
          _avg: { total_amount: true }
        }),

        // Total revenue from reservations
        prisma.reservations.aggregate({
          where: {
            status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] }
          },
          _sum: { total_amount: true }
        })
      ]);

      await prisma.$disconnect();

      // Calculate KPIs
      const totalBookingsCount = totalBookings;
      const cancelledBookingsCount = cancelledBookings;
      const activePropertiesCount = activeProperties;
      const avgDailyRate = Number(averageDailyRate._avg.total_amount) || 0;
      const totalRevenueAmount = Number(totalRevenue._sum.total_amount) || 0;

      // Calculate derived KPIs
      const occupancyRate = 75; // Placeholder - would need complex calculation
      const cancellationRate = totalBookingsCount > 0 ? (cancelledBookingsCount / (totalBookingsCount + cancelledBookingsCount)) * 100 : 0;
      const revenuePerAvailableRoom = activePropertiesCount > 0 ? totalRevenueAmount / activePropertiesCount : 0;
      // Get guest satisfaction and occupancy rate from settings
      const guestSatisfaction = await SettingsService.getNumberValue('guest_satisfaction_target') || 4.2;
      const defaultOccupancyRate = await SettingsService.getNumberValue('default_occupancy_rate') || 75;
      const propertiesOccupied = Math.floor(activePropertiesCount * (defaultOccupancyRate / 100));

      const kpiOverview: KPIOverviewDto = {
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        averageDailyRate: Math.round(avgDailyRate * 100) / 100,
        revenuePerAvailableRoom: Math.round(revenuePerAvailableRoom * 100) / 100,
        totalBookings: totalBookingsCount,
        cancellationRate: Math.round(cancellationRate * 100) / 100,
        guestSatisfaction,
        propertiesActive: activePropertiesCount,
        propertiesOccupied
      };

      logger.info(`[KPI Overview END] KPI calculation completed for user ${currentUser.email}`);
      return FinancialService.prototype.success(kpiOverview, 'KPI overview retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving KPI overview:', error);
      return FinancialService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Get units analytics with detailed property performance
   */
  public static async getUnitsAnalytics(
    currentUser: CurrentUser,
    filters: FinancialFilters = {}
  ): Promise<ServiceResponse<UnitsAnalyticsDto>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Units Analytics] Starting units analysis for user ${currentUser.email}`);

      // Build property where clause based on user role
      let propertyWhere: any = { is_active: true, is_published: true };

      switch (currentUser.role) {
        case 'ADMIN':
        case 'MANAGER':
          // Can see all properties
          break;
        
        case 'AGENT':
          propertyWhere.agent_id = currentUser.id;
          break;
        
        case 'OWNER':
          propertyWhere.owner_id = currentUser.id;
          break;
        
        case 'GUEST':
        default:
          // GUEST cannot access property analytics
          await prisma.$disconnect();
          return FinancialService.prototype.error('Forbidden', 'GUEST role cannot access units analytics', 403);
      }

      // Use raw SQL for complex aggregation
      const unitsData = await prisma.$queryRaw`
        SELECT 
          p.id,
          p.name,
          p.address,
          p.city,
          p.country,
          COALESCE(SUM(CASE WHEN r.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT') THEN r.total_amount ELSE 0 END), 0) as revenue,
          COALESCE(AVG(CASE WHEN r.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT') THEN r.total_amount ELSE NULL END), 0) as avg_daily_rate,
          COUNT(CASE WHEN r.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT') THEN 1 ELSE NULL END) as total_bookings,
          COUNT(CASE WHEN r.status = 'CANCELLED' THEN 1 ELSE NULL END) as cancelled_bookings,
          MAX(CASE WHEN r.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT') THEN r.check_in ELSE NULL END) as last_booking_date,
          MIN(CASE WHEN r.status = 'CONFIRMED' AND r.check_in > NOW() THEN r.check_in ELSE NULL END) as next_booking_date
        FROM properties p
        LEFT JOIN reservations r ON p.id = r.property_id
        WHERE p.is_active = true 
          AND p.is_published = true
        GROUP BY p.id, p.name, p.address, p.city, p.country
        ORDER BY revenue DESC
      `;

      await prisma.$disconnect();

      // Process results
      const units = Array.isArray(unitsData) ? (unitsData as any[]).map(unit => {
        const totalBookings = Number(unit.total_bookings) || 0;
        const cancelledBookings = Number(unit.cancelled_bookings) || 0;
        const totalBookingsWithCancelled = totalBookings + cancelledBookings;
        
        return {
          id: unit.id,
          name: unit.name,
          address: `${unit.address}, ${unit.city}, ${unit.country}`,
          revenue: Number(unit.revenue) || 0,
          occupancyRate: 0, // Would need more complex calculation
          averageDailyRate: Number(unit.avg_daily_rate) || 0,
          totalBookings,
          cancellationRate: totalBookingsWithCancelled > 0 ? (cancelledBookings / totalBookingsWithCancelled) * 100 : 0,
          guestSatisfaction: 4.2, // Placeholder
          lastBookingDate: unit.last_booking_date ? new Date(unit.last_booking_date).toISOString() : undefined,
          nextBookingDate: unit.next_booking_date ? new Date(unit.next_booking_date).toISOString() : undefined
        };
      }) : [];

      // Calculate summary metrics
      const totalUnits = units.length;
      const activeUnits = units.filter(unit => unit.totalBookings > 0).length;
      const totalRevenue = units.reduce((sum, unit) => sum + unit.revenue, 0);
      const averageOccupancyRate = units.length > 0 ? units.reduce((sum, unit) => sum + unit.occupancyRate, 0) / units.length : 0;
      const averageDailyRate = units.length > 0 ? units.reduce((sum, unit) => sum + unit.averageDailyRate, 0) / units.length : 0;

      const unitsAnalytics: UnitsAnalyticsDto = {
        units,
        totalUnits,
        activeUnits,
        totalRevenue,
        averageOccupancyRate: Math.round(averageOccupancyRate * 100) / 100,
        averageDailyRate: Math.round(averageDailyRate * 100) / 100
      };

      logger.info(`[Units Analytics END] Units analysis completed for user ${currentUser.email}`);
      return FinancialService.prototype.success(unitsAnalytics, 'Units analytics retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving units analytics:', error);
      return FinancialService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Get property-specific financial data with comprehensive calculations
   */
  public static async getPropertyFinancialData(
    currentUser: CurrentUser,
    propertyId: string,
    filters: FinancialFilters = {}
  ): Promise<ServiceResponse<PropertyFinancialDataDto>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Property Financial Data] Starting calculation for property ${propertyId} and user ${currentUser.email}`);

      // Verify property access
      const property = await prisma.properties.findUnique({
        where: { id: propertyId },
        select: {
          id: true,
          name: true,
          agency_fee_percentage: true,
          income_distribution: true,
          owner_id: true,
          agent_id: true
        }
      });

      if (!property) {
        await prisma.$disconnect();
        return FinancialService.prototype.error('Not Found', 'Property not found', 404);
      }

      // Check access permissions
      const hasAccess = currentUser.role === 'ADMIN' || 
                       currentUser.role === 'MANAGER' ||
                       property.owner_id === currentUser.id ||
                       property.agent_id === currentUser.id;

      if (!hasAccess) {
        await prisma.$disconnect();
        return FinancialService.prototype.error('Forbidden', 'Access denied to this property', 403);
      }

      // Set default date range (current month)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : startOfMonth;
      const dateTo = filters.dateTo ? new Date(filters.dateTo) : endOfMonth;

      // Execute parallel queries
      const [
        reservationsData,
        transactionsData,
        expensesData,
        recentReservations,
        recentTransactions
      ] = await Promise.all([
        // Reservations aggregation
        prisma.reservations.aggregate({
          where: {
            property_id: propertyId,
            status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
            check_in: { gte: dateFrom, lte: dateTo }
          },
          _sum: { total_amount: true },
          _avg: { total_amount: true },
          _count: true
        }),

        // Transactions aggregation
        prisma.transactions.aggregate({
          where: {
            property_id: propertyId,
            type: { in: ['PAYMENT', 'REVENUE'] },
            status: 'COMPLETED',
            created_at: { gte: dateFrom, lte: dateTo }
          },
          _sum: { amount: true },
          _count: true
        }),

        // Expenses aggregation
        prisma.expenses.aggregate({
          where: {
            property_id: propertyId,
            date: { gte: dateFrom, lte: dateTo }
          },
          _sum: { amount: true }
        }),

        // Recent reservations
        prisma.reservations.findMany({
          where: {
            property_id: propertyId,
            status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] }
          },
          select: {
            id: true,
            check_in: true,
            check_out: true,
            total_amount: true,
            status: true,
            guest_name: true
          },
          orderBy: { check_in: 'desc' },
          take: 5
        }),

        // Recent transactions
        prisma.transactions.findMany({
          where: {
            property_id: propertyId,
            type: { in: ['PAYMENT', 'REVENUE', 'EXPENSE', 'FEE'] }
          },
          select: {
            id: true,
            type: true,
            amount: true,
            description: true,
            created_at: true
          },
          orderBy: { created_at: 'desc' },
          take: 5
        })
      ]);

      // Get expenses by category
      const expensesByCategory = await prisma.expenses.groupBy({
        by: ['category'],
        where: {
          property_id: propertyId,
          date: { gte: dateFrom, lte: dateTo }
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } }
      });

      // Get total bookings and cancellations for metrics
      const [totalBookings, cancelledBookings] = await Promise.all([
        prisma.reservations.count({
          where: {
            property_id: propertyId,
            status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
            check_in: { gte: dateFrom, lte: dateTo }
          }
        }),
        prisma.reservations.count({
          where: {
            property_id: propertyId,
            status: 'CANCELLED',
            check_in: { gte: dateFrom, lte: dateTo }
          }
        })
      ]);

      await prisma.$disconnect();

      // Calculate financial metrics
      const totalRevenue = Number(reservationsData._sum.total_amount) || 0;
      const grossRevenue = Number(transactionsData._sum.amount) || 0;
      const totalExpenses = Number(expensesData._sum.amount) || 0;
      
      // Calculate fees and distribution
      const agencyFeePercentage = property.agency_fee_percentage || 25.0;
      const agencyFee = totalRevenue * (agencyFeePercentage / 100);
      const platformFees = totalRevenue * 0.03; // 3% platform fee
      const netRevenue = grossRevenue - platformFees;
      
      // Calculate profits
      const grossProfit = totalRevenue - totalExpenses;
      const netProfit = netRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      
      // Calculate owner payout
      const ownerPayout = totalRevenue - agencyFee - platformFees;
      
      // Calculate metrics
      const totalBookingsCount = totalBookings;
      const cancelledBookingsCount = cancelledBookings;
      const totalBookingsWithCancelled = totalBookingsCount + cancelledBookingsCount;
      const cancellationRate = totalBookingsWithCancelled > 0 ? (cancelledBookingsCount / totalBookingsWithCancelled) * 100 : 0;
      
      const adr = Number(reservationsData._avg.total_amount) || 0;
      const occupancyRate = 75; // Placeholder - would need complex calculation based on available nights
      const revpar = (totalRevenue / 30) || 0; // Revenue per available room per day (simplified)

      // Format expenses by category
      const expensesByCategoryMap: Record<string, number> = {};
      expensesByCategory.forEach(expense => {
        expensesByCategoryMap[expense.category] = Number(expense._sum.amount) || 0;
      });

      // Format recent data
      const recentReservationsFormatted = recentReservations.map(res => ({
        id: res.id,
        checkIn: res.check_in.toISOString(),
        checkOut: res.check_out.toISOString(),
        totalAmount: res.total_amount,
        status: res.status,
        guestName: res.guest_name || undefined
      }));

      const recentTransactionsFormatted = recentTransactions.map(trans => ({
        id: trans.id,
        type: trans.type,
        amount: trans.amount,
        description: trans.description || undefined,
        createdAt: trans.created_at.toISOString()
      }));

      // Determine period type
      let periodType: 'month' | 'quarter' | 'year' | 'custom' = 'custom';
      const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 31) periodType = 'month';
      else if (daysDiff <= 93) periodType = 'quarter';
      else if (daysDiff <= 366) periodType = 'year';

      const propertyFinancialData: PropertyFinancialDataDto = {
        // Revenue
        totalRevenue,
        grossRevenue,
        netRevenue,
        
        // Expenses
        totalExpenses,
        expensesByCategory: expensesByCategoryMap,
        
        // Profit
        grossProfit,
        netProfit,
        profitMargin: Math.round(profitMargin * 100) / 100,
        
        // Distribution
        ownerPayout: Math.round(ownerPayout * 100) / 100,
        agencyFee: Math.round(agencyFee * 100) / 100,
        platformFees: Math.round(platformFees * 100) / 100,
        
        // Metrics
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        adr: Math.round(adr * 100) / 100,
        revpar: Math.round(revpar * 100) / 100,
        totalBookings: totalBookingsCount,
        cancellationRate: Math.round(cancellationRate * 100) / 100,
        
        // Period
        period: {
          from: dateFrom.toISOString(),
          to: dateTo.toISOString(),
          type: periodType
        },
        
        // Recent data
        recentReservations: recentReservationsFormatted,
        recentTransactions: recentTransactionsFormatted
      };

      logger.info(`[Property Financial Data END] Calculation completed for property ${propertyId}`);
      return FinancialService.prototype.success(propertyFinancialData, 'Property financial data retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving property financial data:', error);
      return FinancialService.prototype.handleDatabaseError(error);
    }
  }
}
