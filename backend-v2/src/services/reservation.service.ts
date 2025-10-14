import { PrismaClient } from '@prisma/client';
import { BaseService } from './BaseService';
import { ServiceResponse } from '../types';
import { CurrentUser, ReservationQueryParams, PaginatedResponse, CreateReservationDto, UpdateReservationDto } from '../types/dto';
import { conflictCheckService } from './conflict-check.service';
import logger from '../utils/logger';

// Reservation Response DTO
export interface ReservationResponseDto {
  id: string;
  reservationId: string;
  propertyId: string;
  propertyName?: string; // ✅ Додано для frontend таблиці
  guestId?: string;
  agentId?: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  guestCount?: number; // ✅ Альтернативне поле
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
  nights?: number; // ✅ Додано для frontend (розраховується автоматично)
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
  // ✅ Extended fields для детальної сторінки
  notesList?: Array<{
    id: number;
    content: string;
    type: string;
    priority: string;
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
  }>;
  payments?: Array<{
    id: number;
    amount: number;
    method: string;
    date: string;
    reference?: string;
    description?: string;
    type: string;
    status: string;
    createdAt?: string;
  }>;
  pricingHistory?: Array<{
    id: number;
    pricePerNight: number;
    totalAmount: number;
    reason: string;
    date: string;
    changedBy: string;
  }>;
  communicationHistory?: Array<{
    id: number;
    type: string;
    subject: string;
    content?: string;
    date: string;
    status: string;
    sentBy?: string;
  }>;
  adjustments?: Array<{
    id: number;
    type: string;
    amount: number;
    reason: string;
    createdBy: string;
    createdAt: string;
  }>;
  createdBy?: {
    name: string;
    email: string;
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
      
      // Date filtering: Show all reservations that OVERLAP with the period
      // A reservation overlaps if: check_in < dateTo AND check_out > dateFrom
      if (dateFrom && dateTo) {
        where.AND = [
          { check_in: { lt: new Date(dateTo) } },
          { check_out: { gt: new Date(dateFrom) } }
        ];
      } else if (dateFrom) {
        // Only dateFrom provided - show all reservations that end after dateFrom
        where.check_out = { gte: new Date(dateFrom) };
      } else if (dateTo) {
        // Only dateTo provided - show all reservations that start before dateTo
        where.check_in = { lte: new Date(dateTo) };
      }

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
      const reservationResponses: ReservationWithDetailsDto[] = reservations.map(reservation => {
        // Calculate nights (difference between check-out and check-in)
        const checkInDate = new Date(reservation.check_in);
        const checkOutDate = new Date(reservation.check_out);
        const nightsCount = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: reservation.id,
          reservationId: reservation.reservation_id,
          propertyId: reservation.property_id,
          propertyName: reservation.properties.name, // ✅ Додано для frontend таблиці
          guestId: reservation.guest_id || undefined,
          agentId: reservation.agent_id || undefined,
          checkIn: reservation.check_in,
          checkOut: reservation.check_out,
          guests: reservation.guests,
          guestCount: reservation.guests, // ✅ Додано альтернативне поле
          nights: nightsCount, // ✅ Розраховано автоматично
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
      });

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

      // Calculate nights
      const checkInDate = new Date(reservation.check_in);
      const checkOutDate = new Date(reservation.check_out);
      const nightsCount = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      const reservationResponse: ReservationWithDetailsDto = {
        id: reservation.id,
        reservationId: reservation.reservation_id,
        propertyId: reservation.property_id,
        propertyName: reservation.properties.name, // ✅ Додано для frontend
        guestId: reservation.guest_id || undefined,
        agentId: reservation.agent_id || undefined,
        checkIn: reservation.check_in,
        checkOut: reservation.check_out,
        guests: reservation.guests,
        guestCount: reservation.guests, // ✅ Альтернативне поле
        nights: nightsCount, // ✅ Розраховано автоматично
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
        },
        // ✅ Extended fields для детальної сторінки
        notesList: [], // TODO: Додати коли буде таблиця notes в БД
        payments: reservation.transactions.map(tx => ({
          id: parseInt(tx.id),
          amount: parseFloat(tx.amount.toString()),
          method: tx.payment_method || 'unknown',
          date: tx.created_at.toISOString().split('T')[0],
          reference: tx.payment_reference || undefined,
          description: tx.description || undefined,
          type: tx.type || 'payment',
          status: tx.status || 'completed',
          createdAt: tx.created_at.toISOString()
        })),
        pricingHistory: [], // TODO: Додати коли буде таблиця pricing_history в БД
        communicationHistory: [], // TODO: Додати коли буде таблиця communications в БД
        adjustments: [] // TODO: Додати коли буде таблиця adjustments в БД
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
      console.log('🚀 [RESERVATION SERVICE] Starting reservation creation...');
      console.log('🚀 [RESERVATION SERVICE] Current user:', {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role
      });
      console.log('🚀 [RESERVATION SERVICE] Input data:', JSON.stringify(data, null, 2));
      
      const prisma = new PrismaClient();

      // Validate permissions
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.role !== 'AGENT') {
        console.log('❌ [RESERVATION SERVICE] Insufficient permissions for user:', currentUser.role);
        await prisma.$disconnect();
        return ReservationService.prototype.error('Forbidden', 'Only ADMIN, MANAGER, and AGENT can create reservations', 403);
      }
      
