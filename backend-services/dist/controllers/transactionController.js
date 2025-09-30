"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionController = exports.TransactionController = void 0;
const transactionService_1 = require("../services/transactionService");
const responseService_1 = require("../services/responseService");
const asyncHandler_1 = require("../middleware/asyncHandler");
class TransactionController {
    constructor() {
        this.createTransaction = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const transaction = await transactionService_1.transactionService.createTransaction({
                ...req.body,
                userId: req.user.id,
            });
            responseService_1.responseService.created(res, transaction, "Transaction created successfully");
        });
        this.getTransactions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { transactions, total } = await transactionService_1.transactionService.getTransactions(req.query);
            responseService_1.responseService.paginated(res, transactions, {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                total,
            });
        });
        this.getTransaction = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const transaction = await transactionService_1.transactionService.getTransactionById(req.params.id);
            responseService_1.responseService.success(res, transaction);
        });
        this.updateTransaction = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const transaction = await transactionService_1.transactionService.updateTransaction(req.params.id, req.body);
            responseService_1.responseService.success(res, transaction, "Transaction updated successfully");
        });
        this.deleteTransaction = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            await transactionService_1.transactionService.deleteTransaction(req.params.id);
            responseService_1.responseService.success(res, null, "Transaction deleted successfully");
        });
        this.getTransactionStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.query.userId;
            const stats = await transactionService_1.transactionService.getTransactionStats(userId);
            responseService_1.responseService.success(res, stats);
        });
    }
}
exports.TransactionController = TransactionController;
exports.transactionController = new TransactionController();
//# sourceMappingURL=transactionController.js.map