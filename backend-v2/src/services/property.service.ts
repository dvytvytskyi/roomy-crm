import { PrismaClient } from '@prisma/client';
import { BaseService } from './BaseService';
import { ServiceResponse } from '../types';
import { CurrentUser, PropertyQueryParams, PaginatedResponse, CreatePropertyDto, UpdatePropertyDto } from '../types/dto';
import { PricelabsService, PropertyData, PropertyUpdateData } from './pricelabs.service';
import S3Service from './s3.service';
import logger from '../utils/logger';

// Property Response DTO
export interface PropertyResponseDto {
  id: string;
  name: string;
  nickname?: string;
  title?: string;
  type: string;
  typeOfUnit: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  pricePerNight: number;
  description?: string;
  amenities: string[];
  houseRules: string[];
  tags: string[];
  isActive: boolean;
  isPublished: boolean;
  primaryImage?: string;
  pricelabId?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId?: string;
  agentId?: string;
  // Settings fields
  minStay?: number;
  maxStay?: number;
  checkInTime?: string;
  checkOutTime?: string;
  bookingWindow?: string;
}

// Property with related data - SUPER ENDPOINT DTO
export interface PropertyWithDetailsDto extends PropertyResponseDto {
  // Owner information
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  // Agent information
  agent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  // Photos with creation date
  photos?: Array<{
    id: string;
    url: string;
    isCover: boolean;
    alt?: string;
    order: number;
    createdAt: Date;
  }>;
  // Pricing rules with creation/update dates
  pricingRules?: Array<{
    id: string;
    name: string;
    type: string;
    value: number;
    startDate?: Date;
    endDate?: Date;
    isActive: boolean;
    conditions?: any;
    createdAt: Date;
    updatedAt: Date;
  }>;
  // Recent transactions (last 20)
  transactions?: Array<{
    id: string;
    transactionId: string;
    type: string;
    category: string;
    amount: number;
    currency: string;
    description?: string;
    platform?: string;
    status: string;
    paymentMethod?: string;
    createdAt: Date;
  }>;
  // Recent reservations (last 20)
  reservations?: Array<{
    id: string;
    reservationId: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    totalAmount: number;
    status: string;
    guestName?: string;
    guestEmail?: string;
    createdAt: Date;
  }>;
  // Recent expenses (last 20)
  expenses?: Array<{
    id: string;
    date: Date;
    category: string;
    amount: number;
    description?: string;
    receiptUrl?: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  // Recent audit logs (last 10)
  auditLogs?: Array<{
    id: string;
    action: string;
    entityType: string;
    changes?: any;
    userId?: string;
    createdAt: Date;
  }>;
  // Property amenities
  amenities?: Array<{
    id: string;
    name: string;
    icon?: string;
    category?: string;
    description?: string;
  }>;
  // Extended count statistics
  _count?: {
    reservations?: number;
    photos?: number;
    pricingRules?: number;
    transactions?: number;
    expenses?: number;
    auditLogs?: number;
  };
}

export class PropertyService extends BaseService {
  private static instance: PropertyService;

  private constructor() {
    super();
  }

  public static getInstance(): PropertyService {
    if (!PropertyService.instance) {
      PropertyService.instance = new PropertyService();
    }
    return PropertyService.instance;
  }

  /**
   * Find all properties with role-based access control
   */
  public static async findAll(currentUser: CurrentUser, queryParams: PropertyQueryParams): Promise<ServiceResponse<PaginatedResponse<PropertyWithDetailsDto>>> {
    try {
      const prisma = new PrismaClient();
      const { page = 1, limit = 10, search, type, status, ownerId, agentId } = queryParams;
      const offset = (page - 1) * limit;

      // Build where clause based on user role
      let where: any = {};

      switch (currentUser.role) {
        case 'ADMIN':
        case 'MANAGER':
          // ADMIN and MANAGER can see all properties
          break;
        
        case 'AGENT':
          // AGENT can see properties where they are assigned as agent
          where = { agent_id: currentUser.id };
          break;
        
        case 'OWNER':
          // OWNER can see properties they own
          where = { owner_id: currentUser.id };
          break;
        
        default:
          // GUEST and others can see published properties
          where = { is_published: true, is_active: true };
      }

      // Add additional filters
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { country: { contains: search, mode: 'insensitive' } }
        ];
      }
      if (type) {
        const upperType = type.toUpperCase();
        logger.info(`PropertyService.findAll: Filtering by type: "${type}" -> "${upperType}"`);
        where.type = upperType;
      }
      if (status) where.is_active = status === 'active';
      if (ownerId) where.owner_id = ownerId;
      if (agentId) where.agent_id = agentId;

      // Get total count
      const total = await prisma.properties.count({ where });

