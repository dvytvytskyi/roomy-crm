# Sentry Error Monitoring for Roomy Backend V2

## Overview

This document outlines the Sentry error monitoring implementation for Roomy Backend V2. Sentry provides comprehensive error tracking, performance monitoring, and release management capabilities.

## Features

### Error Tracking
- Automatic error capture and reporting
- Stack trace analysis
- Error grouping and deduplication
- Real-time error notifications

### Performance Monitoring
- Request/response time tracking
- Database query performance
- Memory usage monitoring
- Custom performance metrics

### Release Management
- Automatic release tracking
- Error correlation with releases
- Performance regression detection
- Deployment notifications

## Configuration

### Environment Variables

```bash
# Required: Sentry DSN (Data Source Name)
SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Optional: Release version
SENTRY_RELEASE=roomy-backend-v2@1.0.0

# Optional: Environment
NODE_ENV=production
```

### Sentry Configuration

The Sentry configuration is located in `src/config/sentry.ts`:

```typescript
export const sentryConfig: SentryConfig = {
  dsn: process.env.SENTRY_DSN || '',
  environment: config.nodeEnv,
  release: process.env.SENTRY_RELEASE || `roomy-backend-v2@${config.version}`,
  tracesSampleRate: config.isProduction ? 0.1 : 1.0, // 10% in production, 100% in development
  profilesSampleRate: config.isProduction ? 0.1 : 1.0, // 10% in production, 100% in development
  enabled: process.env.SENTRY_DSN ? true : false,
};
```

## Integration Points

### 1. Express Middleware

Sentry is integrated at the Express application level:

```typescript
// Sentry middleware (must be first)
app.use(sentryMiddleware.requestHandler);
app.use(sentryMiddleware.tracingHandler);
app.use(sentryUserContext);
app.use(sentryPerformanceContext);

// Sentry error handler (must be before other error handlers)
app.use(sentryMiddleware.errorHandler);
```

### 2. User Context

User context is automatically added to all error reports:

```typescript
setUserContext({
  id: req.user.id,
  email: req.user.email,
  role: req.user.role,
});
```

### 3. Custom Context

Additional context is added for each request:

```typescript
setContext('request', {
  method: req.method,
  url: req.url,
  userAgent: req.get('User-Agent'),
  ip: req.ip,
  timestamp: new Date().toISOString(),
});
```

## Error Filtering

Sentry is configured to filter out known non-critical errors:

```typescript
beforeSend(event, hint) {
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
  
  return event;
}
```

## Manual Error Reporting

### Capturing Errors

```typescript
import { captureError } from '../config/sentry';

try {
  // Some operation that might fail
  await riskyOperation();
} catch (error) {
  captureError(error, {
    operation: 'riskyOperation',
    userId: req.user?.id,
    additionalContext: 'any relevant data',
  });
}
```

### Capturing Messages

```typescript
import { captureMessage } from '../config/sentry';

captureMessage('User performed important action', 'info', {
  userId: req.user.id,
  action: 'important_action',
  timestamp: new Date().toISOString(),
});
```

### Adding Custom Tags

```typescript
import { setTag } from '../config/sentry';

setTag('feature', 'reservation_management');
setTag('user_type', 'premium');
```

## Health Monitoring

### Health Check Endpoints

- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check with service status
- `GET /health/sentry-test` - Test Sentry error reporting

### Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "memory": {
    "rss": 123456789,
    "heapTotal": 98765432,
    "heapUsed": 87654321,
    "external": 1234567
  },
  "sentry": {
    "enabled": true,
    "environment": "production",
    "release": "roomy-backend-v2@1.0.0"
  }
}
```

## Performance Monitoring

### Automatic Performance Tracking

- HTTP request/response times
- Database query performance
- Memory usage trends
- CPU usage patterns

### Custom Performance Metrics

```typescript
import { startTransaction } from '../config/sentry';

