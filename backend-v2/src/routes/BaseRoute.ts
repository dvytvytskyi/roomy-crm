import { Router, Request, Response } from 'express';
import { BaseController } from '../controllers/BaseController';
import { MiddlewareFunction } from '../types';

export abstract class BaseRoute {
  protected router: Router;
  protected controller: BaseController;

  constructor(controller: BaseController) {
    this.router = Router();
    this.controller = controller;
    this.setupRoutes();
  }

  /**
   * Setup routes - to be implemented by subclasses
   */
  protected abstract setupRoutes(): void;

  /**
   * Get the router instance
   */
  public getRouter(): Router {
    return this.router;
  }

  /**
   * Apply middleware to all routes
   */
  protected useMiddleware(middleware: MiddlewareFunction): void {
    this.router.use(middleware);
  }

  /**
   * Apply middleware to specific routes
   */
  protected useMiddlewareForRoutes(middleware: MiddlewareFunction, ...routes: string[]): void {
    routes.forEach(route => {
      this.router.use(route, middleware);
    });
  }

  /**
   * Create a GET route
   */
  protected get(path: string, ...handlers: MiddlewareFunction[]): void {
    this.router.get(path, ...handlers);
  }

  /**
   * Create a POST route
   */
  protected post(path: string, ...handlers: MiddlewareFunction[]): void {
    this.router.post(path, ...handlers);
  }

  /**
   * Create a PUT route
   */
  protected put(path: string, ...handlers: MiddlewareFunction[]): void {
    this.router.put(path, ...handlers);
  }

  /**
   * Create a PATCH route
   */
  protected patch(path: string, ...handlers: MiddlewareFunction[]): void {
    this.router.patch(path, ...handlers);
  }

  /**
   * Create a DELETE route
   */
  protected delete(path: string, ...handlers: MiddlewareFunction[]): void {
    this.router.delete(path, ...handlers);
  }

  /**
   * Create a route for all HTTP methods
   */
  protected all(path: string, ...handlers: MiddlewareFunction[]): void {
    this.router.all(path, ...handlers);
  }

  /**
   * Create a route with parameters validation
   */
  protected param(name: string, handler: MiddlewareFunction): void {
    this.router.param(name, handler);
  }

  /**
   * Create nested routes
   */
  protected use(path: string, router: Router): void {
    this.router.use(path, router);
  }

  /**
   * Create a route group with common middleware
   */
  protected group(middleware: MiddlewareFunction[], callback: () => void): void {
    const originalRouter = this.router;
    this.router = Router();
    
    // Apply middleware to the group
    middleware.forEach(mw => {
      this.router.use(mw);
    });
    
    // Setup routes in the group
    callback();
    
    // Restore original router
    this.router = originalRouter;
  }

  /**
   * Create resource routes (index, show, store, update, destroy)
   */
  protected resource(
    path: string,
    controller: BaseController,
    options: {
      only?: string[];
      except?: string[];
      middleware?: MiddlewareFunction[];
    } = {}
  ): void {
    const { only, except, middleware = [] } = options;
    
    const routes = [
      { method: 'get', path: '', action: 'index', name: 'index' },
      { method: 'get', path: '/:id', action: 'show', name: 'show' },
      { method: 'post', path: '', action: 'store', name: 'store' },
      { method: 'put', path: '/:id', action: 'update', name: 'update' },
      { method: 'patch', path: '/:id', action: 'update', name: 'update' },
      { method: 'delete', path: '/:id', action: 'destroy', name: 'destroy' },
    ];

    routes.forEach(route => {
      // Skip if route is in except array
      if (except && except.includes(route.name)) {
        return;
      }

      // Skip if route is not in only array (when only is specified)
      if (only && !only.includes(route.name)) {
        return;
      }

      // Create route handler
      const handler = async (req: Request, res: Response) => {
        try {
          const action = (controller as any)[route.action];
          if (typeof action === 'function') {
            await action.call(controller, req, res);
          } else {
            res.status(501).json({
              success: false,
              error: 'Not implemented',
              message: `Action ${route.action} is not implemented`,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          });
        }
      };

      // Apply middleware and create route
      this.router[route.method as keyof Router](`${path}${route.path}`, ...middleware, handler);
    });
  }

  /**
   * Create API version routes
   */
  protected apiVersion(version: string, callback: () => void): void {
    this.router.use(`/v${version}`, callback);
  }

  /**
   * Create health check route
   */
  protected healthCheck(): void {
    this.router.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        data: {
          status: 'OK',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        },
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Create root route
   */
  protected root(): void {
    this.router.get('/', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        data: {
          message: 'API is running',
          version: '2.0.0',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    });
  }
}
