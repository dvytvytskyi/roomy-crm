import { z } from 'zod';

// User validation schemas
export const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  description: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'AGENT', 'OWNER', 'GUEST']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'VIP', 'SUSPENDED']).optional(),
  country: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

// Property validation schemas
export const createPropertySchema = z.object({
  name: z.string().min(1, 'Property name is required').max(100, 'Property name is too long'),
  nickname: z.string().optional(),
  type: z.enum(['APARTMENT', 'VILLA', 'STUDIO', 'PENTHOUSE', 'HOUSE', 'CONDO']),
  typeOfUnit: z.enum(['SINGLE', 'DOUBLE', 'FAMILY', 'SHARED']),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  bedrooms: z.number().min(0, 'Bedrooms cannot be negative'),
  bathrooms: z.number().min(0, 'Bathrooms cannot be negative'),
  area: z.number().optional(),
  pricePerNight: z.number().min(0, 'Price per night must be positive'),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  houseRules: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  ownerIds: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

// Reservation validation schemas
export const createReservationSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  guestId: z.string().optional(),
  agentId: z.string().optional(),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.number().min(1, 'Number of guests must be at least 1'),
  totalAmount: z.number().min(0, 'Total amount must be positive'),
  paidAmount: z.number().optional(),
  source: z.enum(['DIRECT', 'AIRBNB', 'BOOKING_COM', 'VRBO', 'EXPEDIA', 'OTHER']).optional(),
  guestName: z.string().min(1, 'Guest name is required'),
  guestEmail: z.string().email('Invalid guest email'),
  guestPhone: z.string().optional(),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  return checkOut > checkIn;
}, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut'],
});

export const updateReservationSchema = createReservationSchema.partial();

// Owner-specific schema (simplified)
export const createOwnerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  nationality: z.string().min(1, 'Nationality is required'),
  role: z.literal('OWNER').optional(),
});

// Guest-specific schema
export const createGuestSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  nationality: z.string().min(1, 'Nationality is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone number is required'),
  dateOfBirth: z.string().optional(),
  preferredLanguage: z.string().optional(),
  role: z.literal('GUEST').optional(),
});

// Agent-specific schema
export const createAgentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  nationality: z.string().min(1, 'Nationality is required'),
  role: z.literal('AGENT').optional(),
});

// Agent update schema (for editing)
export const updateAgentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  nationality: z.string().min(1, 'Nationality is required'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  role: z.literal('AGENT').optional(),
  unitsAttracted: z.array(z.object({
    propertyId: z.string(),
    propertyName: z.string(),
    commission: z.number().optional(),
  })).optional(),
});

// Type exports for TypeScript
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type CreatePropertyData = z.infer<typeof createPropertySchema>;
export type UpdatePropertyData = z.infer<typeof updatePropertySchema>;
export type CreateReservationData = z.infer<typeof createReservationSchema>;
export type UpdateReservationData = z.infer<typeof updateReservationSchema>;
export type CreateOwnerData = z.infer<typeof createOwnerSchema>;
export type CreateGuestData = z.infer<typeof createGuestSchema>;
export type CreateAgentData = z.infer<typeof createAgentSchema>;
export type UpdateAgentData = z.infer<typeof updateAgentSchema>;
