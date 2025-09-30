import { Transaction, TransactionType, TransactionStatus } from "@prisma/client";
import { PaginationParams, FilterParams } from "../types";
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
export declare class TransactionService {
    createTransaction(data: CreateTransactionData): Promise<Transaction>;
    getTransactions(filters?: TransactionFilters): Promise<{
        transactions: Transaction[];
        total: number;
    }>;
    getTransactionById(id: string): Promise<Transaction>;
    updateTransaction(id: string, data: UpdateTransactionData): Promise<Transaction>;
    deleteTransaction(id: string): Promise<void>;
    getTransactionStats(userId?: string): Promise<{
        totalTransactions: number;
        totalAmount: number;
        pendingAmount: number;
        completedAmount: number;
        failedAmount: number;
    }>;
}
export declare const transactionService: TransactionService;
//# sourceMappingURL=transactionService.d.ts.map