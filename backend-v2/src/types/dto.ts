import { UserRole } from '@prisma/client';

// Existing imports and types...
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
  status?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  status?: string;
}

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
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: string;
}

export interface PropertyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  isActive?: boolean;
  ownerId?: string;
  agentId?: string;
}

export interface CreatePropertyDto {
  name: string;
  nickname?: string;
  title?: string;
  type: string;
  typeOfUnit: string;
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
  primaryImage?: string;
  pricelabId?: string;
  ownerId?: string;
  agentId?: string;
}

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
  primaryImage?: string;
  pricelabId?: string;
  ownerId?: string;
  agentId?: string;
}

export interface PropertyResponseDto {
  id: string;
  name: string;
  nickname?: string;
  title?: string;
  type: string;
  typeOfUnit: string;
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
  amenities: string[];
  houseRules: string[];
  tags: string[];
  isActive: boolean;
  isPublished: boolean;
  primaryImage?: string;
  pricelabId?: string;
  createdAt: string;
  updatedAt: string;
  ownerId?: string;
  agentId?: string;
}

export interface PropertyWithDetailsDto extends PropertyResponseDto {
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  agent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    reservations?: number;
    tasks?: number;
  };
}

export interface ReservationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  propertyId?: string;
  guestId?: string;
  agentId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateReservationDto {
  propertyId: string;
  guestId?: string;
  agentId?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  paidAmount?: number;
  outstandingBalance?: number;
  source?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  specialRequests?: string;
  notes?: string;
}

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

export interface ReservationResponseDto {
  id: string;
  reservationId: string;
  propertyId: string;
  guestId?: string;
  agentId?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  paidAmount: number;
  outstandingBalance: number;
  status: string;
  source: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  specialRequests?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Task DTOs
export interface TaskQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string[];
  priority?: string[];
  propertyId?: string;
  assignedTo?: string;
  createdBy?: string;
  scheduledDateFrom?: string;
  scheduledDateTo?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  type: 'CLEANING' | 'MAINTENANCE';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  propertyId: string;
  assignedTo?: string;
  scheduledDate?: string;
  estimatedDuration?: string;
  cost?: number;
  notes?: string;
  checklistItems?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedDuration?: string;
  actualDuration?: string;
  cost?: number;
  notes?: string;
}

export interface TaskResponseDto {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  propertyId: string;
  assignedTo?: string;
  createdBy: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedDuration?: string;
  actualDuration?: string;
  cost?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskWithDetailsDto extends TaskResponseDto {
  property?: {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
  };
  assignedUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  checklistItems?: TaskChecklistItemDto[];
  comments?: TaskCommentDto[];
  attachments?: TaskAttachmentDto[];
  _count?: {
    comments?: number;
    checklistItems?: number;
    attachments?: number;
  };
}

export interface TaskChecklistItemDto {
  id: string;
  item: string;
  completed: boolean;
  order: number;
  createdAt: string;
}

export interface TaskCommentDto {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface TaskAttachmentDto {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface TaskStatsDto {
  totalTasks: number;
  scheduledTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  onHoldTasks: number;
  overdueTasks: number;
}

export interface UpdateTaskStatusDto {
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
  notes?: string;
}

export interface CreateTaskCommentDto {
  content: string;
  type?: string;
}

export interface UpdateTaskChecklistItemDto {
  completed: boolean;
}

// Scheduler DTOs
export interface CreateManualBlockDto {
  propertyId: string;
  startDate: string;
  endDate: string;
  title: string;
  notes?: string;
}

export interface ManualBlockResponseDto {
  id: string;
  propertyId: string;
  property: {
    id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  title: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface SchedulerEventDto {
  id: string;
  type: 'reservation' | 'block';
  title: string;
  startDate: string;
  endDate: string;
  propertyId: string;
  property: {
    id: string;
    name: string;
  };
  // Additional fields for reservations
  status?: string;
  guestName?: string;
  totalAmount?: number;
  guestsCount?: number;
  // Additional fields for blocks
  notes?: string;
  createdBy?: string;
}

export interface SchedulerEventsResponseDto {
  events: SchedulerEventDto[];
  total: number;
}

// Settings DTOs
export interface SettingDto {
  key: string;
  value: string;
  description: string;
  category: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsResponseDto {
  settings: SettingDto[];
  total: number;
}

export interface UpdateSettingDto {
  value: string;
}

export interface CreateTaskChecklistItemDto {
  item: string;
  order?: number;
}

// Additional types for user management
export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationOptions;
}

export interface UserWithStatsDto extends UserResponseDto {
  _count: {
    properties: number;
    reservations: number;
    transactions: number;
  };
}