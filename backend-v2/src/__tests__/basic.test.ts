import { config } from '../config';

describe('Backend V2 Basic Tests', () => {
  test('should have correct configuration', () => {
    expect(config.port).toBe(3002);
    expect(config.nodeEnv).toBe('development');
    expect(config.frontendUrl).toBe('http://localhost:3000');
  });

  test('should have database configuration', () => {
    expect(config.database.url).toContain('roomy_db_v2');
  });

  test('should have JWT configuration', () => {
    expect(config.jwt.secret).toBeDefined();
    expect(config.jwt.expiresIn).toBe('7d');
  });

  test('should have CORS configuration', () => {
    expect(config.cors.origin).toBe('http://localhost:3000');
  });

  test('should have rate limiting configuration', () => {
    expect(config.rateLimit.windowMs).toBe(900000);
    expect(config.rateLimit.maxRequests).toBe(100);
  });

  test('should identify development environment', () => {
    expect(config.isDevelopment).toBe(true);
    expect(config.isProduction).toBe(false);
    expect(config.isTest).toBe(false);
  });
});
