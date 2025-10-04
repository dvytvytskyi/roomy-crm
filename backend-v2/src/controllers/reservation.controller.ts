import { Response, NextFunction } from 'express';
import { ReservationService } from '../services/reservation.service';
import { BaseController } from './BaseController';
import { ReservationQueryParams, CreateReservationDto, UpdateReservationDto } from '../types/dto';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

export class ReservationController extends BaseController {
  /**
   * Get all reservations endpoint with RBAC
   * GET /api/v2/reservations
   */
  public static getAllReservations = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get current user from JWT middleware
      const currentUser = req.user;
      if (!currentUser) {
        ReservationController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      // Parse query parameters
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const search = req.query.search as string;
      const status = req.query.status as string;
      const propertyId = req.query.propertyId as string;
      const guestId = req.query.guestId as string;
      const agentId = req.query.agentId as string;
      const dateFrom = req.query.dateFrom as string;
      const dateTo = req.query.dateTo as string;

      // Validate date formats if provided
      if (dateFrom && isNaN(Date.parse(dateFrom))) {
        ReservationController.validationError(res, [], 'Invalid dateFrom format. Use ISO 8601 format (YYYY-MM-DD)');
        return;
      }

      if (dateTo && isNaN(Date.parse(dateTo))) {
        ReservationController.validationError(res, [], 'Invalid dateTo format. Use ISO 8601 format (YYYY-MM-DD)');
        return;
      }

      // Prepare query parameters
      const queryParams: ReservationQueryParams = {
        page,
        limit,
        ...(search && { search }),
        ...(status && { status }),
        ...(propertyId && { propertyId }),
        ...(guestId && { guestId }),
        ...(agentId && { agentId }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      };

      // Get reservations with RBAC
      const reservationsResult = await ReservationService.findAll(currentUser, queryParams);

      if (!reservationsResult.success || !reservationsResult.data) {
        ReservationController.error(res, reservationsResult.error || 'Failed to retrieve reservations', 500, reservationsResult.message);
        return;
      }

      // Log reservations retrieval
      logger.info(`Reservations retrieved: ${reservationsResult.data.data.length} reservations, page ${page}`);

      // Return reservations with pagination
      ReservationController.paginated(
        res,
        reservationsResult.data.data,
        reservationsResult.data.pagination,
        'Reservations retrieved successfully'
      );
    } catch (error) {
      logger.error('Get all reservations error:', error);
      ReservationController.error(res, error, 500, 'Failed to retrieve reservations');
    }
  };

