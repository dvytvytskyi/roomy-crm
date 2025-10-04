import { PrismaClient } from '@prisma/client';
import { ServiceResponse, PaginationParams } from '../types';
import logger from '../utils/logger';

export abstract class BaseService {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
  }

  /**
   * Create a successful service response
   */
  protected success<T>(data: T, message?: string): ServiceResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  /**
   * Create an error service response
   */
  protected error(error: string, message?: string): ServiceResponse {
    logger.error(`Service Error: ${error}`);
    return {
      success: false,
      error,
      message,
    };
  }

  /**
   * Handle database errors
   */
  protected handleDatabaseError(error: any): ServiceResponse {
    logger.error('Database Error:', error);

    // Prisma specific error handling
    if (error.code === 'P2002') {
      return this.error('Unique constraint violation', 'A record with this data already exists');
    }

    if (error.code === 'P2025') {
      return this.error('Record not found', 'The requested record was not found');
    }

    if (error.code === 'P2003') {
      return this.error('Foreign key constraint violation', 'Referenced record does not exist');
    }

    if (error.code === 'P2014') {
      return this.error('Invalid ID', 'The provided ID is invalid');
    }

    // Generic database error
    return this.error('Database operation failed', 'An error occurred while processing your request');
  }

  /**
   * Validate required fields
   */
  protected validateRequiredFields(data: any, requiredFields: string[]): string[] {
    const missingFields: string[] = [];

    requiredFields.forEach(field => {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        missingFields.push(field);
      }
    });

    return missingFields;
  }

  /**
   * Create pagination metadata
   */
  protected createPaginationMetadata(
    page: number,
    limit: number,
    total: number
  ): {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } {
    const totalPages = Math.ceil(total / limit);
    
    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Build where clause for filtering
   */
  protected buildWhereClause(filters: Record<string, any>): any {
    const where: any = {};

    Object.keys(filters).forEach(key => {
      const value = filters[key];

      if (value !== undefined && value !== null && value !== '') {
        // Handle different filter types
        if (key.endsWith('_contains')) {
          const fieldName = key.replace('_contains', '');
          where[fieldName] = {
            contains: value,
            mode: 'insensitive',
          };
        } else if (key.endsWith('_gt')) {
          const fieldName = key.replace('_gt', '');
          where[fieldName] = {
            gt: value,
          };
        } else if (key.endsWith('_gte')) {
          const fieldName = key.replace('_gte', '');
          where[fieldName] = {
            gte: value,
          };
        } else if (key.endsWith('_lt')) {
          const fieldName = key.replace('_lt', '');
          where[fieldName] = {
            lt: value,
          };
        } else if (key.endsWith('_lte')) {
          const fieldName = key.replace('_lte', '');
          where[fieldName] = {
            lte: value,
          };
        } else if (key.endsWith('_in')) {
          const fieldName = key.replace('_in', '');
          where[fieldName] = {
            in: Array.isArray(value) ? value : [value],
          };
        } else {
          // Direct field match
          where[key] = value;
        }
      }
    });

    return where;
  }

  /**
   * Build order by clause for sorting
   */
  protected buildOrderByClause(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): any {
    if (!sortBy) {
      return { createdAt: 'desc' }; // Default sorting
    }

    return {
      [sortBy]: sortOrder,
    };
  }

  /**
   * Build search clause for text search
   */
  protected buildSearchClause(search: string, searchFields: string[]): any {
    if (!search || !searchFields.length) {
      return {};
    }

    return {
      OR: searchFields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      })),
    };
  }

  /**
   * Execute database transaction
   */
  protected async executeTransaction<T>(
    callback: (prisma: PrismaClient) => Promise<T>
  ): Promise<ServiceResponse<T>> {
    try {
      const result = await this.prisma.$transaction(callback);
      return this.success(result);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Check if record exists
   */
  protected async recordExists(model: any, where: any): Promise<boolean> {
    try {
      const count = await model.count({ where });
      return count > 0;
    } catch (error) {
      logger.error('Error checking record existence:', error);
      return false;
    }
  }

  /**
   * Get record by ID with error handling
   */
  protected async findById<T>(
    model: any,
    id: string,
    include?: any
  ): Promise<ServiceResponse<T>> {
    try {
      const record = await model.findUnique({
        where: { id },
        include,
      });

      if (!record) {
        return this.error('Record not found', 'The requested record was not found');
      }

      return this.success(record);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Get records with pagination
   */
  protected async findMany<T>(
    model: any,
    options: {
      where?: any;
      include?: any;
      orderBy?: any;
      skip?: number;
      take?: number;
    }
  ): Promise<ServiceResponse<T[]>> {
    try {
      const records = await model.findMany(options);
      return this.success(records);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Count records
   */
  protected async countRecords(
    model: any,
    where?: any
  ): Promise<ServiceResponse<number>> {
    try {
      const count = await model.count({ where });
      return this.success(count);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Create record
   */
  protected async createRecord<T>(
    model: any,
    data: any,
    include?: any
  ): Promise<ServiceResponse<T>> {
    try {
      const record = await model.create({
        data,
        include,
      });
      return this.success(record);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Update record
   */
  protected async updateRecord<T>(
    model: any,
    id: string,
    data: any,
    include?: any
  ): Promise<ServiceResponse<T>> {
    try {
      const record = await model.update({
        where: { id },
        data,
        include,
      });
      return this.success(record);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Delete record
   */
  protected async deleteRecord<T>(
    model: any,
    id: string
  ): Promise<ServiceResponse<T>> {
    try {
      const record = await model.delete({
        where: { id },
      });
      return this.success(record);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
