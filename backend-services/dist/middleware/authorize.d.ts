import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const authorize: (allowedRoles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=authorize.d.ts.map