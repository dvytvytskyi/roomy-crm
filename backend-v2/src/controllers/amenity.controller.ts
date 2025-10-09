import { Request, Response, NextFunction } from 'express';
import { AmenityService } from '../services/amenity.service';
import { BaseController } from './BaseController';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

export class AmenityController extends BaseController {
  /**
   * Get all amenities with pagination and filtering
   * GET /api/v2/amenities
   */
  public static getAllAmenities = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse query parameters
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
      const category = req.query.category as string;
      const search = req.query.search as string;

      // Get amenities (public endpoint - no user required)
      const result = await AmenityService.findAllPublic(page, limit, category, search);

      if (!result.success || !result.data) {
        AmenityController.error(res, result.error || 'Failed to retrieve amenities', 500, result.message);
        return;
      }

      // Log amenities retrieval
      logger.info(`Amenities retrieved: ${result.data.data.length} amenities, page ${page}`);

      // Return amenities with pagination
      AmenityController.paginated(
        res,
        result.data.data,
        result.data.pagination,
        'Amenities retrieved successfully'
      );
    } catch (error) {
      logger.error('Get all amenities error:', error);
      AmenityController.error(res, error, 500, 'Failed to retrieve amenities');
    }
  };

  /**
   * Get amenity by ID
   * GET /api/v2/amenities/:id
   */
  public static getAmenityById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        AmenityController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;

      if (!id) {
        AmenityController.validationError(res, [], 'Amenity ID is required');
        return;
      }

      const result = await AmenityService.findById(currentUser, id);

      if (!result.success) {
        AmenityController.error(res, result.error || 'Failed to retrieve amenity', result.statusCode || 500, result.message);
        return;
      }

      AmenityController.success(res, result.data, 'Amenity retrieved successfully');
    } catch (error) {
      logger.error('Get amenity by ID error:', error);
      AmenityController.error(res, error, 500, 'Failed to retrieve amenity');
    }
  };

  /**
   * Create new amenity
   * POST /api/v2/amenities
   */
  public static createAmenity = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        AmenityController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { name, icon, category, description } = req.body;

      // Validate required fields
      if (!name || name.trim() === '') {
        AmenityController.validationError(res, [], 'Name is required');
        return;
      }

      const amenityData = {
        name: name.trim(),
        icon: icon?.trim(),
        category: category?.trim(),
        description: description?.trim()
      };

      const result = await AmenityService.create(currentUser, amenityData);

      if (!result.success || !result.data) {
        AmenityController.error(res, result.error || 'Failed to create amenity', result.statusCode || 400, result.message);
        return;
      }

      AmenityController.success(res, result.data, 'Amenity created successfully', 201);
    } catch (error) {
      logger.error('Create amenity error:', error);
      AmenityController.error(res, error, 500, 'Failed to create amenity');
    }
  };

  /**
   * Update amenity
   * PUT /api/v2/amenities/:id
   */
  public static updateAmenity = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        AmenityController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;
      const { name, icon, category, description, is_active } = req.body;

      if (!id) {
        AmenityController.validationError(res, [], 'Amenity ID is required');
        return;
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (icon !== undefined) updateData.icon = icon?.trim();
      if (category !== undefined) updateData.category = category?.trim();
      if (description !== undefined) updateData.description = description?.trim();
      if (is_active !== undefined) updateData.is_active = Boolean(is_active);

      const result = await AmenityService.update(currentUser, id, updateData);

      if (!result.success || !result.data) {
        AmenityController.error(res, result.error || 'Failed to update amenity', result.statusCode || 400, result.message);
        return;
      }

      AmenityController.success(res, result.data, 'Amenity updated successfully');
    } catch (error) {
      logger.error('Update amenity error:', error);
      AmenityController.error(res, error, 500, 'Failed to update amenity');
    }
  };

  /**
   * Delete amenity
   * DELETE /api/v2/amenities/:id
   */
  public static deleteAmenity = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        AmenityController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;

      if (!id) {
        AmenityController.validationError(res, [], 'Amenity ID is required');
        return;
      }

      const result = await AmenityService.delete(currentUser, id);

      if (!result.success) {
        AmenityController.error(res, result.error || 'Failed to delete amenity', result.statusCode || 400, result.message);
        return;
      }

      AmenityController.success(res, null, 'Amenity deleted successfully');
    } catch (error) {
      logger.error('Delete amenity error:', error);
      AmenityController.error(res, error, 500, 'Failed to delete amenity');
    }
  };

  /**
   * Get amenity categories
   * GET /api/v2/amenities/categories
   */
  public static getCategories = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        AmenityController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const result = await AmenityService.getCategories(currentUser);

      if (!result.success || !result.data) {
        AmenityController.error(res, result.error || 'Failed to retrieve categories', 500, result.message);
        return;
      }

      AmenityController.success(res, result.data, 'Categories retrieved successfully');
    } catch (error) {
      logger.error('Get categories error:', error);
      AmenityController.error(res, error, 500, 'Failed to retrieve categories');
    }
  };
}
