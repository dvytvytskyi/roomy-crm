import { Request, Response } from 'express';
import { reservationService } from '../services/reservationService';
import { asyncHandler } from '../middleware/asyncHandler';
import { loggerService } from '../services/loggerService';
import { 
  CreateReservationRequest, 
  UpdateReservationRequest, 
  ReservationFilters,
  ReservationStatusUpdate 
} from '../types';

/**
 * @desc    Get all reservations with optional filters
 * @route   GET /api/reservations
 * @access  Private (Admin, Manager, Agent)
 */
export const getReservations = asyncHandler(async (req: Request, res: Response) => {
  const filters: ReservationFilters = {
    dateRange: req.query.dateRange ? JSON.parse(req.query.dateRange as string) : undefined,
    status: req.query.status ? (req.query.status as string).split(',') : undefined,
    source: req.query.source ? (req.query.source as string).split(',') : undefined,
    property: req.query.property ? (req.query.property as string).split(',') : undefined,
    amountRange: req.query.amountRange ? JSON.parse(req.query.amountRange as string) : undefined,
    guestName: req.query.guestName as string,
    checkInFrom: req.query.checkInFrom as string,
    checkInTo: req.query.checkInTo as string,
    minAmount: req.query.minAmount as string,
    maxAmount: req.query.maxAmount as string,
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 50
  };

  loggerService.info('Fetching reservations', { filters, userId: req.user?.id });

  const result = await reservationService.getReservations(filters);
  
  res.status(200).json({
    success: true,
    data: result.reservations,
    pagination: result.pagination,
    message: 'Reservations retrieved successfully'
  });
});

/**
 * @desc    Get reservation by ID
 * @route   GET /api/reservations/:id
 * @access  Private (Admin, Manager, Agent, Owner)
 */
export const getReservationById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  loggerService.info('Fetching reservation by ID', { reservationId: id, userId: req.user?.id });

  const reservation = await reservationService.getReservationById(id, req.user?.id);
  
  res.status(200).json({
    success: true,
    data: reservation,
    message: 'Reservation retrieved successfully'
  });
});

/**
 * @desc    Create new reservation
 * @route   POST /api/reservations
 * @access  Private (Admin, Manager, Agent)
 */
export const createReservation = asyncHandler(async (req: Request, res: Response) => {
  const reservationData: CreateReservationRequest = req.body;
  const userId = req.user?.id;

  loggerService.info('Creating new reservation', { 
    reservationData: { 
      propertyId: reservationData.propertyId,
      guestId: reservationData.guestId,
      checkIn: reservationData.checkIn,
      checkOut: reservationData.checkOut
    }, 
    userId 
  });

  const reservation = await reservationService.createReservation(reservationData, userId);
  
  res.status(201).json({
    success: true,
    data: reservation,
    message: 'Reservation created successfully'
  });
});

/**
 * @desc    Update reservation
 * @route   PUT /api/reservations/:id
 * @access  Private (Admin, Manager, Agent)
 */
export const updateReservation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: UpdateReservationRequest = req.body;
  const userId = req.user?.id;

  loggerService.info('Updating reservation', { 
    reservationId: id, 
    updateData, 
    userId 
  });

  const reservation = await reservationService.updateReservation(id, updateData, userId);
  
  res.status(200).json({
    success: true,
    data: reservation,
    message: 'Reservation updated successfully'
  });
});

/**
 * @desc    Delete/Cancel reservation
 * @route   DELETE /api/reservations/:id
 * @access  Private (Admin, Manager, Agent)
 */
export const deleteReservation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  loggerService.info('Deleting reservation', { reservationId: id, userId });

  await reservationService.deleteReservation(id, userId);
  
  res.status(200).json({
    success: true,
    message: 'Reservation deleted successfully'
  });
});

/**
 * @desc    Update reservation status
 * @route   PUT /api/reservations/:id/status
 * @access  Private (Admin, Manager, Agent)
 */
