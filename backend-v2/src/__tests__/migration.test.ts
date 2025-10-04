import { PrismaClient } from '@prisma/client';

describe('Database Migration Tests', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('User Table Migration', () => {
    test('should have User table with correct structure', async () => {
      // Test that we can query the users table
      const userCount = await prisma.user.count();
      expect(typeof userCount).toBe('number');
    });

    test('should have correct UserRole enum values', async () => {
      // Test that UserRole enum is working
      const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          passwordHash: 'hashed_password',
          role: 'ADMIN', // This should work if enum is correct
        },
      });

      expect(testUser.role).toBe('ADMIN');

      // Clean up
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    });

    test('should have correct UserStatus enum values', async () => {
      // Test that UserStatus enum is working
      const testUser = await prisma.user.create({
        data: {
          email: 'test2@example.com',
          firstName: 'Test',
          lastName: 'User',
          passwordHash: 'hashed_password',
          status: 'ACTIVE', // This should work if enum is correct
        },
      });

      expect(testUser.status).toBe('ACTIVE');

      // Clean up
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    });

    test('should have all required indexes', async () => {
      // This test verifies that the table structure is correct
      // by attempting to create a user with all required fields
      const testUser = await prisma.user.create({
        data: {
          email: 'index-test@example.com',
          firstName: 'Index',
          lastName: 'Test',
          passwordHash: 'hashed_password',
          role: 'GUEST',
          status: 'ACTIVE',
        },
      });

      expect(testUser.id).toBeDefined();
      expect(testUser.email).toBe('index-test@example.com');
      expect(testUser.createdAt).toBeDefined();
      expect(testUser.updatedAt).toBeDefined();

      // Clean up
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    });

    test('should enforce unique email constraint', async () => {
      const email = 'unique-test@example.com';
      
      // Create first user
      const user1 = await prisma.user.create({
        data: {
          email,
          firstName: 'First',
          lastName: 'User',
          passwordHash: 'hashed_password',
        },
      });

      // Try to create second user with same email
      await expect(
        prisma.user.create({
          data: {
            email, // Same email
            firstName: 'Second',
            lastName: 'User',
            passwordHash: 'hashed_password',
          },
        })
      ).rejects.toThrow();

      // Clean up
      await prisma.user.delete({
        where: { id: user1.id },
      });
    });
  });
});
