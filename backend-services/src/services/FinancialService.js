/**
 * Financial Service - Business Logic for Financial Operations
 * 
 * Handles complex financial calculations and transactions:
 * - Income distribution calculations
 * - Owner payout calculations
 * - Commission calculations
 * - Financial reporting
 * - Payment processing workflows
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

class FinancialService {
  constructor() {
    this.prisma = new PrismaClient();
    
    // Default income distribution settings
    this.defaultIncomeDistribution = {
      ownerIncome: 70,      // 70% to owner
      roomyAgencyFee: 25,   // 25% to Roomy
      referringAgent: 5     // 5% to referring agent
    };
  }

  /**
   * Calculate income distribution for a reservation
   */
  calculateIncomeDistribution(reservation, settings = {}) {
    const distribution = { ...this.defaultIncomeDistribution, ...settings };
    const totalAmount = reservation.totalAmount;

    const calculations = {
      totalRevenue: totalAmount,
      ownerIncomePercentage: distribution.ownerIncome,
      roomyAgencyFeePercentage: distribution.roomyAgencyFee,
      referringAgentPercentage: distribution.referringAgent,
      
      // Calculate amounts
      ownerPayout: Math.round(totalAmount * (distribution.ownerIncome / 100)),
      roomyAgencyFee: Math.round(totalAmount * (distribution.roomyAgencyFee / 100)),
      referringAgentFee: Math.round(totalAmount * (distribution.referringAgent / 100)),
      
      // Verify calculations
      calculatedTotal: 0
    };

    // Verify that percentages add up to 100%
    const totalPercentage = distribution.ownerIncome + distribution.roomyAgencyFee + distribution.referringAgent;
    if (Math.abs(totalPercentage - 100) > 0.01) {
      logger.warn(`Income distribution percentages don't add up to 100%: ${totalPercentage}%`);
    }

    calculations.calculatedTotal = calculations.ownerPayout + calculations.roomyAgencyFee + calculations.referringAgentFee;

    return calculations;
  }

  /**
   * Process guest payment for a reservation
   */
  async processGuestPayment(reservationId, paymentData) {
    try {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
          property: {
            include: { owner: true }
          },
          guest: true
        }
      });

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      if (reservation.paymentStatus === 'PAID') {
        throw new Error('Reservation is already paid');
      }

      // Create guest payment transaction
      const guestPayment = await this.prisma.transaction.create({
        data: {
          userId: reservation.guestId,
          propertyId: reservation.propertyId,
          reservationId: reservationId,
          type: 'GUEST_PAYMENT',
          category: 'Reservation Payment',
          amount: paymentData.amount,
          currency: paymentData.currency || 'AED',
          description: `Payment for reservation ${reservationId}`,
          paymentMethod: paymentData.paymentMethod,
          paymentGatewayId: paymentData.gatewayId,
          gatewayReference: paymentData.gatewayReference,
          status: 'COMPLETED',
          processedAt: new Date(),
          netAmount: paymentData.amount
        }
      });

      // Update reservation payment status
      await this.prisma.reservation.update({
        where: { id: reservationId },
        data: {
          paidAmount: paymentData.amount,
          outstandingBalance: reservation.totalAmount - paymentData.amount,
          paymentStatus: paymentData.amount >= reservation.totalAmount ? 'PAID' : 'PARTIAL'
        }
      });

      // If fully paid, trigger owner payout calculation
      if (paymentData.amount >= reservation.totalAmount) {
        await this.scheduleOwnerPayout(reservationId);
      }

      logger.info(`Guest payment processed: ${reservationId}, Amount: ${paymentData.amount}`);
      
      return {
        success: true,
        data: {
          transaction: guestPayment,
          reservation: await this.prisma.reservation.findUnique({ where: { id: reservationId } })
        },
        message: 'Payment processed successfully'
      };

    } catch (error) {
      logger.error(`Error processing guest payment: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to process payment'
      };
    }
  }

  /**
   * Schedule owner payout after guest payment
   */
  async scheduleOwnerPayout(reservationId) {
    try {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
          property: {
            include: { owner: true }
          }
        }
      });

      if (!reservation || !reservation.property.owner) {
        throw new Error('Reservation or property owner not found');
      }

      // Calculate income distribution
      const distribution = this.calculateIncomeDistribution(reservation);
      
      // Create owner payout transaction
      const ownerPayout = await this.prisma.transaction.create({
        data: {
          userId: reservation.property.owner.id,
          propertyId: reservation.propertyId,
          reservationId: reservationId,
          type: 'OWNER_PAYOUT',
          category: 'Reservation Income',
          amount: distribution.ownerPayout,
          currency: 'AED',
          description: `Owner payout for reservation ${reservationId}`,
          status: 'PENDING',
          netAmount: distribution.ownerPayout,
          metadata: {
            incomeDistribution: distribution,
            originalReservationAmount: reservation.totalAmount
          }
        }
      });

      // Create agency fee transaction
      const agencyFee = await this.prisma.transaction.create({
        data: {
          userId: reservation.property.owner.id, // This would be the company account in real implementation
          propertyId: reservation.propertyId,
          reservationId: reservationId,
          type: 'AGENCY_FEE',
          category: 'Platform Commission',
          amount: distribution.roomyAgencyFee,
          currency: 'AED',
          description: `Roomy agency fee for reservation ${reservationId}`,
          status: 'COMPLETED',
          netAmount: distribution.roomyAgencyFee,
          metadata: {
            incomeDistribution: distribution,
            originalReservationAmount: reservation.totalAmount
          }
        }
      });

      logger.info(`Owner payout scheduled: ${reservationId}, Amount: ${distribution.ownerPayout}`);
      
      return {
        success: true,
        data: {
          ownerPayout,
          agencyFee,
          distribution
        },
        message: 'Owner payout scheduled successfully'
      };

    } catch (error) {
      logger.error(`Error scheduling owner payout: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to schedule owner payout'
      };
    }
  }

  /**
   * Process owner payout
   */
  async processOwnerPayout(transactionId, payoutData) {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          user: true,
          reservation: true
        }
      });

      if (!transaction || transaction.type !== 'OWNER_PAYOUT') {
        throw new Error('Invalid owner payout transaction');
      }

      if (transaction.status !== 'PENDING') {
        throw new Error('Transaction is not in PENDING status');
      }

      // Update transaction status
      const updatedTransaction = await this.prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
          paymentMethod: payoutData.paymentMethod,
          gatewayReference: payoutData.gatewayReference,
          notes: payoutData.notes
        }
      });

      logger.info(`Owner payout processed: ${transactionId}, Amount: ${transaction.amount}`);
      
      return {
        success: true,
        data: updatedTransaction,
        message: 'Owner payout processed successfully'
      };

    } catch (error) {
      logger.error(`Error processing owner payout: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to process owner payout'
      };
    }
  }

  /**
   * Get financial summary for a property
   */
  async getPropertyFinancialSummary(propertyId, dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;
      
      const where = {
        propertyId,
        type: { in: ['GUEST_PAYMENT', 'OWNER_PAYOUT', 'AGENCY_FEE', 'REFUND'] }
      };

      if (startDate) where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
      if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };

      const transactions = await this.prisma.transaction.findMany({
        where,
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

      // Calculate summary
      const summary = {
        totalRevenue: 0,
        totalOwnerPayouts: 0,
        totalAgencyFees: 0,
        totalRefunds: 0,
        netIncome: 0,
        transactionCount: transactions.length,
        transactions: transactions
      };

      transactions.forEach(transaction => {
        switch (transaction.type) {
          case 'GUEST_PAYMENT':
            summary.totalRevenue += transaction.amount;
            break;
          case 'OWNER_PAYOUT':
            summary.totalOwnerPayouts += transaction.amount;
            break;
          case 'AGENCY_FEE':
            summary.totalAgencyFees += transaction.amount;
            break;
          case 'REFUND':
            summary.totalRefunds += transaction.amount;
            break;
        }
      });

      summary.netIncome = summary.totalRevenue - summary.totalOwnerPayouts - summary.totalRefunds;

      return {
        success: true,
        data: summary,
        message: 'Financial summary retrieved successfully'
      };

    } catch (error) {
      logger.error(`Error retrieving financial summary: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve financial summary'
      };
    }
  }

  /**
   * Get income distribution settings
   */
  async getIncomeDistributionSettings() {
    try {
      // This would typically come from system settings
      // For now, return default settings
      return {
        success: true,
        data: this.defaultIncomeDistribution,
        message: 'Income distribution settings retrieved successfully'
      };
    } catch (error) {
      logger.error(`Error retrieving income distribution settings: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve income distribution settings'
      };
    }
  }

  /**
   * Update income distribution settings
   */
  async updateIncomeDistributionSettings(settings) {
    try {
      // Validate settings
      const totalPercentage = settings.ownerIncome + settings.roomyAgencyFee + settings.referringAgent;
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new Error('Income distribution percentages must add up to 100%');
      }

      // This would typically update system settings in the database
      // For now, update the default settings
      this.defaultIncomeDistribution = { ...settings };

      logger.info('Income distribution settings updated', settings);
      
      return {
        success: true,
        data: this.defaultIncomeDistribution,
        message: 'Income distribution settings updated successfully'
      };
    } catch (error) {
      logger.error(`Error updating income distribution settings: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update income distribution settings'
      };
    }
  }

  /**
   * Calculate owner earnings for a period
   */
  async calculateOwnerEarnings(ownerId, dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;
      
      const where = {
        userId: ownerId,
        type: 'OWNER_PAYOUT',
        status: 'COMPLETED'
      };

      if (startDate) where.processedAt = { ...where.processedAt, gte: new Date(startDate) };
      if (endDate) where.processedAt = { ...where.processedAt, lte: new Date(endDate) };

      const transactions = await this.prisma.transaction.findMany({
        where,
        include: {
          reservation: {
            select: {
              id: true,
              guestName: true,
              checkInDate: true,
              checkOutDate: true
            }
          },
          property: {
            select: {
              id: true,
              name: true,
              nickname: true
            }
          }
        },
        orderBy: { processedAt: 'desc' }
      });

      const totalEarnings = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

      return {
        success: true,
        data: {
          totalEarnings,
          transactionCount: transactions.length,
          transactions,
          period: dateRange
        },
        message: 'Owner earnings calculated successfully'
      };

    } catch (error) {
      logger.error(`Error calculating owner earnings: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Failed to calculate owner earnings'
      };
    }
  }
}

// Singleton instance
const financialService = new FinancialService();

module.exports = financialService;
