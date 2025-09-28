import { Router } from "express";
import { transactionController } from "../controllers/transactionController";
import { authenticate } from "../middleware/auth";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Transaction CRUD operations
router.post("/", transactionController.createTransaction);
router.get("/", transactionController.getTransactions);
router.get("/stats", transactionController.getTransactionStats);
router.get("/:id", transactionController.getTransaction);
router.put("/:id", transactionController.updateTransaction);
router.delete("/:id", transactionController.deleteTransaction);

export { router as transactionRoutes };
