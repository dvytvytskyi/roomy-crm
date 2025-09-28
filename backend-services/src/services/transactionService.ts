import { PrismaClient, Transaction, TransactionType, TransactionStatus } from "@prisma/client";
import { errorHandlerService } from "./errorHandlerService";
import { loggerService } from "./loggerService";
import { PaginationParams, FilterParams } from "../types";

const prisma = new PrismaClient();

export interface CreateTransactionData {
  userId: string;
  reservationId?: string;
  type: TransactionType;
  amount: number;
  currency?: string;
  paymentGateway?: string;
  transactionRef?: string;
  description?: string;
  metadata?: any;
}

export interface UpdateTransactionData {
  status?: TransactionStatus;
  transactionRef?: string;
  metadata?: any;
}

export interface TransactionFilters extends PaginationParams, FilterParams {
  userId?: string;
  reservationId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  paymentGateway?: string;
  amountFrom?: number;
  amountTo?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export class TransactionService {
  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    try {
      const transaction = await prisma.transaction.create({
        data: {
          ...data,
          currency: data.currency || "USD",
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          reservation: {
            select: {
              id: true,
              checkIn: true,
              checkOut: true,
              totalAmount: true,
            },
          },
        },
      });

      loggerService.info("Transaction created", {
        transactionId: transaction.id,
        userId: data.userId,
        type: data.type,
        amount: data.amount,
      });

      return transaction;
    } catch (error) {
      loggerService.error("Error creating transaction", error as Error, {
        userId: data.userId,
        type: data.type,
        amount: data.amount,
      });
      throw error;
    }
  }

  async getTransactions(filters: TransactionFilters = {}): Promise<{ transactions: Transaction[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 10,
        userId,
        reservationId,
        type,
        status,
        paymentGateway,
        amountFrom,
        amountTo,
        dateFrom,
        dateTo,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = filters;

      const where: any = {};

      if (userId) where.userId = userId;
      if (reservationId) where.reservationId = reservationId;
      if (type) where.type = type;
      if (status) where.status = status;
      if (paymentGateway) where.paymentGateway = paymentGateway;
      if (amountFrom || amountTo) {
        where.amount = {};
        if (amountFrom) where.amount.gte = amountFrom;
        if (amountTo) where.amount.lte = amountTo;
      }
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = dateFrom;
        if (dateTo) where.createdAt.lte = dateTo;
      }

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            reservation: {
              select: {
                id: true,
                checkIn: true,
                checkOut: true,
                totalAmount: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.transaction.count({ where }),
      ]);

      return { transactions, total };
    } catch (error) {
      loggerService.error("Error getting transactions", error as Error, { filters });
      throw error;
    }
  }

  async getTransactionById(id: string): Promise<Transaction> {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          reservation: {
            select: {
              id: true,
              checkIn: true,
              checkOut: true,
              totalAmount: true,
            },
          },
        },
      });

      if (!transaction) {
        throw errorHandlerService.createError("Transaction not found", 404);
      }

      return transaction;
    } catch (error) {
      loggerService.error("Error getting transaction", error as Error, { transactionId: id });
      throw error;
    }
  }

  async updateTransaction(id: string, data: UpdateTransactionData): Promise<Transaction> {
    try {
      const transaction = await prisma.transaction.update({
        where: { id },
        data,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          reservation: {
            select: {
              id: true,
              checkIn: true,
              checkOut: true,
              totalAmount: true,
            },
          },
        },
      });

      loggerService.info("Transaction updated", {
        transactionId: id,
        status: data.status,
      });

      return transaction;
    } catch (error) {
      loggerService.error("Error updating transaction", error as Error, { transactionId: id });
      throw error;
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      await prisma.transaction.delete({
        where: { id },
      });

      loggerService.info("Transaction deleted", { transactionId: id });
    } catch (error) {
      loggerService.error("Error deleting transaction", error as Error, { transactionId: id });
      throw error;
    }
  }

  async getTransactionStats(userId?: string): Promise<{
    totalTransactions: number;
    totalAmount: number;
    pendingAmount: number;
    completedAmount: number;
    failedAmount: number;
  }> {
    try {
      const where = userId ? { userId } : {};

      const [
        totalTransactions,
        totalAmount,
        pendingAmount,
        completedAmount,
        failedAmount,
      ] = await Promise.all([
        prisma.transaction.count({ where }),
        prisma.transaction.aggregate({
          where,
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { ...where, status: TransactionStatus.PENDING },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { ...where, status: TransactionStatus.COMPLETED },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { ...where, status: TransactionStatus.FAILED },
          _sum: { amount: true },
        }),
      ]);

      return {
        totalTransactions,
        totalAmount: totalAmount._sum.amount || 0,
        pendingAmount: pendingAmount._sum.amount || 0,
        completedAmount: completedAmount._sum.amount || 0,
        failedAmount: failedAmount._sum.amount || 0,
      };
    } catch (error) {
      loggerService.error("Error getting transaction stats", error as Error, { userId });
      throw error;
    }
  }
}

export const transactionService = new TransactionService();