const transaction = startTransaction('reservation_processing', 'task');
try {
  await processReservation(reservationId);
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

## Alerting and Notifications

### Error Alerts

Configure alerts in Sentry dashboard for:
- New errors
- Error rate spikes
- Performance regressions
- Release issues

### Notification Channels

- Email notifications
- Slack integration
- PagerDuty integration
- Webhook notifications

## Dashboard and Analytics

### Error Dashboard

- Error frequency and trends
- Error distribution by user/feature
- Error resolution tracking
- Performance metrics

### Release Tracking

- Error correlation with releases
- Performance regression detection
- Deployment success/failure tracking

## Best Practices

### 1. Error Context

Always provide relevant context when capturing errors:

```typescript
captureError(error, {
  userId: req.user?.id,
  operation: 'createReservation',
  reservationData: {
    propertyId: req.body.propertyId,
    checkIn: req.body.checkIn,
    checkOut: req.body.checkOut,
  },
  requestId: req.headers['x-request-id'],
});
```

### 2. Performance Monitoring

Use transactions for important operations:

```typescript
const transaction = startTransaction('user_registration', 'task');
try {
  await validateUserData(userData);
  await createUser(userData);
  await sendWelcomeEmail(userData.email);
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

### 3. User Privacy

Never send sensitive user data to Sentry:

```typescript
// Good: Send user ID and role
setUserContext({
  id: user.id,
  role: user.role,
});

// Bad: Don't send sensitive data
setUserContext({
  id: user.id,
  password: user.password, // Never do this!
  creditCard: user.creditCard, // Never do this!
});
```

### 4. Error Filtering

Filter out expected errors to reduce noise:

```typescript
beforeSend(event, hint) {
  // Filter out expected validation errors
  if (event.exception?.values?.[0]?.value?.includes('validation failed')) {
    return null;
  }
  
  return event;
}
```

## Troubleshooting

### Common Issues

1. **Sentry Not Capturing Errors**
   - Check if `SENTRY_DSN` is set correctly
   - Verify Sentry initialization in logs
   - Check network connectivity to Sentry

2. **Too Many Errors**
   - Review error filtering configuration
   - Check for error loops in code
   - Verify error handling in critical paths

3. **Performance Impact**
   - Monitor Sentry sample rates
   - Check for excessive error reporting
   - Review transaction performance

### Debug Mode

Enable debug mode for troubleshooting:

```typescript
Sentry.init({
  dsn: sentryConfig.dsn,
  debug: true, // Enable debug mode
  // ... other options
});
```

## Security Considerations

### Data Privacy

- Never send sensitive user data to Sentry
- Use data scrubbing for sensitive fields
- Implement proper error filtering

### Access Control

- Use Sentry's team and project permissions
- Implement proper authentication for Sentry dashboard
- Regular access review and cleanup

## Monitoring and Maintenance

### Regular Tasks

- Review error trends and patterns
- Update error filtering rules
- Monitor performance impact
- Review and update alerting rules

### Performance Optimization

- Monitor Sentry's impact on application performance
- Adjust sample rates based on traffic
- Optimize error reporting frequency

## Integration with CI/CD

### Release Tracking

```bash
# Set release version during deployment
export SENTRY_RELEASE="roomy-backend-v2@$(git rev-parse HEAD)"

# Create release in Sentry
npx @sentry/cli releases new $SENTRY_RELEASE

# Deploy application
npm run deploy

# Finalize release
npx @sentry/cli releases finalize $SENTRY_RELEASE
```

### Source Maps

Upload source maps for better error tracking:

```bash
# Upload source maps
npx @sentry/cli releases files $SENTRY_RELEASE upload-sourcemaps ./dist
```

## Contact Information

For Sentry-related issues or questions:
- **Sentry Dashboard:** [Your Sentry Project URL]
- **System Administrator:** [Your Name]
- **Emergency Contact:** [Emergency Phone]

## Version History

- **v1.0** (2024-01-01): Initial Sentry integration
- **v1.1** (2024-01-15): Added performance monitoring
- **v1.2** (2024-02-01): Enhanced error filtering and context
