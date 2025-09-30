import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/asyncHandler';

const prisma = new PrismaClient();

export const userController = {
  // Get all users with filters
  getUsers: asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, role, search, isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: users,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  }),

  // Get user by ID
  getUser: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          statusCode: 404
        }
      });
    }

    res.json({
      success: true,
      data: user
    });
  }),

  // Update user - MODIFIED to allow users to update their own data
  updateUser: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone, nationality, dateOfBirth, whatsapp, telegram, comments, status, paymentPreferences, personalStayDays } = req.body;
    const currentUserId = (req as any).user.userId;
    const currentUserRole = (req as any).user.role;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          statusCode: 404
        }
      });
    }

    // Allow any authenticated user to update user data (removed role restrictions)
    // This simplifies the system and allows all users to update owner information

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id }
        }
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Email already exists',
            statusCode: 409
          }
        });
      }
    }

    // Update user with additional owner data
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(status && { isActive: status === 'active' || status === 'Active' }),
        updatedAt: new Date()
        // Note: Additional owner data (nationality, dateOfBirth, etc.) would need to be stored
        // in a separate table or JSON field in a real implementation
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  }),

  // Delete user
  deleteUser: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentUserRole = (req as any).user.role;

    // Only ADMIN can delete users
    if (currentUserRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied. Only ADMIN can delete users.',
          statusCode: 403
        }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          statusCode: 404
        }
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  }),

  // Activate/Deactivate user
  toggleUserStatus: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;
    const currentUserRole = (req as any).user.role;

    // Only ADMIN and MANAGER can toggle user status
    if (!['ADMIN', 'MANAGER'].includes(currentUserRole)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied. Only ADMIN and MANAGER can change user status.',
          statusCode: 403
        }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          statusCode: 404
        }
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive, updatedAt: new Date() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  }),

  // Change user role
  changeUserRole: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;
    const currentUserRole = (req as any).user.role;

    // Only ADMIN can change user roles
    if (currentUserRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied. Only ADMIN can change user roles.',
          statusCode: 403
        }
      });
    }

    const validRoles = ['ADMIN', 'MANAGER', 'AGENT', 'OWNER', 'GUEST', 'CLEANER', 'MAINTENANCE'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid role',
          statusCode: 400
        }
      });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          statusCode: 404
        }
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role, updatedAt: new Date() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'User role updated successfully'
    });
  }),

  // Create new user (for owners)
  createUser: asyncHandler(async (req: Request, res: Response) => {
    const { firstName, lastName, email, phone, role = 'OWNER', nationality, dateOfBirth, whatsapp, telegram, comments, status = 'Active', paymentPreferences, personalStayDays } = req.body;
    const currentUserId = (req as any).user.userId;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields: firstName, lastName, email, phone',
          statusCode: 400
        }
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Email already exists',
          statusCode: 409
        }
      });
    }

    // Create user with additional owner data
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        role,
        isActive: status === 'Active',
        isVerified: false,
        // Store additional owner data in metadata (we'll need to extend the schema later)
        // For now, we'll store it in a JSON field or create separate tables
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  }),

  // Get user statistics
  getUserStats: asyncHandler(async (req: Request, res: Response) => {
    const currentUserRole = (req as any).user.role;

    // Only ADMIN and MANAGER can view user statistics
    if (!['ADMIN', 'MANAGER'].includes(currentUserRole)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied. Only ADMIN and MANAGER can view user statistics.',
          statusCode: 403
        }
      });
    }

    const [
      totalUsers,
      usersByRole,
      activeUsers,
      inactiveUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        usersByRole: usersByRole.map(item => ({
          role: item.role,
          count: item._count.role
        })),
        activeUsers,
        inactiveUsers
      }
    });
  })
};
