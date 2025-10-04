import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../types/dto';

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
  UserRole: {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    AGENT: 'AGENT',
    OWNER: 'OWNER',
    GUEST: 'GUEST',
    CLEANER: 'CLEANER',
    MAINTENANCE_STAFF: 'MAINTENANCE_STAFF',
  },
  UserStatus: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    SUSPENDED: 'SUSPENDED',
    VIP: 'VIP',
  },
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('UserService', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $disconnect: jest.fn(),
    };
    
    (PrismaClient as jest.Mock).mockImplementation(() => mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    test('should find user by email successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'hashed_password',
        role: UserRole.GUEST,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await UserService.findByEmail('test@example.com');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.email).toBe('test@example.com');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    test('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await UserService.findByEmail('nonexistent@example.com');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('findById', () => {
    test('should find user by ID successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'hashed_password',
        role: UserRole.GUEST,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await UserService.findById('1');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('1');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    test('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await UserService.findById('nonexistent');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('create', () => {
    test('should create user successfully', async () => {
      const userData: CreateUserDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.GUEST,
      };

      const mockCreatedUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'hashed_password',
        role: UserRole.GUEST,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock findByEmail to return null (user doesn't exist)
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);

      const result = await UserService.create(userData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.email).toBe('test@example.com');
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          passwordHash: 'hashed_password',
          phone: undefined,
          role: UserRole.GUEST,
          status: UserStatus.ACTIVE,
          avatar: undefined,
          country: undefined,
          flag: undefined,
        },
      });
    });

    test('should fail when user already exists', async () => {
      const userData: CreateUserDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'existing@example.com',
        password: 'password123',
      };

      const existingUser = {
        id: '1',
        email: 'existing@example.com',
        firstName: 'Existing',
        lastName: 'User',
        passwordHash: 'hashed_password',
        role: UserRole.GUEST,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      const result = await UserService.create(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('User already exists');
    });

    test('should fail when required fields are missing', async () => {
      const userData: CreateUserDto = {
        firstName: 'Test',
        lastName: 'User',
        email: '',
        password: 'password123',
      };

      const result = await UserService.create(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required fields');
    });
  });

  describe('findAll', () => {
    test('should find all users with pagination', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
          passwordHash: 'hashed_password',
          role: UserRole.GUEST,
          status: UserStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          email: 'user2@example.com',
          firstName: 'User',
          lastName: 'Two',
          passwordHash: 'hashed_password',
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.user.count.mockResolvedValue(2);
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await UserService.findAll({ page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.data).toHaveLength(2);
      expect(result.data?.pagination.total).toBe(2);
      expect(result.data?.pagination.page).toBe(1);
      expect(result.data?.pagination.limit).toBe(10);
    });

    test('should filter users by role', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          passwordHash: 'hashed_password',
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.user.count.mockResolvedValue(1);
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await UserService.findAll({ 
        page: 1, 
        limit: 10, 
        role: UserRole.ADMIN 
      });

      expect(result.success).toBe(true);
      expect(result.data?.data).toHaveLength(1);
      expect(result.data?.data[0]?.role).toBe(UserRole.ADMIN);
    });
  });
});
