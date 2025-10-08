import { PrismaClient } from '@prisma/client';
import { BaseService } from './BaseService';
import { ServiceResponse } from '../types';
import { CurrentUser } from '../types/dto';
import logger from '../utils/logger';

export interface CreateExpenseDto {
  property_id: string;
  date: string;
  category: string;
  amount: number;
  description?: string;
  receipt_url?: string;
}

export interface UpdateExpenseDto {
  date?: string;
  category?: string;
  amount?: number;
  description?: string;
  receipt_url?: string;
}

export interface ExpenseDto {
  id: string;
  property_id: string;
  date: string;
  category: string;
  amount: number;
  description?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export class ExpenseService extends BaseService {
  private static instance: ExpenseService;

  private constructor() {
    super();
  }

  public static getInstance(): ExpenseService {
    if (!ExpenseService.instance) {
      ExpenseService.instance = new ExpenseService();
    }
    return ExpenseService.instance;
  }

  /**
   * Get all expenses for a property
   */
  public async getExpensesByProperty(
    propertyId: string,
    currentUser: CurrentUser
  ): Promise<ServiceResponse<ExpenseDto[]>> {
    try {
      logger.info(`Getting expenses for property: ${propertyId}, user: ${currentUser.email}`);

      // Check if property exists and user has access
      const property = await this.prisma.properties.findUnique({
        where: { id: propertyId }
      });

      if (!property) {
        return this.error('Property not found');
      }

      // For non-admin users, check property ownership
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        if (property.owner_id !== currentUser.userId && property.agent_id !== currentUser.userId) {
          return this.error('Unauthorized access to property expenses');
        }
      }

      const expenses = await this.prisma.expenses.findMany({
        where: { property_id: propertyId },
        orderBy: { date: 'desc' }
      });

      logger.info(`Found ${expenses.length} expenses for property ${propertyId}`);

      return this.success(expenses as any);
    } catch (error) {
      logger.error('Error getting expenses:', error);
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Create a new expense
   */
  public async createExpense(
    data: CreateExpenseDto,
    currentUser: CurrentUser
  ): Promise<ServiceResponse<ExpenseDto>> {
    try {
      logger.info(`Creating expense for property: ${data.property_id}, user: ${currentUser.email}`);

      // Validate required fields
      const missingFields = this.validateRequiredFields(data, ['property_id', 'date', 'category', 'amount']);
      if (missingFields.length > 0) {
        return this.error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Check if property exists
      const property = await this.prisma.properties.findUnique({
        where: { id: data.property_id }
      });

      if (!property) {
        return this.error('Property not found');
      }

      // For non-admin users, check property ownership
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        if (property.owner_id !== currentUser.userId && property.agent_id !== currentUser.userId) {
          return this.error('Unauthorized access to create expense for this property');
        }
      }

      const expense = await this.prisma.expenses.create({
        data: {
          property_id: data.property_id,
          date: new Date(data.date),
          category: data.category,
          amount: data.amount,
          description: data.description,
          receipt_url: data.receipt_url,
          updated_at: new Date()
        }
      });

      logger.info(`Expense created successfully: ${expense.id}`);

      return this.success(expense as any);
    } catch (error) {
      logger.error('Error creating expense:', error);
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Update an expense
   */
  public async updateExpense(
    id: string,
    data: UpdateExpenseDto,
    currentUser: CurrentUser
  ): Promise<ServiceResponse<ExpenseDto>> {
    try {
      logger.info(`Updating expense: ${id}, user: ${currentUser.email}`);

      // Check if expense exists
      const expense = await this.prisma.expenses.findUnique({
        where: { id },
        include: { property: true }
      });

      if (!expense) {
        return this.error('Expense not found');
      }

      // For non-admin users, check property ownership
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        if (expense.property.owner_id !== currentUser.userId && expense.property.agent_id !== currentUser.userId) {
          return this.error('Unauthorized access to update this expense');
        }
      }

      const updateData: any = {
        ...data,
        updated_at: new Date()
      };

      if (data.date) {
        updateData.date = new Date(data.date);
      }

      const updatedExpense = await this.prisma.expenses.update({
        where: { id },
        data: updateData
      });

      logger.info(`Expense updated successfully: ${id}`);

      return this.success(updatedExpense as any);
    } catch (error) {
      logger.error('Error updating expense:', error);
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Delete an expense
   */
  public async deleteExpense(
    id: string,
    currentUser: CurrentUser
  ): Promise<ServiceResponse<{ message: string }>> {
    try {
      logger.info(`Deleting expense: ${id}, user: ${currentUser.email}`);

      // Check if expense exists
      const expense = await this.prisma.expenses.findUnique({
        where: { id },
        include: { property: true }
      });

      if (!expense) {
        return this.error('Expense not found');
      }

      // For non-admin users, check property ownership
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        if (expense.property.owner_id !== currentUser.userId && expense.property.agent_id !== currentUser.userId) {
          return this.error('Unauthorized access to delete this expense');
        }
      }

      await this.prisma.expenses.delete({
        where: { id }
      });

      logger.info(`Expense deleted successfully: ${id}`);

      return this.success({ message: 'Expense deleted successfully' });
    } catch (error) {
      logger.error('Error deleting expense:', error);
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Get expense by ID
   */
  public async getExpenseById(
    id: string,
    currentUser: CurrentUser
  ): Promise<ServiceResponse<ExpenseDto>> {
    try {
      const expense = await this.prisma.expenses.findUnique({
        where: { id },
        include: { property: true }
      });

      if (!expense) {
        return this.error('Expense not found');
      }

      // For non-admin users, check property ownership
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        if (expense.property.owner_id !== currentUser.userId && expense.property.agent_id !== currentUser.userId) {
          return this.error('Unauthorized access to this expense');
        }
      }

      return this.success(expense as any);
    } catch (error) {
      logger.error('Error getting expense:', error);
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Get total expenses for a property within a date range
   */
  public async getTotalExpenses(
    propertyId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<ServiceResponse<{ total: number; count: number }>> {
    try {
      const where: any = { property_id: propertyId };

      if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) where.date.gte = new Date(dateFrom);
        if (dateTo) where.date.lte = new Date(dateTo);
      }

      const result = await this.prisma.expenses.aggregate({
        where,
        _sum: { amount: true },
        _count: true
      });

      return this.success({
        total: result._sum.amount || 0,
        count: result._count || 0
      });
    } catch (error) {
      logger.error('Error calculating total expenses:', error);
      return this.handleDatabaseError(error);
    }
  }
}

export default ExpenseService;
