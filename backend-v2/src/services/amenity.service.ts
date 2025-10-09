import { PrismaClient } from '@prisma/client';
import { ServiceResponse, PaginatedResponse } from '../types';
import { CurrentUser } from '../types';
import logger from '../utils/logger';

export interface AmenityDto {
  id: string;
  name: string;
  icon?: string;
  category?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAmenityDto {
  name: string;
  icon?: string;
  category?: string;
  description?: string;
}

export interface UpdateAmenityDto {
  name?: string;
  icon?: string;
  category?: string;
  description?: string;
  is_active?: boolean;
}

export class AmenityService {
  /**
   * Get all amenities with pagination and filtering (public endpoint)
   */
  public static async findAllPublic(
    page: number = 1,
    limit: number = 50,
    category?: string,
    search?: string
  ): Promise<ServiceResponse<PaginatedResponse<AmenityDto>>> {
    try {
      const prisma = new PrismaClient();
      const offset = (page - 1) * limit;

      // Build where clause
      let where: any = {
        is_active: true // Only active amenities for public endpoint
      };

      if (category) {
        where.category = category;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get total count
      const totalCount = await prisma.amenities.count({ where });

      // Get amenities
      const amenities = await prisma.amenities.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ]
      });

      // Transform to DTO
      const amenityDtos: AmenityDto[] = amenities.map(amenity => ({
        id: amenity.id,
        name: amenity.name,
        icon: amenity.icon || undefined,
        category: amenity.category || undefined,
        description: amenity.description || undefined,
        is_active: amenity.is_active,
        created_at: amenity.created_at.toISOString(),
        updated_at: amenity.updated_at.toISOString()
      }));

      // Calculate pagination
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const pagination = {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      };

      logger.info(`Public amenities retrieved: ${amenityDtos.length} amenities, page ${page}`);

