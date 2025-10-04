/**
 * Unit Tests for FinancialService
 * 
 * Tests critical financial business logic including:
 * - Income distribution calculations
 * - Payment processing
 * - Owner payout calculations
 * - Refund calculations
 */

const { PrismaClient } = require('@prisma/client');
const financialService = require('../src/services/FinancialService');

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    reservation: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    property: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  })),
}));

describe('FinancialService', () => {
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    financialService.prisma = mockPrisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateIncomeDistribution', () => {
    it('should calculate correct income distribution with default settings', () => {
      const reservation = {
        totalAmount: 1000
      };

      const result = financialService.calculateIncomeDistribution(reservation);

      expect(result).toEqual({
        totalRevenue: 1000,
        ownerIncomePercentage: 70,
        roomyAgencyFeePercentage: 25,
        referringAgentPercentage: 5,
        ownerPayout: 700,
        roomyAgencyFee: 250,
        referringAgentFee: 50,
        calculatedTotal: 1000
      });
    });

    it('should calculate correct income distribution with custom settings', () => {
      const reservation = {
        totalAmount: 2000
      };

      const customSettings = {
        ownerIncome: 80,
        roomyAgencyFee: 15,
        referringAgent: 5
      };

      const result = financialService.calculateIncomeDistribution(reservation, customSettings);

      expect(result).toEqual({
        totalRevenue: 2000,
        ownerIncomePercentage: 80,
        roomyAgencyFeePercentage: 15,
        referringAgentPercentage: 5,
        ownerPayout: 1600,
        roomyAgencyFee: 300,
        referringAgentFee: 100,
        calculatedTotal: 2000
      });
    });

    it('should handle zero amounts correctly', () => {
      const reservation = {
        totalAmount: 0
      };

      const result = financialService.calculateIncomeDistribution(reservation);

      expect(result.ownerPayout).toBe(0);
      expect(result.roomyAgencyFee).toBe(0);
      expect(result.referringAgentFee).toBe(0);
      expect(result.calculatedTotal).toBe(0);
    });

    it('should round amounts correctly', () => {
      const reservation = {
        totalAmount: 333
      };

      const result = financialService.calculateIncomeDistribution(reservation);

      // 333 * 0.7 = 233.1, rounded to 233
      expect(result.ownerPayout).toBe(233);
      // 333 * 0.25 = 83.25, rounded to 83
      expect(result.roomyAgencyFee).toBe(83);
      // 333 * 0.05 = 16.65, rounded to 17
      expect(result.referringAgentFee).toBe(17);
    });
  });

  describe('processGuestPayment', () => {
    const mockReservation = {
      id: 'reservation-1',
      guestId: 'guest-1',
      propertyId: 'property-1',
      totalAmount: 1000,
      paymentStatus: 'PENDING'
    };

    const mockProperty = {
      owner: {
        id: 'owner-1'
      }
    };

    const mockGuest = {
      id: 'guest-1',
      email: 'guest@example.com'
    };

    beforeEach(() => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        ...mockReservation,
        property: mockProperty,
        guest: mockGuest
      });
      mockPrisma.transaction.create.mockResolvedValue({
        id: 'transaction-1',
        amount: 1000
      });
      mockPrisma.reservation.update.mockResolvedValue({
        ...mockReservation,
        paymentStatus: 'PAID'
      });
    });

    it('should process guest payment successfully', async () => {
      const paymentData = {
        amount: 1000,
        currency: 'AED',
        paymentMethod: 'Credit Card',
        gatewayId: 'gateway-123',
        gatewayReference: 'ref-456'
      };

      const result = await financialService.processGuestPayment('reservation-1', paymentData);

      expect(result.success).toBe(true);
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
          paymentGatewayId: 'gateway-123',
          gatewayReference: 'ref-456',
          status: 'COMPLETED',
          processedAt: expect.any(Date),
          netAmount: 1000
        }
      });
      expect(mockPrisma.reservation.update).toHaveBeenCalledWith({
        where: { id: 'reservation-1' },
        data: {
          paidAmount: 1000,
          outstandingBalance: 0,
          paymentStatus: 'PAID'
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
      expect(mockPrisma.reservation.update).toHaveBeenCalledWith({
        where: { id: 'reservation-1' },
        data: {
          paidAmount: 500,
          outstandingBalance: 500,
          paymentStatus: 'PARTIAL'
        }
      });
    });

    it('should return error if reservation not found', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(null);

      const paymentData = {
        amount: 1000,
        currency: 'AED'
      };

      const result = await financialService.processGuestPayment('nonexistent', paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Reservation not found');
    });

    it('should return error if reservation already paid', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        ...mockReservation,
        paymentStatus: 'PAID'
      });

      const paymentData = {
        amount: 1000,
        currency: 'AED'
      };

      const result = await financialService.processGuestPayment('reservation-1', paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Reservation is already paid');
    });
  });

  describe('processOwnerPayout', () => {
    const mockTransaction = {
      id: 'transaction-1',
      type: 'OWNER_PAYOUT',
      status: 'PENDING',
      amount: 700,
      user: { id: 'owner-1' },
      reservation: { id: 'reservation-1' }
    };

    beforeEach(() => {
      mockPrisma.transaction.findUnique.mockResolvedValue(mockTransaction);
      mockPrisma.transaction.update.mockResolvedValue({
        ...mockTransaction,
        status: 'COMPLETED'
      });
    });

    it('should process owner payout successfully', async () => {
      const payoutData = {
        paymentMethod: 'Bank Transfer',
        gatewayReference: 'payout-123',
        notes: 'Monthly payout'
      };

      const result = await financialService.processOwnerPayout('transaction-1', payoutData);

      expect(result.success).toBe(true);
      expect(mockPrisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'transaction-1' },
        data: {
          status: 'COMPLETED',
          processedAt: expect.any(Date),
          paymentMethod: 'Bank Transfer',
          gatewayReference: 'payout-123',
          notes: 'Monthly payout'
        }
      });
    });

    it('should return error if transaction not found', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue(null);

      const payoutData = {
        paymentMethod: 'Bank Transfer'
      };

      const result = await financialService.processOwnerPayout('nonexistent', payoutData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid owner payout transaction');
    });

    it('should return error if transaction is not owner payout type', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({
        ...mockTransaction,
        type: 'GUEST_PAYMENT'
      });

      const payoutData = {
        paymentMethod: 'Bank Transfer'
      };

      const result = await financialService.processOwnerPayout('transaction-1', payoutData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid owner payout transaction');
    });

    it('should return error if transaction is not pending', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({
        ...mockTransaction,
        status: 'COMPLETED'
      });

      const payoutData = {
        paymentMethod: 'Bank Transfer'
      };

      const result = await financialService.processOwnerPayout('transaction-1', payoutData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Transaction is not in PENDING status');
    });
  });

  describe('getPropertyFinancialSummary', () => {
    const mockTransactions = [
      {
        id: 'transaction-1',
        type: 'GUEST_PAYMENT',
        amount: 1000,
        createdAt: new Date('2024-01-01'),
        reservation: {
          id: 'reservation-1',
          guestName: 'John Doe',
          checkInDate: new Date('2024-01-01'),
          checkOutDate: new Date('2024-01-03')
        }
      },
      {
        id: 'transaction-2',
        type: 'OWNER_PAYOUT',
        amount: 700,
        createdAt: new Date('2024-01-02'),
        reservation: {
          id: 'reservation-1',
          guestName: 'John Doe',
          checkInDate: new Date('2024-01-01'),
          checkOutDate: new Date('2024-01-03')
        }
      },
      {
        id: 'transaction-3',
        type: 'AGENCY_FEE',
        amount: 250,
        createdAt: new Date('2024-01-02'),
        reservation: {
          id: 'reservation-1',
          guestName: 'John Doe',
          checkInDate: new Date('2024-01-01'),
          checkOutDate: new Date('2024-01-03')
        }
      }
    ];

    beforeEach(() => {
      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
    });

    it('should calculate financial summary correctly', async () => {
      const result = await financialService.getPropertyFinancialSummary('property-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalRevenue: 1000,
        totalOwnerPayouts: 700,
        totalAgencyFees: 250,
        totalRefunds: 0,
        netIncome: 50,
        transactionCount: 3,
        transactions: mockTransactions
      });
    });

    it('should handle date range filtering', async () => {
      const dateRange = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await financialService.getPropertyFinancialSummary('property-1', dateRange);

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          propertyId: 'property-1',
          type: { in: ['GUEST_PAYMENT', 'OWNER_PAYOUT', 'AGENCY_FEE', 'REFUND'] },
          createdAt: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31')
          }
        },
        include: {
          reservation: {
            select: {
              id: true,
              guestName: true,
              checkInDate: true,
              checkOutDate: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should include refunds in calculations', async () => {
      const transactionsWithRefund = [
        ...mockTransactions,
        {
          id: 'transaction-4',
          type: 'REFUND',
          amount: 200,
          createdAt: new Date('2024-01-03'),
          reservation: {
            id: 'reservation-2',
            guestName: 'Jane Doe',
            checkInDate: new Date('2024-01-02'),
            checkOutDate: new Date('2024-01-04')
          }
        }
      ];

      mockPrisma.transaction.findMany.mockResolvedValue(transactionsWithRefund);

      const result = await financialService.getPropertyFinancialSummary('property-1');

      expect(result.data.totalRefunds).toBe(200);
      expect(result.data.netIncome).toBe(-150); // 1000 - 700 - 200 = 100, but with refund = 100 - 200 = -100
    });
  });

  describe('updateIncomeDistributionSettings', () => {
    it('should update settings successfully with valid percentages', async () => {
      const settings = {
        ownerIncome: 75,
        roomyAgencyFee: 20,
        referringAgent: 5
      };

      const result = await financialService.updateIncomeDistributionSettings(settings);

      expect(result.success).toBe(true);
      expect(financialService.defaultIncomeDistribution).toEqual(settings);
    });

    it('should return error if percentages do not add up to 100%', async () => {
      const settings = {
        ownerIncome: 80,
        roomyAgencyFee: 25,
        referringAgent: 5
      };

      const result = await financialService.updateIncomeDistributionSettings(settings);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Income distribution percentages must add up to 100%');
    });

    it('should allow small floating point differences', async () => {
      const settings = {
        ownerIncome: 33.33,
        roomyAgencyFee: 33.33,
        referringAgent: 33.34
      };

      const result = await financialService.updateIncomeDistributionSettings(settings);

      expect(result.success).toBe(true);
    });
  });
});
