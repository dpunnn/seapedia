import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { errorResponse } from '../utils/response';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const verifyJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    errorResponse(res, 'Token tidak ditemukan', 401);
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    errorResponse(res, 'Token tidak valid atau sudah expired', 401);
    return;
  }

  req.user = payload;
  next();
};
