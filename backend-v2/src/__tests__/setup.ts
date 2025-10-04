import { PrismaClient } from '@prisma/client';

// Global test setup
beforeAll(async () => {
  // Setup test database connection
  process.env['NODE_ENV'] = 'test';
  process.env['DATABASE_URL'] = process.env['TEST_DATABASE_URL'] || 'postgresql://test:test@localhost:5432/roomy_test_db';
});

afterAll(async () => {
  // Cleanup after all tests
  const prisma = new PrismaClient();
  await prisma.$disconnect();
});

beforeEach(() => {
  // Setup before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
});

// Global test utilities
declare global {
  var testUtils: any;
}

global.testUtils = {
  // Add test utilities here
};
