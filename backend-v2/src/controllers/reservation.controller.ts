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
      // Увеличен default limit для scheduler (для получения всех резерваций за период)
      const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit as string) || 100));
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

  /**
   * Update reservation dates endpoint
   * PUT /api/v2/reservations/:id/dates
   */
  public static updateReservationDates = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get current user from JWT middleware
      const currentUser = req.user;
      if (!currentUser) {
        ReservationController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;
      const { checkIn, checkOut } = req.body;

      if (!id) {
        ReservationController.validationError(res, [], 'Reservation ID is required');
        return;
      }

      if (!checkIn || !checkOut) {
        ReservationController.validationError(res, [], 'Both check-in and check-out dates are required');
        return;
      }

      // Validate dates
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      if (isNaN(checkInDate.getTime())) {
        ReservationController.validationError(res, [], 'Invalid check-in date format. Use ISO 8601 format (YYYY-MM-DD)');
        return;
      }

      if (isNaN(checkOutDate.getTime())) {
        ReservationController.validationError(res, [], 'Invalid check-out date format. Use ISO 8601 format (YYYY-MM-DD)');
        return;
      }

      if (checkInDate >= checkOutDate) {
        ReservationController.validationError(res, [], 'Check-out date must be after check-in date');
        return;
      }

      // Check if dates are in the future (business rule)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkInDate < today) {
        ReservationController.validationError(res, [], 'Check-in date cannot be in the past');
        return;
      }

      const datesData = {
        checkIn,
        checkOut
      };

      // Update reservation dates
      const updateResult = await ReservationService.updateDates(currentUser, id, datesData);

      if (!updateResult.success || !updateResult.data) {
        ReservationController.error(res, updateResult.error || 'Reservation dates update failed', 400, updateResult.message);
        return;
      }

      // Log reservation dates update
      logger.info(`Reservation dates updated successfully: ${updateResult.data.reservationId}`);

      // Return updated reservation
      ReservationController.success(res, updateResult.data, 'Reservation dates updated successfully');
    } catch (error) {
      logger.error('Update reservation dates error:', error);
      ReservationController.error(res, error, 500, 'Reservation dates update failed');
    }
  };

  /**
   * Get reservation statistics
   * @route GET /api/v2/reservations/stats
   */
  public static async getReservationStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUser = req.user;

      logger.info(`Getting reservation statistics for user ${currentUser.email}`);

      const result = await ReservationService.getStats(currentUser);

      if (!result.success) {
        ReservationController.error(res, result.error || 'Failed to retrieve reservation statistics', result.statusCode || 500, result.message);
        return;
      }

      logger.info(`Reservation statistics retrieved for user ${currentUser.email}`);
      ReservationController.success(res, result.data, 'Reservation statistics retrieved successfully');
    } catch (error) {
      logger.error('Error in getReservationStats controller:', error);
      ReservationController.error(res, error, 500, 'An error occurred while retrieving reservation statistics');
    }
  }

  // ============================================
  // NOTES MANAGEMENT
  // ============================================

  /**
   * Add note to reservation
   * POST /api/v2/reservations/:id/notes
   */
  public static addNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        ReservationController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;
      const { content, type, priority } = req.body;

      if (!id) {
        ReservationController.validationError(res, [], 'Reservation ID is required');
        return;
      }

      if (!content) {
        ReservationController.validationError(res, [], 'Note content is required');
        return;
      }

      const result = await ReservationService.addNote(currentUser, id, { content, type, priority });

      if (!result.success) {
        ReservationController.error(res, result.error || 'Failed to add note', 400, result.message);
        return;
      }

      logger.info(`Note added to reservation ${id} by user ${currentUser.email}`);
      ReservationController.success(res, result.data, 'Note added successfully', 201);
    } catch (error) {
      logger.error('Add note error:', error);
      ReservationController.error(res, error, 500, 'Failed to add note');
    }
  };

  /**
   * Update reservation note
   * PUT /api/v2/reservations/:id/notes/:noteId
   */
  public static updateNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        ReservationController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id, noteId } = req.params;
      const { content } = req.body;

      if (!id || !noteId) {
        ReservationController.validationError(res, [], 'Reservation ID and Note ID are required');
        return;
      }

      if (!content) {
        ReservationController.validationError(res, [], 'Note content is required');
        return;
      }

      const result = await ReservationService.updateNote(currentUser, id, noteId, content);

      if (!result.success) {
        ReservationController.error(res, result.error || 'Failed to update note', 400, result.message);
        return;
      }

      logger.info(`Note ${noteId} updated for reservation ${id} by user ${currentUser.email}`);
      ReservationController.success(res, result.data, 'Note updated successfully');
    } catch (error) {
      logger.error('Update note error:', error);
      ReservationController.error(res, error, 500, 'Failed to update note');
    }
  };

  /**
   * Delete reservation note
   * DELETE /api/v2/reservations/:id/notes/:noteId
   */
  public static deleteNote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        ReservationController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id, noteId } = req.params;

      if (!id || !noteId) {
        ReservationController.validationError(res, [], 'Reservation ID and Note ID are required');
        return;
      }

      const result = await ReservationService.deleteNote(currentUser, id, noteId);

      if (!result.success) {
        ReservationController.error(res, result.error || 'Failed to delete note', 400, result.message);
        return;
      }

      logger.info(`Note ${noteId} deleted from reservation ${id} by user ${currentUser.email}`);
      ReservationController.success(res, result.data, 'Note deleted successfully');
    } catch (error) {
      logger.error('Delete note error:', error);
      ReservationController.error(res, error, 500, 'Failed to delete note');
    }
  };

  // ============================================
  // PAYMENTS MANAGEMENT
  // ============================================

  /**
   * Add payment to reservation
   * POST /api/v2/reservations/:id/payments
   */
  public static addPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        ReservationController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;
      const { amount, method, date, reference, description, type } = req.body;

      if (!id) {
        ReservationController.validationError(res, [], 'Reservation ID is required');
        return;
      }

      if (!amount || amount <= 0) {
        ReservationController.validationError(res, [], 'Valid payment amount is required');
        return;
      }

      if (!method) {
        ReservationController.validationError(res, [], 'Payment method is required');
        return;
      }

      const result = await ReservationService.addPayment(currentUser, id, { 
        amount, 
        method, 
        date: date || new Date().toISOString(), 
        reference, 
        description, 
        type 
      });

      if (!result.success) {
        ReservationController.error(res, result.error || 'Failed to add payment', 400, result.message);
        return;
      }

      logger.info(`Payment added to reservation ${id} by user ${currentUser.email}`);
      ReservationController.success(res, result.data, 'Payment added successfully', 201);
    } catch (error) {
      logger.error('Add payment error:', error);
      ReservationController.error(res, error, 500, 'Failed to add payment');
    }
  };

  /**
   * Delete payment from reservation
   * DELETE /api/v2/reservations/:id/payments/:paymentId
   */
  public static deletePayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        ReservationController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id, paymentId } = req.params;

      if (!id || !paymentId) {
        ReservationController.validationError(res, [], 'Reservation ID and Payment ID are required');
        return;
      }

      const result = await ReservationService.deletePayment(currentUser, id, paymentId);

      if (!result.success) {
        ReservationController.error(res, result.error || 'Failed to delete payment', 400, result.message);
        return;
      }

      logger.info(`Payment ${paymentId} deleted from reservation ${id} by user ${currentUser.email}`);
      ReservationController.success(res, result.data, 'Payment deleted successfully');
    } catch (error) {
      logger.error('Delete payment error:', error);
      ReservationController.error(res, error, 500, 'Failed to delete payment');
    }
  };

  // ============================================
  // ADJUSTMENTS MANAGEMENT
  // ============================================

  /**
   * Add adjustment to reservation
   * POST /api/v2/reservations/:id/adjustments
   */
  public static addAdjustment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        ReservationController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;
      const { type, amount, reason } = req.body;

      if (!id) {
        ReservationController.validationError(res, [], 'Reservation ID is required');
        return;
      }

      if (!type || !amount || !reason) {
        ReservationController.validationError(res, [], 'Type, amount, and reason are required');
        return;
      }

      const result = await ReservationService.addAdjustment(currentUser, id, { type, amount, reason });

      if (!result.success) {
        ReservationController.error(res, result.error || 'Failed to add adjustment', 400, result.message);
        return;
      }

      logger.info(`Adjustment added to reservation ${id} by user ${currentUser.email}`);
      ReservationController.success(res, result.data, 'Adjustment added successfully', 201);
    } catch (error) {
      logger.error('Add adjustment error:', error);
      ReservationController.error(res, error, 500, 'Failed to add adjustment');
    }
  };

  /**
   * Delete adjustment from reservation
   * DELETE /api/v2/reservations/:id/adjustments/:adjustmentId
   */
  public static deleteAdjustment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        ReservationController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id, adjustmentId } = req.params;

      if (!id || !adjustmentId) {
        ReservationController.validationError(res, [], 'Reservation ID and Adjustment ID are required');
        return;
      }

      const result = await ReservationService.deleteAdjustment(currentUser, id, adjustmentId);

      if (!result.success) {
        ReservationController.error(res, result.error || 'Failed to delete adjustment', 400, result.message);
        return;
      }

      logger.info(`Adjustment ${adjustmentId} deleted from reservation ${id} by user ${currentUser.email}`);
      ReservationController.success(res, result.data, 'Adjustment deleted successfully');
    } catch (error) {
      logger.error('Delete adjustment error:', error);
      ReservationController.error(res, error, 500, 'Failed to delete adjustment');
    }
  };

  // ============================================
  // COMMUNICATIONS MANAGEMENT
  // ============================================

  /**
   * Send communication to guest
   * POST /api/v2/reservations/:id/communications
   */
  public static sendCommunication = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        ReservationController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;
      const { type, subject, content } = req.body;

      if (!id) {
        ReservationController.validationError(res, [], 'Reservation ID is required');
        return;
      }

      if (!type || !subject || !content) {
        ReservationController.validationError(res, [], 'Type, subject, and content are required');
        return;
      }

      const result = await ReservationService.sendCommunication(currentUser, id, { type, subject, content });

      if (!result.success) {
        ReservationController.error(res, result.error || 'Failed to send communication', 400, result.message);
        return;
      }

      logger.info(`Communication sent for reservation ${id} by user ${currentUser.email}`);
      ReservationController.success(res, result.data, 'Communication sent successfully', 201);
    } catch (error) {
      logger.error('Send communication error:', error);
      ReservationController.error(res, error, 500, 'Failed to send communication');
    }
  };

  /**
   * Get all communications for reservation
   * GET /api/v2/reservations/:id/communications
   */
  public static getCommunications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
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

      const result = await ReservationService.getCommunications(currentUser, id);

      if (!result.success) {
        ReservationController.error(res, result.error || 'Failed to get communications', 400, result.message);
        return;
      }

      logger.info(`Communications retrieved for reservation ${id}`);
      ReservationController.success(res, result.data, 'Communications retrieved successfully');
    } catch (error) {
      logger.error('Get communications error:', error);
      ReservationController.error(res, error, 500, 'Failed to get communications');
    }
  };

  // ============================================
  // INVOICES MANAGEMENT
  // ============================================

  /**
   * Generate invoice for reservation
   * POST /api/v2/reservations/:id/invoices
   */
  public static generateInvoice = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        ReservationController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;
      const { type } = req.body;

      if (!id) {
        ReservationController.validationError(res, [], 'Reservation ID is required');
        return;
      }

      const result = await ReservationService.generateInvoice(currentUser, id, type || 'final');

      if (!result.success) {
        ReservationController.error(res, result.error || 'Failed to generate invoice', 400, result.message);
        return;
      }

      logger.info(`Invoice generated for reservation ${id} by user ${currentUser.email}`);
      ReservationController.success(res, result.data, 'Invoice generated successfully', 201);
    } catch (error) {
      logger.error('Generate invoice error:', error);
      ReservationController.error(res, error, 500, 'Failed to generate invoice');
    }
  };

  /**
   * Get all invoices for reservation
   * GET /api/v2/reservations/:id/invoices
   */
  public static getInvoices = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
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

      const result = await ReservationService.getInvoices(currentUser, id);

      if (!result.success) {
        ReservationController.error(res, result.error || 'Failed to get invoices', 400, result.message);
        return;
      }

      logger.info(`Invoices retrieved for reservation ${id}`);
      ReservationController.success(res, result.data, 'Invoices retrieved successfully');
    } catch (error) {
      logger.error('Get invoices error:', error);
      ReservationController.error(res, error, 500, 'Failed to get invoices');
    }
  };

  // ============================================
  // PRICING MANAGEMENT
  // ============================================

  /**
   * Update reservation pricing
   * PUT /api/v2/reservations/:id/pricing
   */
  public static updatePricing = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        ReservationController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;
      const { pricePerNight, totalAmount } = req.body;

      if (!id) {
        ReservationController.validationError(res, [], 'Reservation ID is required');
        return;
      }

      if (pricePerNight !== undefined && pricePerNight <= 0) {
        ReservationController.validationError(res, [], 'Price per night must be positive');
        return;
      }

      if (totalAmount !== undefined && totalAmount <= 0) {
        ReservationController.validationError(res, [], 'Total amount must be positive');
        return;
      }

      const result = await ReservationService.updatePricing(currentUser, id, { pricePerNight, totalAmount });

      if (!result.success) {
        ReservationController.error(res, result.error || 'Failed to update pricing', 400, result.message);
        return;
      }

      logger.info(`Pricing updated for reservation ${id} by user ${currentUser.email}`);
      ReservationController.success(res, result.data, 'Pricing updated successfully');
    } catch (error) {
      logger.error('Update pricing error:', error);
      ReservationController.error(res, error, 500, 'Failed to update pricing');
    }
  };

  // ============================================
  // STATUS OPERATIONS (using Orchestrator)
  // ============================================

  /**
   * Confirm reservation
   * PUT /api/v2/reservations/:id/confirm
   */
  public static confirmReservation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
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

      const result = await ReservationService.confirmReservation(currentUser, id);

      if (!result.success) {
        ReservationController.error(res, result.error || 'Failed to confirm reservation', 400, result.message);
        return;
      }

      logger.info(`Reservation ${id} confirmed by user ${currentUser.email}`);
      ReservationController.success(res, result.data, 'Reservation confirmed successfully');
    } catch (error) {
      logger.error('Confirm reservation error:', error);
      ReservationController.error(res, error, 500, 'Failed to confirm reservation');
    }
  };

  /**
   * Cancel reservation
   * PUT /api/v2/reservations/:id/cancel
   */
  public static cancelReservation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      if (!currentUser) {
        ReservationController.error(res, 'Unauthorized', 401, 'Authentication required');
        return;
      }

      const { id } = req.params;
      const { reason } = req.body;

      if (!id) {
        ReservationController.validationError(res, [], 'Reservation ID is required');
        return;
      }

      const result = await ReservationService.cancelReservation(currentUser, id, reason);

      if (!result.success) {
        ReservationController.error(res, result.error || 'Failed to cancel reservation', 400, result.message);
        return;
      }

      logger.info(`Reservation ${id} cancelled by user ${currentUser.email}`);
      ReservationController.success(res, result.data, 'Reservation cancelled successfully');
    } catch (error) {
      logger.error('Cancel reservation error:', error);
      ReservationController.error(res, error, 500, 'Failed to cancel reservation');
    }
  };

  /**
   * Check-in guest
   * PUT /api/v2/reservations/:id/check-in
   */
  public static checkInReservation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
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

      const result = await ReservationService.checkInReservation(currentUser, id);

      if (!result.success) {
        ReservationController.error(res, result.error || 'Failed to check-in guest', 400, result.message);
        return;
      }

      logger.info(`Guest checked in for reservation ${id} by user ${currentUser.email}`);
      ReservationController.success(res, result.data, 'Guest checked in successfully');
    } catch (error) {
      logger.error('Check-in reservation error:', error);
      ReservationController.error(res, error, 500, 'Failed to check-in guest');
    }
  };

  /**
   * Check-out guest
   * PUT /api/v2/reservations/:id/check-out
   */
  public static checkOutReservation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
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

      const result = await ReservationService.checkOutReservation(currentUser, id);

      if (!result.success) {
        ReservationController.error(res, result.error || 'Failed to check-out guest', 400, result.message);
        return;
      }

      logger.info(`Guest checked out for reservation ${id} by user ${currentUser.email}`);
      ReservationController.success(res, result.data, 'Guest checked out successfully');
    } catch (error) {
      logger.error('Check-out reservation error:', error);
      ReservationController.error(res, error, 500, 'Failed to check-out guest');
    }
  };

  /**
   * Mark reservation as no-show
   * PUT /api/v2/reservations/:id/no-show
   */
  public static markAsNoShow = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
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

      const result = await ReservationService.markAsNoShow(currentUser, id);

      if (!result.success) {
        ReservationController.error(res, result.error || 'Failed to mark as no-show', 400, result.message);
        return;
      }

      logger.info(`Reservation ${id} marked as no-show by user ${currentUser.email}`);
      ReservationController.success(res, result.data, 'Reservation marked as no-show successfully');
    } catch (error) {
      logger.error('Mark as no-show error:', error);
      ReservationController.error(res, error, 500, 'Failed to mark as no-show');
    }
  };
}
