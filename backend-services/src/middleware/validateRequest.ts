import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { loggerService } from '../services/loggerService';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    loggerService.warn('Validation failed', {
      errors: errors.array(),
      body: req.body,
      query: req.query,
      params: req.params
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  next();
};
