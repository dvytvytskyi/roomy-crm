import { UserRole, UserStatus } from '@prisma/client';

// Create User DTO
export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  avatar?: string;
  country?: string;
  flag?: string;
}

// Update User DTO
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  avatar?: string;
  country?: string;
  flag?: string;
  isVerified?: boolean;
}

// Login DTO
export interface LoginDto {
  email: string;
  password: string;
}

// User Response DTO (without sensitive data)
export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  country?: string;
  flag?: string;
  isVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Pagination Options
export interface PaginationOptions {
  page: number;
  limit: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Auth Response
export interface AuthResponseDto {
  user: UserResponseDto;
  token: string;
  expiresIn: string;
}

// Current User Interface for Services
export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

// Query Parameters for Services
export interface UserQueryParams extends PaginationOptions {
  search?: string;
  status?: UserStatus;
}

export interface PropertyQueryParams extends PaginationOptions {
  search?: string;
  type?: string;
  status?: string;
  ownerId?: string;
  agentId?: string;
}

export interface ReservationQueryParams extends PaginationOptions {
  search?: string;
  status?: string;
  propertyId?: string;
  guestId?: string;
  agentId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Extended User Response with Statistics
export interface UserWithStatsDto extends UserResponseDto {
  _count?: {
    properties?: number;
    reservations?: number;
    transactions?: number;
  };
}

// Create Property DTO
export interface CreatePropertyDto {
  name: string;
  nickname?: string;
  title?: string;
  type: string;
  typeOfUnit?: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  pricePerNight: number;
  description?: string;
  amenities?: string[];
  houseRules?: string[];
  tags?: string[];
  ownerId: string;
  agentId?: string;
}

// Update Property DTO
export interface UpdatePropertyDto {
  name?: string;
  nickname?: string;
  title?: string;
  type?: string;
  typeOfUnit?: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  pricePerNight?: number;
  description?: string;
  amenities?: string[];
  houseRules?: string[];
  tags?: string[];
  isActive?: boolean;
  isPublished?: boolean;
  ownerId?: string;
  agentId?: string;
}

// Create Reservation DTO
export interface CreateReservationDto {
  propertyId: string;
  guestId?: string;
  agentId?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  source: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  specialRequests?: string;
  notes?: string;
}

// Update Reservation DTO
export interface UpdateReservationDto {
  propertyId?: string;
  guestId?: string;
  agentId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  totalAmount?: number;
  paidAmount?: number;
  outstandingBalance?: number;
  status?: string;
  source?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  specialRequests?: string;
  notes?: string;
}
