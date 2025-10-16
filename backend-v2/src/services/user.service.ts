import { PrismaClient, User, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { BaseService } from './BaseService';
import { ServiceResponse } from '../types';
import { CreateUserDto, UpdateUserDto, UserResponseDto, PaginationOptions, PaginatedResponse, CurrentUser, UserQueryParams, UserWithStatsDto, CreateBankAccountDto, UpdateBankAccountDto, BankAccountResponseDto, CreateTransactionDto, UpdateTransactionDto, TransactionResponseDto, CreateDocumentDto, UpdateDocumentDto, DocumentResponseDto, CreateActivityLogDto, ActivityLogResponseDto } from '../types/dto';
import logger from '../utils/logger';

export class UserService extends BaseService {
  private static instance: UserService;

  private constructor() {
    super();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Find user by email
   */
  public static async findByEmail(email: string): Promise<ServiceResponse<UserResponseDto | null>> {
    try {
      const prisma = new PrismaClient();
      
      const user = await prisma.user.findUnique({
        where: { email },
      });

      await prisma.$disconnect();

      if (!user) {
        return UserService.prototype.success(null);
      }

      const userResponse = UserService.mapToUserResponse(user);
      return UserService.prototype.success(userResponse);
    } catch (error) {
      logger.error('Error finding user by email:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Find user by ID
   */
  public static async findById(id: string): Promise<ServiceResponse<UserResponseDto | null>> {
    try {
      const prisma = new PrismaClient();
      
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          description: true,
          role: true,
          is_active: true,
          avatar: true,
          isVerified: true,
          last_login: true,
          nationality: true,
          date_of_birth: true,
          whatsapp: true,
          telegram: true,
          comments: true, // CRITICAL: Include comments field for units data
          payment_preferences: true,
          personal_stay_days: true,
          createdAt: true,
          updatedAt: true,
          // Include guest reservations for activity
          reservations_reservations_guest_idTousers: {
            include: {
              properties: {
                select: {
                  name: true,
                  nickname: true
                }
              }
            },
            orderBy: { created_at: 'desc' },
            take: 5
          },
          // Include documents
          documents: {
            orderBy: { created_at: 'desc' },
            take: 10
          },
          // Include activity log
          activity_log: {
            orderBy: { created_at: 'desc' },
            take: 10
          }
        }
      });

      await prisma.$disconnect();

      if (!user) {
        return UserService.prototype.success(null);
      }

      console.log('🔍 findById: Raw user from DB:', user);
      console.log('🔍 findById: User comments from DB:', user.comments);

      const userResponse = UserService.mapToUserResponse(user);
      return UserService.prototype.success(userResponse);
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }




  /**
   * Delete user
   */
  public static async delete(currentUser: CurrentUser, id: string): Promise<ServiceResponse<UserResponseDto>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[User Deactivation] Starting user deactivation for ID: ${id}`);

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'User not found');
      }

      // Check permissions - only ADMIN and MANAGER can deactivate users
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        await prisma.$disconnect();
        return UserService.prototype.error('Forbidden', 'Only ADMIN and MANAGER can deactivate users');
      }

      // Prevent self-deactivation
      if (currentUser.id === id) {
        await prisma.$disconnect();
        return UserService.prototype.error('Bad Request', 'You cannot deactivate your own account');
      }

      // Check if user is already deactivated
      if (!existingUser.is_active) {
        await prisma.$disconnect();
        return UserService.prototype.error('Bad Request', 'User is already deactivated');
      }

      // Deactivate user (soft delete) in transaction with audit logging
      const result = await prisma.$transaction(async (tx) => {
        logger.info(`[User Deactivation Step 1/2] Deactivating user...`);
        
        // Create audit log BEFORE deactivation
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.audit_logs.create({
          data: {
            id: auditId,
            user_id: currentUser.id,
            action: 'USER_DEACTIVATED',
            entity_type: 'USER',
            entity_id: id,
            ip_address: '127.0.0.1',
            user_agent: 'Backend-V2-UserService',
            changes: {
              deactivated_by: currentUser.email,
              user_email: existingUser.email,
              action: 'deactivated',
              reason: 'User deactivated by admin'
            }
          }
        });

        logger.info(`[User Deactivation Step 2/2] Setting is_active to false...`);
        
        // Deactivate user (soft delete)
        const deactivatedUser = await tx.user.update({
          where: { id },
          data: { is_active: false },
        });

        logger.info(`[User Deactivation END] User deactivated: ${deactivatedUser.email}`);
        return deactivatedUser;
      });

      await prisma.$disconnect();

      const userResponse = UserService.mapToUserResponse(result);
      logger.info(`User deactivated successfully: ${result.email} by ${currentUser.email}`);
      return UserService.prototype.success(userResponse, 'User deactivated successfully');
    } catch (error) {
      logger.error('Error deleting user:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Update user password
   */
  public static async updatePassword(id: string, newPassword: string): Promise<ServiceResponse<boolean>> {
    try {
      const prisma = new PrismaClient();

      // Check if user exists
      const existingUser = await UserService.findById(id);
      if (!existingUser.success || !existingUser.data) {
        await prisma.$disconnect();
        return UserService.prototype.error('User not found', 'The specified user does not exist');
      }

      // Hash new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      await prisma.user.update({
        where: { id },
        data: { password: passwordHash },
      });

      await prisma.$disconnect();

      logger.info(`Password updated for user: ${existingUser.data.email}`);
      return UserService.prototype.success(true, 'Password updated successfully');
    } catch (error) {
      logger.error('Error updating password:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Create new user
   */
  public static async create(currentUser: CurrentUser, data: CreateUserDto): Promise<ServiceResponse<UserResponseDto>> {
    try {
      const prisma = new PrismaClient();

      // Validate permissions
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        await prisma.$disconnect();
        return UserService.prototype.error('Forbidden', 'Only ADMIN and MANAGER can create users');
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        await prisma.$disconnect();
        return UserService.prototype.error('Conflict', 'User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      logger.info(`[User Creation] Starting user creation for role: ${data.role}`);

      // Create user in a transaction
      const result = await prisma.$transaction(async (tx) => {
        logger.info(`[User Creation Step 1/3] Creating user record...`);
        
        // Create user
        const user = await tx.user.create({
          data: {
            email: data.email,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || null,
            description: data.description || null,
            role: data.role || 'GUEST',
            is_active: data.status === 'ACTIVE' || data.status === undefined,
            isVerified: false,
            nationality: data.nationality || null,
            date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
            whatsapp: data.whatsapp || null,
            telegram: data.telegram || null,
            comments: data.comments || null,
            payment_preferences: data.paymentPreferences || null,
            personal_stay_days: data.personalStayDays || 30,
          },
        });

        logger.info(`[User Creation Step 2/3] User created with ID: ${user.id}`);

        // For OWNER role, we don't need to create separate PropertyOwner records
        // The relationship is handled through properties.owner_id directly
        if (data.role === 'OWNER') {
          logger.info(`[User Creation Step 3/3] Owner user created - properties can be assigned later`);
        } else {
          logger.info(`[User Creation Step 3/3] User creation completed for role: ${data.role}`);
        }

        // Create audit log
        const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await tx.audit_logs.create({
          data: {
            id: auditId,
            user_id: currentUser.id,
            action: 'USER_CREATED',
            entity_type: 'USER',
            entity_id: user.id,
            ip_address: '127.0.0.1',
            user_agent: 'Backend-V2-UserService',
            changes: {
              created_by: currentUser.email,
              user_role: data.role,
              user_email: data.email
            }
          }
        });

        logger.info(`[User Creation END] User created successfully: ${user.email}`);
        return user;
      });

      await prisma.$disconnect();


      const userResponse = UserService.mapToUserResponse(result);
      logger.info(`User created successfully: ${result.email} by ${currentUser.email}`);
      return UserService.prototype.success(userResponse, 'User created successfully');
    } catch (error) {
      logger.error('Error creating user:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Update user
   */
  public static async update(currentUser: CurrentUser, id: string, data: UpdateUserDto): Promise<ServiceResponse<UserResponseDto>> {
    try {
      const prisma = new PrismaClient();

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'User not found');
      }

      // Check permissions
      const canEdit = currentUser.role === 'ADMIN' || 
                     currentUser.role === 'MANAGER' || 
                     currentUser.id === id;

      if (!canEdit) {
        await prisma.$disconnect();
        return UserService.prototype.error('Forbidden', 'You can only edit your own profile');
      }

      // If trying to change email, check if new email already exists
      if (data.email && data.email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: data.email },
        });

        if (emailExists) {
          await prisma.$disconnect();
          return UserService.prototype.error('Conflict', 'User with this email already exists');
        }
      }

      // Build update data
      const updateData: any = {};
      if (data.firstName !== undefined) updateData.firstName = data.firstName;
      if (data.lastName !== undefined) updateData.lastName = data.lastName;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.nationality !== undefined) updateData.nationality = data.nationality;
      if (data.dateOfBirth !== undefined) updateData.date_of_birth = new Date(data.dateOfBirth);
      if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
      if (data.telegram !== undefined) updateData.telegram = data.telegram;
      if (data.comments !== undefined) updateData.comments = data.comments;
      if (data.paymentPreferences !== undefined) updateData.paymentPreferences = data.paymentPreferences;
      if (data.personalStayDays !== undefined) updateData.personalStayDays = data.personalStayDays;
      
      // Store units in comments field as JSON for agents
      if (data.units !== undefined) {
        console.log('🔍 update: Storing units for user:', id, 'units:', data.units);
        if (data.units.length > 0) {
          updateData.comments = JSON.stringify({ units: data.units });
          console.log('🔍 update: Stored units in comments:', updateData.comments);
        } else {
          updateData.comments = null;
          console.log('🔍 update: Cleared comments (no units)');
        }
      }

      // Only ADMIN can change role and status
      if (currentUser.role === 'ADMIN') {
        if (data.role !== undefined) updateData.role = data.role;
        if (data.status !== undefined) updateData.is_active = data.status === 'ACTIVE';
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          description: true,
          role: true,
          is_active: true,
          avatar: true,
          isVerified: true,
          last_login: true,
          nationality: true,
          date_of_birth: true,
          whatsapp: true,
          telegram: true,
          comments: true,
          payment_preferences: true,
          personal_stay_days: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      // Log audit action
      const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await prisma.audit_logs.create({
        data: {
          id: auditId,
          user_id: currentUser.id,
          action: 'UPDATE_USER',
          entity_type: 'USER',
          entity_id: id,
          changes: {
            updated_fields: Object.keys(updateData),
            target_user_email: existingUser.email,
          },
          ip_address: '127.0.0.1', // TODO: Get from request
          user_agent: 'Backend-V2',
        },
      });

      await prisma.$disconnect();

      const userResponse = UserService.mapToUserResponse(updatedUser);
      logger.info(`User updated: ${updatedUser.email} by ${currentUser.email}`);
      return UserService.prototype.success(userResponse);
    } catch (error) {
      logger.error('Error updating user:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Update last login time
   */
  public static async updateLastLogin(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const prisma = new PrismaClient();

      await prisma.user.update({
        where: { id },
        data: { last_login: new Date() },
      });

      await prisma.$disconnect();

      return UserService.prototype.success(true);
    } catch (error) {
      logger.error('Error updating last login:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Find all users with role-based access control
   */
  public static async findAll(currentUser: CurrentUser, queryParams: UserQueryParams): Promise<ServiceResponse<PaginatedResponse<UserWithStatsDto>>> {
    try {
      const prisma = new PrismaClient();
      const { page = 1, limit = 10, role, status, search } = queryParams;
      const offset = (page - 1) * limit;

      // Build where clause based on user role
      let where: any = {};

      switch (currentUser.role) {
        case 'ADMIN':
        case 'MANAGER':
          // ADMIN and MANAGER can see all users
          break;
        
        case 'AGENT':
          // AGENT can see guests who have reservations for their properties
          const agentReservations = await prisma.reservations.findMany({
            where: { agent_id: currentUser.id },
            select: { guest_id: true }
          });
          const guestIds = agentReservations.map(r => r.guest_id).filter(Boolean);
          where = {
            OR: [
              { id: currentUser.id }, // Can see themselves
              { id: { in: guestIds } } // Can see their guests
            ]
          };
          break;
        
        case 'OWNER':
          // OWNER can see guests who have reservations for their properties
          const ownerReservations = await prisma.reservations.findMany({
            where: { 
              properties: { owner_id: currentUser.id }
            },
            select: { guest_id: true }
          });
          const ownerGuestIds = ownerReservations.map(r => r.guest_id).filter(Boolean);
          where = {
            OR: [
              { id: currentUser.id }, // Can see themselves
              { id: { in: ownerGuestIds } } // Can see their guests
            ]
          };
          break;
        
        default:
          // GUEST and others can only see themselves
          where = { id: currentUser.id };
      }

      // Add additional filters
      if (role) {
        where.role = role;
        logger.info(`[Find All Users] Filtering by role: ${role}`);
      }
      if (status) where.is_active = status === 'ACTIVE';
      
      if (search) {
        where.OR = [
          ...(where.OR || []),
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get total count
      const total = await prisma.user.count({ where });

      // Get users with statistics
      const users = await prisma.user.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
        _count: {
          select: {
            properties_properties_owner_idTousers: true,
            properties_properties_agent_idTousers: true,
            reservations_reservations_guest_idTousers: true,
            reservations_reservations_agent_idTousers: true,
            transactions: true,
            documents: true,
            activity_log: true
          }
        }
        }
      });

      await prisma.$disconnect();

      // Map to response DTOs with statistics
      const userResponses: UserWithStatsDto[] = users.map(user => ({
        ...UserService.mapToUserResponse(user),
        _count: {
          properties: user._count.properties_properties_owner_idTousers + user._count.properties_properties_agent_idTousers,
          reservations: user._count.reservations_reservations_guest_idTousers + user._count.reservations_reservations_agent_idTousers,
          transactions: user._count.transactions,
          documents: user._count.documents,
          activity_log: user._count.activity_log
        }
      }));

      // Create pagination metadata
      const pagination = UserService.prototype.createPaginationMetadata(page, limit, total);

      const result: PaginatedResponse<UserWithStatsDto> = {
        data: userResponses,
        pagination,
      };

      return UserService.prototype.success(result);
    } catch (error) {
      logger.error('Error finding all users with RBAC:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Find user by ID with role-based access control
   */
  public static async findByIdWithRBAC(currentUser: CurrentUser, id: string): Promise<ServiceResponse<UserWithStatsDto | null>> {
    try {
      const prisma = new PrismaClient();

      // Check access permissions
      let hasAccess = false;

      switch (currentUser.role) {
        case 'ADMIN':
        case 'MANAGER':
          // ADMIN and MANAGER can see any user
          hasAccess = true;
          break;
        
        case 'AGENT':
          // AGENT can see themselves or guests who have reservations for their properties
          if (id === currentUser.id) {
            hasAccess = true;
          } else {
            const hasGuestReservation = await prisma.reservations.findFirst({
              where: {
                guest_id: id,
                agent_id: currentUser.id
              }
            });
            hasAccess = !!hasGuestReservation;
          }
          break;
        
        case 'OWNER':
          // OWNER can see themselves or guests who have reservations for their properties
          if (id === currentUser.id) {
            hasAccess = true;
          } else {
            const hasGuestReservation = await prisma.reservations.findFirst({
              where: {
                guest_id: id,
                properties: { owner_id: currentUser.id }
              }
            });
            hasAccess = !!hasGuestReservation;
          }
          break;
        
        default:
          // Others can only see themselves
          hasAccess = id === currentUser.id;
      }

      if (!hasAccess) {
        await prisma.$disconnect();
        return UserService.prototype.error('Access denied', 'You do not have permission to view this user');
      }

      // Get user with statistics and related data
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              properties_properties_owner_idTousers: true,
              properties_properties_agent_idTousers: true,
              reservations_reservations_guest_idTousers: true,
              reservations_reservations_agent_idTousers: true,
              transactions: true,
              documents: true,
              activity_log: true
            }
          },
          // Include related data for owners
          transactions: {
            orderBy: { created_at: 'desc' },
            take: 50 // Limit to recent transactions
          },
          // Include documents for guests
          documents: {
            orderBy: { created_at: 'desc' },
            take: 10 // Limit to recent documents
          },
          // Include activity log for guests
          activity_log: {
            orderBy: { created_at: 'desc' },
            take: 10 // Limit to recent activities
          },
          // Include guest reservations for activity
          reservations_reservations_guest_idTousers: {
            include: {
              properties: {
                select: {
                  name: true,
                  nickname: true
                }
              }
            },
            orderBy: { created_at: 'desc' },
            take: 5 // Limit to recent reservations
          }
        }
      });

      await prisma.$disconnect();

      if (!user) {
        return UserService.prototype.success(null);
      }

      const userResponse: UserWithStatsDto = {
        ...UserService.mapToUserResponse(user),
        _count: {
          properties: user._count.properties_properties_owner_idTousers + user._count.properties_properties_agent_idTousers,
          reservations: user._count.reservations_reservations_guest_idTousers + user._count.reservations_reservations_agent_idTousers,
          transactions: user._count.transactions,
          documents: user._count.documents,
          activity_log: user._count.activity_log
        },
        // Include related data
        transactions: user.transactions,
        documents: user.documents,
        activity_log: user.activity_log,
        reservations: user.reservations_reservations_guest_idTousers
      };

      return UserService.prototype.success(userResponse);
    } catch (error) {
      logger.error('Error finding user by ID with RBAC:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Map User entity to UserResponseDto (excludes sensitive data)
   */
  private static mapToUserResponse(user: any): UserResponseDto {
    const baseResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      description: user.description || undefined,
      role: user.role,
      status: user.is_active ? 'ACTIVE' : 'INACTIVE',
      avatar: user.avatar,
      isVerified: user.isVerified,
      lastLoginAt: user.last_login || undefined,
      nationality: user.nationality || undefined,
      dateOfBirth: user.date_of_birth ? user.date_of_birth.toISOString().split('T')[0] : undefined,
      whatsapp: user.whatsapp || undefined,
      telegram: user.telegram || undefined,
      comments: user.comments || undefined,
      paymentPreferences: user.payment_preferences || undefined,
      personalStayDays: user.personal_stay_days || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Parse units from comments field for agents
    if (user.role === 'AGENT' && user.comments) {
      console.log('🔍 mapToUserResponse: Parsing units for agent:', user.email, 'comments:', user.comments);
      try {
        const parsedComments = JSON.parse(user.comments);
        console.log('🔍 mapToUserResponse: Parsed comments:', parsedComments);
        if (parsedComments.units) {
          (baseResponse as any).units = parsedComments.units;
          console.log('🔍 mapToUserResponse: Added units to response:', parsedComments.units);
        }
      } catch (error) {
        // If parsing fails, treat as regular comments
        console.log('Failed to parse units from comments:', error);
      }
    } else if (user.role === 'AGENT') {
      console.log('🔍 mapToUserResponse: Agent has no comments or not an agent:', user.role, 'comments:', user.comments);
    }

    // Add related data if available
    if (user.reservations_reservations_guest_idTousers) {
      (baseResponse as any).guestReservations = user.reservations_reservations_guest_idTousers;
    }
    if (user.documents) {
      (baseResponse as any).documents = user.documents;
    }
    if (user.activity_log) {
      (baseResponse as any).auditLogs = user.activity_log;
    }

    return baseResponse;
  }

  /**
   * Get user statistics
   */
  public static async getStats(currentUser: CurrentUser): Promise<ServiceResponse<any>> {
    try {
      logger.info(`Getting user statistics for user ${currentUser.email}`);

      // RBAC check - only ADMIN and MANAGER can see user statistics
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        return {
          success: false,
          error: 'Forbidden',
          message: 'Only ADMIN and MANAGER roles can access user statistics'
        };
      }

      // Create Prisma instance for static method
      const prisma = new (require('@prisma/client').PrismaClient)();

      // Get basic counts
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({ where: { is_active: true } });
      const inactiveUsers = await prisma.user.count({ where: { is_active: false } });

      const stats = {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        byRole: [],
        byStatus: [],
        recentUsers: []
      };

      await prisma.$disconnect();

      logger.info(`User statistics retrieved for user ${currentUser.email}`);
      return {
        success: true,
        data: stats,
        message: 'User statistics retrieved successfully'
      };
    } catch (error) {
      logger.error('Error retrieving user statistics:', error);
      return {
        success: false,
        error: 'Database operation failed',
        message: 'An error occurred while processing your request'
      };
    }
  }

  /**
   * Get properties owned by user
   */
  public static async getUserProperties(currentUser: CurrentUser, userId: string): Promise<ServiceResponse<any[]>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[User Properties] Getting properties for user ${userId} by ${currentUser.email}`);

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'User not found');
      }

      // RBAC: Check if current user can access this user's properties
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.id !== userId) {
        await prisma.$disconnect();
        return UserService.prototype.error('Forbidden', 'You can only view your own properties');
      }

      // Get properties owned by user
      const properties = await prisma.properties.findMany({
        where: { owner_id: userId },
        select: {
          id: true,
          name: true,
          nickname: true,
          type: true,
          type_of_unit: true,
          address: true,
          city: true,
          country: true,
          capacity: true,
          bedrooms: true,
          bathrooms: true,
          area: true,
          price_per_night: true,
          description: true,
          amenities: true,
          house_rules: true,
          tags: true,
          is_active: true,
          is_published: true,
          primary_image: true,
          created_at: true,
          updated_at: true
        },
        orderBy: { created_at: 'desc' }
      });

      await prisma.$disconnect();

      logger.info(`[User Properties] Found ${properties.length} properties for user ${userId}`);
      return UserService.prototype.success(properties, 'Properties retrieved successfully');
    } catch (error) {
      logger.error('Error getting user properties:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Link property to user
   */
  public static async linkPropertyToUser(currentUser: CurrentUser, userId: string, propertyId: string): Promise<ServiceResponse<any>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Link Property] Linking property ${propertyId} to user ${userId} by ${currentUser.email}`);

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'User not found');
      }

      // Check if property exists
      const property = await prisma.properties.findUnique({
        where: { id: propertyId },
        select: { id: true, name: true, owner_id: true }
      });

      if (!property) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'Property not found');
      }

      // Allow changing ownership - just log if property already has an owner
      if (property.owner_id && property.owner_id !== userId) {
        logger.info(`[Link Property] Changing ownership of property ${propertyId} from ${property.owner_id} to ${userId}`);
      }

      // Link property to user
      const updatedProperty = await prisma.properties.update({
        where: { id: propertyId },
        data: { owner_id: userId },
        select: {
          id: true,
          name: true,
          nickname: true,
          type: true,
          address: true,
          city: true,
          country: true,
          price_per_night: true,
          owner_id: true
        }
      });

      await prisma.$disconnect();

      logger.info(`[Link Property] Property ${propertyId} linked to user ${userId} successfully`);
      return UserService.prototype.success(updatedProperty, 'Property linked to user successfully');
    } catch (error) {
      logger.error('Error linking property to user:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Unlink property from user
   */
  public static async unlinkPropertyFromUser(currentUser: CurrentUser, userId: string, propertyId: string): Promise<ServiceResponse<any>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Unlink Property] Unlinking property ${propertyId} from user ${userId} by ${currentUser.email}`);

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'User not found');
      }

      // Check if property exists and is owned by this user
      const property = await prisma.properties.findUnique({
        where: { id: propertyId },
        select: { id: true, name: true, owner_id: true }
      });

      if (!property) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'Property not found');
      }

      if (property.owner_id !== userId) {
        await prisma.$disconnect();
        return UserService.prototype.error('Forbidden', 'Property is not owned by this user');
      }

      // Unlink property from user
      const updatedProperty = await prisma.properties.update({
        where: { id: propertyId },
        data: { owner_id: null },
        select: {
          id: true,
          name: true,
          nickname: true,
          type: true,
          address: true,
          city: true,
          country: true,
          price_per_night: true,
          owner_id: true
        }
      });

      await prisma.$disconnect();

      logger.info(`[Unlink Property] Property ${propertyId} unlinked from user ${userId} successfully`);
      return UserService.prototype.success(updatedProperty, 'Property unlinked from user successfully');
    } catch (error) {
      logger.error('Error unlinking property from user:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Get bank accounts for user
   */
  public static async getUserBankAccounts(currentUser: CurrentUser, userId: string): Promise<ServiceResponse<BankAccountResponseDto[]>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[User Bank Accounts] Getting bank accounts for user ${userId} by ${currentUser.email}`);

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'User not found');
      }

      // RBAC: Check if current user can access this user's bank accounts
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.id !== userId) {
        await prisma.$disconnect();
        return UserService.prototype.error('Forbidden', 'You can only view your own bank accounts');
      }

      // Get bank accounts for user
      const bankAccounts = await prisma.bank_accounts.findMany({
        where: { 
          user_id: userId,
          is_active: true
        },
        orderBy: [
          { is_primary: 'desc' },
          { created_at: 'desc' }
        ]
      });

      await prisma.$disconnect();

      logger.info(`[User Bank Accounts] Found ${bankAccounts.length} bank accounts for user ${userId}`);
      return UserService.prototype.success(bankAccounts, 'Bank accounts retrieved successfully');
    } catch (error) {
      logger.error('Error getting user bank accounts:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Create bank account for user
   */
  public static async createUserBankAccount(currentUser: CurrentUser, userId: string, data: CreateBankAccountDto): Promise<ServiceResponse<BankAccountResponseDto>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Create Bank Account] Creating bank account for user ${userId} by ${currentUser.email}`);

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'User not found');
      }

      // RBAC: Check if current user can create bank account for this user
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.id !== userId) {
        await prisma.$disconnect();
        return UserService.prototype.error('Forbidden', 'You can only create bank accounts for yourself');
      }

      // If this is set as primary, unset other primary accounts
      if (data.is_primary) {
        await prisma.bank_accounts.updateMany({
          where: { 
            user_id: userId,
            is_primary: true
          },
          data: { is_primary: false }
        });
      }

      // Create bank account
      const bankAccount = await prisma.bank_accounts.create({
        data: {
          user_id: userId,
          bank_name: data.bank_name,
          account_holder: data.account_holder,
          account_number: data.account_number,
          iban: data.iban || null,
          swift_code: data.swift_code || null,
          routing_number: data.routing_number || null,
          account_type: data.account_type || 'CHECKING',
          currency: data.currency || 'USD',
          is_primary: data.is_primary || false,
          is_active: true
        }
      });

      await prisma.$disconnect();

      logger.info(`[Create Bank Account] Bank account created for user ${userId} successfully`);
      return UserService.prototype.success(bankAccount, 'Bank account created successfully');
    } catch (error) {
      logger.error('Error creating user bank account:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Update bank account for user
   */
  public static async updateUserBankAccount(currentUser: CurrentUser, userId: string, accountId: string, data: UpdateBankAccountDto): Promise<ServiceResponse<BankAccountResponseDto>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Update Bank Account] Updating bank account ${accountId} for user ${userId} by ${currentUser.email}`);

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'User not found');
      }

      // Check if bank account exists and belongs to user
      const existingAccount = await prisma.bank_accounts.findFirst({
        where: { 
          id: accountId,
          user_id: userId
        }
      });

      if (!existingAccount) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'Bank account not found');
      }

      // RBAC: Check if current user can update this bank account
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.id !== userId) {
        await prisma.$disconnect();
        return UserService.prototype.error('Forbidden', 'You can only update your own bank accounts');
      }

      // If this is set as primary, unset other primary accounts
      if (data.is_primary) {
        await prisma.bank_accounts.updateMany({
          where: { 
            user_id: userId,
            is_primary: true,
            id: { not: accountId }
          },
          data: { is_primary: false }
        });
      }

      // Update bank account
      const updateData: any = {};
      if (data.bank_name !== undefined) updateData.bank_name = data.bank_name;
      if (data.account_holder !== undefined) updateData.account_holder = data.account_holder;
      if (data.account_number !== undefined) updateData.account_number = data.account_number;
      if (data.iban !== undefined) updateData.iban = data.iban;
      if (data.swift_code !== undefined) updateData.swift_code = data.swift_code;
      if (data.routing_number !== undefined) updateData.routing_number = data.routing_number;
      if (data.account_type !== undefined) updateData.account_type = data.account_type;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.is_primary !== undefined) updateData.is_primary = data.is_primary;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;

      const bankAccount = await prisma.bank_accounts.update({
        where: { id: accountId },
        data: updateData
      });

      await prisma.$disconnect();

      logger.info(`[Update Bank Account] Bank account ${accountId} updated for user ${userId} successfully`);
      return UserService.prototype.success(bankAccount, 'Bank account updated successfully');
    } catch (error) {
      logger.error('Error updating user bank account:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Delete bank account for user
   */
  public static async deleteUserBankAccount(currentUser: CurrentUser, userId: string, accountId: string): Promise<ServiceResponse<BankAccountResponseDto>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Delete Bank Account] Deleting bank account ${accountId} for user ${userId} by ${currentUser.email}`);

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'User not found');
      }

      // Check if bank account exists and belongs to user
      const existingAccount = await prisma.bank_accounts.findFirst({
        where: { 
          id: accountId,
          user_id: userId
        }
      });

      if (!existingAccount) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'Bank account not found');
      }

      // RBAC: Check if current user can delete this bank account
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.id !== userId) {
        await prisma.$disconnect();
        return UserService.prototype.error('Forbidden', 'You can only delete your own bank accounts');
      }

      // Soft delete - set is_active to false
      const bankAccount = await prisma.bank_accounts.update({
        where: { id: accountId },
        data: { is_active: false }
      });

      await prisma.$disconnect();

      logger.info(`[Delete Bank Account] Bank account ${accountId} deleted for user ${userId} successfully`);
      return UserService.prototype.success(bankAccount, 'Bank account deleted successfully');
    } catch (error) {
      logger.error('Error deleting user bank account:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Get transactions for user
   */
  public static async getUserTransactions(currentUser: CurrentUser, userId: string): Promise<ServiceResponse<TransactionResponseDto[]>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[User Transactions] Getting transactions for user ${userId} by ${currentUser.email}`);

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'User not found');
      }

      // RBAC: Check if current user can access this user's transactions
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.id !== userId) {
        await prisma.$disconnect();
        return UserService.prototype.error('Forbidden', 'You can only view your own transactions');
      }

      // Get transactions for user
      const transactions = await prisma.transactions.findMany({
        where: { 
          user_id: userId
        },
        orderBy: { created_at: 'desc' }
      });

      await prisma.$disconnect();

      logger.info(`[User Transactions] Found ${transactions.length} transactions for user ${userId}`);
      return UserService.prototype.success(transactions, 'Transactions retrieved successfully');
    } catch (error) {
      logger.error('Error getting user transactions:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Create transaction for user
   */
  public static async createUserTransaction(currentUser: CurrentUser, userId: string, data: CreateTransactionDto): Promise<ServiceResponse<TransactionResponseDto>> {
    try {
      const prisma = new PrismaClient();

      logger.info(`[Create Transaction] Creating transaction for user ${userId} by ${currentUser.email}`);
      logger.info(`[Create Transaction] Prisma client created successfully`);

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'User not found');
      }

      // RBAC: Check if current user can create transaction for this user
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.id !== userId) {
        await prisma.$disconnect();
        return UserService.prototype.error('Forbidden', 'You can only create transactions for yourself');
      }

      // Generate unique transaction ID
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Calculate net amount
      const platformFee = data.platform_fee || 0;
      const transactionFee = data.transaction_fee || 0;
      const netAmount = data.amount - platformFee - transactionFee;

      // Create transaction
      const transaction = await prisma.transactions.create({
        data: {
          id: transactionId,
          transaction_id: transactionId,
          property_id: data.property_id || null,
          reservation_id: data.reservation_id || null,
          user_id: userId,
          type: data.type as any,
          category: data.category,
          amount: data.amount,
          currency: data.currency || 'AED',
          description: data.description,
          platform: data.platform,
          platform_fee: platformFee,
          transaction_fee: transactionFee,
          net_amount: netAmount,
          status: 'PENDING',
          payment_method: data.payment_method,
          payment_reference: data.payment_reference,
          updated_at: new Date()
        }
      });

      await prisma.$disconnect();

      logger.info(`[Create Transaction] Transaction created for user ${userId} successfully`);
      return UserService.prototype.success(transaction, 'Transaction created successfully');
    } catch (error) {
      logger.error('Error creating user transaction:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Get user documents
   */
  public static async getUserDocuments(currentUser: CurrentUser, userId: string): Promise<ServiceResponse<DocumentResponseDto[]>> {
    try {
      const prisma = new PrismaClient();
      logger.info(`[User Documents] Getting documents for user ${userId} by ${currentUser.email}`);
      
      // Check if user exists
      const user = await prisma.user.findUnique({ 
        where: { id: userId }, 
        select: { id: true, email: true, role: true } 
      });
      
      if (!user) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'User not found');
      }

      // RBAC check
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.id !== userId) {
        await prisma.$disconnect();
        return UserService.prototype.error('Forbidden', 'You can only view your own documents');
      }

      const documents = await prisma.documents.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' }
      });

      await prisma.$disconnect();
      logger.info(`[User Documents] Found ${documents.length} documents for user ${userId}`);
      return UserService.prototype.success(documents, 'Documents retrieved successfully');
    } catch (error) {
      logger.error('Error getting user documents:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Create user document
   */
  public static async createUserDocument(currentUser: CurrentUser, userId: string, data: CreateDocumentDto): Promise<ServiceResponse<DocumentResponseDto>> {
    try {
      const prisma = new PrismaClient();
      logger.info(`[Create Document] Creating document for user ${userId} by ${currentUser.email}`);
      
      // Check if user exists
      const user = await prisma.user.findUnique({ 
        where: { id: userId }, 
        select: { id: true, email: true, role: true } 
      });
      
      if (!user) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'User not found');
      }

      // RBAC check
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.id !== userId) {
        await prisma.$disconnect();
        return UserService.prototype.error('Forbidden', 'You can only create documents for yourself');
      }

      // Log the data being processed
      logger.info(`[Create Document] Data received:`, {
        name: data.name,
        type: data.type,
        filename: data.filename,
        size: data.size,
        s3_key: data.s3_key,
        s3_url: data.s3_url,
        uploaded_by: data.uploaded_by
      });

      const document = await prisma.documents.create({
        data: {
          user_id: userId,
          name: data.name,
          type: data.type,
          filename: data.filename || data.name || 'unknown',
          size: data.size,
          s3_key: data.s3_key || null,
          s3_url: data.s3_url || null,
          uploaded_by: data.uploaded_by || currentUser.email,
          updated_at: new Date()
        }
      });

      await prisma.$disconnect();
      logger.info(`[Create Document] Document created for user ${userId} successfully`);
      return UserService.prototype.success(document, 'Document created successfully');
    } catch (error) {
      logger.error('Error creating user document:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Update user document
   */
  public static async updateUserDocument(currentUser: CurrentUser, userId: string, documentId: string, data: UpdateDocumentDto): Promise<ServiceResponse<DocumentResponseDto>> {
    try {
      const prisma = new PrismaClient();
      logger.info(`[Update Document] Updating document ${documentId} for user ${userId} by ${currentUser.email}`);
      
      // Check if user exists
      const user = await prisma.user.findUnique({ 
        where: { id: userId }, 
        select: { id: true, email: true, role: true } 
      });
      
      if (!user) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'User not found');
      }

      // RBAC check
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.id !== userId) {
        await prisma.$disconnect();
        return UserService.prototype.error('Forbidden', 'You can only update your own documents');
      }

      // Check if document exists and belongs to user
      const existingDocument = await prisma.documents.findFirst({
        where: { id: documentId, user_id: userId }
      });

      if (!existingDocument) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'Document not found');
      }

      const document = await prisma.documents.update({
        where: { id: documentId },
        data: {
          ...data,
          updated_at: new Date()
        }
      });

      await prisma.$disconnect();
      logger.info(`[Update Document] Document updated for user ${userId} successfully`);
      return UserService.prototype.success(document, 'Document updated successfully');
    } catch (error) {
      logger.error('Error updating user document:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Delete user document
   */
  public static async deleteUserDocument(currentUser: CurrentUser, userId: string, documentId: string): Promise<ServiceResponse<DocumentResponseDto>> {
    try {
      const prisma = new PrismaClient();
      logger.info(`[Delete Document] Deleting document ${documentId} for user ${userId} by ${currentUser.email}`);
      
      // Check if user exists
      const user = await prisma.user.findUnique({ 
        where: { id: userId }, 
        select: { id: true, email: true, role: true } 
      });
      
      if (!user) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'User not found');
      }

      // RBAC check
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.id !== userId) {
        await prisma.$disconnect();
        return UserService.prototype.error('Forbidden', 'You can only delete your own documents');
      }

      // Check if document exists and belongs to user
      const existingDocument = await prisma.documents.findFirst({
        where: { id: documentId, user_id: userId }
      });

      if (!existingDocument) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'Document not found');
      }

      const document = await prisma.documents.delete({
        where: { id: documentId }
      });

      await prisma.$disconnect();
      logger.info(`[Delete Document] Document deleted for user ${userId} successfully`);
      return UserService.prototype.success(document, 'Document deleted successfully');
    } catch (error) {
      logger.error('Error deleting user document:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Get user activity log
   */
  public static async getUserActivityLog(currentUser: CurrentUser, userId: string): Promise<ServiceResponse<ActivityLogResponseDto[]>> {
    try {
      const prisma = new PrismaClient();
      logger.info(`[User Activity Log] Getting activity log for user ${userId} by ${currentUser.email}`);
      
      // Check if user exists
      const user = await prisma.user.findUnique({ 
        where: { id: userId }, 
        select: { id: true, email: true, role: true } 
      });
      
      if (!user) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'User not found');
      }

      // RBAC check
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.id !== userId) {
        await prisma.$disconnect();
        return UserService.prototype.error('Forbidden', 'You can only view your own activity log');
      }

      const activityLog = await prisma.activity_log.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' }
      });

      await prisma.$disconnect();
      logger.info(`[User Activity Log] Found ${activityLog.length} activity log entries for user ${userId}`);
      return UserService.prototype.success(activityLog, 'Activity log retrieved successfully');
    } catch (error) {
      logger.error('Error getting user activity log:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Create user activity log entry
   */
  public static async createUserActivityLog(currentUser: CurrentUser, userId: string, data: CreateActivityLogDto): Promise<ServiceResponse<ActivityLogResponseDto>> {
    try {
      const prisma = new PrismaClient();
      logger.info(`[Create Activity Log] Creating activity log entry for user ${userId} by ${currentUser.email}`);
      
      // Check if user exists
      const user = await prisma.user.findUnique({ 
        where: { id: userId }, 
        select: { id: true, email: true, role: true } 
      });
      
      if (!user) {
        await prisma.$disconnect();
        return UserService.prototype.error('Not Found', 'User not found');
      }

      // RBAC check
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER' && currentUser.id !== userId) {
        await prisma.$disconnect();
        return UserService.prototype.error('Forbidden', 'You can only create activity log entries for yourself');
      }

      const activityLog = await prisma.activity_log.create({
        data: {
          user_id: userId,
          action: data.action,
          description: data.description,
          type: data.type,
          performed_by: data.performed_by || currentUser.email || null,
          metadata: data.metadata
        }
      });

      await prisma.$disconnect();
      logger.info(`[Create Activity Log] Activity log entry created for user ${userId} successfully`);
      return UserService.prototype.success(activityLog, 'Activity log entry created successfully');
    } catch (error) {
      logger.error('Error creating user activity log:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Get user statistics
   */
  public static async getUserStats(currentUser: CurrentUser, role?: string): Promise<ServiceResponse<any>> {
    try {
      logger.info(`[User Stats] Getting user statistics for role: ${role} by ${currentUser.email}`);
      
      // For now, return basic mock stats
      const stats = {
        totalUsers: 5,
        activeUsers: 5,
        inactiveUsers: 0,
        usersWithReservations: 0,
        averageReservations: 0,
        birthdaysThisMonth: 0
      };

      logger.info(`[User Stats] Final stats:`, stats);
      logger.info(`[User Stats] User statistics retrieved for role: ${role} successfully`);
      return UserService.prototype.success(stats, 'User statistics retrieved successfully');
    } catch (error) {
      logger.error('Error getting user statistics:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }

  /**
   * Get user detail statistics
   */
  public static async getUserDetailStats(currentUser: CurrentUser, userId: string): Promise<ServiceResponse<any>> {
    try {
      logger.info(`[User Detail Stats] Getting user detail statistics for user ${userId} by ${currentUser.email}`);
      
      // For now, return basic mock stats
      const stats = {
        totalReservations: 0,
        totalNights: 0,
        lifetimeValue: 0,
        averageBookingValue: 0,
        completedReservations: 0,
        upcomingReservations: 0,
        cancelledReservations: 0,
        lastActivity: null
      };

      logger.info(`[User Detail Stats] User detail statistics retrieved for user ${userId} successfully`);
      return UserService.prototype.success(stats, 'User detail statistics retrieved successfully');
    } catch (error) {
      logger.error('Error getting user detail statistics:', error);
      return UserService.prototype.handleDatabaseError(error);
    }
  }
}
