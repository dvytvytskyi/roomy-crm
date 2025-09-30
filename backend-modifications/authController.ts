import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateRequest } from '../middleware/validation';
import { registerSchema, loginSchema } from '../validation/authValidation';

const prisma = new PrismaClient();

// JWT Secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export const authController = {
  // Register new user with role support
  register: asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, role = 'GUEST' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'User already exists',
          statusCode: 409
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with specified role
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role as any, // Allow any valid role
        isActive: true,
        isVerified: false
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

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      data: {
        user,
        accessToken,
        refreshToken
      },
      message: 'User registered successfully'
    });
  }),

  // Login user
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          statusCode: 401
        }
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          statusCode: 401
        }
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Account is deactivated',
          statusCode: 401
        }
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        accessToken,
        refreshToken
      },
      message: 'Login successful'
    });
  }),

  // Get user profile
  profile: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      data: { user }
    });
  }),

  // Refresh token
  refresh: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Refresh token required',
          statusCode: 401
        }
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid refresh token',
            statusCode: 401
          }
        });
      }

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        data: { accessToken }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid refresh token',
          statusCode: 401
        }
      });
    }
  })
};