      console.log('✅ [RESERVATION SERVICE] User has sufficient permissions');

      // Verify property exists
      console.log('🔍 [RESERVATION SERVICE] Checking if property exists:', data.propertyId);
      const property = await prisma.properties.findUnique({
        where: { id: data.propertyId },
      });

      if (!property) {
        console.log('❌ [RESERVATION SERVICE] Property not found:', data.propertyId);
        await prisma.$disconnect();
        return ReservationService.prototype.error('Not Found', 'Property not found', 404);
      }
      
      console.log('✅ [RESERVATION SERVICE] Property found:', {
        id: property.id,
        name: property.name,
        address: property.address
      });

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

      logger.info(`[Reservation Creation] Starting reservation creation: ${data.guestName}`);

      // Check for conflicts using the new conflict check service
      const checkInDate = new Date(data.checkIn);
      const checkOutDate = new Date(data.checkOut);

      const conflictResult = await conflictCheckService.checkForConflicts({
        propertyId: data.propertyId,
        checkIn: checkInDate,
        checkOut: checkOutDate
      });

      if (conflictResult.hasConflict) {
        await prisma.$disconnect();
        const conflictingDetails = conflictResult.conflictingReservations
          .map(conflict => `${conflict.guestName} (${conflict.source}) ${conflict.checkIn.toISOString().split('T')[0]} to ${conflict.checkOut.toISOString().split('T')[0]}`)
          .join(', ');
        
        return ReservationService.prototype.error(
          'Conflict', 
          `The property is not available for the selected dates. Conflicting reservations: ${conflictingDetails}`, 
          409
        );
      }

      logger.info(`[Reservation Creation] Availability check passed for property ${data.propertyId}`);
      console.log('✅ [RESERVATION SERVICE] Availability check passed');

