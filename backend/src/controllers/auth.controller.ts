import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const registerSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  roles: z
    .array(z.enum(['SELLER', 'BUYER', 'DRIVER']))
    .min(1, 'Pilih minimal 1 role'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const selectRoleSchema = z.object({
  role: z.enum(['ADMIN', 'SELLER', 'BUYER', 'DRIVER']),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    errorResponse(res, 'Validasi gagal', 400, parse.error.flatten().fieldErrors);
    return;
  }

  const { username, email, password, roles } = parse.data;

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    errorResponse(res, 'Email sudah digunakan', 400);
    return;
  }

  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) {
    errorResponse(res, 'Username sudah digunakan', 400);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { username, email, passwordHash },
    });

    await tx.userRole.createMany({
      data: roles.map((role) => ({ userId: newUser.id, role })),
    });

    if (roles.includes('BUYER') || roles.includes('DRIVER')) {
      await tx.wallet.create({ data: { userId: newUser.id, balance: 0 } });
    }

    if (roles.includes('BUYER')) {
      await tx.cart.create({ data: { buyerId: newUser.id } });
    }

    return newUser;
  });

  successResponse(
    res,
    { id: user.id, username: user.username, email: user.email, roles },
    'Registrasi berhasil',
    201
  );
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    errorResponse(res, 'Email dan password wajib diisi', 400);
    return;
  }

  const { email, password } = parse.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: true },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    errorResponse(res, 'Email atau password salah', 401);
    return;
  }

  const roles = user.roles.map((r) => r.role);
  const token = generateToken({ userId: user.id, email: user.email, roles });

  successResponse(res, {
    user: { id: user.id, username: user.username, email: user.email },
    roles,
    token,
  });
};

export const selectRole = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = selectRoleSchema.safeParse(req.body);
  if (!parse.success) {
    errorResponse(res, 'Role tidak valid', 400);
    return;
  }

  const { role } = parse.data;
  const userId = req.user!.userId;

  const userRole = await prisma.userRole.findUnique({
    where: { userId_role: { userId, role } },
  });

  if (!userRole) {
    errorResponse(res, 'Anda tidak memiliki role tersebut', 403);
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });

  const roles = user!.roles.map((r) => r.role);
  const token = generateToken({ userId, email: req.user!.email, roles, activeRole: role });

  successResponse(res, { token, activeRole: role });
};

export const logout = (_req: Request, res: Response): void => {
  successResponse(res, null, 'Logout berhasil');
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { roles: true },
  });

  if (!user) {
    errorResponse(res, 'User tidak ditemukan', 404);
    return;
  }

  successResponse(res, {
    user: { id: user.id, username: user.username, email: user.email },
    roles: user.roles.map((r) => r.role),
    activeRole: req.user!.activeRole,
  });
};
