import { PrismaClient } from '@prisma/client';
import { BaseService } from './BaseService';
import { ServiceResponse } from '../types';
import { CurrentUser, ReservationQueryParams, PaginatedResponse, CreateReservationDto, UpdateReservationDto } from '../types/dto';
import logger from '../utils/logger';

// Reservation Response DTO
export interface ReservationResponseDto {
  id: string;
  reservationId: string;
  propertyId: string;
  guestId?: string;
  agentId?: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalAmount: number;
  paidAmount: number;
  outstandingBalance: number;
  status: string;
  source: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  specialRequests?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Reservation with related data
export interface ReservationWithDetailsDto extends ReservationResponseDto {
  property?: {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    capacity: number;
    bedrooms: number;
    bathrooms: number;
    pricePerNight: number;
    primaryImage?: string;
  };
  guest?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  agent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  _count?: {
    transactions?: number;
  };
}

export class ReservationService extends BaseService {
  private static instance: ReservationService;

  private constructor() {
    super();
  }

  public static getInstance(): ReservationService {
    if (!ReservationService.instance) {
      ReservationService.instance = new ReservationService();
    }
    return ReservationService.instance;
  }

  /**
   * Find all reservations with role-based access control
   */
  public static async findAll(currentUser: CurrentUser, queryParams: ReservationQueryParams): Promise<ServiceResponse<PaginatedResponse<ReservationWithDetailsDto>>> {
    try {
      const prisma = new PrismaClient();
      const { page = 1, limit = 10, search, status, propertyId, guestId, agentId, dateFrom, dateTo } = queryParams;
      const offset = (page - 1) * limit;

      // Build where clause based on user role
      let where: any = {};

      switch (currentUser.role) {
        case 'ADMIN':
        case 'MANAGER':
          // ADMIN and MANAGER can see all reservations
          break;
        
        case 'AGENT':
          // AGENT can see reservations for properties they manage
          where = { agent_id: currentUser.id };
          break;
        
        case 'OWNER':
          // OWNER can see reservations for their properties
          where = { 
            properties: { owner_id: currentUser.id }
          };
          break;
        
        case 'GUEST':
          // GUEST can see their own reservations
          where = { guest_id: currentUser.id };
          break;
        
        default:
          // Others cannot see any reservations
          where = { id: 'none' }; // This will return no results
      }

      // Add additional filters
      if (search) {
        where.OR = [
          { guest_name: { contains: search, mode: 'insensitive' } },
          { guest_email: { contains: search, mode: 'insensitive' } },
          { reservation_id: { contains: search, mode: 'insensitive' } },
          { properties: { name: { contains: search, mode: 'insensitive' } } }
        ];
      }
      if (status) where.status = status;
      if (propertyId) where.property_id = propertyId;
      if (guestId) where.guest_id = guestId;
      if (agentId) where.agent_id = agentId;
      if (dateFrom) where.check_in = { gte: new Date(dateFrom) };
      if (dateTo) where.check_out = { lte: new Date(dateTo) };

      // Get total count
      const total = await prisma.reservations.count({ where });

      // Get reservations with related data
      const reservations = await prisma.reservations.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          properties: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              country: true,
              capacity: true,
              bedrooms: true,
              bathrooms: true,
              price_per_night: true,
              primary_image: true
            }
          },
          users_reservations_guest_idTousers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          users_reservations_agent_idTousers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          _count: {
            select: {
              transactions: true
            }
          }
        }
      });

      await prisma.$disconnect();

      // Map to response DTOs
      const reservationResponses: ReservationWithDetailsDto[] = reservations.map(reservation => ({
        id: reservation.id,
        reservationId: reservation.reservation_id,
        propertyId: reservation.property_id,
        guestId: reservation.guest_id || undefined,
        agentId: reservation.agent_id || undefined,
        checkIn: reservation.check_in,
        checkOut: reservation.check_out,
        guests: reservation.guests,
        totalAmount: reservation.total_amount,
        paidAmount: reservation.paid_amount,
        outstandingBalance: reservation.outstanding_balance,
        status: reservation.status,
        source: reservation.source,
        guestName: reservation.guest_name || undefined,
        guestEmail: reservation.guest_email || undefined,
        guestPhone: reservation.guest_phone || undefined,
        specialRequests: reservation.special_requests || undefined,
        notes: reservation.notes || undefined,
        createdAt: reservation.created_at,
        updatedAt: reservation.updated_at,
        property: {
          id: reservation.properties.id,
          name: reservation.properties.name,
          address: reservation.properties.address,
          city: reservation.properties.city,
          country: reservation.properties.country,
          capacity: reservation.properties.capacity,
          bedrooms: reservation.properties.bedrooms,
          bathrooms: reservation.properties.bathrooms,
          pricePerNight: reservation.properties.price_per_night,
          primaryImage: reservation.properties.primary_image || undefined
        },
        guest: reservation.users_reservations_guest_idTousers ? {
          id: reservation.users_reservations_guest_idTousers.id,
          firstName: reservation.users_reservations_guest_idTousers.firstName,
          lastName: reservation.users_reservations_guest_idTousers.lastName,
          email: reservation.users_reservations_guest_idTousers.email,
          phone: reservation.users_reservations_guest_idTousers.phone || undefined
        } : undefined,
        agent: reservation.users_reservations_agent_idTousers ? {
          id: reservation.users_reservations_agent_idTousers.id,
          firstName: reservation.users_reservations_agent_idTousers.firstName,
          lastName: reservation.users_reservations_agent_idTousers.lastName,
          email: reservation.users_reservations_agent_idTousers.email,
          phone: reservation.users_reservations_agent_idTousers.phone || undefined
        } : undefined,
        _count: {
          transactions: reservation._count.transactions
        }
      }));

      // Create pagination metadata
      const pagination = ReservationService.prototype.createPaginationMetadata(page, limit, total);

      const result: PaginatedResponse<ReservationWithDetailsDto> = {
        data: reservationResponses,
        pagination,
      };

      return ReservationService.prototype.success(result);
    } catch (error) {
      logger.error('Error finding all reservations with RBAC:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Find reservation by ID with role-based access control
   */
  public static async findById(currentUser: CurrentUser, id: string): Promise<ServiceResponse<ReservationWithDetailsDto | null>> {
    try {
      const prisma = new PrismaClient();

      // Check access permissions
      let hasAccess = false;

      switch (currentUser.role) {
        case 'ADMIN':
        case 'MANAGER':
          // ADMIN and MANAGER can see any reservation
          hasAccess = true;
          break;
        
        case 'AGENT':
          // AGENT can see reservations for properties they manage
          const agentReservation = await prisma.reservations.findFirst({
            where: { id, agent_id: currentUser.id }
          });
          hasAccess = !!agentReservation;
          break;
        
        case 'OWNER':
          // OWNER can see reservations for their properties
          const ownerReservation = await prisma.reservations.findFirst({
            where: { 
              id, 
              properties: { owner_id: currentUser.id }
            }
          });
          hasAccess = !!ownerReservation;
          break;
        
        case 'GUEST':
          // GUEST can see their own reservations
          const guestReservation = await prisma.reservations.findFirst({
            where: { id, guest_id: currentUser.id }
          });
          hasAccess = !!guestReservation;
          break;
        
        default:
          // Others cannot see any reservations
          hasAccess = false;
      }

      if (!hasAccess) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Access denied', 'You do not have permission to view this reservation');
      }

      // Get reservation with all related data
      const reservation = await prisma.reservations.findUnique({
        where: { id },
        include: {
          properties: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              country: true,
              capacity: true,
              bedrooms: true,
              bathrooms: true,
              price_per_night: true,
              primary_image: true,
              amenities: true,
              house_rules: true,
              description: true
            }
          },
          users_reservations_guest_idTousers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              role: true,
              is_active: true
            }
          },
          users_reservations_agent_idTousers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              role: true,
              is_active: true
            }
          },
          transactions: {
            select: {
              id: true,
              transaction_id: true,
              type: true,
              category: true,
              amount: true,
              currency: true,
              description: true,
              status: true,
              payment_method: true,
              payment_reference: true,
              created_at: true
            },
            orderBy: { created_at: 'desc' }
          },
          _count: {
            select: {
              transactions: true
            }
          }
        }
      });

      await prisma.$disconnect();

      if (!reservation) {
        return ReservationService.prototype.success(null);
      }

      const reservationResponse: ReservationWithDetailsDto = {
        id: reservation.id,
        reservationId: reservation.reservation_id,
        propertyId: reservation.property_id,
        guestId: reservation.guest_id || undefined,
        agentId: reservation.agent_id || undefined,
        checkIn: reservation.check_in,
        checkOut: reservation.check_out,
        guests: reservation.guests,
        totalAmount: reservation.total_amount,
        paidAmount: reservation.paid_amount,
        outstandingBalance: reservation.outstanding_balance,
        status: reservation.status,
        source: reservation.source,
        guestName: reservation.guest_name || undefined,
        guestEmail: reservation.guest_email || undefined,
        guestPhone: reservation.guest_phone || undefined,
        specialRequests: reservation.special_requests || undefined,
        notes: reservation.notes || undefined,
        createdAt: reservation.created_at,
        updatedAt: reservation.updated_at,
        property: {
          id: reservation.properties.id,
          name: reservation.properties.name,
          address: reservation.properties.address,
          city: reservation.properties.city,
          country: reservation.properties.country,
          capacity: reservation.properties.capacity,
          bedrooms: reservation.properties.bedrooms,
          bathrooms: reservation.properties.bathrooms,
          pricePerNight: reservation.properties.price_per_night,
          primaryImage: reservation.properties.primary_image || undefined
        },
        guest: reservation.users_reservations_guest_idTousers ? {
          id: reservation.users_reservations_guest_idTousers.id,
          firstName: reservation.users_reservations_guest_idTousers.firstName,
          lastName: reservation.users_reservations_guest_idTousers.lastName,
          email: reservation.users_reservations_guest_idTousers.email,
          phone: reservation.users_reservations_guest_idTousers.phone || undefined
        } : undefined,
        agent: reservation.users_reservations_agent_idTousers ? {
          id: reservation.users_reservations_agent_idTousers.id,
          firstName: reservation.users_reservations_agent_idTousers.firstName,
          lastName: reservation.users_reservations_agent_idTousers.lastName,
          email: reservation.users_reservations_agent_idTousers.email,
          phone: reservation.users_reservations_agent_idTousers.phone || undefined
        } : undefined,
        _count: {
          transactions: reservation._count.transactions
        }
      };

      return ReservationService.prototype.success(reservationResponse);
    } catch (error) {
      logger.error('Error finding reservation by ID with RBAC:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Create new reservation
   */
  public static async create(currentUser: CurrentUser, data: CreateReservationDto): Promise<ServiceResponse<ReservationResponseDto>> {
    try {
      const prisma = new PrismaClient();

      // Validate permissions
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.role !== 'AGENT') {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Forbidden', 'Only ADMIN, MANAGER, and AGENT can create reservations', 403);
      }

      // Verify property exists
      const property = await prisma.properties.findUnique({
        where: { id: data.propertyId },
      });

      if (!property) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Not Found', 'Property not found', 404);
      }

      // If AGENT, they can only create reservations for properties they manage
      if (currentUser.role === 'AGENT' && property.agent_id !== currentUser.id) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Forbidden', 'AGENT can only create reservations for their managed properties', 403);
      }

      // Verify guest exists if provided
      if (data.guestId) {
        const guest = await prisma.user.findUnique({
          where: { id: data.guestId },
        });

        if (!guest) {
          await prisma.$disconnect();
          return ReservationService.prototype.error('Not Found', 'Guest not found', 404);
        }
      }

      // Verify agent exists if provided and different from current user
      if (data.agentId && data.agentId !== currentUser.id) {
        const agent = await prisma.user.findUnique({
          where: { id: data.agentId },
        });

        if (!agent) {
          await prisma.$disconnect();
          return ReservationService.prototype.error('Not Found', 'Agent not found', 404);
        }
      }

      // Generate reservation ID
      const reservationId = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Create reservation
      const reservation = await prisma.reservations.create({
        data: {
          id: `reservation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          reservation_id: reservationId,
          property_id: data.propertyId,
          guest_id: data.guestId || null,
          agent_id: data.agentId || currentUser.id,
          check_in: new Date(data.checkIn),
          check_out: new Date(data.checkOut),
          guests: data.guests,
          total_amount: data.totalAmount,
          paid_amount: 0,
          outstanding_balance: data.totalAmount,
          status: 'PENDING',
          source: data.source,
          guest_name: data.guestName,
          guest_email: data.guestEmail,
          guest_phone: data.guestPhone,
          special_requests: data.specialRequests,
          notes: data.notes,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // TODO: Log audit action - temporarily disabled
      // await prisma.audit_logs.create({
      //   data: {
      //     id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      //     user_id: currentUser.id,
      //     action: 'CREATE_RESERVATION',
      //     entity_type: 'RESERVATION',
      //     entity_id: reservation.id,
      //     ip_address: '127.0.0.1', // TODO: Get from request
      //     user_agent: 'Backend-V2',
      //   },
      // });

      await prisma.$disconnect();

      // Return the created reservation with full details
      const reservationResult = await ReservationService.findById(currentUser, reservation.id);
      if (!reservationResult.success || !reservationResult.data) {
        return ReservationService.prototype.error('Error', 'Failed to retrieve created reservation', 500);
      }

      logger.info(`Reservation created: ${reservationId} by ${currentUser.email}`);
      return ReservationService.prototype.success(reservationResult.data);
    } catch (error) {
      logger.error('Error creating reservation:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Update reservation
   */
  public static async update(currentUser: CurrentUser, id: string, data: UpdateReservationDto): Promise<ServiceResponse<ReservationResponseDto>> {
    try {
      const prisma = new PrismaClient();

      // Check if reservation exists
      const existingReservation = await prisma.reservations.findUnique({
        where: { id },
      });

      if (!existingReservation) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Not Found', 'Reservation not found', 404);
      }

      // Check permissions
      const canEdit = currentUser.role === 'ADMIN' || 
                     currentUser.role === 'MANAGER' || 
                     (currentUser.role === 'AGENT' && existingReservation.agent_id === currentUser.id) ||
                     (currentUser.role === 'OWNER' && existingReservation.property_id);

      // If OWNER, check if they own the property
      if (currentUser.role === 'OWNER' && existingReservation.property_id) {
        const property = await prisma.properties.findUnique({
          where: { id: existingReservation.property_id },
        });

        if (property && property.owner_id !== currentUser.id) {
          await prisma.$disconnect();
          return ReservationService.prototype.error('Forbidden', 'OWNER can only edit reservations for their properties', 403);
        }
      }

      if (!canEdit) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Forbidden', 'You do not have permission to edit this reservation', 403);
      }

      // Verify property exists if changing
      if (data.propertyId && data.propertyId !== existingReservation.property_id) {
        const property = await prisma.properties.findUnique({
          where: { id: data.propertyId },
        });

        if (!property) {
          await prisma.$disconnect();
          return ReservationService.prototype.error('Not Found', 'New property not found', 404);
        }
      }

      // Verify guest exists if changing
      if (data.guestId && data.guestId !== existingReservation.guest_id) {
        const guest = await prisma.user.findUnique({
          where: { id: data.guestId },
        });

        if (!guest) {
          await prisma.$disconnect();
          return ReservationService.prototype.error('Not Found', 'New guest not found', 404);
        }
      }

      // Verify agent exists if changing
      if (data.agentId && data.agentId !== existingReservation.agent_id) {
        const agent = await prisma.user.findUnique({
          where: { id: data.agentId },
        });

        if (!agent) {
          await prisma.$disconnect();
          return ReservationService.prototype.error('Not Found', 'New agent not found', 404);
        }
      }

      // Build update data
      const updateData: any = {};
      if (data.propertyId !== undefined) updateData.property_id = data.propertyId;
      if (data.guestId !== undefined) updateData.guest_id = data.guestId;
      if (data.agentId !== undefined) updateData.agent_id = data.agentId;
      if (data.checkIn !== undefined) updateData.check_in = new Date(data.checkIn);
      if (data.checkOut !== undefined) updateData.check_out = new Date(data.checkOut);
      if (data.guests !== undefined) updateData.guests = data.guests;
      if (data.totalAmount !== undefined) updateData.total_amount = data.totalAmount;
      if (data.paidAmount !== undefined) updateData.paid_amount = data.paidAmount;
      if (data.outstandingBalance !== undefined) updateData.outstanding_balance = data.outstandingBalance;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.source !== undefined) updateData.source = data.source;
      if (data.guestName !== undefined) updateData.guest_name = data.guestName;
      if (data.guestEmail !== undefined) updateData.guest_email = data.guestEmail;
      if (data.guestPhone !== undefined) updateData.guest_phone = data.guestPhone;
      if (data.specialRequests !== undefined) updateData.special_requests = data.specialRequests;
      if (data.notes !== undefined) updateData.notes = data.notes;

      // Update reservation
      const updatedReservation = await prisma.reservations.update({
        where: { id },
        data: updateData,
      });

      // Log audit action
      await prisma.audit_logs.create({
        data: {
          user_id: currentUser.id,
          action: 'UPDATE_RESERVATION',
          entity_type: 'RESERVATION',
          entity_id: id,
          details: {
            updated_fields: Object.keys(updateData),
            reservation_id: existingReservation.reservation_id,
          },
          ip_address: '127.0.0.1', // TODO: Get from request
          user_agent: 'Backend-V2',
        },
      });

      await prisma.$disconnect();

      // Return the updated reservation with full details
      const reservationResult = await ReservationService.findById(currentUser, id);
      if (!reservationResult.success || !reservationResult.data) {
        return ReservationService.prototype.error('Error', 'Failed to retrieve updated reservation', 500);
      }

      logger.info(`Reservation updated: ${updatedReservation.reservation_id} by ${currentUser.email}`);
      return ReservationService.prototype.success(reservationResult.data);
    } catch (error) {
      logger.error('Error updating reservation:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }
}