      // Get properties with related data
      const properties = await prisma.properties.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          users_properties_owner_idTousers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          users_properties_agent_idTousers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          property_photos: {
            select: {
              id: true,
              url: true,
              is_cover: true,
              alt: true,
              order: true
            },
            orderBy: { order: 'asc' }
          },
          _count: {
            select: {
              reservations: true,
              property_photos: true
            }
          }
        }
      });

      await prisma.$disconnect();

      // Map to response DTOs
      const propertyResponses: PropertyWithDetailsDto[] = properties.map(property => ({
        id: property.id,
        name: property.name,
        nickname: property.nickname || undefined,
        title: property.title || undefined,
        type: property.type,
        typeOfUnit: property.type_of_unit,
        address: property.address,
        city: property.city,
        country: property.country,
        latitude: property.latitude || undefined,
        longitude: property.longitude || undefined,
        capacity: property.capacity,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area || undefined,
        pricePerNight: property.price_per_night,
        description: property.description || undefined,
        amenities: property.amenities,
        houseRules: property.house_rules,
        tags: property.tags,
        isActive: property.is_active,
        isPublished: property.is_published,
        primaryImage: property.primary_image || undefined,
        pricelabId: property.pricelab_id || undefined,
        createdAt: property.created_at,
        updatedAt: property.updated_at,
        ownerId: property.owner_id || undefined,
        agentId: property.agent_id || undefined,
        // Settings fields
        minStay: property.min_stay,
        maxStay: property.max_stay,
        checkInTime: property.check_in_time,
        checkOutTime: property.check_out_time,
        bookingWindow: property.booking_window,
        owner: property.users_properties_owner_idTousers ? {
          id: property.users_properties_owner_idTousers.id,
          firstName: property.users_properties_owner_idTousers.firstName,
          lastName: property.users_properties_owner_idTousers.lastName,
          email: property.users_properties_owner_idTousers.email,
          phone: property.users_properties_owner_idTousers.phone || undefined
        } : undefined,
        agent: property.users_properties_agent_idTousers ? {
          id: property.users_properties_agent_idTousers.id,
          firstName: property.users_properties_agent_idTousers.firstName,
          lastName: property.users_properties_agent_idTousers.lastName,
          email: property.users_properties_agent_idTousers.email,
          phone: property.users_properties_agent_idTousers.phone || undefined
        } : undefined,
        photos: property.property_photos.map(photo => ({
          id: photo.id,
          url: photo.url,
          isCover: photo.is_cover,
          alt: photo.alt || undefined,
          order: photo.order
        })),
        _count: {
          reservations: property._count.reservations,
          photos: property._count.property_photos
        }
      }));

      // Create pagination metadata
      const pagination = PropertyService.prototype.createPaginationMetadata(page, limit, total);

      const result: PaginatedResponse<PropertyWithDetailsDto> = {
        data: propertyResponses,
        pagination,
      };

      return PropertyService.prototype.success(result);
    } catch (error) {
      logger.error('Error finding all properties with RBAC:', error);
      return PropertyService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Find property by ID with role-based access control - SUPER ENDPOINT
   * Returns ALL related data in one request
   */
  public static async findById(currentUser: CurrentUser, id: string): Promise<ServiceResponse<PropertyWithDetailsDto | null>> {
    try {
      const prisma = new PrismaClient();

      // Check access permissions
      let hasAccess = false;

      switch (currentUser.role) {
        case 'ADMIN':
        case 'MANAGER':
          // ADMIN and MANAGER can see any property
          hasAccess = true;
          break;
        
        case 'AGENT':
          // AGENT can see properties where they are assigned as agent
          const agentProperty = await prisma.properties.findFirst({
            where: { id, agent_id: currentUser.id }
          });
          hasAccess = !!agentProperty;
          break;
        
        case 'OWNER':
          // OWNER can see properties they own
          const ownerProperty = await prisma.properties.findFirst({
            where: { id, owner_id: currentUser.id }
          });
          hasAccess = !!ownerProperty;
          break;
        
        default:
          // GUEST and others can see published properties
          const publishedProperty = await prisma.properties.findFirst({
            where: { id, is_published: true, is_active: true }
          });
          hasAccess = !!publishedProperty;
      }

      if (!hasAccess) {
        await prisma.$disconnect();
        return PropertyService.prototype.error('Access denied', 'You do not have permission to view this property');
      }

      // SUPER ENDPOINT: Get property with ALL related data
      const property = await prisma.properties.findUnique({
        where: { id },
        include: {
          // Owner information
          users_properties_owner_idTousers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          // Agent information
          users_properties_agent_idTousers: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          // Photos
          property_photos: {
            select: {
              id: true,
              url: true,
              is_cover: true,
              alt: true,
              order: true,
              created_at: true
            },
            orderBy: { order: 'asc' }
          },
          // Pricing rules
          pricing_rules: {
            select: {
              id: true,
              name: true,
              type: true,
              value: true,
              start_date: true,
              end_date: true,
              is_active: true,
              conditions: true,
              created_at: true,
              updated_at: true
            },
            orderBy: { created_at: 'desc' }
          },
          // Recent transactions (last 20)
          transactions: {
            select: {
              id: true,
              transaction_id: true,
              type: true,
              category: true,
              amount: true,
              currency: true,
              description: true,
              platform: true,
              status: true,
              payment_method: true,
              created_at: true
            },
            orderBy: { created_at: 'desc' },
            take: 20
          },
          // Recent reservations (last 20)
          reservations: {
            select: {
              id: true,
              reservation_id: true,
              check_in: true,
              check_out: true,
              guests: true,
              total_amount: true,
              status: true,
              guest_name: true,
              guest_email: true,
              created_at: true
            },
            orderBy: { created_at: 'desc' },
            take: 20
          },
          // Recent expenses (last 20)
          expenses: {
            select: {
              id: true,
              date: true,
              category: true,
              amount: true,
              description: true,
              receipt_url: true,
              created_at: true,
              updated_at: true
            },
            orderBy: { created_at: 'desc' },
            take: 20
          },
          // Recent audit logs (last 10)
          audit_logs: {
            select: {
              id: true,
              action: true,
              entity_type: true,
              changes: true,
              user_id: true,
              created_at: true
            },
            where: { entity_type: 'PROPERTY', entity_id: id },
            orderBy: { created_at: 'desc' },
            take: 10
          },
          // Property amenities
          property_amenities: {
            include: {
              amenity: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                  category: true,
                  description: true
                }
              }
            }
          },
          // Counts for statistics
          _count: {
            select: {
              reservations: true,
              property_photos: true,
              pricing_rules: true,
              transactions: true,
              expenses: true,
              audit_logs: true
            }
          }
        }
      });

      await prisma.$disconnect();

      if (!property) {
        return PropertyService.prototype.success(null);
      }

      const propertyResponse: PropertyWithDetailsDto = {
        id: property.id,
        name: property.name,
        nickname: property.nickname || undefined,
        title: property.title || undefined,
        type: property.type,
        typeOfUnit: property.type_of_unit,
        address: property.address,
        city: property.city,
        country: property.country,
        latitude: property.latitude || undefined,
        longitude: property.longitude || undefined,
        capacity: property.capacity,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area || undefined,
        pricePerNight: property.price_per_night,
        description: property.description || undefined,
        amenities: property.amenities,
        houseRules: property.house_rules,
        tags: property.tags,
        isActive: property.is_active,
        isPublished: property.is_published,
        primaryImage: property.primary_image || undefined,
        pricelabId: property.pricelab_id || undefined,
        createdAt: property.created_at,
        updatedAt: property.updated_at,
        ownerId: property.owner_id || undefined,
        agentId: property.agent_id || undefined,
        
        // New fields for property details
        summary: property.summary || undefined,
        theSpace: property.the_space || undefined,
        guestAccess: property.guest_access || undefined,
        otherThings: property.other_things || undefined,
        
        // Availability settings
        bookingWindow: property.booking_window,
        advanceNotice: property.advance_notice || undefined,
        minStay: property.min_stay,
        maxStay: property.max_stay,
        
        // Utilities and additional settings
        utilities: property.utilities || [],
        incomeDistribution: property.income_distribution || undefined,
        
        // Financial settings
        agencyFeePercentage: property.agency_fee_percentage || undefined,
        referringAgentFeePercentage: property.referring_agent_fee_percentage || undefined,
        dtcmLicenseExpiry: property.dtcm_license_expiry || undefined,
        
        // Additional property details
        parkingSlots: property.parking_slots || undefined,
        checkInTime: property.check_in_time,
        checkOutTime: property.check_out_time,
        
        // Owner information
        owner: property.users_properties_owner_idTousers ? {
          id: property.users_properties_owner_idTousers.id,
          firstName: property.users_properties_owner_idTousers.firstName,
          lastName: property.users_properties_owner_idTousers.lastName,
          email: property.users_properties_owner_idTousers.email,
          phone: property.users_properties_owner_idTousers.phone || undefined
        } : undefined,
        // Agent information
        agent: property.users_properties_agent_idTousers ? {
          id: property.users_properties_agent_idTousers.id,
          firstName: property.users_properties_agent_idTousers.firstName,
          lastName: property.users_properties_agent_idTousers.lastName,
          email: property.users_properties_agent_idTousers.email,
          phone: property.users_properties_agent_idTousers.phone || undefined
        } : undefined,
        // Photos with creation date
        photos: property.property_photos.map(photo => ({
          id: photo.id,
          url: photo.url,
          isCover: photo.is_cover,
          alt: photo.alt || undefined,
          order: photo.order,
          createdAt: photo.created_at
        })),
        // Pricing rules with creation/update dates
        pricingRules: property.pricing_rules.map(rule => ({
          id: rule.id,
          name: rule.name,
          type: rule.type,
          value: rule.value,
          startDate: rule.start_date || undefined,
          endDate: rule.end_date || undefined,
          isActive: rule.is_active,
          conditions: rule.conditions || undefined,
          createdAt: rule.created_at,
          updatedAt: rule.updated_at
        })),
        // Recent transactions (last 20)
        transactions: property.transactions.map(transaction => ({
          id: transaction.id,
          transactionId: transaction.transaction_id,
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount,
          currency: transaction.currency,
          description: transaction.description || undefined,
          platform: transaction.platform || undefined,
          status: transaction.status,
          paymentMethod: transaction.payment_method || undefined,
          createdAt: transaction.created_at
        })),
        // Recent reservations (last 20)
        reservations: property.reservations.map(reservation => ({
          id: reservation.id,
          reservationId: reservation.reservation_id,
          checkIn: reservation.check_in,
          checkOut: reservation.check_out,
          guests: reservation.guests,
          totalAmount: reservation.total_amount,
          status: reservation.status,
          guestName: reservation.guest_name || undefined,
          guestEmail: reservation.guest_email || undefined,
          createdAt: reservation.created_at
        })),
        // Recent expenses (last 20)
        expenses: property.expenses.map(expense => ({
          id: expense.id,
          date: expense.date,
          category: expense.category,
          amount: expense.amount,
          description: expense.description || undefined,
          receiptUrl: expense.receipt_url || undefined,
          createdAt: expense.created_at,
          updatedAt: expense.updated_at
        })),
        // Recent audit logs (last 10)
        auditLogs: property.audit_logs.map(log => ({
          id: log.id,
          action: log.action,
          entityType: log.entity_type,
          changes: log.changes || undefined,
          userId: log.user_id || undefined,
          createdAt: log.created_at
        })),
        // Property amenities
        amenities: property.property_amenities.map(pa => ({
          id: pa.amenity.id,
          name: pa.amenity.name,
          icon: pa.amenity.icon || undefined,
          category: pa.amenity.category || undefined,
          description: pa.amenity.description || undefined
        })),
        // Extended count statistics
        _count: {
          reservations: property._count.reservations,
          photos: property._count.property_photos,
          pricingRules: property._count.pricing_rules,
          transactions: property._count.transactions,
          expenses: property._count.expenses,
          auditLogs: property._count.audit_logs
        },
        // Settings fields (duplicate for PropertyResponseDto compatibility)
        minStay: property.min_stay,
        maxStay: property.max_stay,
        checkInTime: property.check_in_time,
        checkOutTime: property.check_out_time,
        bookingWindow: property.booking_window
      };

      return PropertyService.prototype.success(propertyResponse);
    } catch (error) {
      logger.error('Error finding property by ID with RBAC:', error);
      return PropertyService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Create new property
   */
  public static async create(currentUser: CurrentUser, data: CreatePropertyDto): Promise<ServiceResponse<PropertyResponseDto>> {
    try {
      const prisma = new PrismaClient();

      // Validate permissions
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.role !== 'OWNER') {
        await prisma.$disconnect();
        return PropertyService.prototype.error('Forbidden', 'Only ADMIN, MANAGER, and OWNER can create properties', 403);
      }

      // If OWNER, they can only create properties for themselves
      if (currentUser.role === 'OWNER' && data.ownerId !== currentUser.id) {
        await prisma.$disconnect();
        return PropertyService.prototype.error('Forbidden', 'OWNER can only create properties for themselves', 403);
      }

      // Verify owner exists
      const owner = await prisma.user.findUnique({
        where: { id: data.ownerId },
      });

      if (!owner) {
        await prisma.$disconnect();
        return PropertyService.prototype.error('Not Found', 'Owner not found', 404);
      }

      // Verify agent exists if provided
      if (data.agentId) {
        const agent = await prisma.user.findUnique({
          where: { id: data.agentId },
        });

        if (!agent) {
          await prisma.$disconnect();
          return PropertyService.prototype.error('Not Found', 'Agent not found', 404);
        }
      }

      logger.info(`[Property Creation] Starting property creation: ${data.name}`);

      // Create property in transaction with audit logging
      // Increased timeout for photo uploads (30 seconds per photo * 25 photos = 750 seconds max)
      const result = await prisma.$transaction(async (tx) => {
        logger.info(`[Property Creation Step 1/2] Creating property record...`);
        
        // Create property
        const property = await tx.properties.create({
          data: {
            id: `property-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: data.name,
            nickname: data.nickname,
            title: data.title,
            type: data.type as any,
            type_of_unit: data.typeOfUnit as any,
            address: data.address,
            city: data.city,
            country: data.country,
            latitude: data.latitude,
            longitude: data.longitude,
            capacity: data.capacity,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            area: data.area,
            price_per_night: data.pricePerNight,
            description: data.description,
            amenities: data.amenities || [],
            house_rules: data.houseRules || [],
            tags: data.tags || [],
            is_active: true,
            is_published: false,
            owner_id: data.ownerId,
            agent_id: data.agentId,
            
            // New fields for property details
            summary: data.summary,
            the_space: data.theSpace,
            guest_access: data.guestAccess,
            other_things: data.otherThings,
            
            // Availability settings
            booking_window: data.bookingWindow || "all-days",
            advance_notice: data.advanceNotice || "none",
            min_stay: data.minStay || 3,
            max_stay: data.maxStay || 365,
            
            // Utilities and additional settings
            utilities: data.utilities || [],
            income_distribution: data.incomeDistribution,
            
            // Financial settings
            agency_fee_percentage: data.agencyFeePercentage || 25.0,
            referring_agent_fee_percentage: data.referringAgentFeePercentage || 5.0,
            dtcm_license_expiry: data.dtcmLicenseExpiry ? new Date(data.dtcmLicenseExpiry) : null,
            
            // Additional property details
            parking_slots: data.parkingSlots || 0,
            check_in_time: data.checkInTime || "15:00",
            check_out_time: data.checkOutTime || "12:00",
            
            // Airbnb enrichment fields
            beds_configuration: data.bedsConfiguration,
            external_rating: data.externalRating,
            external_review_count: data.externalReviewCount,
            allows_pets: data.allowsPets,
            external_cancellation_policy: data.externalCancellationPolicy,
            
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        logger.info(`[Property Creation Step 2/5] Creating audit log...`);

        // Create audit log
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.audit_logs.create({
          data: {
            id: auditId,
            user_id: currentUser.id,
            action: 'PROPERTY_CREATED',
            entity_type: 'PROPERTY',
            entity_id: property.id,
            ip_address: '127.0.0.1',
            user_agent: 'Backend-V2-PropertyService',
            changes: {
              created_by: currentUser.email,
              property_name: data.name,
              owner_id: data.ownerId,
              agent_id: data.agentId,
              property_type: data.type
            }
          }
        });

        // Step 3: Upload photos to S3 and create records
        if (data.photos && data.photos.length > 0) {
          logger.info(`[Property Creation Step 3/5] Processing ${data.photos.length} photos...`);
          
          // Check if S3 is configured
          const s3Service = S3Service.getInstance();
          const s3Configured = s3Service.isConfigured();
          
          logger.info(`[Property Creation] S3 configured: ${s3Configured}`);
          
          if (!s3Configured) {
            logger.warn(`[Property Creation] S3 not configured, storing Airbnb URLs directly`);
          } else {
            logger.info(`[Property Creation] S3 is configured, will upload photos to S3`);
          }
          
          for (let i = 0; i < data.photos.length; i++) {
            const photo = data.photos[i];
            const photoId = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`;
            
            let photoUrl = photo.url;
            let s3Key: string | null = null;
            
            // If S3 is configured and this is an external URL (Airbnb), upload to S3
            if (s3Configured && (photo.url.includes('airbnb.com') || photo.url.includes('muscache.com'))) {
              try {
                logger.info(`[Property Creation] Uploading photo ${i + 1}/${data.photos.length} to S3...`);
                const s3Result = await s3Service.uploadFromUrl(
                  photo.url,
                  property.id,
                  i
                );
                photoUrl = s3Result.url;
                s3Key = s3Result.key;
                logger.info(`[Property Creation] Photo uploaded to S3: ${s3Key}`);
              } catch (s3Error: any) {
                logger.error(`[Property Creation] Failed to upload photo to S3: ${s3Error.message}`);
                logger.warn(`[Property Creation] Falling back to original Airbnb URL`);
                // Keep original Airbnb URL if S3 upload fails
              }
            }
            
            await tx.property_photos.create({
              data: {
                id: photoId,
                property_id: property.id,
                url: photoUrl,
                s3_key: s3Key,
                is_cover: photo.isCover || i === 0,
                alt: photo.alt || null,
                order: photo.order !== undefined ? photo.order : i,
                created_at: new Date(),
              }
            });
          }

          logger.info(`[Property Creation] Created ${data.photos.length} photos`);
        }

        // Step 4: Create or link amenities if provided
        if (data.amenities && data.amenities.length > 0) {
          logger.info(`[Property Creation Step 4/5] Processing ${data.amenities.length} amenities...`);
          
          for (const amenityName of data.amenities) {
            // Find or create amenity
            let amenity = await tx.amenities.findFirst({
              where: { 
                name: {
                  equals: amenityName,
                  mode: 'insensitive' // Case-insensitive search
                }
              }
            });

            if (!amenity) {
              // Create new amenity
              const amenityId = `amenity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              amenity = await tx.amenities.create({
                data: {
                  id: amenityId,
                  name: amenityName,
                  icon: 'check', // Default icon
                  category: 'GENERAL', // Default category
                  created_at: new Date(),
                  updated_at: new Date(),
                }
              });
              logger.info(`[Property Creation] Created new amenity: ${amenityName}`);
            }

            // Link amenity to property
            const propertyAmenityId = `prop-amenity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            await tx.property_amenities.create({
              data: {
                id: propertyAmenityId,
                property_id: property.id,
                amenity_id: amenity.id,
                created_at: new Date(),
              }
            });
          }

          logger.info(`[Property Creation] Linked ${data.amenities.length} amenities`);
        }

        logger.info(`[Property Creation Step 5/5] All steps completed`);
        logger.info(`[Property Creation END] Property created successfully: ${property.name}`);
        return property;
      }, {
        timeout: 120000, // 120 seconds timeout for S3 uploads
      });

      await prisma.$disconnect();

      // Step 3: Create listing in PriceLabs (outside transaction)
      logger.info(`[Property Creation Step 3/3] Creating PriceLabs listing for property: ${result.id}`);
      
      try {
        // Prepare property data for PriceLabs
        const propertyDataForPricelabs: PropertyData = {
          id: result.id,
          name: result.name,
          address: result.address,
          city: result.city,
          country: result.country,
          latitude: result.latitude,
          longitude: result.longitude,
          capacity: result.capacity,
          bedrooms: result.bedrooms,
          bathrooms: result.bathrooms,
          area: result.area,
          price_per_night: result.price_per_night,
          description: result.description,
          amenities: result.amenities,
          house_rules: result.house_rules
        };

        // Create listing in PriceLabs
        const pricelabsResult = await PricelabsService.createListing(propertyDataForPricelabs);
        
        if (pricelabsResult.success && pricelabsResult.data?.listing_id) {
          logger.info(`[Property Creation Step 3/3] PriceLabs listing created successfully: ${pricelabsResult.data.listing_id}`);
          
          // Update property with PriceLabs ID
          const updatedProperty = await prisma.properties.update({
            where: { id: result.id },
            data: { 
              pricelab_id: pricelabsResult.data.listing_id,
              updated_at: new Date()
            }
          });
          
          logger.info(`[Property Creation COMPLETE] Property ${result.name} created with PriceLabs ID: ${pricelabsResult.data.listing_id}`);
        } else {
          logger.warn(`[Property Creation Step 3/3] Failed to create PriceLabs listing: ${pricelabsResult.error}`);
          logger.warn(`[Property Creation COMPLETE] Property ${result.name} created without PriceLabs integration`);
        }
      } catch (pricelabsError) {
        logger.error(`[Property Creation Step 3/3] Error creating PriceLabs listing:`, pricelabsError);
        logger.warn(`[Property Creation COMPLETE] Property ${result.name} created without PriceLabs integration due to error`);
      }

      // Return the created property with full details
      const propertyResult = await PropertyService.findById(currentUser, result.id);
      if (!propertyResult.success || !propertyResult.data) {
        return PropertyService.prototype.error('Error', 'Failed to retrieve created property', 500);
      }

      logger.info(`Property created successfully: ${result.name} by ${currentUser.email}`);
      return PropertyService.prototype.success(propertyResult.data, 'Property created successfully');
    } catch (error) {
      logger.error('Error creating property:', error);
      return PropertyService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Update property
   */
  public static async update(currentUser: CurrentUser, id: string, data: UpdatePropertyDto): Promise<ServiceResponse<PropertyResponseDto>> {
    try {
      const prisma = new PrismaClient();

      // Check if property exists
      const existingProperty = await prisma.properties.findUnique({
        where: { id },
      });

      if (!existingProperty) {
        await prisma.$disconnect();
        return PropertyService.prototype.error('Not Found', 'Property not found', 404);
      }

      // Check permissions
      const canEdit = currentUser.role === 'ADMIN' || 
                     currentUser.role === 'MANAGER' || 
                     (currentUser.role === 'OWNER' && existingProperty.owner_id === currentUser.id) ||
                     (currentUser.role === 'AGENT' && existingProperty.agent_id === currentUser.id);

      if (!canEdit) {
        await prisma.$disconnect();
        return PropertyService.prototype.error('Forbidden', 'You do not have permission to edit this property', 403);
      }

      // If OWNER, they cannot change owner_id
      if (currentUser.role === 'OWNER' && data.ownerId && data.ownerId !== currentUser.id) {
        await prisma.$disconnect();
        return PropertyService.prototype.error('Forbidden', 'OWNER cannot transfer property ownership', 403);
      }

      // Verify new owner exists if changing
      if (data.ownerId && data.ownerId !== existingProperty.owner_id) {
        const owner = await prisma.user.findUnique({
          where: { id: data.ownerId },
        });

        if (!owner) {
          await prisma.$disconnect();
          return PropertyService.prototype.error('Not Found', 'New owner not found', 404);
        }
      }

      // Verify new agent exists if changing
      if (data.agentId && data.agentId !== existingProperty.agent_id) {
        const agent = await prisma.user.findUnique({
          where: { id: data.agentId },
        });

        if (!agent) {
          await prisma.$disconnect();
          return PropertyService.prototype.error('Not Found', 'New agent not found', 404);
        }
      }

      // Build update data
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.nickname !== undefined) updateData.nickname = data.nickname;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.typeOfUnit !== undefined) updateData.type_of_unit = data.typeOfUnit;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.country !== undefined) updateData.country = data.country;
      if (data.latitude !== undefined) updateData.latitude = data.latitude;
      if (data.longitude !== undefined) updateData.longitude = data.longitude;
      if (data.capacity !== undefined) updateData.capacity = data.capacity;
      if (data.bedrooms !== undefined) updateData.bedrooms = data.bedrooms;
      if (data.bathrooms !== undefined) updateData.bathrooms = data.bathrooms;
      if (data.area !== undefined) updateData.area = data.area;
      if (data.pricePerNight !== undefined) updateData.price_per_night = data.pricePerNight;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.amenities !== undefined) updateData.amenities = data.amenities;
      if (data.houseRules !== undefined) updateData.house_rules = data.houseRules;
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;
      if (data.isPublished !== undefined) updateData.is_published = data.isPublished;
      if (data.agentId !== undefined) updateData.agent_id = data.agentId;
      
      // New fields for property details
      if (data.summary !== undefined) updateData.summary = data.summary;
      if (data.theSpace !== undefined) updateData.the_space = data.theSpace;
      if (data.guestAccess !== undefined) updateData.guest_access = data.guestAccess;
      if (data.otherThings !== undefined) updateData.other_things = data.otherThings;
      
      // Availability settings
      if (data.bookingWindow !== undefined) updateData.booking_window = data.bookingWindow;
      if (data.advanceNotice !== undefined) updateData.advance_notice = data.advanceNotice;
      if (data.minStay !== undefined) updateData.min_stay = data.minStay;
      if (data.maxStay !== undefined) updateData.max_stay = data.maxStay;
      
      // Utilities and additional settings
      if (data.utilities !== undefined) updateData.utilities = data.utilities;
      if (data.incomeDistribution !== undefined) updateData.income_distribution = data.incomeDistribution;
      
      // Financial settings
      if (data.agencyFeePercentage !== undefined) updateData.agency_fee_percentage = data.agencyFeePercentage;
      if (data.referringAgentFeePercentage !== undefined) updateData.referring_agent_fee_percentage = data.referringAgentFeePercentage;
      if (data.dtcmLicenseExpiry !== undefined) updateData.dtcm_license_expiry = data.dtcmLicenseExpiry ? new Date(data.dtcmLicenseExpiry) : null;
      
      // Additional property details
      if (data.parkingSlots !== undefined) updateData.parking_slots = data.parkingSlots;
      if (data.checkInTime !== undefined) updateData.check_in_time = data.checkInTime;
      if (data.checkOutTime !== undefined) updateData.check_out_time = data.checkOutTime;
      if (data.pricelabId !== undefined) updateData.pricelab_id = data.pricelabId;

      // Only ADMIN can change owner
      if (currentUser.role === 'ADMIN' && data.ownerId !== undefined) {
        updateData.owner_id = data.ownerId;
      }

      logger.info(`[Property Update] Starting property update: ${existingProperty.name}`);

      // Update property in transaction with audit logging
      const result = await prisma.$transaction(async (tx) => {
        logger.info(`[Property Update Step 1/2] Updating property record...`);
        
        // Update property
        const updatedProperty = await tx.properties.update({
          where: { id },
          data: {
            ...updateData,
            updated_at: new Date(),
          },
        });

        logger.info(`[Property Update Step 2/2] Creating audit log...`);

        // Create audit log
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.audit_logs.create({
          data: {
            id: auditId,
            user_id: currentUser.id,
            action: 'PROPERTY_UPDATED',
            entity_type: 'PROPERTY',
            entity_id: id,
            ip_address: '127.0.0.1',
            user_agent: 'Backend-V2-PropertyService',
            changes: {
              updated_by: currentUser.email,
              updated_fields: Object.keys(updateData),
              property_name: existingProperty.name,
              old_values: updateData,
              new_values: updateData
            }
          }
        });

        logger.info(`[Property Update END] Property updated successfully: ${updatedProperty.name}`);
        return updatedProperty;
      });

      await prisma.$disconnect();

      // Step 3: Sync with PriceLabs if critical fields changed
      if (existingProperty.pricelab_id) {
        logger.info(`[Property Update Step 3/3] Syncing changes with PriceLabs for listing: ${existingProperty.pricelab_id}`);
        
        try {
          // Check if critical fields that affect pricing have changed
          const criticalFieldsChanged = 
            data.name !== undefined ||
            data.address !== undefined ||
            data.city !== undefined ||
            data.country !== undefined ||
            data.latitude !== undefined ||
            data.longitude !== undefined ||
            data.capacity !== undefined ||
            data.bedrooms !== undefined ||
            data.bathrooms !== undefined ||
            data.area !== undefined ||
            data.pricePerNight !== undefined ||
            data.description !== undefined ||
            data.amenities !== undefined ||
            data.houseRules !== undefined;

          if (criticalFieldsChanged) {
            // Prepare update data for PriceLabs
            const pricelabsUpdateData: PropertyUpdateData = {};
            
            if (data.name !== undefined) pricelabsUpdateData.name = data.name;
            if (data.address !== undefined) pricelabsUpdateData.address = data.address;
            if (data.city !== undefined) pricelabsUpdateData.city = data.city;
            if (data.country !== undefined) pricelabsUpdateData.country = data.country;
            if (data.latitude !== undefined) pricelabsUpdateData.latitude = data.latitude;
            if (data.longitude !== undefined) pricelabsUpdateData.longitude = data.longitude;
            if (data.capacity !== undefined) pricelabsUpdateData.capacity = data.capacity;
            if (data.bedrooms !== undefined) pricelabsUpdateData.bedrooms = data.bedrooms;
            if (data.bathrooms !== undefined) pricelabsUpdateData.bathrooms = data.bathrooms;
            if (data.area !== undefined) pricelabsUpdateData.area = data.area;
            if (data.pricePerNight !== undefined) pricelabsUpdateData.price_per_night = data.pricePerNight;
            if (data.description !== undefined) pricelabsUpdateData.description = data.description;
            if (data.amenities !== undefined) pricelabsUpdateData.amenities = data.amenities;
            if (data.houseRules !== undefined) pricelabsUpdateData.house_rules = data.houseRules;

            // Update listing in PriceLabs
            const pricelabsResult = await PricelabsService.updateListing(existingProperty.pricelab_id, pricelabsUpdateData);
            
            if (pricelabsResult.success) {
              logger.info(`[Property Update Step 3/3] PriceLabs listing updated successfully: ${existingProperty.pricelab_id}`);
            } else {
              logger.warn(`[Property Update Step 3/3] Failed to update PriceLabs listing: ${pricelabsResult.error}`);
            }
          } else {
            logger.info(`[Property Update Step 3/3] No critical fields changed, skipping PriceLabs sync`);
          }
        } catch (pricelabsError) {
          logger.error(`[Property Update Step 3/3] Error syncing with PriceLabs:`, pricelabsError);
          // Don't fail the property update if PriceLabs sync fails
        }
      } else {
        logger.info(`[Property Update Step 3/3] Property not linked to PriceLabs, skipping sync`);
      }

      // Return the updated property with full details
      const propertyResult = await PropertyService.findById(currentUser, id);
      if (!propertyResult.success || !propertyResult.data) {
        return PropertyService.prototype.error('Error', 'Failed to retrieve updated property', 500);
      }

      logger.info(`Property updated successfully: ${result.name} by ${currentUser.email}`);
      return PropertyService.prototype.success(propertyResult.data, 'Property updated successfully');
    } catch (error) {
      logger.error('Error updating property:', error);
      return PropertyService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Delete (deactivate) property
   */
  public static async delete(currentUser: CurrentUser, id: string): Promise<ServiceResponse<PropertyResponseDto>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Property Deactivation] Starting property deactivation for ID: ${id}`);

      // Check if property exists
      const existingProperty = await prisma.properties.findUnique({
        where: { id },
      });

      if (!existingProperty) {
        await prisma.$disconnect();
        return PropertyService.prototype.error('Not Found', 'Property not found', 404);
      }

      // Check permissions - only ADMIN and MANAGER can deactivate properties
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        await prisma.$disconnect();
        return PropertyService.prototype.error('Forbidden', 'Only ADMIN and MANAGER can deactivate properties', 403);
      }

      // Check if property is already deactivated
      if (!existingProperty.is_active) {
        await prisma.$disconnect();
        return PropertyService.prototype.error('Bad Request', 'Property is already deactivated', 400);
      }

      // Deactivate property in transaction with audit logging
      const result = await prisma.$transaction(async (tx) => {
        logger.info(`[Property Deactivation Step 1/2] Deactivating property...`);
        
        // Deactivate property instead of deleting
        const deactivatedProperty = await tx.properties.update({
          where: { id },
          data: {
            is_active: false,
            updated_at: new Date(),
          },
        });

        logger.info(`[Property Deactivation Step 2/2] Creating audit log...`);

        // Create audit log
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.audit_logs.create({
          data: {
            id: auditId,
            user_id: currentUser.id,
            action: 'PROPERTY_DEACTIVATED',
            entity_type: 'PROPERTY',
            entity_id: id,
            ip_address: '127.0.0.1',
            user_agent: 'Backend-V2-PropertyService',
            changes: {
              deactivated_by: currentUser.email,
              property_name: existingProperty.name,
              action: 'deactivated',
              reason: 'Property deactivated by admin'
            }
          }
        });

        logger.info(`[Property Deactivation END] Property deactivated successfully: ${deactivatedProperty.name}`);
        return deactivatedProperty;
      });

      await prisma.$disconnect();

      // Step 3: Delete/Archive listing in PriceLabs
      if (existingProperty.pricelab_id) {
        logger.info(`[Property Deactivation Step 3/3] Deleting PriceLabs listing: ${existingProperty.pricelab_id}`);
        
        try {
          // Delete listing in PriceLabs
          const pricelabsResult = await PricelabsService.deleteListing(existingProperty.pricelab_id);
          
          if (pricelabsResult.success) {
            logger.info(`[Property Deactivation Step 3/3] PriceLabs listing deleted successfully: ${existingProperty.pricelab_id}`);
          } else {
            logger.warn(`[Property Deactivation Step 3/3] Failed to delete PriceLabs listing: ${pricelabsResult.error}`);
          }
        } catch (pricelabsError) {
          logger.error(`[Property Deactivation Step 3/3] Error deleting PriceLabs listing:`, pricelabsError);
          // Don't fail the property deactivation if PriceLabs deletion fails
        }
      } else {
        logger.info(`[Property Deactivation Step 3/3] Property not linked to PriceLabs, skipping deletion`);
      }

      // Return the updated property with full details
      const propertyResult = await PropertyService.findById(currentUser, id);
      if (!propertyResult.success || !propertyResult.data) {
        return PropertyService.prototype.error('Error', 'Failed to retrieve deactivated property', 500);
      }

      logger.info(`Property deactivated successfully: ${result.name} by ${currentUser.email}`);
      return PropertyService.prototype.success(propertyResult.data, 'Property deactivated successfully');
    } catch (error) {
      logger.error('Error deactivating property:', error);
      return PropertyService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Update property marketing information
   */
  public static async updateMarketing(currentUser: CurrentUser, id: string, marketingData: any): Promise<ServiceResponse<PropertyResponseDto>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Property Marketing Update] Starting marketing update for property ID: ${id}`);

      // Check if property exists
      const existingProperty = await prisma.properties.findUnique({
        where: { id },
      });

      if (!existingProperty) {
        await prisma.$disconnect();
        return PropertyService.prototype.error('Not Found', 'Property not found', 404);
      }

      // Check permissions
      const canEdit = currentUser.role === 'ADMIN' || 
                     currentUser.role === 'MANAGER' || 
                     (currentUser.role === 'OWNER' && existingProperty.owner_id === currentUser.id) ||
                     (currentUser.role === 'AGENT' && existingProperty.agent_id === currentUser.id);

      if (!canEdit) {
        await prisma.$disconnect();
        return PropertyService.prototype.error('Forbidden', 'You do not have permission to edit this property', 403);
      }

      // Build marketing update data
      const updateData: any = {};
      if (marketingData.title !== undefined) updateData.title = marketingData.title;
      if (marketingData.description !== undefined) updateData.description = marketingData.description;
      if (marketingData.tags !== undefined) updateData.tags = marketingData.tags;
      if (marketingData.isPublished !== undefined) updateData.is_published = marketingData.isPublished;
      if (marketingData.primaryImage !== undefined) updateData.primary_image = marketingData.primaryImage;
      if (marketingData.pricelabId !== undefined) updateData.pricelab_id = marketingData.pricelabId;

      // Update property marketing in transaction with audit logging
      const result = await prisma.$transaction(async (tx) => {
        logger.info(`[Property Marketing Update Step 1/2] Updating marketing information...`);
        
        const updatedProperty = await tx.properties.update({
          where: { id },
          data: {
            ...updateData,
            updated_at: new Date(),
          },
        });

        logger.info(`[Property Marketing Update Step 2/2] Creating audit log...`);

        // Create audit log
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.audit_logs.create({
          data: {
            id: auditId,
            user_id: currentUser.id,
            action: 'PROPERTY_MARKETING_UPDATED',
            entity_type: 'PROPERTY',
            entity_id: id,
            ip_address: '127.0.0.1',
            user_agent: 'Backend-V2-PropertyService',
            changes: {
              updated_by: currentUser.email,
              updated_fields: Object.keys(updateData),
              property_name: existingProperty.name,
              marketing_changes: updateData
            }
          }
        });

        logger.info(`[Property Marketing Update END] Marketing updated successfully: ${updatedProperty.name}`);
        return updatedProperty;
      });

      await prisma.$disconnect();

      // Return the updated property with full details
      const propertyResult = await PropertyService.findById(currentUser, id);
      if (!propertyResult.success || !propertyResult.data) {
        return PropertyService.prototype.error('Error', 'Failed to retrieve updated property', 500);
      }

      logger.info(`Property marketing updated successfully: ${result.name} by ${currentUser.email}`);
      return PropertyService.prototype.success(propertyResult.data, 'Property marketing updated successfully');
    } catch (error) {
      logger.error('Error updating property marketing:', error);
      return PropertyService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Update property availability
   */
  public static async updateAvailability(currentUser: CurrentUser, id: string, availabilityData: any): Promise<ServiceResponse<PropertyResponseDto>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Property Availability Update] Starting availability update for property ID: ${id}`);

      // Check if property exists
      const existingProperty = await prisma.properties.findUnique({
        where: { id },
      });

      if (!existingProperty) {
        await prisma.$disconnect();
        return PropertyService.prototype.error('Not Found', 'Property not found', 404);
      }

      // Check permissions
      const canEdit = currentUser.role === 'ADMIN' || 
                     currentUser.role === 'MANAGER' || 
                     (currentUser.role === 'OWNER' && existingProperty.owner_id === currentUser.id) ||
                     (currentUser.role === 'AGENT' && existingProperty.agent_id === currentUser.id);

      if (!canEdit) {
        await prisma.$disconnect();
        return PropertyService.prototype.error('Forbidden', 'You do not have permission to edit this property', 403);
      }

      // Build availability update data
      const updateData: any = {};
      if (availabilityData.isActive !== undefined) updateData.is_active = availabilityData.isActive;
      if (availabilityData.isPublished !== undefined) updateData.is_published = availabilityData.isPublished;
      if (availabilityData.pricePerNight !== undefined) updateData.price_per_night = availabilityData.pricePerNight;
      if (availabilityData.capacity !== undefined) updateData.capacity = availabilityData.capacity;
      
      // Settings fields
      if (availabilityData.minStay !== undefined) updateData.min_stay = availabilityData.minStay;
      if (availabilityData.maxStay !== undefined) updateData.max_stay = availabilityData.maxStay;
      if (availabilityData.checkInTime !== undefined) updateData.check_in_time = availabilityData.checkInTime;
      if (availabilityData.checkOutTime !== undefined) updateData.check_out_time = availabilityData.checkOutTime;
      if (availabilityData.bookingWindow !== undefined) updateData.booking_window = availabilityData.bookingWindow;

      // Update property availability in transaction with audit logging
      const result = await prisma.$transaction(async (tx) => {
        logger.info(`[Property Availability Update Step 1/2] Updating availability information...`);
        
        const updatedProperty = await tx.properties.update({
          where: { id },
          data: {
            ...updateData,
            updated_at: new Date(),
          },
        });

        logger.info(`[Property Availability Update Step 2/2] Creating audit log...`);

        // Create audit log
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.audit_logs.create({
          data: {
            id: auditId,
            user_id: currentUser.id,
            action: 'PROPERTY_AVAILABILITY_UPDATED',
            entity_type: 'PROPERTY',
            entity_id: id,
            ip_address: '127.0.0.1',
            user_agent: 'Backend-V2-PropertyService',
            changes: {
              updated_by: currentUser.email,
              updated_fields: Object.keys(updateData),
              property_name: existingProperty.name,
              availability_changes: updateData
            }
          }
        });

        logger.info(`[Property Availability Update END] Availability updated successfully: ${updatedProperty.name}`);
        return updatedProperty;
      });

      await prisma.$disconnect();

      // Return the updated property with full details
      const propertyResult = await PropertyService.findById(currentUser, id);
      if (!propertyResult.success || !propertyResult.data) {
        return PropertyService.prototype.error('Error', 'Failed to retrieve updated property', 500);
      }

      logger.info(`Property availability updated successfully: ${result.name} by ${currentUser.email}`);
      return PropertyService.prototype.success(propertyResult.data, 'Property availability updated successfully');
    } catch (error) {
      logger.error('Error updating property availability:', error);
      return PropertyService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Get property statistics
   */
  public static async getStats(currentUser: CurrentUser): Promise<ServiceResponse<any>> {
    try {
      logger.info(`Getting property statistics for user ${currentUser.email}`);

      // RBAC check
      if (currentUser.role === 'GUEST') {
        return {
          success: false,
          error: 'Forbidden',
          message: 'GUEST role cannot access property statistics'
        };
      }

      // Create Prisma instance for static method
      const prisma = new (require('@prisma/client').PrismaClient)();

      // Get statistics based on user role
      let whereClause = {};

      if (currentUser.role === 'OWNER') {
        whereClause = { owner_id: currentUser.id };
      } else if (currentUser.role === 'AGENT') {
        whereClause = { agent_id: currentUser.id };
      }
      // ADMIN and MANAGER can see all properties

      // Get basic counts
      const totalProperties = await prisma.properties.count({ where: whereClause });
      const activeProperties = await prisma.properties.count({ where: { ...whereClause, is_active: true } });
      const inactiveProperties = await prisma.properties.count({ where: { ...whereClause, is_active: false } });
      const publishedProperties = await prisma.properties.count({ where: { ...whereClause, is_published: true } });

      const stats = {
        total: totalProperties,
        active: activeProperties,
        inactive: inactiveProperties,
        published: publishedProperties,
        byType: [],
        byStatus: []
      };

      await prisma.$disconnect();

      logger.info(`Property statistics retrieved for user ${currentUser.email}`);
      return {
        success: true,
        data: stats,
        message: 'Property statistics retrieved successfully'
      };
    } catch (error) {
      logger.error('Error retrieving property statistics:', error);
      return {
        success: false,
        error: 'Database operation failed',
        message: 'An error occurred while processing your request'
      };
    }
  }

  /**
   * Get available properties (without owners)
   */
  public static async getAvailableProperties(currentUser: CurrentUser): Promise<ServiceResponse<any[]>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Available Properties] Getting available properties by ${currentUser.email}`);

      // RBAC: Only ADMIN and MANAGER can access
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        await prisma.$disconnect();
        return PropertyService.prototype.error('Forbidden', 'Only administrators and managers can view available properties');
      }

      // Get properties without owners
      const properties = await prisma.properties.findMany({
        where: { 
          owner_id: null,
          is_active: true
        },
        select: {
          id: true,
          name: true,
          nickname: true,
          type: true,
          type_of_unit: true,
          address: true,
          city: true,
          country: true,
          capacity: true,
          bedrooms: true,
          bathrooms: true,
          area: true,
          price_per_night: true,
          description: true,
          amenities: true,
          house_rules: true,
          tags: true,
          is_active: true,
          is_published: true,
          primary_image: true,
          created_at: true,
          updated_at: true
        },
        orderBy: { created_at: 'desc' }
      });

      await prisma.$disconnect();

      logger.info(`[Available Properties] Found ${properties.length} available properties`);
      return PropertyService.prototype.success(properties, 'Available properties retrieved successfully');
    } catch (error) {
      await prisma.$disconnect();
      logger.error('Error getting available properties:', error);
      return PropertyService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Update property amenities using many-to-many relationship
   */
  public static async updateAmenities(currentUser: CurrentUser, id: string, amenityIds: string[]): Promise<ServiceResponse<PropertyResponseDto>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Property Amenities Update] Starting amenities update for property ID: ${id} with amenity IDs: ${amenityIds.join(', ')}`);
      logger.info(`[Property Amenities Update] Current user:`, { 
        userId: currentUser.id, 
        email: currentUser.email, 
        role: currentUser.role 
      });

      // Check if property exists
      logger.info(`[Property Amenities Update] Checking if property exists: ${id}`);
      const existingProperty = await prisma.properties.findUnique({
        where: { id },
      });

      logger.info(`[Property Amenities Update] Property lookup result:`, { 
        found: !!existingProperty, 
        propertyId: existingProperty?.id,
        ownerId: existingProperty?.owner_id,
        agentId: existingProperty?.agent_id
      });

      if (!existingProperty) {
        logger.error(`[Property Amenities Update] Property not found: ${id}`);
        await prisma.$disconnect();
        return PropertyService.prototype.error('Not Found', 'Property not found', 404);
      }

      // Check permissions
      const canEdit = currentUser.role === 'ADMIN' || 
                     currentUser.role === 'MANAGER' || 
                     (currentUser.role === 'OWNER' && existingProperty.owner_id === currentUser.id) ||
                     (currentUser.role === 'AGENT' && existingProperty.agent_id === currentUser.id);

      logger.info(`[Property Amenities Update] Permission check:`, { 
        canEdit, 
        userRole: currentUser.role,
        propertyOwnerId: existingProperty.owner_id,
        propertyAgentId: existingProperty.agent_id,
        userId: currentUser.id
      });

      if (!canEdit) {
        logger.error(`[Property Amenities Update] Insufficient permissions for user ${currentUser.id} to edit property ${id}`);
        await prisma.$disconnect();
        return PropertyService.prototype.error('Forbidden', 'Insufficient permissions to update property amenities', 403);
      }

      // Validate that all amenity IDs exist
      if (amenityIds.length > 0) {
        logger.info(`[Property Amenities Update] Validating ${amenityIds.length} amenity IDs:`, amenityIds);
        
        const existingAmenities = await prisma.amenities.findMany({
          where: { id: { in: amenityIds } },
          select: { id: true }
        });

        logger.info(`[Property Amenities Update] Found ${existingAmenities.length} existing amenities:`, existingAmenities);

        const existingIds = existingAmenities.map(a => a.id);
        const invalidIds = amenityIds.filter(id => !existingIds.includes(id));

        logger.info(`[Property Amenities Update] Validation result:`, { 
          existingIds, 
          invalidIds, 
          invalidCount: invalidIds.length 
        });

        if (invalidIds.length > 0) {
          logger.error(`[Property Amenities Update] Invalid amenity IDs found:`, invalidIds);
          await prisma.$disconnect();
          return PropertyService.prototype.error('Bad Request', `Invalid amenity IDs: ${invalidIds.join(', ')}`, 400);
        }
      } else {
        logger.info(`[Property Amenities Update] No amenities to add (empty array)`);
      }

      // Use transaction to update amenities
      logger.info(`[Property Amenities Update] Starting transaction for property ${id}`);
      const result = await prisma.$transaction(async (tx) => {
        // Remove all existing amenities for this property
        logger.info(`[Property Amenities Update] Removing existing amenities for property ${id}`);
        const deleteResult = await tx.property_amenities.deleteMany({
          where: { property_id: id }
        });
        logger.info(`[Property Amenities Update] Deleted ${deleteResult.count} existing amenities`);

        // Add new amenities if any
        if (amenityIds.length > 0) {
          logger.info(`[Property Amenities Update] Adding ${amenityIds.length} new amenities:`, amenityIds);
          const createData = amenityIds.map(amenityId => ({
            property_id: id,
            amenity_id: amenityId
          }));
          logger.info(`[Property Amenities Update] Create data:`, createData);
          
          const createResult = await tx.property_amenities.createMany({
            data: createData
          });
          logger.info(`[Property Amenities Update] Created ${createResult.count} new amenities`);
        } else {
          logger.info(`[Property Amenities Update] No new amenities to add`);
        }

        // Get updated property with amenities
        const updatedProperty = await tx.properties.findUnique({
          where: { id },
          include: {
            users_properties_owner_idTousers: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            },
            users_properties_agent_idTousers: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            },
            property_photos: {
              select: {
                id: true,
                url: true,
                is_cover: true,
                alt: true,
                order: true
              },
              orderBy: { order: 'asc' }
            },
            property_amenities: {
              include: {
                amenity: {
                  select: {
                    id: true,
                    name: true,
                    icon: true,
                    category: true
                  }
                }
              }
            }
          }
        });

        return updatedProperty;
      });

      await prisma.$disconnect();

      logger.info(`[Property Amenities Update] Transaction completed, checking result:`, { 
        hasResult: !!result, 
        resultId: result?.id 
      });

      if (!result) {
        logger.error(`[Property Amenities Update] Property not found after update: ${id}`);
        return PropertyService.prototype.error('Not Found', 'Property not found after update', 404);
      }

      logger.info(`[Property Amenities Update] Property found after update:`, {
        id: result.id,
        name: result.name,
        amenitiesCount: result.property_amenities?.length || 0
      });

      // Transform to response DTO
      const propertyResponse: PropertyResponseDto = {
        id: result.id,
        name: result.name,
        nickname: result.nickname,
        title: result.title,
        type: result.type,
        typeOfUnit: result.type_of_unit,
        address: result.address,
        city: result.city,
        country: result.country,
        latitude: result.latitude,
        longitude: result.longitude,
        capacity: result.capacity,
        bedrooms: result.bedrooms,
        bathrooms: result.bathrooms,
        area: result.area,
        pricePerNight: result.price_per_night,
        description: result.description,
        amenities: result.amenities, // Keep old format for backward compatibility
        houseRules: result.house_rules,
        tags: result.tags,
        isActive: result.is_active,
        isPublished: result.is_published,
        primaryImage: result.primary_image,
        pricelabId: result.pricelab_id,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        ownerId: result.owner_id,
        agentId: result.agent_id,
        // Settings fields
        minStay: result.min_stay,
        maxStay: result.max_stay,
        checkInTime: result.check_in_time,
        checkOutTime: result.check_out_time,
        bookingWindow: result.booking_window
      };

      logger.info(`[Property Amenities Update] Successfully updated amenities for property ID: ${id}. Added ${amenityIds.length} amenities.`);
      logger.info(`[Property Amenities Update] Final response DTO:`, { 
        id: propertyResponse.id, 
        name: propertyResponse.name 
      });
      
      return PropertyService.prototype.success(propertyResponse, 'Property amenities updated successfully');
    } catch (error) {
      logger.error('[Property Amenities Update] Error updating property amenities:', error);
      return PropertyService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Check property availability for specific dates
   */
  public static async checkAvailability(currentUser: CurrentUser, propertyId: string, startDate: string, endDate: string): Promise<ServiceResponse<{ isAvailable: boolean; conflictingReservations?: any[] }>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Property Availability Check] Checking availability for property ${propertyId} from ${startDate} to ${endDate}`);

      // Check if property exists
      const property = await prisma.properties.findUnique({
        where: { id: propertyId },
      });

      if (!property) {
        await prisma.$disconnect();
        return PropertyService.prototype.error('Not Found', 'Property not found', 404);
      }

      // Check permissions
      const canView = currentUser.role === 'ADMIN' || 
                     currentUser.role === 'MANAGER' || 
                     (currentUser.role === 'OWNER' && property.owner_id === currentUser.id) ||
                     (currentUser.role === 'AGENT' && property.agent_id === currentUser.id);

      if (!canView) {
        await prisma.$disconnect();
        return PropertyService.prototype.error('Forbidden', 'You do not have permission to check availability for this property', 403);
      }

      // Parse dates
      const checkInDate = new Date(startDate);
      const checkOutDate = new Date(endDate);

      // Check for overlapping reservations
      const overlappingReservations = await prisma.reservations.findMany({
        where: {
          property_id: propertyId,
          status: { not: 'CANCELLED' },
          OR: [
            {
              AND: [
                { check_in: { lte: checkInDate } },
                { check_out: { gt: checkInDate } }
              ]
            },
            {
              AND: [
                { check_in: { lt: checkOutDate } },
                { check_out: { gte: checkOutDate } }
              ]
            },
            {
              AND: [
                { check_in: { gte: checkInDate } },
                { check_out: { lte: checkOutDate } }
              ]
            }
          ]
        },
        select: {
          id: true,
          reservation_id: true,
          check_in: true,
          check_out: true,
          status: true,
          guest_name: true
        }
      });

      await prisma.$disconnect();

      const isAvailable = overlappingReservations.length === 0;

      logger.info(`[Property Availability Check] Property ${propertyId} is ${isAvailable ? 'available' : 'not available'} for the requested dates`);

      return PropertyService.prototype.success({
        isAvailable,
        ...(overlappingReservations.length > 0 && { conflictingReservations: overlappingReservations })
      }, 'Availability checked successfully');

    } catch (error) {
      logger.error('[Property Availability Check] Error checking availability:', error);
      return PropertyService.prototype.handleDatabaseError(error);
    }
  }
}
