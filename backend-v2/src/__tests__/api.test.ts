// Simple API integration tests
describe('API Integration Tests', () => {
  test('should import auth controller', async () => {
    const authController = await import('../controllers/auth.controller');
    expect(authController.AuthController).toBeDefined();
    expect(typeof authController.AuthController.login).toBe('function');
    expect(typeof authController.AuthController.getProfile).toBe('function');
  });

  test('should import user controller', async () => {
    const userController = await import('../controllers/user.controller');
    expect(userController.UserController).toBeDefined();
    expect(typeof userController.UserController.createUser).toBe('function');
    expect(typeof userController.UserController.getAllUsers).toBe('function');
  });

  test('should import auth middleware', async () => {
    const authMiddleware = await import('../middleware/auth.middleware');
    expect(authMiddleware.authenticateToken).toBeDefined();
    expect(authMiddleware.checkRole).toBeDefined();
    expect(authMiddleware.requireAdmin).toBeDefined();
    expect(authMiddleware.requireManagerOrAdmin).toBeDefined();
  });

  test('should import auth routes', async () => {
    const authRoutes = await import('../routes/auth.routes');
    expect(authRoutes.default).toBeDefined();
  });

  test('should import user routes', async () => {
    const userRoutes = await import('../routes/user.routes');
    expect(userRoutes.default).toBeDefined();
  });

  test('should import main server file', async () => {
    const server = await import('../index');
    expect(server).toBeDefined();
  });
});
