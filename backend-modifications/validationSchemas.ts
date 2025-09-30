import Joi from 'joi';

// Auth validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'AGENT', 'OWNER', 'GUEST', 'CLEANER', 'MAINTENANCE').optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// User validation schemas
export const createUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'AGENT', 'OWNER', 'GUEST', 'CLEANER', 'MAINTENANCE').optional(),
  nationality: Joi.string().optional(),
  dateOfBirth: Joi.string().optional(),
  whatsapp: Joi.string().optional().allow(null, ''),
  telegram: Joi.string().optional().allow(null, ''),
  comments: Joi.string().optional().allow(null, ''),
  status: Joi.string().valid('Active', 'VIP', 'Inactive').optional(),
  paymentPreferences: Joi.string().optional(),
  personalStayDays: Joi.number().min(0).max(365).optional()
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional().allow(null, ''),
  isActive: Joi.boolean().optional(),
  nationality: Joi.string().optional(),
  dateOfBirth: Joi.string().optional(),
  whatsapp: Joi.string().optional().allow(null, ''),
  telegram: Joi.string().optional().allow(null, ''),
  comments: Joi.string().optional().allow(null, ''),
  status: Joi.string().valid('Active', 'VIP', 'Inactive', 'active', 'inactive', 'vip').optional(),
  paymentPreferences: Joi.string().optional(),
  personalStayDays: Joi.number().min(0).max(365).optional()
});

export const changeRoleSchema = Joi.object({
  role: Joi.string().valid('ADMIN', 'MANAGER', 'AGENT', 'OWNER', 'GUEST', 'CLEANER', 'MAINTENANCE').required()
});

export const toggleStatusSchema = Joi.object({
  isActive: Joi.boolean().required()
});
