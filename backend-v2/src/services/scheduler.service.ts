import { PrismaClient } from '@prisma/client';
import { BaseService } from './BaseService';
import { ServiceResponse } from '../types';
import { CurrentUser } from '../types/dto';
import { CreateManualBlockDto, SchedulerEventsResponseDto, SchedulerEventDto } from '../types/dto';
import logger from '../utils/logger';

export class SchedulerService extends BaseService {
  private static instance: SchedulerService;

  private constructor() {
    super();
  }

  public static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  /**
   * Get scheduler events (reservations and manual blocks)
   */
  public static async getEvents(
    currentUser: CurrentUser,
    filters: {
      propertyId?: string;
      startDate?: string;
      endDate?: string;
      type?: string[];
    } = {}
  ): Promise<ServiceResponse<SchedulerEventsResponseDto>> {
    try {
      const prisma = new PrismaClient();
      
      if (!prisma) {
        throw new Error('Prisma client not initialized');
      }

      logger.info(`[Scheduler Events] Starting events retrieval for user ${currentUser.email}`);

      // Build base where clauses based on user role
      let reservationWhere: any = {};
      let blockWhere: any = {};

      switch (currentUser.role) {
        case 'ADMIN':
        case 'MANAGER':
          // Can see all events
          break;
        
        case 'AGENT':
          reservationWhere.property = { agent_id: currentUser.id };
          blockWhere.property = { agent_id: currentUser.id };
          break;
        
        case 'OWNER':
          reservationWhere.property = { owner_id: currentUser.id };
          blockWhere.property = { owner_id: currentUser.id };
          break;
        
        case 'GUEST':
        default:
          // GUEST can only see their own reservations
          reservationWhere.guest_id = currentUser.id;
          // GUEST cannot see manual blocks
          blockWhere = { id: null }; // This will return no blocks
          break;
      }

      // Add property filter
      if (filters.propertyId) {
        reservationWhere.property_id = filters.propertyId;
        blockWhere.property_id = filters.propertyId;
      }

      // Add date filters
      if (filters.startDate || filters.endDate) {
        const dateWhere: any = {};
        if (filters.startDate) {
          dateWhere.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          dateWhere.lte = new Date(filters.endDate);
        }

        // For reservations: check if they overlap with the date range
        reservationWhere.OR = [
          {
            check_in: { lte: new Date(filters.endDate || '2099-12-31') },
            check_out: { gte: new Date(filters.startDate || '1900-01-01') }
          }
        ];

        // For blocks: check if they overlap with the date range
        blockWhere.OR = [
          {
            start_date: { lte: new Date(filters.endDate || '2099-12-31') },
            end_date: { gte: new Date(filters.startDate || '1900-01-01') }
          }
        ];
      }

      // Execute parallel queries
      const [reservations, manualBlocks] = await Promise.all([
        // Get reservations
        prisma.reservations.findMany({
          where: reservationWhere,
          include: {
            properties: {
              select: {
                id: true,
                name: true
              }
            },
            users_reservations_guest_idTousers: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            check_in: 'asc'
          }
        }),

        // Get manual blocks (only if not GUEST)
        currentUser.role !== 'GUEST' ? prisma.manual_blocks.findMany({
          where: blockWhere,
          include: {
            property: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            start_date: 'asc'
          }
        }) : []
      ]);

      await prisma.$disconnect();

      // Transform reservations to events
      const reservationEvents: SchedulerEventDto[] = reservations.map(reservation => ({
        id: reservation.id,
        type: 'reservation' as const,
        title: `${reservation.users_reservations_guest_idTousers?.firstName || ''} ${reservation.users_reservations_guest_idTousers?.lastName || ''}`.trim() || 'Guest',
        startDate: reservation.check_in.toISOString(),
        endDate: reservation.check_out.toISOString(),
        propertyId: reservation.property_id,
        property: {
          id: reservation.properties.id,
          name: reservation.properties.name
        },
        status: reservation.status,
        guestName: `${reservation.users_reservations_guest_idTousers?.firstName || ''} ${reservation.users_reservations_guest_idTousers?.lastName || ''}`.trim(),
        totalAmount: Number(reservation.total_amount),
        guestsCount: reservation.guests_count
      }));

      // Transform manual blocks to events
      const blockEvents: SchedulerEventDto[] = (manualBlocks || []).map(block => ({
        id: block.id,
        type: 'block' as const,
        title: block.title,
        startDate: block.start_date.toISOString(),
        endDate: block.end_date.toISOString(),
        propertyId: block.property_id,
        property: {
          id: block.property.id,
          name: block.property.name
        },
        notes: block.notes || undefined,
        createdBy: block.created_by
      }));

      // Combine and sort events by start date
      const allEvents = [...reservationEvents, ...blockEvents].sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      // Filter by type if specified
      const filteredEvents = filters.type && filters.type.length > 0 
        ? allEvents.filter(event => filters.type!.includes(event.type))
        : allEvents;

      const result: SchedulerEventsResponseDto = {
        events: filteredEvents,
        total: filteredEvents.length
      };

      logger.info(`[Scheduler Events END] Retrieved ${result.total} events for user ${currentUser.email}`);
      return SchedulerService.prototype.success(result, 'Scheduler events retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving scheduler events:', error);
      return SchedulerService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Create a manual block
   */
  public static async createBlock(
    currentUser: CurrentUser,
    data: CreateManualBlockDto
  ): Promise<ServiceResponse<any>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Manual Block Creation] Starting block creation for user ${currentUser.email}`);

      // Validate user permissions
      if (currentUser.role === 'GUEST') {
        await prisma.$disconnect();
        return SchedulerService.prototype.error('Forbidden', 'GUEST role cannot create manual blocks', 403);
      }

      // Validate property exists and user has access
      const property = await prisma.properties.findFirst({
        where: {
          id: data.propertyId,
          ...(currentUser.role === 'AGENT' ? { agent_id: currentUser.id } : {}),
          ...(currentUser.role === 'OWNER' ? { owner_id: currentUser.id } : {})
        }
      });

      if (!property) {
        await prisma.$disconnect();
        return SchedulerService.prototype.error('Not Found', 'Property not found or access denied', 404);
      }

      // Validate dates
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (startDate >= endDate) {
        await prisma.$disconnect();
        return SchedulerService.prototype.error('Bad Request', 'End date must be after start date', 400);
      }

      // Check for overlapping blocks
      const overlappingBlock = await prisma.manual_blocks.findFirst({
        where: {
          property_id: data.propertyId,
          OR: [
            {
              start_date: { lte: endDate },
              end_date: { gte: startDate }
            }
          ]
        }
      });

      if (overlappingBlock) {
        await prisma.$disconnect();
        return SchedulerService.prototype.error('Conflict', 'A manual block already exists for this date range', 409);
      }

      // Check for overlapping reservations
      const overlappingReservation = await prisma.reservations.findFirst({
        where: {
          property_id: data.propertyId,
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          OR: [
            {
              check_in: { lte: endDate },
              check_out: { gte: startDate }
            }
          ]
        }
      });

      if (overlappingReservation) {
        await prisma.$disconnect();
        return SchedulerService.prototype.error('Conflict', 'A reservation exists for this date range', 409);
      }

      // Create the manual block
      const manualBlock = await prisma.manual_blocks.create({
        data: {
          property_id: data.propertyId,
          start_date: startDate,
          end_date: endDate,
          title: data.title,
          notes: data.notes,
          created_by: currentUser.id
        },
        include: {
          property: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      // Create audit log
      const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await prisma.audit_logs.create({
        data: {
          id: auditId,
          entity_type: 'MANUAL_BLOCK',
          entity_id: manualBlock.id,
          action: 'CREATE',
          user_id: currentUser.id,
          changes: {
            propertyId: data.propertyId,
            propertyName: property.name,
            startDate: data.startDate,
            endDate: data.endDate,
            title: data.title,
            notes: data.notes || null
          },
          ip_address: '127.0.0.1',
          user_agent: 'Scheduler API'
        }
      });

      await prisma.$disconnect();

      const result = {
        id: manualBlock.id,
        propertyId: manualBlock.property_id,
        property: {
          id: manualBlock.property.id,
          name: manualBlock.property.name
        },
        startDate: manualBlock.start_date.toISOString(),
        endDate: manualBlock.end_date.toISOString(),
        title: manualBlock.title,
        notes: manualBlock.notes,
        createdAt: manualBlock.created_at.toISOString(),
        createdBy: manualBlock.created_by
      };

      logger.info(`[Manual Block Creation END] Block created successfully: ${manualBlock.id}`);
      return SchedulerService.prototype.success(result, 'Manual block created successfully');
    } catch (error) {
      logger.error('Error creating manual block:', error);
      return SchedulerService.prototype.handleDatabaseError(error);
    }
  }
}
