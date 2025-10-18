import { Router } from 'express';
import { PortalController } from '../controllers/portal.controller';

const router = Router();

/**
 * Portal Routes
 * Provides filtered data access for AGENT and OWNER roles
 * 
 * Authentication: Uses Bearer token from Authorization header
 * No middleware applied - authentication handled inside controller methods
 */

// ==================== AGENT ROUTES ====================

/**
 * @route   GET /api/v2/portal/agent/properties
 * @desc    Get properties assigned to the agent
 * @access  Private - AGENT, ADMIN
 */
router.get('/agent/properties', PortalController.getAgentProperties);

/**
 * @route   GET /api/v2/portal/agent/reservations
 * @desc    Get reservations for agent's properties
 * @access  Private - AGENT, ADMIN
 */
router.get('/agent/reservations', PortalController.getAgentReservations);

/**
 * @route   GET /api/v2/portal/agent/finances
 * @desc    Get financial summary for agent's properties
 * @access  Private - AGENT, ADMIN
 */
router.get('/agent/finances', PortalController.getAgentFinances);

// ==================== OWNER ROUTES ====================

/**
 * @route   GET /api/v2/portal/owner/properties
 * @desc    Get properties owned by the owner
 * @access  Private - OWNER, ADMIN
 */
router.get('/owner/properties', PortalController.getOwnerProperties);

/**
 * @route   GET /api/v2/portal/owner/reservations
 * @desc    Get reservations for owner's properties
 * @access  Private - OWNER, ADMIN
 */
router.get('/owner/reservations', PortalController.getOwnerReservations);

/**
 * @route   GET /api/v2/portal/owner/finances
 * @desc    Get financial summary for owner's properties
 * @access  Private - OWNER, ADMIN
 */
router.get('/owner/finances', PortalController.getOwnerFinances);

export default router;

