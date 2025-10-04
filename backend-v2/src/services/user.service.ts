import { PrismaClient, User, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { BaseService } from './BaseService';
import { ServiceResponse } from '../types';
import { CreateUserDto, UpdateUserDto, UserResponseDto, PaginationOptions, PaginatedResponse, CurrentUser, UserQueryParams, UserWithStatsDto } from '../types/dto';
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
      });

      await prisma.$disconnect();

      if (!user) {
        return UserService.prototype.success(null);
      }

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
  public static async delete(id: string): Promise<ServiceResponse<UserResponseDto>> {
    try {
      const prisma = new PrismaClient();

      // Check if user exists
      const existingUser = await UserService.findById(id);
      if (!existingUser.success || !existingUser.data) {
        await prisma.$disconnect();
        return UserService.prototype.error('User not found', 'The specified user does not exist');
      }

      const deletedUser = await prisma.user.delete({
        where: { id },
      });

      await prisma.$disconnect();

      const userResponse = UserService.mapToUserResponse(deletedUser);
      
      logger.info(`User deleted successfully: ${deletedUser.email}`);
      return UserService.prototype.success(userResponse, 'User deleted successfully');
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
        data: { passwordHash },
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

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: data.role || 'GUEST',
          is_active: data.status === 'ACTIVE' || data.status === undefined,
          isVerified: false,
        },
      });

      // TODO: Add audit logging when schema is fixed
      await prisma.$disconnect();

      const userResponse = UserService.mapToUserResponse(user);
      logger.info(`User created: ${user.email} by ${currentUser.email}`);
      return UserService.prototype.success(userResponse);
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
      if (data.avatar !== undefined) updateData.avatar = data.avatar;
      if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;

      // Only ADMIN can change role and status
      if (currentUser.role === 'ADMIN') {
        if (data.role !== undefined) updateData.role = data.role;
        if (data.status !== undefined) updateData.is_active = data.status === 'ACTIVE';
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      // Log audit action
      await prisma.audit_logs.create({
        data: {
          user_id: currentUser.id,
          action: 'UPDATE_USER',
          entity_type: 'USER',
          entity_id: id,
          details: {
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
      if (role) where.role = role;
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
              transactions: true
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
          transactions: user._count.transactions
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

      // Get user with statistics
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              properties_properties_owner_idTousers: true,
              properties_properties_agent_idTousers: true,
              reservations_reservations_guest_idTousers: true,
              reservations_reservations_agent_idTousers: true,
              transactions: true
            }
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
          transactions: user._count.transactions
        }
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
  private static mapToUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      status: user.is_active ? 'ACTIVE' : 'INACTIVE',
      avatar: user.avatar,
      country: user.country || undefined,
      flag: user.flag || undefined,
      isVerified: user.isVerified,
      lastLoginAt: user.last_login || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
