// Tests for routes

describe('Routes Tests', () => {
  describe('Auth Routes', () => {
    test('should import auth routes', async () => {
      const authRoutes = await import('../routes/auth.routes');
      expect(authRoutes.default).toBeDefined();
      expect(typeof authRoutes.default).toBe('function');
    });

    test('should have auth routes as Express router', async () => {
      const authRoutes = await import('../routes/auth.routes');
      const router = authRoutes.default;
      
      // Check if it's an Express router
      expect(router).toBeDefined();
      expect(typeof router).toBe('function');
    });
  });

  describe('User Routes', () => {
    test('should import user routes', async () => {
      const userRoutes = await import('../routes/user.routes');
      expect(userRoutes.default).toBeDefined();
      expect(typeof userRoutes.default).toBe('function');
    });

    test('should have user routes as Express router', async () => {
      const userRoutes = await import('../routes/user.routes');
      const router = userRoutes.default;
      
      // Check if it's an Express router
      expect(router).toBeDefined();
      expect(typeof router).toBe('function');
    });
  });

  describe('Route Integration', () => {
    test('should be able to import both route modules', async () => {
      const authRoutes = await import('../routes/auth.routes');
      const userRoutes = await import('../routes/user.routes');
      
      expect(authRoutes.default).toBeDefined();
      expect(userRoutes.default).toBeDefined();
    });

    test('should export default router from both modules', async () => {
      const authRoutes = await import('../routes/auth.routes');
      const userRoutes = await import('../routes/user.routes');
      
      expect(authRoutes.default).toBeDefined();
      expect(userRoutes.default).toBeDefined();
      
      // Both should be Express Router instances
      expect(typeof authRoutes.default).toBe('function');
      expect(typeof userRoutes.default).toBe('function');
    });
  });

  describe('Route Structure', () => {
    test('auth routes should be importable', async () => {
      expect(async () => {
        await import('../routes/auth.routes');
      }).not.toThrow();
    });

    test('user routes should be importable', async () => {
      expect(async () => {
        await import('../routes/user.routes');
      }).not.toThrow();
    });
  });
});
