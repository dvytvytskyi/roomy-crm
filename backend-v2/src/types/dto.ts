import { UserRole } from '@prisma/client';

// Define UserStatus locally since it's not exported from @prisma/client
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';

// Existing imports and types...
export interface CreateUserDto {
  email: string;
  password?: string; // Optional: will be auto-generated if not provided
  firstName: string;
  lastName: string;
  phone?: string;
  description?: string;
  role?: UserRole;
  status?: string;
  nationality?: string;
  dateOfBirth?: string;
  whatsapp?: string;
  telegram?: string;
  comments?: string;
  paymentPreferences?: string;
  personalStayDays?: number;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  description?: string;
  role?: UserRole;
  status?: string;
  nationality?: string;
  dateOfBirth?: string;
  whatsapp?: string;
  telegram?: string;
  comments?: string;
  paymentPreferences?: string;
  personalStayDays?: number;
  units?: Array<{
    id: string;
    name: string;
    propertyId: string;
    commission?: number;
    status?: string;
    referralDate?: string;
  }>;
}

export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  description?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  country?: string;
  flag?: string;
  isVerified: boolean;
  lastLoginAt?: string;
  nationality?: string;
  dateOfBirth?: string;
  whatsapp?: string;
  telegram?: string;
  comments?: string;
  paymentPreferences?: string;
  personalStayDays?: number;
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
  
  // New fields for property details
  summary?: string;
  theSpace?: string;
  guestAccess?: string;
  otherThings?: string;
  
  // Availability settings
  bookingWindow?: string;
  advanceNotice?: string;
  minStay?: number;
  maxStay?: number;
  
  // Utilities and additional settings
  utilities?: string[];
  incomeDistribution?: any;
  
  // Financial settings
  agencyFeePercentage?: number;
  referringAgentFeePercentage?: number;
  dtcmLicenseExpiry?: string;
  
  // Additional property details
  parkingSlots?: number;
  checkInTime?: string;
  checkOutTime?: string;
  
  // Airbnb enrichment fields
  bedsConfiguration?: any; // JSON array of bed configurations
  externalRating?: number;
  externalReviewCount?: number;
  allowsPets?: boolean;
  externalCancellationPolicy?: string;
  
  // Photos array for Airbnb import
  photos?: Array<{
    url: string;
    isCover?: boolean;
    alt?: string;
    order?: number;
  }>;
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
  
  // New fields for property details
  summary?: string;
  theSpace?: string;
  guestAccess?: string;
  otherThings?: string;
  
  // Availability settings
  bookingWindow?: string;
  advanceNotice?: string;
  minStay?: number;
  maxStay?: number;
  
  // Utilities and additional settings
  utilities?: string[];
  incomeDistribution?: any;
  
  // Financial settings
  agencyFeePercentage?: number;
  referringAgentFeePercentage?: number;
  dtcmLicenseExpiry?: string;
  
  // Additional property details
  parkingSlots?: number;
  checkInTime?: string;
  checkOutTime?: string;
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
  
  // New fields for property details
  summary?: string;
  theSpace?: string;
  guestAccess?: string;
  otherThings?: string;
  
  // Availability settings
  bookingWindow?: string;
  advanceNotice?: string;
  minStay?: number;
  maxStay?: number;
  
  // Utilities and additional settings
  utilities: string[];
  incomeDistribution?: any;
  
  // Financial settings
  agencyFeePercentage?: number;
  referringAgentFeePercentage?: number;
  dtcmLicenseExpiry?: string;
  
  // Additional property details
  parkingSlots?: number;
  checkInTime?: string;
  checkOutTime?: string;
  
  // Airbnb enrichment fields
  bedsConfiguration?: any; // JSON array of bed configurations
  externalRating?: number;
  externalReviewCount?: number;
  allowsPets?: boolean;
  externalCancellationPolicy?: string;
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
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
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
    documents: number;
    activity_log: number;
  };
  // Include related data
  transactions?: any[];
  documents?: any[];
  activity_log?: any[];
  reservations?: any[];
}

// Bank Account DTOs
export interface CreateBankAccountDto {
  bank_name: string;
  account_holder: string;
  account_number: string;
  iban?: string;
  swift_code?: string;
  routing_number?: string;
  account_type?: string;
  currency?: string;
  is_primary?: boolean;
}

export interface UpdateBankAccountDto {
  bank_name?: string;
  account_holder?: string;
  account_number?: string;
  iban?: string;
  swift_code?: string;
  routing_number?: string;
  account_type?: string;
  currency?: string;
  is_primary?: boolean;
  is_active?: boolean;
}

export interface BankAccountResponseDto {
  id: string;
  user_id: string;
  bank_name: string;
  account_holder: string;
  account_number: string;
  iban?: string;
  swift_code?: string;
  routing_number?: string;
  account_type: string;
  currency: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Transaction DTOs
export interface CreateTransactionDto {
  property_id?: string;
  reservation_id?: string;
  type: string;
  category: string;
  amount: number;
  currency?: string;
  description?: string;
  platform?: string;
  platform_fee?: number;
  transaction_fee?: number;
  payment_method?: string;
  payment_reference?: string;
}

export interface UpdateTransactionDto {
  type?: string;
  category?: string;
  amount?: number;
  currency?: string;
  description?: string;
  platform?: string;
  platform_fee?: number;
  transaction_fee?: number;
  status?: string;
  payment_method?: string;
  payment_reference?: string;
  processed_at?: string;
}

export interface TransactionResponseDto {
  id: string;
  transaction_id: string;
  property_id?: string;
  reservation_id?: string;
  user_id?: string;
  type: string;
  category: string;
  amount: number;
  currency: string;
  description?: string;
  platform?: string;
  platform_fee?: number;
  transaction_fee?: number;
  net_amount: number;
  status: string;
  payment_method?: string;
  payment_reference?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

// Document DTOs
export interface CreateDocumentDto {
  name: string;
  type: string; // e.g., 'PDF', 'DOC', 'IMAGE'
  filename: string;
  size: string; // e.g., '2.5 MB'
  s3_key?: string;
  s3_url?: string;
  uploaded_by?: string;
}

export interface UpdateDocumentDto {
  name?: string;
  type?: string;
  filename?: string;
  size?: string;
  s3_key?: string;
  s3_url?: string;
  uploaded_by?: string;
}

export interface DocumentResponseDto {
  id: string;
  user_id: string;
  name: string;
  type: string;
  filename: string;
  size: string;
  s3_key?: string;
  s3_url?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

// Activity Log DTOs
export interface CreateActivityLogDto {
  action: string; // e.g., 'Document Uploaded', 'Profile Updated'
  description: string; // Detailed description of the action
  type: string; // e.g., 'create', 'update', 'delete', 'payment', 'document', 'unit'
  performed_by?: string; // User who performed the action
  metadata?: any; // Additional metadata about the action
}

export interface ActivityLogResponseDto {
  id: string;
  user_id: string;
  action: string;
  description: string;
  type: string;
  performed_by?: string;
  metadata?: any;
  created_at: string;
}