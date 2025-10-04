/**
 * Jest Setup File
 * 
 * Global test configuration and setup
 */

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

// Mock notification service
jest.mock('../src/services/NotificationService', () => ({
  sendReservationConfirmation: jest.fn(),
  sendPaymentConfirmation: jest.fn(),
  sendOwnerPayout: jest.fn(),
  sendTaskAssignment: jest.fn(),
  sendNotification: jest.fn(),
}));

// Global test utilities
global.testUtils = {
  createMockReservation: (overrides = {}) => ({
    id: 'reservation-1',
    propertyId: 'property-1',
    guestId: 'guest-1',
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    checkInDate: new Date('2024-02-01'),
    checkOutDate: new Date('2024-02-03'),
    totalAmount: 1000,
    status: 'PENDING',
    property: {
      id: 'property-1',
      name: 'Luxury Apartment',
      owner: {
        id: 'owner-1',
        email: 'owner@example.com'
      }
    },
    guest: {
      id: 'guest-1',
      email: 'john@example.com'
    },
    ...overrides
  }),

  createMockProperty: (overrides = {}) => ({
    id: 'property-1',
    name: 'Luxury Apartment',
    nickname: 'Luxury Apt',
    status: 'ACTIVE',
    type: 'APARTMENT',
    capacity: 4,
    bedrooms: 2,
    bathrooms: 2,
    pricePerNight: 500,
    owner: {
      id: 'owner-1',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'owner@example.com'
    },
    ...overrides
  }),

  createMockUser: (overrides = {}) => ({
    id: 'user-1',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'GUEST',
    status: 'ACTIVE',
    ...overrides
  }),

  createMockTask: (overrides = {}) => ({
    id: 'task-1',
    propertyId: 'property-1',
    reservationId: 'reservation-1',
    type: 'CLEANING',
    title: 'Pre-arrival cleaning',
    status: 'PENDING',
    priority: 'HIGH',
    cost: 150,
    ...overrides
  }),

  createMockTransaction: (overrides = {}) => ({
    id: 'transaction-1',
    userId: 'user-1',
    propertyId: 'property-1',
    reservationId: 'reservation-1',
    type: 'GUEST_PAYMENT',
    amount: 1000,
    currency: 'AED',
    status: 'COMPLETED',
    ...overrides
  })
};

// Setup global error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
