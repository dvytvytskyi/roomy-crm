"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionService = exports.TransactionService = void 0;
const client_1 = require("@prisma/client");
const errorHandlerService_1 = require("./errorHandlerService");
const loggerService_1 = require("./loggerService");
const prisma = new client_1.PrismaClient();
class TransactionService {
    async createTransaction(data) {
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
            loggerService_1.loggerService.info("Transaction created", {
                transactionId: transaction.id,
                userId: data.userId,
                type: data.type,
                amount: data.amount,
            });
            return transaction;
        }
        catch (error) {
            loggerService_1.loggerService.error("Error creating transaction", error, {
                userId: data.userId,
                type: data.type,
                amount: data.amount,
            });
            throw error;
        }
    }
    async getTransactions(filters = {}) {
        try {
            const { page = 1, limit = 10, userId, reservationId, type, status, paymentGateway, amountFrom, amountTo, dateFrom, dateTo, search, sortBy = "createdAt", sortOrder = "desc", } = filters;
            const where = {};
            if (userId)
                where.userId = userId;
            if (reservationId)
                where.reservationId = reservationId;
            if (type)
                where.type = type;
            if (status)
                where.status = status;
            if (paymentGateway)
                where.paymentGateway = paymentGateway;
            if (amountFrom || amountTo) {
                where.amount = {};
                if (amountFrom)
                    where.amount.gte = amountFrom;
                if (amountTo)
                    where.amount.lte = amountTo;
            }
            if (dateFrom || dateTo) {
                where.createdAt = {};
                if (dateFrom)
                    where.createdAt.gte = dateFrom;
                if (dateTo)
                    where.createdAt.lte = dateTo;
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
        }
        catch (error) {
            loggerService_1.loggerService.error("Error getting transactions", error, { filters });
            throw error;
        }
    }
    async getTransactionById(id) {
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
                throw errorHandlerService_1.errorHandlerService.createError("Transaction not found", 404);
            }
            return transaction;
        }
        catch (error) {
            loggerService_1.loggerService.error("Error getting transaction", error, { transactionId: id });
            throw error;
        }
    }
    async updateTransaction(id, data) {
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
            loggerService_1.loggerService.info("Transaction updated", {
                transactionId: id,
                status: data.status,
            });
            return transaction;
        }
        catch (error) {
            loggerService_1.loggerService.error("Error updating transaction", error, { transactionId: id });
            throw error;
        }
    }
    async deleteTransaction(id) {
        try {
            await prisma.transaction.delete({
                where: { id },
            });
            loggerService_1.loggerService.info("Transaction deleted", { transactionId: id });
        }
        catch (error) {
            loggerService_1.loggerService.error("Error deleting transaction", error, { transactionId: id });
            throw error;
        }
    }
    async getTransactionStats(userId) {
        try {
            const where = userId ? { userId } : {};
            const [totalTransactions, totalAmount, pendingAmount, completedAmount, failedAmount,] = await Promise.all([
                prisma.transaction.count({ where }),
                prisma.transaction.aggregate({
                    where,
                    _sum: { amount: true },
                }),
                prisma.transaction.aggregate({
                    where: { ...where, status: client_1.TransactionStatus.PENDING },
                    _sum: { amount: true },
                }),
                prisma.transaction.aggregate({
                    where: { ...where, status: client_1.TransactionStatus.COMPLETED },
                    _sum: { amount: true },
                }),
                prisma.transaction.aggregate({
                    where: { ...where, status: client_1.TransactionStatus.FAILED },
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
        }
        catch (error) {
            loggerService_1.loggerService.error("Error getting transaction stats", error, { userId });
            throw error;
        }
    }
}
exports.TransactionService = TransactionService;
exports.transactionService = new TransactionService();
//# sourceMappingURL=transactionService.js.map