      // Create reservation in transaction with audit logging
      const result = await prisma.$transaction(async (tx) => {
        logger.info(`[Reservation Creation Step 1/2] Creating reservation record...`);
        console.log('🔍 [RESERVATION SERVICE] Starting transaction...');
        
        // Generate reservation ID
        const reservationId = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        console.log('🔍 [RESERVATION SERVICE] Generated reservation ID:', reservationId);

        console.log('🔍 [RESERVATION SERVICE] About to create reservation with data:', {
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
          special_requests: data.specialRequests
        });

        // Create reservation
        const reservation = await tx.reservations.create({
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
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        console.log('✅ [RESERVATION SERVICE] Reservation created successfully:', {
          id: reservation.id,
          reservation_id: reservation.reservation_id
        });

        // Notes functionality removed to avoid database schema conflicts

        logger.info(`[Reservation Creation Step 2/2] Creating audit log...`);
        console.log('🔍 [RESERVATION SERVICE] Creating audit log...');

        // Create audit log
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.audit_logs.create({
          data: {
            id: auditId,
            user_id: currentUser.id,
            action: 'RESERVATION_CREATED',
            entity_type: 'RESERVATION',
            entity_id: reservation.id,
            ip_address: '127.0.0.1',
            user_agent: 'Backend-V2-ReservationService',
            changes: {
              created_by: currentUser.email,
              reservation_id: reservationId,
              guest_name: data.guestName,
              guest_email: data.guestEmail,
              property_id: data.propertyId,
              check_in: data.checkIn,
              check_out: data.checkOut,
              total_amount: data.totalAmount
            }
          }
        });

        logger.info(`[Reservation Creation END] Reservation created successfully: ${reservationId}`);
        console.log('✅ [RESERVATION SERVICE] Transaction completed successfully');
        return reservation;
      });

      await prisma.$disconnect();

      console.log('🔍 [RESERVATION SERVICE] Fetching created reservation details...');
      // Return the created reservation with full details
      const reservationResult = await ReservationService.findById(currentUser, result.id);
      if (!reservationResult.success || !reservationResult.data) {
        console.log('❌ [RESERVATION SERVICE] Failed to retrieve created reservation');
        return ReservationService.prototype.error('Error', 'Failed to retrieve created reservation', 500);
      }

      logger.info(`Reservation created successfully: ${result.reservation_id} by ${currentUser.email}`);
      console.log('🎉 [RESERVATION SERVICE] Reservation creation completed successfully!');
      return ReservationService.prototype.success(reservationResult.data, 'Reservation created successfully');
    } catch (error) {
      logger.error('Error creating reservation:', error);
      console.log('❌ [RESERVATION SERVICE] Error occurred:', error);
      console.log('❌ [RESERVATION SERVICE] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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

      logger.info(`[Reservation Update] Starting reservation update: ${existingReservation.reservation_id}`);

      // Update reservation in transaction with audit logging
      const result = await prisma.$transaction(async (tx) => {
        logger.info(`[Reservation Update Step 1/2] Updating reservation record...`);
        
        // Update reservation
        const updatedReservation = await tx.reservations.update({
          where: { id },
          data: {
            ...updateData,
            updated_at: new Date(),
          },
        });

        logger.info(`[Reservation Update Step 2/2] Creating audit log...`);

        // Create audit log
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.audit_logs.create({
          data: {
            id: auditId,
            user_id: currentUser.id,
            action: 'RESERVATION_UPDATED',
            entity_type: 'RESERVATION',
            entity_id: id,
            ip_address: '127.0.0.1',
            user_agent: 'Backend-V2-ReservationService',
            changes: {
              updated_by: currentUser.email,
              updated_fields: Object.keys(updateData),
              reservation_id: existingReservation.reservation_id,
              old_values: updateData,
              new_values: updateData
            }
          }
        });

        logger.info(`[Reservation Update END] Reservation updated successfully: ${updatedReservation.reservation_id}`);
        return updatedReservation;
      });

      await prisma.$disconnect();

      // Return the updated reservation with full details
      const reservationResult = await ReservationService.findById(currentUser, id);
      if (!reservationResult.success || !reservationResult.data) {
        return ReservationService.prototype.error('Error', 'Failed to retrieve updated reservation', 500);
      }

      logger.info(`Reservation updated successfully: ${result.reservation_id} by ${currentUser.email}`);
      return ReservationService.prototype.success(reservationResult.data, 'Reservation updated successfully');
    } catch (error) {
      logger.error('Error updating reservation:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Update reservation dates with availability check
   */
  public static async updateDates(currentUser: CurrentUser, id: string, datesData: { checkIn: string; checkOut: string }): Promise<ServiceResponse<ReservationResponseDto>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Reservation Dates Update] Starting dates update for reservation ID: ${id}`);

      // Check if reservation exists
      const existingReservation = await prisma.reservations.findUnique({
        where: { id },
        include: {
          properties: true
        }
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

      // Check if reservation can be modified (business rules)
      if (existingReservation.status === 'CHECKED_OUT' || existingReservation.status === 'CANCELLED') {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Bad Request', 'Cannot modify dates for completed or cancelled reservations', 400);
      }

      // Check availability for new dates
      const checkInDate = new Date(datesData.checkIn);
      const checkOutDate = new Date(datesData.checkOut);

      // Check for overlapping reservations (excluding current reservation)
      const overlappingReservations = await prisma.reservations.findMany({
        where: {
          property_id: existingReservation.property_id,
          id: { not: id },
          status: { not: 'CANCELLED' },
          OR: [
            {
              check_in: { lt: checkOutDate },
              check_out: { gt: checkInDate }
            }
          ]
        }
      });

      if (overlappingReservations.length > 0) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Conflict', 'Property is not available for the selected dates', 409);
      }

      // Update reservation dates in transaction with audit logging
      const result = await prisma.$transaction(async (tx) => {
        logger.info(`[Reservation Dates Update Step 1/2] Updating dates...`);
        
        // Update reservation dates
        const updatedReservation = await tx.reservations.update({
          where: { id },
          data: {
            check_in: checkInDate,
            check_out: checkOutDate,
            updated_at: new Date(),
          },
        });

        logger.info(`[Reservation Dates Update Step 2/2] Creating audit log...`);

        // Create audit log
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.audit_logs.create({
          data: {
            id: auditId,
            user_id: currentUser.id,
            action: 'RESERVATION_DATES_UPDATED',
            entity_type: 'RESERVATION',
            entity_id: id,
            ip_address: '127.0.0.1',
            user_agent: 'Backend-V2-ReservationService',
            changes: {
              updated_by: currentUser.email,
              reservation_id: existingReservation.reservation_id,
              old_check_in: existingReservation.check_in.toISOString(),
              old_check_out: existingReservation.check_out.toISOString(),
              new_check_in: checkInDate.toISOString(),
              new_check_out: checkOutDate.toISOString(),
              property_id: existingReservation.property_id
            }
          }
        });

        logger.info(`[Reservation Dates Update END] Dates updated successfully: ${updatedReservation.reservation_id}`);
        return updatedReservation;
      });

      await prisma.$disconnect();

      // Return the updated reservation with full details
      const reservationResult = await ReservationService.findById(currentUser, id);
      if (!reservationResult.success || !reservationResult.data) {
        return ReservationService.prototype.error('Error', 'Failed to retrieve updated reservation', 500);
      }

      logger.info(`Reservation dates updated successfully: ${result.reservation_id} by ${currentUser.email}`);
      return ReservationService.prototype.success(reservationResult.data, 'Reservation dates updated successfully');
    } catch (error) {
      logger.error('Error updating reservation dates:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Get reservation statistics
   */
  public static async getStats(currentUser: CurrentUser): Promise<ServiceResponse<any>> {
    try {
      logger.info(`Getting reservation statistics for user ${currentUser.email}`);

      // RBAC check
      if (currentUser.role === 'GUEST') {
        return {
          success: false,
          error: 'Forbidden',
          message: 'GUEST role cannot access reservation statistics'
        };
      }

      // Create Prisma instance for static method
      const prisma = new (require('@prisma/client').PrismaClient)();

      // Get statistics based on user role
      let whereClause = {};

      if (currentUser.role === 'OWNER') {
        // Owners can see reservations for their properties
        whereClause = {
          properties: {
            owner_id: currentUser.id
          }
        };
      } else if (currentUser.role === 'AGENT') {
        // Agents can see reservations they manage
        whereClause = { agent_id: currentUser.id };
      }
      // ADMIN and MANAGER can see all reservations

      // Get basic counts
      const totalReservations = await prisma.reservations.count({ where: whereClause });
      const pendingReservations = await prisma.reservations.count({ where: { ...whereClause, status: 'PENDING' } });
      const confirmedReservations = await prisma.reservations.count({ where: { ...whereClause, status: 'CONFIRMED' } });
      const checkedInReservations = await prisma.reservations.count({ where: { ...whereClause, status: 'CHECKED_IN' } });
      const checkedOutReservations = await prisma.reservations.count({ where: { ...whereClause, status: 'CHECKED_OUT' } });
      const cancelledReservations = await prisma.reservations.count({ where: { ...whereClause, status: 'CANCELLED' } });

      const stats = {
        total: totalReservations,
        pending: pendingReservations,
        confirmed: confirmedReservations,
        checkedIn: checkedInReservations,
        checkedOut: checkedOutReservations,
        cancelled: cancelledReservations,
        byStatus: [],
        byMonth: []
      };

      await prisma.$disconnect();

      logger.info(`Reservation statistics retrieved for user ${currentUser.email}`);
      return {
        success: true,
        data: stats,
        message: 'Reservation statistics retrieved successfully'
      };
    } catch (error) {
      logger.error('Error retrieving reservation statistics:', error);
      return {
        success: false,
        error: 'Database operation failed',
        message: 'An error occurred while processing your request'
      };
    }
  }

  // ============================================
  // NOTES MANAGEMENT
  // ============================================

  /**
   * Add note to reservation
   */
  public static async addNote(
    currentUser: CurrentUser,
    reservationId: string,
    noteData: { content: string; type?: string; priority?: string }
  ): Promise<ServiceResponse<any>> {
    try {
      const prisma = new PrismaClient();

      // Get reservation first
      const reservation = await prisma.reservations.findUnique({
        where: { id: reservationId },
        include: { properties: true }
      });

      if (!reservation) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Not Found', 'Reservation not found', 404);
      }

      // RBAC check
      const canEdit = await ReservationService.checkEditPermission(currentUser, reservation);
      if (!canEdit) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Forbidden', 'You do not have permission to add notes to this reservation', 403);
      }

      // Create note (mock implementation - adjust based on your schema)
      const note = {
        id: Date.now(),
        reservationId,
        content: noteData.content,
        type: noteData.type || 'internal',
        priority: noteData.priority || 'normal',
        createdBy: `${currentUser.firstName} ${currentUser.lastName}`,
        createdAt: new Date().toISOString(),
      };

      await prisma.$disconnect();

      logger.info(`Note added to reservation ${reservationId} by user ${currentUser.email}`);
      return ReservationService.prototype.success(note, 'Note added successfully');
    } catch (error) {
      logger.error('Error adding note:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Update reservation note
   */
  public static async updateNote(
    currentUser: CurrentUser,
    reservationId: string,
    noteId: string,
    content: string
  ): Promise<ServiceResponse<any>> {
    try {
      const prisma = new PrismaClient();

      // Get reservation
      const reservation = await prisma.reservations.findUnique({
        where: { id: reservationId },
        include: { properties: true }
      });

      if (!reservation) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Not Found', 'Reservation not found', 404);
      }

      // RBAC check
      const canEdit = await ReservationService.checkEditPermission(currentUser, reservation);
      if (!canEdit) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Forbidden', 'You do not have permission to update notes for this reservation', 403);
      }

      // Mock update
      const updatedNote = {
        id: noteId,
        content,
        updatedAt: new Date().toISOString(),
      };

      await prisma.$disconnect();

      logger.info(`Note ${noteId} updated for reservation ${reservationId} by user ${currentUser.email}`);
      return ReservationService.prototype.success(updatedNote, 'Note updated successfully');
    } catch (error) {
      logger.error('Error updating note:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Delete reservation note
   */
  public static async deleteNote(
    currentUser: CurrentUser,
    reservationId: string,
    noteId: string
  ): Promise<ServiceResponse<any>> {
    try {
      const prisma = new PrismaClient();

      // Get reservation
      const reservation = await prisma.reservations.findUnique({
        where: { id: reservationId },
        include: { properties: true }
      });

      if (!reservation) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Not Found', 'Reservation not found', 404);
      }

      // RBAC check
      const canEdit = await ReservationService.checkEditPermission(currentUser, reservation);
      if (!canEdit) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Forbidden', 'You do not have permission to delete notes from this reservation', 403);
      }

      await prisma.$disconnect();

      logger.info(`Note ${noteId} deleted from reservation ${reservationId} by user ${currentUser.email}`);
      return ReservationService.prototype.success({ id: noteId }, 'Note deleted successfully');
    } catch (error) {
      logger.error('Error deleting note:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  // ============================================
  // PAYMENTS MANAGEMENT
  // ============================================

  /**
   * Add payment to reservation
   */
  public static async addPayment(
    currentUser: CurrentUser,
    reservationId: string,
    paymentData: { amount: number; method: string; date: string; reference?: string; description?: string; type?: string }
  ): Promise<ServiceResponse<any>> {
    try {
      const prisma = new PrismaClient();

      // Get reservation
      const reservation = await prisma.reservations.findUnique({
        where: { id: reservationId },
        include: { properties: true }
      });

      if (!reservation) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Not Found', 'Reservation not found', 404);
      }

      // RBAC check
      const canEdit = await ReservationService.checkEditPermission(currentUser, reservation);
      if (!canEdit) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Forbidden', 'You do not have permission to add payments to this reservation', 403);
      }

      // Update paid amount
      const newPaidAmount = (reservation.paid_amount || 0) + paymentData.amount;
      const newOutstandingBalance = reservation.total_amount - newPaidAmount;

      await prisma.reservations.update({
        where: { id: reservationId },
        data: {
          paid_amount: newPaidAmount,
          outstanding_balance: newOutstandingBalance,
          updated_at: new Date(),
        }
      });

      // Create payment record (mock - adjust based on schema)
      const payment = {
        id: Date.now(),
        reservationId,
        amount: paymentData.amount,
        method: paymentData.method,
        date: paymentData.date,
        reference: paymentData.reference,
        description: paymentData.description,
        type: paymentData.type || 'payment',
        status: 'completed',
        createdAt: new Date().toISOString(),
      };

      await prisma.$disconnect();

      logger.info(`Payment added to reservation ${reservationId} by user ${currentUser.email}`);
      return ReservationService.prototype.success(payment, 'Payment added successfully');
    } catch (error) {
      logger.error('Error adding payment:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Delete payment from reservation
   */
  public static async deletePayment(
    currentUser: CurrentUser,
    reservationId: string,
    paymentId: string
  ): Promise<ServiceResponse<any>> {
    try {
      const prisma = new PrismaClient();

      // Get reservation
      const reservation = await prisma.reservations.findUnique({
        where: { id: reservationId },
        include: { properties: true }
      });

      if (!reservation) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Not Found', 'Reservation not found', 404);
      }

      // RBAC check
      const canEdit = await ReservationService.checkEditPermission(currentUser, reservation);
      if (!canEdit) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Forbidden', 'You do not have permission to delete payments from this reservation', 403);
      }

      await prisma.$disconnect();

      logger.info(`Payment ${paymentId} deleted from reservation ${reservationId} by user ${currentUser.email}`);
      return ReservationService.prototype.success({ id: paymentId }, 'Payment deleted successfully');
    } catch (error) {
      logger.error('Error deleting payment:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  // ============================================
  // ADJUSTMENTS MANAGEMENT
  // ============================================

  /**
   * Add adjustment to reservation
   */
  public static async addAdjustment(
    currentUser: CurrentUser,
    reservationId: string,
    adjustmentData: { type: string; amount: number; reason: string }
  ): Promise<ServiceResponse<any>> {
    try {
      const prisma = new PrismaClient();

      // Get reservation
      const reservation = await prisma.reservations.findUnique({
        where: { id: reservationId },
        include: { properties: true }
      });

      if (!reservation) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Not Found', 'Reservation not found', 404);
      }

      // RBAC check
      const canEdit = await ReservationService.checkEditPermission(currentUser, reservation);
      if (!canEdit) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Forbidden', 'You do not have permission to add adjustments to this reservation', 403);
      }

      // Update total amount based on adjustment
      const newTotalAmount = reservation.total_amount + adjustmentData.amount;
      const newOutstandingBalance = newTotalAmount - (reservation.paid_amount || 0);

      await prisma.reservations.update({
        where: { id: reservationId },
        data: {
          total_amount: newTotalAmount,
          outstanding_balance: newOutstandingBalance,
          updated_at: new Date(),
        }
      });

      // Create adjustment record (mock)
      const adjustment = {
        id: Date.now(),
        reservationId,
        type: adjustmentData.type,
        amount: adjustmentData.amount,
        reason: adjustmentData.reason,
        createdBy: `${currentUser.firstName} ${currentUser.lastName}`,
        createdAt: new Date().toISOString(),
      };

      await prisma.$disconnect();

      logger.info(`Adjustment added to reservation ${reservationId} by user ${currentUser.email}`);
      return ReservationService.prototype.success(adjustment, 'Adjustment added successfully');
    } catch (error) {
      logger.error('Error adding adjustment:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Delete adjustment from reservation
   */
  public static async deleteAdjustment(
    currentUser: CurrentUser,
    reservationId: string,
    adjustmentId: string
  ): Promise<ServiceResponse<any>> {
    try {
      const prisma = new PrismaClient();

      // Get reservation
      const reservation = await prisma.reservations.findUnique({
        where: { id: reservationId },
        include: { properties: true }
      });

      if (!reservation) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Not Found', 'Reservation not found', 404);
      }

      // RBAC check
      const canEdit = await ReservationService.checkEditPermission(currentUser, reservation);
      if (!canEdit) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Forbidden', 'You do not have permission to delete adjustments from this reservation', 403);
      }

      await prisma.$disconnect();

      logger.info(`Adjustment ${adjustmentId} deleted from reservation ${reservationId} by user ${currentUser.email}`);
      return ReservationService.prototype.success({ id: adjustmentId }, 'Adjustment deleted successfully');
    } catch (error) {
      logger.error('Error deleting adjustment:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  // ============================================
  // COMMUNICATIONS MANAGEMENT
  // ============================================

  /**
   * Send communication to guest
   */
  public static async sendCommunication(
    currentUser: CurrentUser,
    reservationId: string,
    commData: { type: string; subject: string; content: string }
  ): Promise<ServiceResponse<any>> {
    try {
      const prisma = new PrismaClient();

      // Get reservation
      const reservation = await prisma.reservations.findUnique({
        where: { id: reservationId },
        include: { properties: true }
      });

      if (!reservation) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Not Found', 'Reservation not found', 404);
      }

      // RBAC check
      const canEdit = await ReservationService.checkEditPermission(currentUser, reservation);
      if (!canEdit) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Forbidden', 'You do not have permission to send communications for this reservation', 403);
      }

      // Create communication record (mock - integrate with real email/SMS service)
      const communication = {
        id: Date.now(),
        reservationId,
        type: commData.type,
        subject: commData.subject,
        content: commData.content,
        status: 'sent',
        sentBy: `${currentUser.firstName} ${currentUser.lastName}`,
        date: new Date().toISOString(),
      };

      await prisma.$disconnect();

      logger.info(`Communication sent for reservation ${reservationId} by user ${currentUser.email}`);
      return ReservationService.prototype.success(communication, 'Communication sent successfully');
    } catch (error) {
      logger.error('Error sending communication:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Get all communications for reservation
   */
  public static async getCommunications(
    currentUser: CurrentUser,
    reservationId: string
  ): Promise<ServiceResponse<any[]>> {
    try {
      const prisma = new PrismaClient();

      // Get reservation
      const reservation = await prisma.reservations.findUnique({
        where: { id: reservationId },
        include: { properties: true }
      });

      if (!reservation) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Not Found', 'Reservation not found', 404);
      }

      // RBAC check
      const canView = await ReservationService.checkViewPermission(currentUser, reservation);
      if (!canView) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Forbidden', 'You do not have permission to view communications for this reservation', 403);
      }

      // Mock communications array
      const communications: any[] = [];

      await prisma.$disconnect();

      logger.info(`Communications retrieved for reservation ${reservationId}`);
      return ReservationService.prototype.success(communications, 'Communications retrieved successfully');
    } catch (error) {
      logger.error('Error getting communications:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  // ============================================
  // INVOICES MANAGEMENT
  // ============================================

  /**
   * Generate invoice for reservation
   */
  public static async generateInvoice(
    currentUser: CurrentUser,
    reservationId: string,
    type: string
  ): Promise<ServiceResponse<any>> {
    try {
      const prisma = new PrismaClient();

      // Get reservation
      const reservation = await prisma.reservations.findUnique({
        where: { id: reservationId },
        include: { properties: true }
      });

      if (!reservation) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Not Found', 'Reservation not found', 404);
      }

      // RBAC check
      const canEdit = await ReservationService.checkEditPermission(currentUser, reservation);
      if (!canEdit) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Forbidden', 'You do not have permission to generate invoices for this reservation', 403);
      }

      // Generate invoice (mock - integrate with real invoice generator)
      const invoice = {
        id: Date.now(),
        reservationId,
        type,
        number: `INV-${Date.now()}`,
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        amount: reservation.total_amount,
        status: 'draft',
        pdfUrl: null,
      };

      await prisma.$disconnect();

      logger.info(`Invoice generated for reservation ${reservationId} by user ${currentUser.email}`);
      return ReservationService.prototype.success(invoice, 'Invoice generated successfully');
    } catch (error) {
      logger.error('Error generating invoice:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Get all invoices for reservation
   */
  public static async getInvoices(
    currentUser: CurrentUser,
    reservationId: string
  ): Promise<ServiceResponse<any[]>> {
    try {
      const prisma = new PrismaClient();

      // Get reservation
      const reservation = await prisma.reservations.findUnique({
        where: { id: reservationId },
        include: { properties: true }
      });

      if (!reservation) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Not Found', 'Reservation not found', 404);
      }

      // RBAC check
      const canView = await ReservationService.checkViewPermission(currentUser, reservation);
      if (!canView) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Forbidden', 'You do not have permission to view invoices for this reservation', 403);
      }

      // Mock invoices array
      const invoices: any[] = [];

      await prisma.$disconnect();

      logger.info(`Invoices retrieved for reservation ${reservationId}`);
      return ReservationService.prototype.success(invoices, 'Invoices retrieved successfully');
    } catch (error) {
      logger.error('Error getting invoices:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  // ============================================
  // PRICING MANAGEMENT
  // ============================================

  /**
   * Update reservation pricing
   */
  public static async updatePricing(
    currentUser: CurrentUser,
    reservationId: string,
    pricingData: { pricePerNight?: number; totalAmount?: number }
  ): Promise<ServiceResponse<any>> {
    try {
      const prisma = new PrismaClient();

      // Get reservation
      const reservation = await prisma.reservations.findUnique({
        where: { id: reservationId },
        include: { properties: true }
      });

      if (!reservation) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Not Found', 'Reservation not found', 404);
      }

      // RBAC check
      const canEdit = await ReservationService.checkEditPermission(currentUser, reservation);
      if (!canEdit) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Forbidden', 'You do not have permission to update pricing for this reservation', 403);
      }

      // Update pricing
      const updateData: any = { updated_at: new Date() };
      if (pricingData.totalAmount !== undefined) {
        updateData.total_amount = pricingData.totalAmount;
        updateData.outstanding_balance = pricingData.totalAmount - (reservation.paid_amount || 0);
      }

      const updatedReservation = await prisma.reservations.update({
        where: { id: reservationId },
        data: updateData
      });

      await prisma.$disconnect();

      logger.info(`Pricing updated for reservation ${reservationId} by user ${currentUser.email}`);
      
      // Return full reservation data
      const reservationResult = await ReservationService.findById(currentUser, reservationId);
      return reservationResult;
    } catch (error) {
      logger.error('Error updating pricing:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  // ============================================
  // STATUS OPERATIONS (using Orchestrator)
  // ============================================

  /**
   * Confirm reservation (delegates to orchestrator)
   */
  public static async confirmReservation(
    currentUser: CurrentUser,
    reservationId: string
  ): Promise<ServiceResponse<any>> {
    try {
      // Import orchestrator dynamically to avoid circular dependencies
      const { ReservationOrchestratorService } = require('./reservation-orchestrator.service');
      
      logger.info(`Confirming reservation ${reservationId} via orchestrator`);
      return await ReservationOrchestratorService.confirmReservation(currentUser, reservationId);
    } catch (error) {
      logger.error('Error confirming reservation:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Cancel reservation (delegates to orchestrator)
   */
  public static async cancelReservation(
    currentUser: CurrentUser,
    reservationId: string,
    reason?: string
  ): Promise<ServiceResponse<any>> {
    try {
      const { ReservationOrchestratorService } = require('./reservation-orchestrator.service');
      
      logger.info(`Cancelling reservation ${reservationId} via orchestrator`);
      return await ReservationOrchestratorService.cancelReservation(currentUser, reservationId, reason);
    } catch (error) {
      logger.error('Error cancelling reservation:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Check-in guest (delegates to orchestrator)
   */
  public static async checkInReservation(
    currentUser: CurrentUser,
    reservationId: string
  ): Promise<ServiceResponse<any>> {
    try {
      const { ReservationOrchestratorService } = require('./reservation-orchestrator.service');
      
      logger.info(`Checking in guest for reservation ${reservationId} via orchestrator`);
      return await ReservationOrchestratorService.checkInGuest(currentUser, reservationId);
    } catch (error) {
      logger.error('Error checking in guest:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Check-out guest (delegates to orchestrator)
   */
  public static async checkOutReservation(
    currentUser: CurrentUser,
    reservationId: string
  ): Promise<ServiceResponse<any>> {
    try {
      const { ReservationOrchestratorService } = require('./reservation-orchestrator.service');
      
      logger.info(`Checking out guest for reservation ${reservationId} via orchestrator`);
      return await ReservationOrchestratorService.checkOutGuest(currentUser, reservationId);
    } catch (error) {
      logger.error('Error checking out guest:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Mark reservation as no-show
   */
  public static async markAsNoShow(
    currentUser: CurrentUser,
    reservationId: string
  ): Promise<ServiceResponse<any>> {
    try {
      const prisma = new PrismaClient();

      // Get reservation
      const reservation = await prisma.reservations.findUnique({
        where: { id: reservationId },
        include: { properties: true }
      });

      if (!reservation) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Not Found', 'Reservation not found', 404);
      }

      // RBAC check
      const canEdit = await ReservationService.checkEditPermission(currentUser, reservation);
      if (!canEdit) {
        await prisma.$disconnect();
        return ReservationService.prototype.error('Forbidden', 'You do not have permission to modify this reservation', 403);
      }

      // Update status
      await prisma.reservations.update({
        where: { id: reservationId },
        data: {
          status: 'NO_SHOW',
          updated_at: new Date(),
        }
      });

      await prisma.$disconnect();

      logger.info(`Reservation ${reservationId} marked as no-show by user ${currentUser.email}`);
      
      // Return full reservation data
      const reservationResult = await ReservationService.findById(currentUser, reservationId);
      return reservationResult;
    } catch (error) {
      logger.error('Error marking as no-show:', error);
      return ReservationService.prototype.handleDatabaseError(error);
    }
  }

  // Helper methods for RBAC checks

  private static async checkEditPermission(currentUser: CurrentUser, reservation: any): Promise<boolean> {
    if (currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') {
      return true;
    }
    if (currentUser.role === 'AGENT' && reservation.agent_id === currentUser.id) {
      return true;
    }
    if (currentUser.role === 'OWNER' && reservation.properties?.owner_id === currentUser.id) {
      return true;
    }
    return false;
  }

  private static async checkViewPermission(currentUser: CurrentUser, reservation: any): Promise<boolean> {
    if (currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') {
      return true;
    }
    if (currentUser.role === 'AGENT' && reservation.agent_id === currentUser.id) {
      return true;
    }
    if (currentUser.role === 'OWNER' && reservation.properties?.owner_id === currentUser.id) {
      return true;
    }
    if (currentUser.role === 'GUEST' && reservation.guest_id === currentUser.id) {
      return true;
    }
    return false;
  }
}
