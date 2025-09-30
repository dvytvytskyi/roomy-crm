"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionRoutes = void 0;
const express_1 = require("express");
const transactionController_1 = require("../controllers/transactionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.transactionRoutes = router;
router.use(auth_1.authenticate);
router.post("/", transactionController_1.transactionController.createTransaction);
router.get("/", transactionController_1.transactionController.getTransactions);
router.get("/stats", transactionController_1.transactionController.getTransactionStats);
router.get("/:id", transactionController_1.transactionController.getTransaction);
router.put("/:id", transactionController_1.transactionController.updateTransaction);
router.delete("/:id", transactionController_1.transactionController.deleteTransaction);
//# sourceMappingURL=transactionRoutes.js.map