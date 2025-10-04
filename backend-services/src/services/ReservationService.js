/**
 * Reservation Service - Business Logic Orchestrator
 * 
 * Handles complex reservation workflows including:
 * - Reservation confirmation with automatic task creation
 * - Check-in/check-out processes
 * - Cancellation with compensation
 * - Status transitions with business rules
 */

const { PrismaClient } = require('@prisma/client');
const sagaOrchestrator = require('./SagaOrchestrator');
const logger = require('../utils/logger');

class ReservationService {
  constructor() {
    this.prisma = new PrismaClient();
    this.setupSagas();
  }

  /**
   * Setup reservation-related sagas
   */
  setupSagas() {
    // Confirm Reservation Saga
    sagaOrchestrator.registerSaga('confirmReservation', [
      {
        name: 'validateReservation',
        execute: async (data) => {
          const reservation = await this.prisma.reservation.findUnique({
            where: { id: data.reservationId },
            include: {
              property: true,
              guest: true
            }
          });

          if (!reservation) {
            throw new Error('Reservation not found');
          }

          if (reservation.status !== 'PENDING') {
            throw new Error('Reservation is not in PENDING status');
          }

          // Check property availability
          const conflictingReservations = await this.prisma.reservation.findMany({
            where: {
              propertyId: reservation.propertyId,
              status: { in: ['CONFIRMED', 'CHECKED_IN'] },
              OR: [
                {
                  checkInDate: { lte: reservation.checkOutDate },
                  checkOutDate: { gte: reservation.checkInDate }
                }
              ]
            }
          });

          if (conflictingReservations.length > 0) {
            throw new Error('Property is not available for the selected dates');
          }

          return { reservation };
        }
      },
      {
        name: 'updateReservationStatus',
        execute: async (data) => {
          const updatedReservation = await this.prisma.reservation.update({
            where: { id: data.reservationId },
            data: { 
              status: 'CONFIRMED',
              updatedAt: new Date()
            }
          });

          return { updatedReservation };
        },
        compensate: async (data) => {
          await this.prisma.reservation.update({
            where: { id: data.reservationId },
            data: { 
              status: 'PENDING',
              updatedAt: new Date()
            }
          });
        }
      },
      {
        name: 'createCleaningTask',
        execute: async (data) => {
          const cleaningTask = await this.prisma.task.create({
            data: {
              propertyId: data.reservation.propertyId,
              reservationId: data.reservationId,
              type: 'CLEANING',
              title: `Pre-arrival cleaning for ${data.reservation.guestName}`,
              description: `Clean property before guest arrival on ${data.reservation.checkInDate}`,
              status: 'PENDING',
              priority: 'HIGH',
              scheduledDate: new Date(data.reservation.checkInDate.getTime() - 24 * 60 * 60 * 1000), // 1 day before check-in
              cost: 150, // Default cleaning cost
              tags: ['cleaning', 'pre-arrival']
            }
          });

          return { cleaningTaskId: cleaningTask.id };
        },
        compensate: async (data) => {
          if (data.cleaningTaskId) {
            await this.prisma.task.delete({
              where: { id: data.cleaningTaskId }
            });
          }
        }
      },
      {
        name: 'createCheckInTask',
        execute: async (data) => {
          const checkInTask = await this.prisma.task.create({
            data: {
              propertyId: data.reservation.propertyId,
              reservationId: data.reservationId,
              type: 'CHECK_IN',
              title: `Check-in for ${data.reservation.guestName}`,
              description: `Meet guest for check-in at ${data.reservation.checkInDate}`,
              status: 'PENDING',
              priority: 'HIGH',
              scheduledDate: new Date(data.reservation.checkInDate),
              tags: ['check-in', 'guest-meeting']
            }
          });

          return { checkInTaskId: checkInTask.id };
        },
        compensate: async (data) => {
          if (data.checkInTaskId) {
            await this.prisma.task.delete({
              where: { id: data.checkInTaskId }
            });
          }
        }
      },
      {
        name: 'createFinancialTransaction',
        execute: async (data) => {
          const transaction = await this.prisma.transaction.create({
            data: {
              userId: data.reservation.guestId,
              propertyId: data.reservation.propertyId,
              reservationId: data.reservationId,
              type: 'GUEST_PAYMENT',
              category: 'Reservation Confirmation',
              amount: data.reservation.totalAmount,
              currency: 'AED',
              description: `Payment for reservation ${data.reservationId}`,
              status: 'PENDING',
              netAmount: data.reservation.totalAmount
            }
          });

          return { transactionId: transaction.id };
        },
        compensate: async (data) => {
          if (data.transactionId) {
            await this.prisma.transaction.update({
              where: { id: data.transactionId },
              data: { status: 'CANCELLED' }
            });
          }
        }
      },
      {
        name: 'sendConfirmationNotification',
        execute: async (data) => {
          // This would integrate with email/SMS service
          logger.info(`Sending confirmation notification to ${data.reservation.guestEmail}`);
          
          // For now, just log the notification
          const notification = {
            type: 'RESERVATION_CONFIRMED',
            recipient: data.reservation.guestEmail,
            subject: 'Reservation Confirmed',
            message: `Your reservation for ${data.reservation.property.name} has been confirmed. Check-in: ${data.reservation.checkInDate}`,
            sentAt: new Date()
          };

          return { notification };
        }
      }
    ]);

    // Check-in Saga
    sagaOrchestrator.registerSaga('checkInReservation', [
      {
        name: 'validateCheckIn',
        execute: async (data) => {
          const reservation = await this.prisma.reservation.findUnique({
            where: { id: data.reservationId }
          });

          if (!reservation || reservation.status !== 'CONFIRMED') {
            throw new Error('Reservation not found or not confirmed');
          }

          return { reservation };
        }
      },
      {
        name: 'updateReservationStatus',
        execute: async (data) => {
          await this.prisma.reservation.update({
            where: { id: data.reservationId },
            data: { 
              status: 'CHECKED_IN',
              updatedAt: new Date()
            }
          });

          return {};
        }
      },
      {
        name: 'createCheckOutTask',
        execute: async (data) => {
          const checkOutTask = await this.prisma.task.create({
            data: {
              propertyId: data.reservation.propertyId,
              reservationId: data.reservationId,
              type: 'CHECK_OUT',
              title: `Check-out for ${data.reservation.guestName}`,
              description: `Meet guest for check-out at ${data.reservation.checkOutDate}`,
              status: 'PENDING',
              priority: 'HIGH',
              scheduledDate: new Date(data.reservation.checkOutDate),
              tags: ['check-out', 'guest-meeting']
            }
          });

          return { checkOutTaskId: checkOutTask.id };
        }
      },
      {
        name: 'createPostCheckOutCleaningTask',
        execute: async (data) => {
          const cleaningTask = await this.prisma.task.create({
            data: {
              propertyId: data.reservation.propertyId,
              reservationId: data.reservationId,
              type: 'CLEANING',
              title: `Post-departure cleaning for ${data.reservation.guestName}`,
              description: `Clean property after guest departure on ${data.reservation.checkOutDate}`,
              status: 'PENDING',
              priority: 'HIGH',
              scheduledDate: new Date(data.reservation.checkOutDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours after check-out
              cost: 150,
              tags: ['cleaning', 'post-departure']
            }
          });

          return { postCleaningTaskId: cleaningTask.id };
        }
      }
    ]);

    // Cancel Reservation Saga
    sagaOrchestrator.registerSaga('cancelReservation', [
      {
        name: 'validateCancellation',
        execute: async (data) => {
          const reservation = await this.prisma.reservation.findUnique({
            where: { id: data.reservationId }
          });

          if (!reservation) {
            throw new Error('Reservation not found');
          }

          if (reservation.status === 'CANCELLED') {
            throw new Error('Reservation is already cancelled');
          }

          return { reservation };
        }
      },
      {
        name: 'cancelRelatedTasks',
        execute: async (data) => {
          await this.prisma.task.updateMany({
            where: {
              reservationId: data.reservationId,
              status: { in: ['PENDING', 'IN_PROGRESS'] }
            },
            data: { status: 'CANCELLED' }
          });

          return {};
        }
      },
      {
        name: 'createRefundTransaction',
        execute: async (data) => {
          const refundAmount = this.calculateRefundAmount(data.reservation);
          
          if (refundAmount > 0) {
            const refundTransaction = await this.prisma.transaction.create({
              data: {
                userId: data.reservation.guestId,
                propertyId: data.reservation.propertyId,
                reservationId: data.reservationId,
                type: 'REFUND',
                category: 'Reservation Cancellation',
                amount: refundAmount,
                currency: 'AED',
                description: `Refund for cancelled reservation ${data.reservationId}`,
                status: 'PENDING',
                netAmount: refundAmount
              }
            });

            return { refundTransactionId: refundTransaction.id };
          }

          return {};
        }
      },
      {
        name: 'updateReservationStatus',
        execute: async (data) => {
          await this.prisma.reservation.update({
            where: { id: data.reservationId },
            data: { 
              status: 'CANCELLED',
              updatedAt: new Date()
            }
          });

          return {};
        }
      }
    ]);
  }

  /**
   * Confirm a reservation (main business process)
   */
  async confirmReservation(reservationId, confirmData = {}) {
    logger.info(`Confirming reservation: ${reservationId}`);
    
    try {
      const result = await sagaOrchestrator.executeSaga('confirmReservation', {
        reservationId,
        ...confirmData
      });

      if (result.success) {
        logger.info(`Reservation confirmed successfully: ${reservationId}`);
        return {
          success: true,
          data: result.data,
          message: 'Reservation confirmed successfully'
        };
      } else {
        logger.error(`Reservation confirmation failed: ${result.error}`);
        return {
          success: false,
          error: result.error,
          message: 'Reservation confirmation failed'
        };
      }
    } catch (error) {
      logger.error(`Error confirming reservation: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Internal error during reservation confirmation'
      };
    }
  }

  /**
   * Check-in a reservation
   */
  async checkInReservation(reservationId, checkInData = {}) {
    logger.info(`Checking in reservation: ${reservationId}`);
    
    try {
      const result = await sagaOrchestrator.executeSaga('checkInReservation', {
        reservationId,
        ...checkInData
      });

      if (result.success) {
        logger.info(`Reservation checked in successfully: ${reservationId}`);
        return {
          success: true,
          data: result.data,
          message: 'Reservation checked in successfully'
        };
      } else {
        logger.error(`Reservation check-in failed: ${result.error}`);
        return {
          success: false,
          error: result.error,
          message: 'Reservation check-in failed'
        };
      }
    } catch (error) {
      logger.error(`Error checking in reservation: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Internal error during check-in'
      };
    }
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(reservationId, cancelData = {}) {
    logger.info(`Cancelling reservation: ${reservationId}`);
    
    try {
      const result = await sagaOrchestrator.executeSaga('cancelReservation', {
        reservationId,
        ...cancelData
      });

      if (result.success) {
        logger.info(`Reservation cancelled successfully: ${reservationId}`);
        return {
          success: true,
          data: result.data,
          message: 'Reservation cancelled successfully'
        };
      } else {
        logger.error(`Reservation cancellation failed: ${result.error}`);
        return {
          success: false,
          error: result.error,
          message: 'Reservation cancellation failed'
        };
      }
    } catch (error) {
      logger.error(`Error cancelling reservation: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Internal error during cancellation'
      };
    }
  }

  /**
   * Calculate refund amount based on cancellation policy
   */
  calculateRefundAmount(reservation) {
    const now = new Date();
    const checkInDate = new Date(reservation.checkInDate);
    const daysUntilCheckIn = Math.ceil((checkInDate - now) / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;

    // Cancellation policy based on days until check-in
    if (daysUntilCheckIn >= 7) {
      refundPercentage = 100; // Full refund
    } else if (daysUntilCheckIn >= 3) {
      refundPercentage = 50; // 50% refund
    } else if (daysUntilCheckIn >= 1) {
      refundPercentage = 25; // 25% refund
    } else {
      refundPercentage = 0; // No refund
    }

    return Math.round(reservation.totalAmount * (refundPercentage / 100));
  }

  /**
   * Get reservation with all related data
   */
  async getReservationWithDetails(reservationId) {
    try {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
          property: {
            include: {
              location: true,
              owner: true,
              photos: true
            }
          },
          guest: true,
          agent: true,
          tasks: {
            orderBy: { createdAt: 'desc' }
          },
          transactions: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      return {
        success: true,
        data: reservation,
        message: 'Reservation retrieved successfully'
      };
    } catch (error) {
      logger.error(`Error retrieving reservation: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve reservation'
      };
    }
  }

  /**
   * Get reservations with filtering and pagination
   */
  async getReservations(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 50 } = pagination;
      const skip = (page - 1) * limit;

      const where = {};
      
      if (filters.status) where.status = filters.status;
      if (filters.propertyId) where.propertyId = filters.propertyId;
      if (filters.guestId) where.guestId = filters.guestId;
      if (filters.dateFrom) where.checkInDate = { gte: new Date(filters.dateFrom) };
      if (filters.dateTo) where.checkInDate = { ...where.checkInDate, lte: new Date(filters.dateTo) };

      const [reservations, total] = await Promise.all([
        this.prisma.reservation.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            property: {
              select: {
                id: true,
                name: true,
                nickname: true,
                location: {
                  select: {
                    name: true,
                    city: true
                  }
                }
              }
            },
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.reservation.count({ where })
      ]);

      return {
        success: true,
        data: reservations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        message: 'Reservations retrieved successfully'
      };
    } catch (error) {
      logger.error(`Error retrieving reservations: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve reservations'
      };
    }
  }
}

// Singleton instance
const reservationService = new ReservationService();

module.exports = reservationService;
