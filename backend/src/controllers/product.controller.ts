import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { successResponse, errorResponse } from '../utils/response';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 12);
  const search = (req.query.search as string) || '';
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { store: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  successResponse(res, { products, total, page, totalPages: Math.ceil(total / limit) });
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const product = await prisma.product.findFirst({
    where: { id: req.params.id as string, isActive: true },
    include: {
      store: {
        include: { user: { select: { username: true } } },
      },
    },
  });

  if (!product) {
    errorResponse(res, 'Produk tidak ditemukan', 404);
    return;
  }

  successResponse(res, product);
};
