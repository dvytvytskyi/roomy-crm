import { PrismaClient } from '@prisma/client';
import { BaseService } from './BaseService';
import { ServiceResponse } from '../types';
import { CurrentUser, PropertyQueryParams, PaginatedResponse, CreatePropertyDto, UpdatePropertyDto } from '../types/dto';
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
}

// Property with related data
export interface PropertyWithDetailsDto extends PropertyResponseDto {
  owner?: {
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
  photos?: Array<{
    id: string;
    url: string;
    isCover: boolean;
    alt?: string;
    order: number;
  }>;
  _count?: {
    reservations?: number;
    photos?: number;
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
      if (type) where.type = type;
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
   * Find property by ID with role-based access control
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

      // Get property with all related data
      const property = await prisma.properties.findUnique({
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
          pricing_rules: {
            select: {
              id: true,
              name: true,
              type: true,
              value: true,
              start_date: true,
              end_date: true,
              is_active: true,
              conditions: true
            },
            where: { is_active: true },
            orderBy: { created_at: 'desc' }
          },
          _count: {
            select: {
              reservations: true,
              property_photos: true,
              pricing_rules: true
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
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        logger.info(`[Property Creation Step 2/2] Creating audit log...`);

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

        logger.info(`[Property Creation END] Property created successfully: ${property.name}`);
        return property;
      });

      await prisma.$disconnect();

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
}
