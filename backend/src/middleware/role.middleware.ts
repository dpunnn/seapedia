import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { errorResponse } from '../utils/response';

export const requireRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    if (req.user.activeRole !== role) {
      errorResponse(res, `Akses ditolak. Diperlukan role: ${role}`, 403);
      return;
    }
    next();
  };
};