  /**
   * Get reservation by ID endpoint with RBAC
   * GET /api/v2/reservations/:id
   */
  public static getReservationById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get current user from JWT middleware
      const currentUser = req.user;
      if (!currentUser) {
        ReservationController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;

      if (!id) {
        ReservationController.validationError(res, [], 'Reservation ID is required');
        return;
      }

      // Get reservation with RBAC
      const reservationResult = await ReservationService.findById(currentUser, id);

      if (!reservationResult.success) {
        if (reservationResult.error === 'Access denied') {
          ReservationController.error(res, 'Forbidden', 403, reservationResult.message);
          return;
        }
        ReservationController.notFound(res, 'Reservation', 'Reservation not found');
        return;
      }

      if (!reservationResult.data) {
        ReservationController.notFound(res, 'Reservation', 'Reservation not found');
        return;
      }

      // Log reservation retrieval
      logger.info(`Reservation retrieved: ${reservationResult.data.reservationId}`);

      // Return reservation
      ReservationController.success(res, reservationResult.data, 'Reservation retrieved successfully');
    } catch (error) {
      logger.error('Get reservation by ID error:', error);
      ReservationController.error(res, error, 500, 'Failed to retrieve reservation');
    }
  };

  /**
   * Create reservation endpoint
   * POST /api/v2/reservations
   */
  public static createReservation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get current user from JWT middleware
      const currentUser = req.user;
      if (!currentUser) {
        ReservationController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const {
        propertyId,
        guestId,
        agentId,
        checkIn,
        checkOut,
        guests,
        totalAmount,
        source,
        guestName,
        guestEmail,
        guestPhone,
        specialRequests,
        notes
      } = req.body;

      // Validate required fields
      if (!propertyId || !checkIn || !checkOut || !guests || !totalAmount || !source || !guestName || !guestEmail) {
        ReservationController.validationError(res, [], 'Property ID, check-in date, check-out date, guests count, total amount, source, guest name, and guest email are required');
        return;
      }

      // Validate dates
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      if (isNaN(checkInDate.getTime())) {
        ReservationController.validationError(res, [], 'Invalid check-in date format');
        return;
      }

      if (isNaN(checkOutDate.getTime())) {
        ReservationController.validationError(res, [], 'Invalid check-out date format');
        return;
      }

      if (checkInDate >= checkOutDate) {
        ReservationController.validationError(res, [], 'Check-out date must be after check-in date');
        return;
      }

      // Validate guests count
      if (guests < 1) {
        ReservationController.validationError(res, [], 'Guests count must be at least 1');
        return;
      }

      // Validate total amount
      if (totalAmount <= 0) {
        ReservationController.validationError(res, [], 'Total amount must be positive');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail)) {
        ReservationController.validationError(res, [], 'Invalid guest email format');
        return;
      }

      const reservationData: CreateReservationDto = {
        propertyId,
        guestId,
        agentId,
        checkIn,
        checkOut,
        guests,
        totalAmount,
        source,
        guestName,
        guestEmail,
        guestPhone,
        specialRequests,
        notes
      };

      // Create reservation
      const createResult = await ReservationService.create(currentUser, reservationData);

      if (!createResult.success || !createResult.data) {
        ReservationController.error(res, createResult.error || 'Reservation creation failed', 400, createResult.message);
        return;
      }

      // Log reservation creation
      logger.info(`Reservation created successfully: ${createResult.data.reservationId}`);

      // Return created reservation with 201 status
      ReservationController.success(res, createResult.data, 'Reservation created successfully', 201);
    } catch (error) {
      logger.error('Create reservation error:', error);
      ReservationController.error(res, error, 500, 'Reservation creation failed');
    }
  };

  /**
   * Update reservation endpoint
   * PUT /api/v2/reservations/:id
   */
  public static updateReservation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get current user from JWT middleware
      const currentUser = req.user;
      if (!currentUser) {
        ReservationController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        ReservationController.validationError(res, [], 'Reservation ID is required');
        return;
      }

      // Validate dates if provided
      if (updateData.checkIn) {
        const checkInDate = new Date(updateData.checkIn);
        if (isNaN(checkInDate.getTime())) {
          ReservationController.validationError(res, [], 'Invalid check-in date format');
          return;
        }
      }

      if (updateData.checkOut) {
        const checkOutDate = new Date(updateData.checkOut);
        if (isNaN(checkOutDate.getTime())) {
          ReservationController.validationError(res, [], 'Invalid check-out date format');
          return;
        }
      }

      // Validate both dates if both provided
      if (updateData.checkIn && updateData.checkOut) {
        const checkInDate = new Date(updateData.checkIn);
        const checkOutDate = new Date(updateData.checkOut);
        if (checkInDate >= checkOutDate) {
          ReservationController.validationError(res, [], 'Check-out date must be after check-in date');
          return;
        }
      }

      // Validate guests count if provided
      if (updateData.guests && updateData.guests < 1) {
        ReservationController.validationError(res, [], 'Guests count must be at least 1');
        return;
      }

      // Validate amounts if provided
      if (updateData.totalAmount && updateData.totalAmount <= 0) {
        ReservationController.validationError(res, [], 'Total amount must be positive');
        return;
      }

      if (updateData.paidAmount && updateData.paidAmount < 0) {
        ReservationController.validationError(res, [], 'Paid amount must be non-negative');
        return;
      }

      if (updateData.outstandingBalance && updateData.outstandingBalance < 0) {
        ReservationController.validationError(res, [], 'Outstanding balance must be non-negative');
        return;
      }

      // Validate email format if provided
      if (updateData.guestEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.guestEmail)) {
          ReservationController.validationError(res, [], 'Invalid guest email format');
          return;
        }
      }

      const reservationUpdateData: UpdateReservationDto = updateData;

      // Update reservation
      const updateResult = await ReservationService.update(currentUser, id, reservationUpdateData);

      if (!updateResult.success || !updateResult.data) {
        ReservationController.error(res, updateResult.error || 'Reservation update failed', 400, updateResult.message);
        return;
      }

      // Log reservation update
      logger.info(`Reservation updated successfully: ${updateResult.data.reservationId}`);

      // Return updated reservation
      ReservationController.success(res, updateResult.data, 'Reservation updated successfully');
    } catch (error) {
      logger.error('Update reservation error:', error);
      ReservationController.error(res, error, 500, 'Reservation update failed');
    }
  };
}
