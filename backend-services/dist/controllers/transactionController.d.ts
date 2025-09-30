import { Request, Response } from "express";
export declare class TransactionController {
    createTransaction: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getTransactions: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getTransaction: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateTransaction: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteTransaction: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getTransactionStats: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
export declare const transactionController: TransactionController;
//# sourceMappingURL=transactionController.d.ts.map