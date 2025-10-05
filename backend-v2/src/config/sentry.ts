import * as Sentry from '@sentry/node';
import { config } from './index';

/**
 * Sentry Configuration for Roomy Backend V2
 * Provides error monitoring, performance tracking, and release management
 */

export interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
  enabled: boolean;
}

export const sentryConfig: SentryConfig = {
  dsn: process.env.SENTRY_DSN || '',
  environment: config.nodeEnv,
  release: process.env.SENTRY_RELEASE || `roomy-backend-v2@${config.version}`,
  tracesSampleRate: config.isProduction ? 0.1 : 1.0, // 10% in production, 100% in development
  profilesSampleRate: config.isProduction ? 0.1 : 1.0, // 10% in production, 100% in development
  enabled: process.env.SENTRY_DSN ? true : false,
};

/**
 * Initialize Sentry
 */
export function initSentry(): void {
  if (!sentryConfig.enabled) {
    console.log('Sentry is disabled - no DSN provided');
    return;
  }

  Sentry.init({
    dsn: sentryConfig.dsn,
    environment: sentryConfig.environment,
    release: sentryConfig.release,
    
    // Performance Monitoring
    tracesSampleRate: sentryConfig.tracesSampleRate,
    profilesSampleRate: sentryConfig.profilesSampleRate,
    
    // Integrations
    integrations: [
      // Enable HTTP calls tracing
      Sentry.httpIntegration({ tracing: true }),
      // Enable Express.js tracing
      Sentry.expressIntegration(),
    ],
    
    // Error filtering
    beforeSend(event, hint) {
      // Filter out known non-critical errors
      if (event.exception) {
        const error = hint.originalException;
        
        // Filter out validation errors (these are expected)
        if (error instanceof Error && error.message.includes('validation')) {
          return null;
        }
        
        // Filter out authentication errors (these are expected)
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          return null;
        }
        
        // Filter out rate limiting errors (these are expected)
        if (error instanceof Error && error.message.includes('Too many requests')) {
          return null;
        }
      }
      
      return event;
    },
    
    // Additional options
    maxBreadcrumbs: 50,
    attachStacktrace: true,
    sendDefaultPii: false, // Don't send personally identifiable information
    
    // Custom tags
    initialScope: {
      tags: {
        component: 'backend',
        service: 'roomy-backend-v2',
      },
    },
  });

  console.log(`Sentry initialized for environment: ${sentryConfig.environment}`);
}

/**
 * Sentry middleware for Express
 */
export const sentryMiddleware = {
  requestHandler: (req: any, res: any, next: any) => next(),
  tracingHandler: (req: any, res: any, next: any) => next(),
  errorHandler: (err: any, req: any, res: any, next: any) => next(err),
};

/**
 * Capture and report errors
 */
export const captureError = (error: Error, context?: Record<string, any>): void => {
  if (!sentryConfig.enabled) {
    console.error('Error (Sentry disabled):', error);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setContext(key, context[key]);
      });
    }
    
    Sentry.captureException(error);
  });
};

/**
 * Capture and report messages
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>): void => {
  if (!sentryConfig.enabled) {
    console.log(`Message (Sentry disabled): ${message}`);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setContext(key, context[key]);
      });
    }
    
    Sentry.captureMessage(message, level);
  });
};

/**
 * Add user context to Sentry
 */
export const setUserContext = (user: { id: string; email: string; role: string }): void => {
  if (!sentryConfig.enabled) return;

  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
};

/**
 * Add custom tags to Sentry
 */
export const setTag = (key: string, value: string): void => {
  if (!sentryConfig.enabled) return;

  Sentry.setTag(key, value);
};

/**
 * Add custom context to Sentry
 */
export const setContext = (key: string, context: Record<string, any>): void => {
  if (!sentryConfig.enabled) return;

  Sentry.setContext(key, context);
};

/**
 * Create a Sentry transaction for performance monitoring
 */
export const startTransaction = (name: string, op: string): Sentry.Transaction | undefined => {
  if (!sentryConfig.enabled) return undefined;

  return Sentry.startTransaction({
    name,
    op,
  });
};

/**
 * Flush Sentry events (useful for graceful shutdown)
 */
export const flushSentry = async (timeout: number = 2000): Promise<boolean> => {
  if (!sentryConfig.enabled) return true;

  return await Sentry.flush(timeout);
};

/**
 * Sentry health check
 */
export const getSentryHealth = (): { enabled: boolean; environment: string; release: string } => {
  return {
    enabled: sentryConfig.enabled,
    environment: sentryConfig.environment,
    release: sentryConfig.release,
  };
};