      return {
        success: true,
        data: {
          data: amenityDtos,
          pagination
        }
      };
    } catch (error) {
      logger.error('Public amenities retrieval error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve amenities'
      };
    } finally {
      // prisma will be disconnected automatically
    }
  }

  /**
   * Get all amenities with pagination and filtering (authenticated)
   */
  public static async findAll(
    currentUser: CurrentUser,
    page: number = 1,
    limit: number = 50,
    category?: string,
    search?: string
  ): Promise<ServiceResponse<PaginatedResponse<AmenityDto>>> {
    try {
      const prisma = new PrismaClient();
      const offset = (page - 1) * limit;

      // Build where clause
      let where: any = {};

      if (category) {
        where.category = category;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get total count
      const total = await prisma.amenities.count({ where });

      // Get amenities
      const amenities = await prisma.amenities.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ]
      });

      await prisma.$disconnect();

      // Map to DTOs
      const amenityDtos: AmenityDto[] = amenities.map(amenity => ({
        id: amenity.id,
        name: amenity.name,
        icon: amenity.icon || undefined,
        category: amenity.category || undefined,
        description: amenity.description || undefined,
        is_active: amenity.is_active,
        created_at: amenity.created_at.toISOString(),
        updated_at: amenity.updated_at.toISOString()
      }));

      // Create pagination metadata
      const pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      };

      const result: PaginatedResponse<AmenityDto> = {
        data: amenityDtos,
        pagination
      };

      return AmenityService.prototype.success(result);
    } catch (error) {
      logger.error('Error finding all amenities:', error);
      return AmenityService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Get amenity by ID
   */
  public static async findById(
    currentUser: CurrentUser,
    id: string
  ): Promise<ServiceResponse<AmenityDto | null>> {
    try {
      const prisma = new PrismaClient();

      const amenity = await prisma.amenities.findUnique({
        where: { id }
      });

      await prisma.$disconnect();

      if (!amenity) {
        return AmenityService.prototype.error('Amenity not found', 'Amenity with the specified ID does not exist', 404);
      }

      const amenityDto: AmenityDto = {
        id: amenity.id,
        name: amenity.name,
        icon: amenity.icon || undefined,
        category: amenity.category || undefined,
        description: amenity.description || undefined,
        is_active: amenity.is_active,
        created_at: amenity.created_at.toISOString(),
        updated_at: amenity.updated_at.toISOString()
      };

      return AmenityService.prototype.success(amenityDto);
    } catch (error) {
      logger.error('Error finding amenity by ID:', error);
      return AmenityService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Create new amenity
   */
  public static async create(
    currentUser: CurrentUser,
    data: CreateAmenityDto
  ): Promise<ServiceResponse<AmenityDto>> {
    try {
      // Check permissions
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        return AmenityService.prototype.error('Forbidden', 'Only ADMIN and MANAGER can create amenities', 403);
      }

      const prisma = new PrismaClient();

      // Check if amenity with same name already exists
      const existingAmenity = await prisma.amenities.findUnique({
        where: { name: data.name }
      });

      if (existingAmenity) {
        await prisma.$disconnect();
        return AmenityService.prototype.error('Conflict', 'Amenity with this name already exists', 409);
      }

      // Create amenity
      const amenity = await prisma.amenities.create({
        data: {
          name: data.name,
          icon: data.icon,
          category: data.category,
          description: data.description
        }
      });

      await prisma.$disconnect();

      const amenityDto: AmenityDto = {
        id: amenity.id,
        name: amenity.name,
        icon: amenity.icon || undefined,
        category: amenity.category || undefined,
        description: amenity.description || undefined,
        is_active: amenity.is_active,
        created_at: amenity.created_at.toISOString(),
        updated_at: amenity.updated_at.toISOString()
      };

      logger.info(`Amenity created: ${amenity.name} by user ${currentUser.id}`);
      return AmenityService.prototype.success(amenityDto, 'Amenity created successfully', 201);
    } catch (error) {
      logger.error('Error creating amenity:', error);
      return AmenityService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Update amenity
   */
  public static async update(
    currentUser: CurrentUser,
    id: string,
    data: UpdateAmenityDto
  ): Promise<ServiceResponse<AmenityDto>> {
    try {
      // Check permissions
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        return AmenityService.prototype.error('Forbidden', 'Only ADMIN and MANAGER can update amenities', 403);
      }

      const prisma = new PrismaClient();

      // Check if amenity exists
      const existingAmenity = await prisma.amenities.findUnique({
        where: { id }
      });

      if (!existingAmenity) {
        await prisma.$disconnect();
        return AmenityService.prototype.error('Not found', 'Amenity not found', 404);
      }

      // Check if name is being changed and if new name already exists
      if (data.name && data.name !== existingAmenity.name) {
        const nameExists = await prisma.amenities.findUnique({
          where: { name: data.name }
        });

        if (nameExists) {
          await prisma.$disconnect();
          return AmenityService.prototype.error('Conflict', 'Amenity with this name already exists', 409);
        }
      }

      // Update amenity
      const amenity = await prisma.amenities.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date()
        }
      });

      await prisma.$disconnect();

      const amenityDto: AmenityDto = {
        id: amenity.id,
        name: amenity.name,
        icon: amenity.icon || undefined,
        category: amenity.category || undefined,
        description: amenity.description || undefined,
        is_active: amenity.is_active,
        created_at: amenity.created_at.toISOString(),
        updated_at: amenity.updated_at.toISOString()
      };

      logger.info(`Amenity updated: ${amenity.name} by user ${currentUser.id}`);
      return AmenityService.prototype.success(amenityDto, 'Amenity updated successfully');
    } catch (error) {
      logger.error('Error updating amenity:', error);
      return AmenityService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Delete amenity
   */
  public static async delete(
    currentUser: CurrentUser,
    id: string
  ): Promise<ServiceResponse<null>> {
    try {
      // Check permissions
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        return AmenityService.prototype.error('Forbidden', 'Only ADMIN and MANAGER can delete amenities', 403);
      }

      const prisma = new PrismaClient();

      // Check if amenity exists
      const existingAmenity = await prisma.amenities.findUnique({
        where: { id }
      });

      if (!existingAmenity) {
        await prisma.$disconnect();
        return AmenityService.prototype.error('Not found', 'Amenity not found', 404);
      }

      // Check if amenity is used by any properties
      const propertyCount = await prisma.property_amenities.count({
        where: { amenity_id: id }
      });

      if (propertyCount > 0) {
        await prisma.$disconnect();
        return AmenityService.prototype.error('Conflict', `Cannot delete amenity. It is used by ${propertyCount} properties.`, 409);
      }

      // Delete amenity
      await prisma.amenities.delete({
        where: { id }
      });

      await prisma.$disconnect();

      logger.info(`Amenity deleted: ${existingAmenity.name} by user ${currentUser.id}`);
      return AmenityService.prototype.success(null, 'Amenity deleted successfully');
    } catch (error) {
      logger.error('Error deleting amenity:', error);
      return AmenityService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Get amenities by category
   */
  public static async getCategories(
    currentUser: CurrentUser
  ): Promise<ServiceResponse<string[]>> {
    try {
      const prisma = new PrismaClient();

      const categories = await prisma.amenities.findMany({
        select: { category: true },
        where: {
          category: { not: null },
          is_active: true
        },
        distinct: ['category']
      });

      await prisma.$disconnect();

      const categoryList = categories
        .map(c => c.category)
        .filter(Boolean)
        .sort();

      return AmenityService.prototype.success(categoryList);
    } catch (error) {
      logger.error('Error getting amenity categories:', error);
      return AmenityService.prototype.handleDatabaseError(error);
    }
  }
}
