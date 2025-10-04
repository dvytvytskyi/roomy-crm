/**
 * Integration Tests for Reservation Workflow
 * 
 * Tests complete business workflows including:
 * - Reservation confirmation saga
 * - Check-in workflow
 * - Check-out workflow
 * - Cancellation workflow
 * - Payment processing workflow
 */

const { PrismaClient } = require('@prisma/client');
const reservationService = require('../src/services/ReservationService');
const financialService = require('../src/services/FinancialService');
const taskOrchestrator = require('../src/services/TaskOrchestrator');
const notificationService = require('../src/services/NotificationService');

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    reservation: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    task: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    property: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  })),
}));

// Mock notification service
jest.mock('../src/services/NotificationService', () => ({
  sendReservationConfirmation: jest.fn(),
  sendPaymentConfirmation: jest.fn(),
  sendOwnerPayout: jest.fn(),
}));

describe('Reservation Workflow Integration Tests', () => {
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    reservationService.prisma = mockPrisma;
    financialService.prisma = mockPrisma;
    taskOrchestrator.prisma = mockPrisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Reservation Confirmation Workflow', () => {
    const mockReservation = {
      id: 'reservation-1',
      propertyId: 'property-1',
      guestId: 'guest-1',
      guestName: 'John Doe',
      guestEmail: 'john@example.com',
      checkInDate: new Date('2024-02-01'),
      checkOutDate: new Date('2024-02-03'),
      totalAmount: 1000,
      status: 'PENDING',
      property: {
        id: 'property-1',
        name: 'Luxury Apartment',
        owner: {
          id: 'owner-1',
          email: 'owner@example.com'
        }
      },
      guest: {
        id: 'guest-1',
        email: 'john@example.com'
      }
    };

    beforeEach(() => {
      // Mock reservation lookup
      mockPrisma.reservation.findUnique.mockResolvedValue(mockReservation);
      
      // Mock property availability check
      mockPrisma.reservation.findMany.mockResolvedValue([]);
      
      // Mock reservation status update
      mockPrisma.reservation.update.mockResolvedValue({
        ...mockReservation,
        status: 'CONFIRMED'
      });
      
      // Mock task creation
      mockPrisma.task.create
        .mockResolvedValueOnce({ id: 'task-1', title: 'Pre-arrival cleaning' })
        .mockResolvedValueOnce({ id: 'task-2', title: 'Check-in' })
        .mockResolvedValueOnce({ id: 'task-3', title: 'Check-out' })
        .mockResolvedValueOnce({ id: 'task-4', title: 'Post-departure cleaning' });
      
      // Mock transaction creation
      mockPrisma.transaction.create.mockResolvedValue({
        id: 'transaction-1',
        amount: 1000
      });
      
      // Mock notification
      notificationService.sendReservationConfirmation.mockResolvedValue({
        success: true
      });
    });

    it('should execute complete reservation confirmation workflow', async () => {
      const result = await reservationService.confirmReservation('reservation-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Reservation confirmed successfully');

      // Verify reservation status update
      expect(mockPrisma.reservation.update).toHaveBeenCalledWith({
        where: { id: 'reservation-1' },
        data: { 
          status: 'CONFIRMED',
          updatedAt: expect.any(Date)
        }
      });

      // Verify tasks were created
      expect(mockPrisma.task.create).toHaveBeenCalledTimes(4);
      
      // Verify cleaning task
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          propertyId: 'property-1',
          reservationId: 'reservation-1',
          type: 'CLEANING',
          title: 'Pre-arrival cleaning for John Doe',
          description: 'Clean property before guest arrival on 2/1/2024',
          status: 'PENDING',
          priority: 'HIGH',
          scheduledDate: new Date('2024-01-31T00:00:00.000Z'), // 1 day before
          cost: 150,
          tags: ['cleaning', 'pre-arrival']
        }
      });

      // Verify check-in task
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          propertyId: 'property-1',
          reservationId: 'reservation-1',
          type: 'CHECK_IN',
          title: 'Check-in for John Doe',
          description: 'Meet guest for check-in at 2/1/2024',
          status: 'PENDING',
          priority: 'HIGH',
          scheduledDate: new Date('2024-02-01T00:00:00.000Z'),
          tags: ['check-in', 'guest-meeting']
        }
      });

      // Verify check-out task
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          propertyId: 'property-1',
          reservationId: 'reservation-1',
          type: 'CHECK_OUT',
          title: 'Check-out for John Doe',
          description: 'Meet guest for check-out at 2/3/2024',
          status: 'PENDING',
          priority: 'HIGH',
          scheduledDate: new Date('2024-02-03T00:00:00.000Z'),
          tags: ['check-out', 'guest-meeting']
        }
      });

      // Verify post-departure cleaning task
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          propertyId: 'property-1',
          reservationId: 'reservation-1',
          type: 'CLEANING',
          title: 'Post-departure cleaning for John Doe',
          description: 'Clean property after guest departure on 2/3/2024',
          status: 'PENDING',
          priority: 'HIGH',
          scheduledDate: new Date('2024-02-03T02:00:00.000Z'), // 2 hours after
          cost: 150,
          tags: ['cleaning', 'post-departure']
        }
      });

      // Verify financial transaction
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: 'guest-1',
          propertyId: 'property-1',
          reservationId: 'reservation-1',
          type: 'GUEST_PAYMENT',
          category: 'Reservation Confirmation',
          amount: 1000,
          currency: 'AED',
          description: 'Payment for reservation reservation-1',
          status: 'PENDING',
          netAmount: 1000
        }
      });

      // Verify notification sent
      expect(notificationService.sendReservationConfirmation).toHaveBeenCalledWith(mockReservation);
    });

    it('should handle property availability conflicts', async () => {
      // Mock conflicting reservation
      mockPrisma.reservation.findMany.mockResolvedValue([
        {
          id: 'conflicting-reservation',
          status: 'CONFIRMED'
        }
      ]);

      const result = await reservationService.confirmReservation('reservation-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Property is not available for the selected dates');
      
      // Verify no tasks were created
      expect(mockPrisma.task.create).not.toHaveBeenCalled();
      
      // Verify reservation status was not updated
      expect(mockPrisma.reservation.update).not.toHaveBeenCalled();
    });

    it('should handle invalid reservation status', async () => {
      // Mock reservation with wrong status
      mockPrisma.reservation.findUnique.mockResolvedValue({
        ...mockReservation,
        status: 'CONFIRMED'
      });

      const result = await reservationService.confirmReservation('reservation-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Reservation is not in PENDING status');
    });
  });

  describe('Payment Processing Workflow', () => {
    const mockReservation = {
      id: 'reservation-1',
      guestId: 'guest-1',
      propertyId: 'property-1',
      totalAmount: 1000,
      paymentStatus: 'PENDING',
      property: {
        owner: { id: 'owner-1' }
      }
    };

    beforeEach(() => {
      mockPrisma.reservation.findUnique.mockResolvedValue(mockReservation);
      mockPrisma.transaction.create
        .mockResolvedValueOnce({ id: 'transaction-1', amount: 1000 }) // Guest payment
        .mockResolvedValueOnce({ id: 'transaction-2', amount: 700 })  // Owner payout
        .mockResolvedValueOnce({ id: 'transaction-3', amount: 250 }); // Agency fee
      mockPrisma.reservation.update.mockResolvedValue({
        ...mockReservation,
        paymentStatus: 'PAID'
      });
    });

    it('should process payment and trigger owner payout', async () => {
      const paymentData = {
        amount: 1000,
        currency: 'AED',
        paymentMethod: 'Credit Card'
      };

      const result = await financialService.processGuestPayment('reservation-1', paymentData);

      expect(result.success).toBe(true);
      
      // Verify guest payment transaction
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: 'guest-1',
          propertyId: 'property-1',
          reservationId: 'reservation-1',
          type: 'GUEST_PAYMENT',
          category: 'Reservation Payment',
          amount: 1000,
          currency: 'AED',
          description: 'Payment for reservation reservation-1',
          paymentMethod: 'Credit Card',
          paymentGatewayId: undefined,
          gatewayReference: undefined,
          status: 'COMPLETED',
          processedAt: expect.any(Date),
          netAmount: 1000
        }
      });

      // Verify reservation update
      expect(mockPrisma.reservation.update).toHaveBeenCalledWith({
        where: { id: 'reservation-1' },
        data: {
          paidAmount: 1000,
          outstandingBalance: 0,
          paymentStatus: 'PAID'
        }
      });

      // Verify owner payout was scheduled
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: 'owner-1',
          propertyId: 'property-1',
          reservationId: 'reservation-1',
          type: 'OWNER_PAYOUT',
          category: 'Reservation Income',
          amount: 700,
          currency: 'AED',
          description: 'Owner payout for reservation reservation-1',
          status: 'PENDING',
          netAmount: 700,
          metadata: {
            incomeDistribution: expect.any(Object),
            originalReservationAmount: 1000
          }
        }
      });

      // Verify agency fee transaction
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: 'owner-1', // Company account in real implementation
          propertyId: 'property-1',
          reservationId: 'reservation-1',
          type: 'AGENCY_FEE',
          category: 'Platform Commission',
          amount: 250,
          currency: 'AED',
          description: 'Roomy agency fee for reservation reservation-1',
          status: 'COMPLETED',
          netAmount: 250,
          metadata: {
            incomeDistribution: expect.any(Object),
            originalReservationAmount: 1000
          }
        }
      });
    });

    it('should handle partial payment correctly', async () => {
      const paymentData = {
        amount: 500,
        currency: 'AED'
      };

      mockPrisma.reservation.update.mockResolvedValue({
        ...mockReservation,
        paymentStatus: 'PARTIAL'
      });

      const result = await financialService.processGuestPayment('reservation-1', paymentData);

      expect(result.success).toBe(true);
      
      // Verify reservation update with partial payment
      expect(mockPrisma.reservation.update).toHaveBeenCalledWith({
        where: { id: 'reservation-1' },
        data: {
          paidAmount: 500,
          outstandingBalance: 500,
          paymentStatus: 'PARTIAL'
        }
      });

      // Verify no owner payout was scheduled (not fully paid)
      expect(mockPrisma.transaction.create).toHaveBeenCalledTimes(1); // Only guest payment
    });
  });

  describe('Check-in Workflow', () => {
    const mockReservation = {
      id: 'reservation-1',
      propertyId: 'property-1',
      guestId: 'guest-1',
      status: 'CONFIRMED',
      checkInDate: new Date('2024-02-01'),
      checkOutDate: new Date('2024-02-03')
    };

    beforeEach(() => {
      mockPrisma.reservation.findUnique.mockResolvedValue(mockReservation);
      mockPrisma.reservation.update.mockResolvedValue({
        ...mockReservation,
        status: 'CHECKED_IN'
      });
      mockPrisma.task.create
        .mockResolvedValueOnce({ id: 'task-1', title: 'Check-out' })
        .mockResolvedValueOnce({ id: 'task-2', title: 'Post-departure cleaning' });
    });

    it('should execute check-in workflow successfully', async () => {
      const result = await reservationService.checkInReservation('reservation-1');

      expect(result.success).toBe(true);
      
      // Verify reservation status update
      expect(mockPrisma.reservation.update).toHaveBeenCalledWith({
        where: { id: 'reservation-1' },
        data: { 
          status: 'CHECKED_IN',
          updatedAt: expect.any(Date)
        }
      });

      // Verify check-out task was created
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          propertyId: 'property-1',
          reservationId: 'reservation-1',
          type: 'CHECK_OUT',
          title: 'Check-out for undefined',
          description: 'Meet guest for check-out at 2/3/2024',
          status: 'PENDING',
          priority: 'HIGH',
          scheduledDate: new Date('2024-02-03T00:00:00.000Z'),
          tags: ['check-out', 'guest-meeting']
        }
      });

      // Verify post-departure cleaning task was created
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          propertyId: 'property-1',
          reservationId: 'reservation-1',
          type: 'CLEANING',
          title: 'Post-departure cleaning for undefined',
          description: 'Clean property after guest departure on 2/3/2024',
          status: 'PENDING',
          priority: 'HIGH',
          scheduledDate: new Date('2024-02-03T02:00:00.000Z'),
          cost: 150,
          tags: ['cleaning', 'post-departure']
        }
      });
    });
  });

  describe('Cancellation Workflow', () => {
    const mockReservation = {
      id: 'reservation-1',
      guestId: 'guest-1',
      propertyId: 'property-1',
      totalAmount: 1000,
      status: 'CONFIRMED',
      checkInDate: new Date('2024-02-01'),
      checkOutDate: new Date('2024-02-03')
    };

    beforeEach(() => {
      mockPrisma.reservation.findUnique.mockResolvedValue(mockReservation);
      mockPrisma.task.updateMany.mockResolvedValue({ count: 2 });
      mockPrisma.transaction.create.mockResolvedValue({
        id: 'refund-transaction-1',
        amount: 500
      });
      mockPrisma.reservation.update.mockResolvedValue({
        ...mockReservation,
        status: 'CANCELLED'
      });
    });

    it('should execute cancellation workflow successfully', async () => {
      const result = await reservationService.cancelReservation('reservation-1');

      expect(result.success).toBe(true);
      
      // Verify related tasks were cancelled
      expect(mockPrisma.task.updateMany).toHaveBeenCalledWith({
        where: {
          reservationId: 'reservation-1',
          status: { in: ['PENDING', 'IN_PROGRESS'] }
        },
        data: { status: 'CANCELLED' }
      });

      // Verify refund transaction was created
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: 'guest-1',
          propertyId: 'property-1',
          reservationId: 'reservation-1',
          type: 'REFUND',
          category: 'Reservation Cancellation',
          amount: 500, // 50% refund for cancellation 3+ days before
          currency: 'AED',
          description: 'Refund for cancelled reservation reservation-1',
          status: 'PENDING',
          netAmount: 500
        }
      });

      // Verify reservation status update
      expect(mockPrisma.reservation.update).toHaveBeenCalledWith({
        where: { id: 'reservation-1' },
        data: { 
          status: 'CANCELLED',
          updatedAt: expect.any(Date)
        }
      });
    });

    it('should calculate refund amount correctly based on cancellation policy', () => {
      const now = new Date('2024-01-25'); // 7 days before check-in
      jest.useFakeTimers();
      jest.setSystemTime(now);

      const refundAmount = reservationService.calculateRefundAmount(mockReservation);
      expect(refundAmount).toBe(1000); // Full refund for 7+ days

      jest.setSystemTime(new Date('2024-01-29')); // 3 days before check-in
      const refundAmount2 = reservationService.calculateRefundAmount(mockReservation);
      expect(refundAmount2).toBe(500); // 50% refund for 3-6 days

      jest.setSystemTime(new Date('2024-01-31')); // 1 day before check-in
      const refundAmount3 = reservationService.calculateRefundAmount(mockReservation);
      expect(refundAmount3).toBe(250); // 25% refund for 1-2 days

      jest.setSystemTime(new Date('2024-02-01')); // Day of check-in
      const refundAmount4 = reservationService.calculateRefundAmount(mockReservation);
      expect(refundAmount4).toBe(0); // No refund for same day

      jest.useRealTimers();
    });
  });

  describe('Task Completion Workflow', () => {
    const mockTask = {
      id: 'task-1',
      type: 'CLEANING',
      title: 'Pre-arrival cleaning',
      status: 'PENDING',
      property: { id: 'property-1', name: 'Luxury Apartment' },
      reservation: { id: 'reservation-1' },
      assignee: { id: 'cleaner-1' }
    };

    beforeEach(() => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      mockPrisma.task.update.mockResolvedValue({
        ...mockTask,
        status: 'COMPLETED',
        completedDate: new Date()
      });
    });

    it('should complete task successfully', async () => {
      const completionData = {
        notes: 'Cleaning completed successfully',
        actualCost: 150
      };

      const result = await taskOrchestrator.completeTask('task-1', completionData);

      expect(result.success).toBe(true);
      
      // Verify task update
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: {
          status: 'COMPLETED',
          completedDate: expect.any(Date),
          notes: 'Cleaning completed successfully',
          cost: 150
        }
      });
    });

    it('should handle task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      const result = await taskOrchestrator.completeTask('nonexistent', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Task not found');
    });

    it('should handle already completed task', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({
        ...mockTask,
        status: 'COMPLETED'
      });

      const result = await taskOrchestrator.completeTask('task-1', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Task is already completed');
    });
  });
});
