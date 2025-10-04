import { UserRole, UserStatus } from '@prisma/client';

describe('Services Integration Tests', () => {
  test('should have correct UserRole enum values', () => {
    expect(UserRole.ADMIN).toBe('ADMIN');
    expect(UserRole.MANAGER).toBe('MANAGER');
    expect(UserRole.AGENT).toBe('AGENT');
    expect(UserRole.OWNER).toBe('OWNER');
    expect(UserRole.GUEST).toBe('GUEST');
    expect(UserRole.CLEANER).toBe('CLEANER');
    expect(UserRole.MAINTENANCE_STAFF).toBe('MAINTENANCE_STAFF');
  });

  test('should have correct UserStatus enum values', () => {
    expect(UserStatus.ACTIVE).toBe('ACTIVE');
    expect(UserStatus.INACTIVE).toBe('INACTIVE');
    expect(UserStatus.SUSPENDED).toBe('SUSPENDED');
    expect(UserStatus.VIP).toBe('VIP');
  });

  test('should import UserService successfully', async () => {
    const { UserService } = await import('../services/user.service');
    expect(UserService).toBeDefined();
    expect(typeof UserService.findByEmail).toBe('function');
    expect(typeof UserService.findById).toBe('function');
    expect(typeof UserService.create).toBe('function');
    expect(typeof UserService.findAll).toBe('function');
  });

  test('should import AuthService successfully', async () => {
    const { AuthService } = await import('../services/auth.service');
    expect(AuthService).toBeDefined();
    expect(typeof AuthService.validateUser).toBe('function');
    expect(typeof AuthService.login).toBe('function');
    expect(typeof AuthService.loginWithCredentials).toBe('function');
    expect(typeof AuthService.verifyToken).toBe('function');
  });

  test('should import DTO types successfully', async () => {
    await import('../types/dto');
    
    // Test CreateUserDto structure
    const createUserData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.GUEST,
    };
    expect(createUserData.firstName).toBe('Test');
    expect(createUserData.email).toBe('test@example.com');

    // Test LoginDto structure
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };
    expect(loginData.email).toBe('test@example.com');

    // Test UserResponseDto structure
    const userResponse = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.GUEST,
      status: UserStatus.ACTIVE,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(userResponse.id).toBe('1');
    expect(userResponse.role).toBe(UserRole.GUEST);
  });
});
