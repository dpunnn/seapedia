import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { errorResponse } from '../utils/response';
import prisma from '../utils/prisma';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const verifyJWT = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { isBlocked: true } });
  if (!user) {
    errorResponse(res, 'Pengguna tidak ditemukan', 401);
    return;
  }
  if (user.isBlocked) {
    errorResponse(res, 'Akun Anda telah diblokir oleh admin', 401);
    return;
  }

  req.user = payload;
  next();
};

export const optionalJWT = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) req.user = payload;
  }
  next();
};
