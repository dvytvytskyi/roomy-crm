import { UserRole, UserStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { config } from '../config';

// Mock dependencies
jest.mock('../services/user.service');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../config');

const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockConfig = config as jest.Mocked<typeof config>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default config mock
    mockConfig.jwt = {
      secret: 'test-secret',
      expiresIn: '7d',
      refreshExpiresIn: '30d',
    };
  });

  describe('validateUser', () => {
    test('should validate user successfully', async () => {
      const mockUser = {
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


      // Mock UserService.findByEmail to return user
      mockUserService.findByEmail.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      // Mock bcrypt.compare to return true
      mockBcrypt.compare.mockResolvedValue(true);

      // Mock Prisma user query (simulated through UserService.updateLastLogin)
      mockUserService.updateLastLogin.mockResolvedValue({
        success: true,
        data: true,
      });

      const result = await AuthService.validateUser('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.email).toBe('test@example.com');
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
    });

    test('should return null when user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await AuthService.validateUser('nonexistent@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(result.message).toBe('Invalid credentials');
    });

    test('should return null when password is invalid', async () => {
      const mockUser = {
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

      mockUserService.findByEmail.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      // Mock bcrypt.compare to return false (invalid password)
      mockBcrypt.compare.mockResolvedValue(false);

      const result = await AuthService.validateUser('test@example.com', 'wrongpassword');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(result.message).toBe('Invalid credentials');
    });

    test('should return error when user account is inactive', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.GUEST,
        status: UserStatus.INACTIVE,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.findByEmail.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const result = await AuthService.validateUser('test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account is not active');
    });
  });

  describe('login', () => {
    test('should generate JWT token successfully', async () => {
      const mockUser = {
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

      const mockToken = 'generated-jwt-token';

      mockJwt.sign.mockReturnValue(mockToken);

      const result = await AuthService.login(mockUser);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.token).toBe(mockToken);
      expect(result.data?.user).toEqual(mockUser);
      expect(result.data?.expiresIn).toBe('7d');
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          userId: '1',
          email: 'test@example.com',
          role: UserRole.GUEST,
        },
        'test-secret',
        { expiresIn: '7d' }
      );
    });

    test('should handle JWT generation error', async () => {
      const mockUser = {
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

      mockJwt.sign.mockImplementation(() => {
        throw new Error('JWT generation failed');
      });

      const result = await AuthService.login(mockUser);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Token generation failed');
    });
  });

  describe('loginWithCredentials', () => {
    test('should complete login process successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
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


      // Mock validateUser
      mockUserService.findByEmail.mockResolvedValue({
        success: true,
        data: mockUser,
      });
      mockBcrypt.compare.mockResolvedValue(true);
      mockUserService.updateLastLogin.mockResolvedValue({
        success: true,
        data: true,
      });

      // Mock login
      mockJwt.sign.mockReturnValue('generated-jwt-token');

      const result = await AuthService.loginWithCredentials(loginData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.token).toBe('generated-jwt-token');
      expect(result.data?.user.email).toBe('test@example.com');
    });

    test('should fail when credentials are invalid', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockUserService.findByEmail.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await AuthService.loginWithCredentials(loginData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed');
    });
  });

  describe('verifyToken', () => {
    test('should verify valid token successfully', async () => {
      const mockToken = 'valid-jwt-token';
      const mockPayload = {
        userId: '1',
        email: 'test@example.com',
        role: UserRole.GUEST,
        iat: 1234567890,
        exp: 1234567890 + 3600,
      };

      const mockUser = {
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

      mockJwt.verify.mockReturnValue(mockPayload);
      mockUserService.findById.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const result = await AuthService.verifyToken(mockToken);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toBe('1');
      expect(result.data?.email).toBe('test@example.com');
      expect(mockJwt.verify).toHaveBeenCalledWith(mockToken, 'test-secret');
    });

    test('should fail when token is invalid', async () => {
      const mockToken = 'invalid-jwt-token';

      mockJwt.verify.mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      const result = await AuthService.verifyToken(mockToken);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid token');
    });

    test('should fail when user is not found', async () => {
      const mockToken = 'valid-jwt-token';
      const mockPayload = {
        userId: 'nonexistent',
        email: 'test@example.com',
        role: UserRole.GUEST,
      };

      mockJwt.verify.mockReturnValue(mockPayload);
      mockUserService.findById.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await AuthService.verifyToken(mockToken);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    test('should fail when user account is inactive', async () => {
      const mockToken = 'valid-jwt-token';
      const mockPayload = {
        userId: '1',
        email: 'test@example.com',
        role: UserRole.GUEST,
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.GUEST,
        status: UserStatus.INACTIVE,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockJwt.verify.mockReturnValue(mockPayload);
      mockUserService.findById.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const result = await AuthService.verifyToken(mockToken);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account inactive');
    });
  });

  describe('refreshToken', () => {
    test('should refresh token successfully', async () => {
      const mockToken = 'valid-jwt-token';
      const mockPayload = {
        userId: '1',
        email: 'test@example.com',
        role: UserRole.GUEST,
      };

      const mockUser = {
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


      // Mock verifyToken
      mockJwt.verify.mockReturnValue(mockPayload);
      mockUserService.findById.mockResolvedValue({
        success: true,
        data: mockUser,
      });

      // Mock login for new token
      mockJwt.sign.mockReturnValue('new-jwt-token');

      const result = await AuthService.refreshToken(mockToken);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.token).toBe('new-jwt-token');
    });
  });

  describe('changePassword', () => {
    test('should change password successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'old_hashed_password',
        role: UserRole.GUEST,
        status: UserStatus.ACTIVE,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBcrypt.compare.mockResolvedValue(true);
      mockUserService.updatePassword.mockResolvedValue({
        success: true,
        data: true,
      });

      const result = await AuthService.changePassword('1', 'oldpassword', 'newpassword');

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(mockBcrypt.compare).toHaveBeenCalledWith('oldpassword', 'old_hashed_password');
      expect(mockUserService.updatePassword).toHaveBeenCalledWith('1', 'newpassword');
    });

    test('should fail when current password is wrong', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'old_hashed_password',
        role: UserRole.GUEST,
        status: UserStatus.ACTIVE,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBcrypt.compare.mockResolvedValue(false);

      const result = await AuthService.changePassword('1', 'wrongpassword', 'newpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid current password');
    });
  });
});
