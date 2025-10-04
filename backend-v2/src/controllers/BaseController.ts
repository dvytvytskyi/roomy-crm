import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ServiceResponse } from '../types';
import logger from '../utils/logger';

export abstract class BaseController {
  /**
   * Handle successful response
   */
  protected success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }

  /**
   * Handle error response
   */
  protected error(
    res: Response,
    error: string | Error,
    statusCode: number = 500,
    message?: string
  ): void {
    const errorMessage = error instanceof Error ? error.message : error;
    
    logger.error(`Controller Error: ${errorMessage}`);

    const response: ApiResponse = {
      success: false,
      error: errorMessage,
      message,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }

  /**
   * Handle paginated response
   */
  protected paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message?: string
  ): void {
    const response: ApiResponse<T[]> = {
      success: true,
      data,
      message,
      pagination,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }

  /**
   * Handle validation error
   */
  protected validationError(
    res: Response,
    errors: any[],
    message: string = 'Validation failed'
  ): void {
    const response: ApiResponse = {
      success: false,
      error: message,
      data: { errors },
      timestamp: new Date().toISOString(),
    };

    res.status(400).json(response);
  }

  /**
   * Handle not found error
   */
  protected notFound(
    res: Response,
    resource: string = 'Resource',
    message?: string
  ): void {
    const response: ApiResponse = {
      success: false,
      error: `${resource} not found`,
      message: message || `The requested ${resource.toLowerCase()} was not found`,
      timestamp: new Date().toISOString(),
    };

    res.status(404).json(response);
  }

  /**
   * Handle unauthorized error
   */
  protected unauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): void {
    const response: ApiResponse = {
      success: false,
      error: 'Unauthorized',
      message,
      timestamp: new Date().toISOString(),
    };

    res.status(401).json(response);
  }

  /**
   * Handle forbidden error
   */
  protected forbidden(
    res: Response,
    message: string = 'Access forbidden'
  ): void {
    const response: ApiResponse = {
      success: false,
      error: 'Forbidden',
      message,
      timestamp: new Date().toISOString(),
    };

    res.status(403).json(response);
  }

  /**
   * Handle conflict error
   */
  protected conflict(
    res: Response,
    message: string = 'Resource conflict'
  ): void {
    const response: ApiResponse = {
      success: false,
      error: 'Conflict',
      message,
      timestamp: new Date().toISOString(),
    };

    res.status(409).json(response);
  }

  /**
   * Handle service response
   */
  protected handleServiceResponse<T>(
    res: Response,
    serviceResponse: ServiceResponse<T>,
    successStatusCode: number = 200
  ): void {
    if (serviceResponse.success) {
      this.success(res, serviceResponse.data, serviceResponse.message, successStatusCode);
    } else {
      this.error(res, serviceResponse.error || 'Service error', 500, serviceResponse.message);
    }
  }

  /**
   * Extract pagination parameters from request
   */
  protected getPaginationParams(req: Request): {
    page: number;
    limit: number;
    offset: number;
  } {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  /**
   * Extract search parameters from request
   */
  protected getSearchParams(req: Request): {
    search?: string;
    filters?: Record<string, any>;
  } {
    const search = req.query.search as string;
    const filters: Record<string, any> = {};

    // Extract filter parameters (exclude pagination and search)
    Object.keys(req.query).forEach(key => {
      if (!['page', 'limit', 'search', 'sortBy', 'sortOrder'].includes(key)) {
        const value = req.query[key];
        if (value !== undefined && value !== '') {
          filters[key] = value;
        }
      }
    });

    return { search, filters };
  }

  /**
   * Extract sorting parameters from request
   */
  protected getSortParams(req: Request): {
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
  } {
    const sortBy = req.query.sortBy as string;
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

    return { sortBy, sortOrder };
  }

  /**
   * Async wrapper for route handlers
   */
  protected asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // ==========================================
  // STATIC WRAPPER METHODS FOR CONTROLLERS
  // ==========================================

  /**
   * Static wrapper for success response
   */
  public static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }

  /**
   * Static wrapper for error response
   */
  public static error(
    res: Response,
    error: string | Error,
    statusCode: number = 500,
    message?: string
  ): void {
    const errorMessage = error instanceof Error ? error.message : error;
    
    logger.error(`Controller Error: ${errorMessage}`);

    const response: ApiResponse = {
      success: false,
      error: errorMessage,
      message,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }

  /**
   * Static wrapper for paginated response
   */
  public static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message?: string
  ): void {
    const response: ApiResponse<T[]> = {
      success: true,
      data,
      message,
      pagination,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }

  /**
   * Static wrapper for validation error
   */
  public static validationError(
    res: Response,
    errors: any[],
    message: string = 'Validation failed'
  ): void {
    const response: ApiResponse = {
      success: false,
      error: message,
      data: { errors },
      timestamp: new Date().toISOString(),
    };

    res.status(400).json(response);
  }

  /**
   * Static wrapper for not found error
   */
  public static notFound(
    res: Response,
    resource: string = 'Resource',
    message?: string
  ): void {
    const response: ApiResponse = {
      success: false,
      error: `${resource} not found`,
      message: message || `The requested ${resource.toLowerCase()} was not found`,
      timestamp: new Date().toISOString(),
    };

    res.status(404).json(response);
  }

  /**
   * Static wrapper for unauthorized error
   */
  public static unauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): void {
    const response: ApiResponse = {
      success: false,
      error: 'Unauthorized',
      message,
      timestamp: new Date().toISOString(),
    };

    res.status(401).json(response);
  }

  /**
   * Static wrapper for forbidden error
   */
  public static forbidden(
    res: Response,
    message: string = 'Access forbidden'
  ): void {
    const response: ApiResponse = {
      success: false,
      error: 'Forbidden',
      message,
      timestamp: new Date().toISOString(),
    };

    res.status(403).json(response);
  }

  /**
   * Static wrapper for conflict error
   */
  public static conflict(
    res: Response,
    message: string = 'Resource conflict'
  ): void {
    const response: ApiResponse = {
      success: false,
      error: 'Conflict',
      message,
      timestamp: new Date().toISOString(),
    };

    res.status(409).json(response);
  }
}
