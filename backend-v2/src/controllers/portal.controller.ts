import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { AuthService } from '../services/auth.service';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Helper interface for JWT payload
interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Portal Controller
 * Provides filtered data access for AGENT and OWNER roles
 * Does not modify existing authentication system
 */
export class PortalController {
  
  /**
   * Extract and verify user from JWT token
   * Returns user info or null if invalid
   */
  private static async extractUserFromToken(req: Request): Promise<JwtPayload | null> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('Portal access attempt without Bearer token');
        return null;
      }

      const token = authHeader.replace('Bearer ', '');
      
      // Use existing AuthService to verify token
      const verifyResult = await AuthService.verifyToken(token);
      
      if (!verifyResult.success || !verifyResult.data) {
        logger.warn('Portal access attempt with invalid token');
        return null;
      }

      return {
        userId: verifyResult.data.userId,
        email: verifyResult.data.email,
        role: verifyResult.data.role,
      };
    } catch (error) {
      logger.error('Error extracting user from token:', error);
      return null;
    }
  }

  // ==================== AGENT ENDPOINTS ====================

  /**
   * Get properties assigned to the agent
   * GET /api/v2/portal/agent/properties
   */
  static async getAgentProperties(req: Request, res: Response): Promise<void> {
    try {
      const user = await PortalController.extractUserFromToken(req);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Invalid token',
        });
        return;
      }

      // Only AGENT and ADMIN can access
      if (user.role !== UserRole.AGENT && user.role !== UserRole.ADMIN) {
        logger.warn(`Access denied for user ${user.email} with role ${user.role} to agent portal`);
        res.status(403).json({
          success: false,
          message: 'Access denied - Agent role required',
        });
        return;
      }

      // Filter properties by agent_id
      const whereClause = user.role === UserRole.ADMIN 
        ? {} // Admin sees all
        : { agent_id: user.userId }; // Agent sees only their properties

      const properties = await prisma.properties.findMany({
        where: whereClause,
        include: {
          users_properties_owner_idTousers: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      logger.info(`Agent ${user.email} accessed ${properties.length} properties`);

      res.json({
        success: true,
        data: properties,
        count: properties.length,
      });
    } catch (error) {
      logger.error('Error in getAgentProperties:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get reservations for agent's properties
   * GET /api/v2/portal/agent/reservations
   */
  static async getAgentReservations(req: Request, res: Response): Promise<void> {
    try {
      const user = await PortalController.extractUserFromToken(req);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Invalid token',
        });
        return;
      }

      if (user.role !== UserRole.AGENT && user.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          message: 'Access denied - Agent role required',
        });
        return;
      }

      // Filter reservations by agent_id
      const whereClause = user.role === UserRole.ADMIN 
        ? {} 
        : { agent_id: user.userId };

      const reservations = await prisma.reservations.findMany({
        where: whereClause,
        include: {
          properties: {
            select: {
              id: true,
              title: true,
              address: true,
            },
          },
        },
        orderBy: {
          check_in: 'desc',
        },
      });

      logger.info(`Agent ${user.email} accessed ${reservations.length} reservations`);

      res.json({
        success: true,
        data: reservations,
        count: reservations.length,
      });
    } catch (error) {
      logger.error('Error in getAgentReservations:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get financial summary for agent's properties
   * GET /api/v2/portal/agent/finances
   */
  static async getAgentFinances(req: Request, res: Response): Promise<void> {
    try {
      const user = await PortalController.extractUserFromToken(req);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Invalid token',
        });
        return;
      }

      if (user.role !== UserRole.AGENT && user.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          message: 'Access denied - Agent role required',
        });
        return;
      }

      const whereClause = user.role === UserRole.ADMIN 
        ? {} 
        : { agent_id: user.userId };

      // Get total revenue from reservations
      const reservations = await prisma.reservations.findMany({
        where: {
          ...whereClause,
          status: 'CONFIRMED',
        },
        select: {
          total_amount: true,
          paid_amount: true,
          outstanding_balance: true,
        },
      });

      const totalRevenue = reservations.reduce((sum, r) => sum + (r.total_amount || 0), 0);
      const totalPaid = reservations.reduce((sum, r) => sum + (r.paid_amount || 0), 0);
      const totalOutstanding = reservations.reduce((sum, r) => sum + (r.outstanding_balance || 0), 0);

      // Get expenses
      const expenses = await prisma.expenses.findMany({
        where: whereClause,
        select: {
          amount: true,
          category: true,
        },
      });

      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      logger.info(`Agent ${user.email} accessed financial summary`);

      res.json({
        success: true,
        data: {
          revenue: {
            total: totalRevenue,
            paid: totalPaid,
            outstanding: totalOutstanding,
          },
          expenses: {
            total: totalExpenses,
            breakdown: expenses,
          },
          netIncome: totalPaid - totalExpenses,
          reservationsCount: reservations.length,
        },
      });
    } catch (error) {
      logger.error('Error in getAgentFinances:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // ==================== OWNER ENDPOINTS ====================

  /**
   * Get properties owned by the owner
   * GET /api/v2/portal/owner/properties
   */
  static async getOwnerProperties(req: Request, res: Response): Promise<void> {
    try {
      const user = await PortalController.extractUserFromToken(req);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Invalid token',
        });
        return;
      }

      // Only OWNER and ADMIN can access
      if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
        logger.warn(`Access denied for user ${user.email} with role ${user.role} to owner portal`);
        res.status(403).json({
          success: false,
          message: 'Access denied - Owner role required',
        });
        return;
      }

      // Filter properties by owner_id
      const whereClause = user.role === UserRole.ADMIN 
        ? {} 
        : { owner_id: user.userId };

      const properties = await prisma.properties.findMany({
        where: whereClause,
        include: {
          users_properties_agent_idTousers: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      logger.info(`Owner ${user.email} accessed ${properties.length} properties`);

      res.json({
        success: true,
        data: properties,
        count: properties.length,
      });
    } catch (error) {
      logger.error('Error in getOwnerProperties:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get reservations for owner's properties
   * GET /api/v2/portal/owner/reservations
   */
  static async getOwnerReservations(req: Request, res: Response): Promise<void> {
    try {
      const user = await PortalController.extractUserFromToken(req);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Invalid token',
        });
        return;
      }

      if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          message: 'Access denied - Owner role required',
        });
        return;
      }

      // Get owner's property IDs first
      const wherePropertyClause = user.role === UserRole.ADMIN 
        ? {} 
        : { owner_id: user.userId };

      const properties = await prisma.properties.findMany({
        where: wherePropertyClause,
        select: { id: true },
      });

      const propertyIds = properties.map(p => p.id);

      // Get reservations for these properties
      const reservations = await prisma.reservations.findMany({
        where: {
          property_id: user.role === UserRole.ADMIN 
            ? undefined 
            : { in: propertyIds },
        },
        include: {
          properties: {
            select: {
              id: true,
              title: true,
              address: true,
            },
          },
        },
        orderBy: {
          check_in: 'desc',
        },
      });

      logger.info(`Owner ${user.email} accessed ${reservations.length} reservations`);

      res.json({
        success: true,
        data: reservations,
        count: reservations.length,
      });
    } catch (error) {
      logger.error('Error in getOwnerReservations:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get financial summary for owner's properties
   * GET /api/v2/portal/owner/finances
   */
  static async getOwnerFinances(req: Request, res: Response): Promise<void> {
    try {
      const user = await PortalController.extractUserFromToken(req);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - Invalid token',
        });
        return;
      }

      if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          message: 'Access denied - Owner role required',
        });
        return;
      }

      // Get owner's property IDs
      const wherePropertyClause = user.role === UserRole.ADMIN 
        ? {} 
        : { owner_id: user.userId };

      const properties = await prisma.properties.findMany({
        where: wherePropertyClause,
        select: { id: true, title: true },
      });

      const propertyIds = properties.map(p => p.id);

      // Get reservations revenue
      const reservations = await prisma.reservations.findMany({
        where: {
          property_id: user.role === UserRole.ADMIN 
            ? undefined 
            : { in: propertyIds },
          status: 'CONFIRMED',
        },
        select: {
          total_amount: true,
          paid_amount: true,
          outstanding_balance: true,
          property_id: true,
        },
      });

      const totalRevenue = reservations.reduce((sum, r) => sum + (r.total_amount || 0), 0);
      const totalPaid = reservations.reduce((sum, r) => sum + (r.paid_amount || 0), 0);
      const totalOutstanding = reservations.reduce((sum, r) => sum + (r.outstanding_balance || 0), 0);

      // Get expenses per property
      const expenses = await prisma.expenses.findMany({
        where: {
          property_id: user.role === UserRole.ADMIN 
            ? undefined 
            : { in: propertyIds },
        },
        select: {
          amount: true,
          category: true,
          property_id: true,
        },
      });

      const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      // Calculate per-property breakdown
      const propertyBreakdown = properties.map(property => {
        const propReservations = reservations.filter(r => r.property_id === property.id);
        const propExpenses = expenses.filter(e => e.property_id === property.id);
        
        const propRevenue = propReservations.reduce((sum, r) => sum + (r.total_amount || 0), 0);
        const propPaid = propReservations.reduce((sum, r) => sum + (r.paid_amount || 0), 0);
        const propExpenseTotal = propExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

        return {
          propertyId: property.id,
          propertyTitle: property.title,
          revenue: propRevenue,
          paid: propPaid,
          expenses: propExpenseTotal,
          netIncome: propPaid - propExpenseTotal,
        };
      });

      logger.info(`Owner ${user.email} accessed financial summary`);

      res.json({
        success: true,
        data: {
          summary: {
            totalRevenue,
            totalPaid,
            totalOutstanding,
            totalExpenses,
            netIncome: totalPaid - totalExpenses,
          },
          propertiesCount: properties.length,
          reservationsCount: reservations.length,
          propertyBreakdown,
        },
      });
    } catch (error) {
      logger.error('Error in getOwnerFinances:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

