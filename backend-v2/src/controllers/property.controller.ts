import { Response, NextFunction } from 'express';
import { PropertyService } from '../services/property.service';
import { BaseController } from './BaseController';
import { PropertyQueryParams, CreatePropertyDto, UpdatePropertyDto } from '../types/dto';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

export class PropertyController extends BaseController {
  /**
   * Get all properties endpoint with RBAC
   * GET /api/v2/properties
   */
  public static getAllProperties = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get current user from JWT middleware
      const currentUser = req.user;
      if (!currentUser) {
        PropertyController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      // Parse query parameters
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const search = req.query.search as string;
      const type = req.query.type as string;
      const status = req.query.status as string;
      const ownerId = req.query.ownerId as string;
      const agentId = req.query.agentId as string;

      // Prepare query parameters
      const queryParams: PropertyQueryParams = {
        page,
        limit,
        ...(search && { search }),
        ...(type && { type }),
        ...(status && { status }),
        ...(ownerId && { ownerId }),
        ...(agentId && { agentId })
      };

      // Get properties with RBAC
      const propertiesResult = await PropertyService.findAll(currentUser, queryParams);

      if (!propertiesResult.success || !propertiesResult.data) {
        PropertyController.error(res, propertiesResult.error || 'Failed to retrieve properties', 500, propertiesResult.message);
        return;
      }

      // Log properties retrieval
      logger.info(`Properties retrieved: ${propertiesResult.data.data.length} properties, page ${page}`);

      // Return properties with pagination
      PropertyController.paginated(
        res,
        propertiesResult.data.data,
        propertiesResult.data.pagination,
        'Properties retrieved successfully'
      );
    } catch (error) {
      logger.error('Get all properties error:', error);
      PropertyController.error(res, error, 500, 'Failed to retrieve properties');
    }
  };

  /**
   * Get property by ID endpoint with RBAC
   * GET /api/v2/properties/:id
   */
  public static getPropertyById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get current user from JWT middleware
      const currentUser = req.user;
      if (!currentUser) {
        PropertyController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;

      if (!id) {
        PropertyController.validationError(res, [], 'Property ID is required');
        return;
      }

      // Get property with RBAC
      const propertyResult = await PropertyService.findById(currentUser, id);

      if (!propertyResult.success) {
        if (propertyResult.error === 'Access denied') {
          PropertyController.error(res, 'Forbidden', 403, propertyResult.message);
          return;
        }
        PropertyController.notFound(res, 'Property', 'Property not found');
        return;
      }

      if (!propertyResult.data) {
        PropertyController.notFound(res, 'Property', 'Property not found');
        return;
      }

      // Log property retrieval
      logger.info(`Property retrieved: ${propertyResult.data.name}`);

      // Return property
      PropertyController.success(res, propertyResult.data, 'Property retrieved successfully');
    } catch (error) {
      logger.error('Get property by ID error:', error);
      PropertyController.error(res, error, 500, 'Failed to retrieve property');
    }
  };

  /**
   * Create property endpoint
   * POST /api/v2/properties
   */
  public static createProperty = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get current user from JWT middleware
      const currentUser = req.user;
      if (!currentUser) {
        PropertyController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const {
        name,
        nickname,
        title,
        type,
        typeOfUnit,
        address,
        city,
        country,
        latitude,
        longitude,
        capacity,
        bedrooms,
        bathrooms,
        area,
        pricePerNight,
        description,
        amenities,
        houseRules,
        tags,
        ownerId,
        agentId
      } = req.body;

      // Validate required fields
      if (!name || !address || !city || !country || !capacity || !bedrooms || !bathrooms || !pricePerNight || !ownerId) {
        PropertyController.validationError(res, [], 'Name, address, city, country, capacity, bedrooms, bathrooms, price per night, and owner ID are required');
        return;
      }

      // Validate numeric fields
      if (capacity < 1 || bedrooms < 0 || bathrooms < 0 || pricePerNight <= 0) {
        PropertyController.validationError(res, [], 'Capacity must be at least 1, bedrooms and bathrooms must be non-negative, and price per night must be positive');
        return;
      }

      // Validate latitude and longitude if provided
      if (latitude && (latitude < -90 || latitude > 90)) {
        PropertyController.validationError(res, [], 'Latitude must be between -90 and 90');
        return;
      }

      if (longitude && (longitude < -180 || longitude > 180)) {
        PropertyController.validationError(res, [], 'Longitude must be between -180 and 180');
        return;
      }

      const propertyData: CreatePropertyDto = {
        name,
        nickname,
        title,
        type,
        typeOfUnit,
        address,
        city,
        country,
        latitude,
        longitude,
        capacity,
        bedrooms,
        bathrooms,
        area,
        pricePerNight,
        description,
        amenities,
        houseRules,
        tags,
        ownerId,
        agentId
      };

      // Create property
      const createResult = await PropertyService.create(currentUser, propertyData);

      if (!createResult.success || !createResult.data) {
        PropertyController.error(res, createResult.error || 'Property creation failed', 400, createResult.message);
        return;
      }

      // Log property creation
      logger.info(`Property created successfully: ${name}`);

      // Return created property with 201 status
      PropertyController.success(res, createResult.data, 'Property created successfully', 201);
    } catch (error) {
      logger.error('Create property error:', error);
      PropertyController.error(res, error, 500, 'Property creation failed');
    }
  };

  /**
   * Update property endpoint
   * PUT /api/v2/properties/:id
   */
  public static updateProperty = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get current user from JWT middleware
      const currentUser = req.user;
      if (!currentUser) {
        PropertyController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        PropertyController.validationError(res, [], 'Property ID is required');
        return;
      }

      // Validate numeric fields if provided
      if (updateData.capacity && updateData.capacity < 1) {
        PropertyController.validationError(res, [], 'Capacity must be at least 1');
        return;
      }

      if (updateData.bedrooms && updateData.bedrooms < 0) {
        PropertyController.validationError(res, [], 'Bedrooms must be non-negative');
        return;
      }

      if (updateData.bathrooms && updateData.bathrooms < 0) {
        PropertyController.validationError(res, [], 'Bathrooms must be non-negative');
        return;
      }

      if (updateData.pricePerNight && updateData.pricePerNight <= 0) {
        PropertyController.validationError(res, [], 'Price per night must be positive');
        return;
      }

      // Validate latitude and longitude if provided
      if (updateData.latitude && (updateData.latitude < -90 || updateData.latitude > 90)) {
        PropertyController.validationError(res, [], 'Latitude must be between -90 and 90');
        return;
      }

      if (updateData.longitude && (updateData.longitude < -180 || updateData.longitude > 180)) {
        PropertyController.validationError(res, [], 'Longitude must be between -180 and 180');
        return;
      }

      const propertyUpdateData: UpdatePropertyDto = updateData;

      // Update property
      const updateResult = await PropertyService.update(currentUser, id, propertyUpdateData);

      if (!updateResult.success || !updateResult.data) {
        PropertyController.error(res, updateResult.error || 'Property update failed', 400, updateResult.message);
        return;
      }

      // Log property update
      logger.info(`Property updated successfully: ${id}`);

      // Return updated property
      PropertyController.success(res, updateResult.data, 'Property updated successfully');
    } catch (error) {
      logger.error('Update property error:', error);
      PropertyController.error(res, error, 500, 'Property update failed');
    }
  };
}
