import { Request, Response } from "express";
import { transactionService } from "../services/transactionService";
import { responseService } from "../services/responseService";
import { asyncHandler } from "../middleware/asyncHandler";
import { AuthRequest } from "../types";

export class TransactionController {
  createTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const transaction = await transactionService.createTransaction({
      ...req.body,
      userId: req.user!.id,
    });
    responseService.created(res, transaction, "Transaction created successfully");
  });

  getTransactions = asyncHandler(async (req: Request, res: Response) => {
    const { transactions, total } = await transactionService.getTransactions(req.query as any);
    responseService.paginated(res, transactions, {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      total,
    });
  });

  getTransaction = asyncHandler(async (req: Request, res: Response) => {
    const transaction = await transactionService.getTransactionById(req.params.id as string);
    responseService.success(res, transaction);
  });

  updateTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const transaction = await transactionService.updateTransaction(req.params.id as string, req.body);
    responseService.success(res, transaction, "Transaction updated successfully");
  });

  deleteTransaction = asyncHandler(async (req: AuthRequest, res: Response) => {
    await transactionService.deleteTransaction(req.params.id as string);
    responseService.success(res, null, "Transaction deleted successfully");
  });

  getTransactionStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    const stats = await transactionService.getTransactionStats(userId);
    responseService.success(res, stats);
  });
}

export const transactionController = new TransactionController();
