import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/v2/properties/:propertyId/expenses
 * @desc    Get all expenses for a property
 * @access  Private (JWT required)
 */
router.get('/:propertyId/expenses', authenticateToken, ExpenseController.getExpenses);

/**
 * @route   GET /api/v2/properties/:propertyId/expenses/total
 * @desc    Get total expenses for a property (with optional date range)
 * @access  Private (JWT required)
 * @query   dateFrom - Optional start date (YYYY-MM-DD)
 * @query   dateTo - Optional end date (YYYY-MM-DD)
 */
router.get('/:propertyId/expenses/total', authenticateToken, ExpenseController.getTotalExpenses);

/**
 * @route   POST /api/v2/properties/:propertyId/expenses
 * @desc    Create a new expense for a property
 * @access  Private (JWT required)
 */
router.post('/:propertyId/expenses', authenticateToken, ExpenseController.createExpense);

/**
 * @route   PUT /api/v2/properties/:propertyId/expenses/:id
 * @desc    Update an expense
 * @access  Private (JWT required)
 */
router.put('/:propertyId/expenses/:id', authenticateToken, ExpenseController.updateExpense);

/**
 * @route   DELETE /api/v2/properties/:propertyId/expenses/:id
 * @desc    Delete an expense
 * @access  Private (JWT required)
 */
router.delete('/:propertyId/expenses/:id', authenticateToken, ExpenseController.deleteExpense);

export default router;