export const updateReservationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const statusData: ReservationStatusUpdate = req.body;
  const userId = req.user?.id;

  loggerService.info('Updating reservation status', { 
    reservationId: id, 
    statusData, 
    userId 
  });

  const reservation = await reservationService.updateReservationStatus(id, statusData, userId);
  
  res.status(200).json({
    success: true,
    data: reservation,
    message: 'Reservation status updated successfully'
  });
});

/**
 * @desc    Check-in guest
 * @route   PUT /api/reservations/:id/check-in
 * @access  Private (Admin, Manager, Agent)
 */
export const checkInGuest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  loggerService.info('Checking in guest', { reservationId: id, userId });

  const reservation = await reservationService.checkInGuest(id, userId);
  
  res.status(200).json({
    success: true,
    data: reservation,
    message: 'Guest checked in successfully'
  });
});

/**
 * @desc    Check-out guest
 * @route   PUT /api/reservations/:id/check-out
 * @access  Private (Admin, Manager, Agent)
 */
export const checkOutGuest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  loggerService.info('Checking out guest', { reservationId: id, userId });

  const reservation = await reservationService.checkOutGuest(id, userId);
  
  res.status(200).json({
    success: true,
    data: reservation,
    message: 'Guest checked out successfully'
  });
});

/**
 * @desc    Mark as no-show
 * @route   PUT /api/reservations/:id/no-show
 * @access  Private (Admin, Manager, Agent)
 */
export const markAsNoShow = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  loggerService.info('Marking reservation as no-show', { reservationId: id, userId });

  const reservation = await reservationService.markAsNoShow(id, userId);
  
  res.status(200).json({
    success: true,
    data: reservation,
    message: 'Reservation marked as no-show'
  });
});

/**
 * @desc    Get reservation calendar view
 * @route   GET /api/reservations/calendar
 * @access  Private (Admin, Manager, Agent, Owner)
 */
export const getReservationCalendar = asyncHandler(async (req: Request, res: Response) => {
  const { propertyId, startDate, endDate } = req.query;
  const userId = req.user?.id;

  loggerService.info('Fetching reservation calendar', { 
    propertyId, 
    startDate, 
    endDate, 
    userId 
  });

  const calendar = await reservationService.getReservationCalendar(
    propertyId as string,
    startDate as string,
    endDate as string,
    userId
  );
  
  res.status(200).json({
    success: true,
    data: calendar,
    message: 'Reservation calendar retrieved successfully'
  });
});

/**
 * @desc    Get reservation statistics
 * @route   GET /api/reservations/stats
 * @access  Private (Admin, Manager, Agent)
 */
export const getReservationStats = asyncHandler(async (req: Request, res: Response) => {
  const { propertyId, startDate, endDate } = req.query;
  const userId = req.user?.id;

  loggerService.info('Fetching reservation statistics', { 
    propertyId, 
    startDate, 
    endDate, 
    userId 
  });

  const stats = await reservationService.getReservationStats(
    propertyId as string,
    startDate as string,
    endDate as string,
    userId
  );
  
  res.status(200).json({
    success: true,
    data: stats,
    message: 'Reservation statistics retrieved successfully'
  });
});

/**
 * @desc    Get reservation sources
 * @route   GET /api/reservations/sources
 * @access  Private (Admin, Manager, Agent)
 */
export const getReservationSources = asyncHandler(async (req: Request, res: Response) => {
  loggerService.info('Fetching reservation sources', { userId: req.user?.id });

  const sources = await reservationService.getReservationSources();
  
  res.status(200).json({
    success: true,
    data: sources,
    message: 'Reservation sources retrieved successfully'
  });
});

/**
 * @desc    Get available properties for reservation
 * @route   GET /api/reservations/available-properties
 * @access  Private (Admin, Manager, Agent)
 */
export const getAvailableProperties = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, guests } = req.query;
  const userId = req.user?.id;

  loggerService.info('Fetching available properties', { 
    startDate, 
    endDate, 
    guests, 
    userId 
  });

  const properties = await reservationService.getAvailableProperties(
    startDate as string,
    endDate as string,
    guests ? parseInt(guests as string) : undefined,
    userId
  );
  
  res.status(200).json({
    success: true,
    data: properties,
    message: 'Available properties retrieved successfully'
  });
});
