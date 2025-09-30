"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableProperties = exports.getReservationSources = exports.getReservationStats = exports.getReservationCalendar = exports.markAsNoShow = exports.checkOutGuest = exports.checkInGuest = exports.updateReservationStatus = exports.deleteReservation = exports.updateReservation = exports.createReservation = exports.getReservationById = exports.getReservations = void 0;
const reservationService_1 = require("../services/reservationService");
const asyncHandler_1 = require("../middleware/asyncHandler");
const loggerService_1 = require("../services/loggerService");
exports.getReservations = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const filters = {
        dateRange: req.query.dateRange ? JSON.parse(req.query.dateRange) : undefined,
        status: req.query.status ? req.query.status.split(',') : undefined,
        source: req.query.source ? req.query.source.split(',') : undefined,
        property: req.query.property ? req.query.property.split(',') : undefined,
        amountRange: req.query.amountRange ? JSON.parse(req.query.amountRange) : undefined,
        guestName: req.query.guestName,
        checkInFrom: req.query.checkInFrom,
        checkInTo: req.query.checkInTo,
        minAmount: req.query.minAmount,
        maxAmount: req.query.maxAmount,
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 50
    };
    loggerService_1.loggerService.info('Fetching reservations', { filters, userId: req.user?.id });
    const result = await reservationService_1.reservationService.getReservations(filters);
    res.status(200).json({
        success: true,
        data: result.reservations,
        pagination: result.pagination,
        message: 'Reservations retrieved successfully'
    });
});
exports.getReservationById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    loggerService_1.loggerService.info('Fetching reservation by ID', { reservationId: id, userId: req.user?.id });
    const reservation = await reservationService_1.reservationService.getReservationById(id, req.user?.id);
    res.status(200).json({
        success: true,
        data: reservation,
        message: 'Reservation retrieved successfully'
    });
});
exports.createReservation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const reservationData = req.body;
    const userId = req.user?.id;
    loggerService_1.loggerService.info('Creating new reservation', {
        reservationData: {
            propertyId: reservationData.propertyId,
            guestId: reservationData.guestId,
            checkIn: reservationData.checkIn,
            checkOut: reservationData.checkOut
        },
        userId
    });
    const reservation = await reservationService_1.reservationService.createReservation(reservationData, userId);
    res.status(201).json({
        success: true,
        data: reservation,
        message: 'Reservation created successfully'
    });
});
exports.updateReservation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user?.id;
    loggerService_1.loggerService.info('Updating reservation', {
        reservationId: id,
        updateData,
        userId
    });
    const reservation = await reservationService_1.reservationService.updateReservation(id, updateData, userId);
    res.status(200).json({
        success: true,
        data: reservation,
        message: 'Reservation updated successfully'
    });
});
exports.deleteReservation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    loggerService_1.loggerService.info('Deleting reservation', { reservationId: id, userId });
    await reservationService_1.reservationService.deleteReservation(id, userId);
    res.status(200).json({
        success: true,
        message: 'Reservation deleted successfully'
    });
});
exports.updateReservationStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const statusData = req.body;
    const userId = req.user?.id;
    loggerService_1.loggerService.info('Updating reservation status', {
        reservationId: id,
        statusData,
        userId
    });
    const reservation = await reservationService_1.reservationService.updateReservationStatus(id, statusData, userId);
    res.status(200).json({
        success: true,
        data: reservation,
        message: 'Reservation status updated successfully'
    });
});
exports.checkInGuest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    loggerService_1.loggerService.info('Checking in guest', { reservationId: id, userId });
    const reservation = await reservationService_1.reservationService.checkInGuest(id, userId);
    res.status(200).json({
        success: true,
        data: reservation,
        message: 'Guest checked in successfully'
    });
});
exports.checkOutGuest = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    loggerService_1.loggerService.info('Checking out guest', { reservationId: id, userId });
    const reservation = await reservationService_1.reservationService.checkOutGuest(id, userId);
    res.status(200).json({
        success: true,
        data: reservation,
        message: 'Guest checked out successfully'
    });
});
exports.markAsNoShow = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    loggerService_1.loggerService.info('Marking reservation as no-show', { reservationId: id, userId });
    const reservation = await reservationService_1.reservationService.markAsNoShow(id, userId);
    res.status(200).json({
        success: true,
        data: reservation,
        message: 'Reservation marked as no-show'
    });
});
exports.getReservationCalendar = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { propertyId, startDate, endDate } = req.query;
    const userId = req.user?.id;
    loggerService_1.loggerService.info('Fetching reservation calendar', {
        propertyId,
        startDate,
        endDate,
        userId
    });
    const calendar = await reservationService_1.reservationService.getReservationCalendar(propertyId, startDate, endDate, userId);
    res.status(200).json({
        success: true,
        data: calendar,
        message: 'Reservation calendar retrieved successfully'
    });
});
exports.getReservationStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { propertyId, startDate, endDate } = req.query;
    const userId = req.user?.id;
    loggerService_1.loggerService.info('Fetching reservation statistics', {
        propertyId,
        startDate,
        endDate,
        userId
    });
    const stats = await reservationService_1.reservationService.getReservationStats(propertyId, startDate, endDate, userId);
    res.status(200).json({
        success: true,
        data: stats,
        message: 'Reservation statistics retrieved successfully'
    });
});
exports.getReservationSources = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    loggerService_1.loggerService.info('Fetching reservation sources', { userId: req.user?.id });
    const sources = await reservationService_1.reservationService.getReservationSources();
    res.status(200).json({
        success: true,
        data: sources,
        message: 'Reservation sources retrieved successfully'
    });
});
exports.getAvailableProperties = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate, guests } = req.query;
    const userId = req.user?.id;
    loggerService_1.loggerService.info('Fetching available properties', {
        startDate,
        endDate,
        guests,
        userId
    });
    const properties = await reservationService_1.reservationService.getAvailableProperties(startDate, endDate, guests ? parseInt(guests) : undefined, userId);
    res.status(200).json({
        success: true,
        data: properties,
        message: 'Available properties retrieved successfully'
    });
});
//# sourceMappingURL=reservationController.js.map