import { Response, NextFunction } from 'express';
import { loggerService } from '../services/loggerService';
import { AuthRequest } from '../types';

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        loggerService.warn('Authorization failed', {
          userId: req.user.id,
          userRole: req.user.role,
          allowedRoles,
          path: req.path,
          method: req.method
        });

        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      loggerService.error('Authorization error', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization failed'
      });
    }
  };
};
