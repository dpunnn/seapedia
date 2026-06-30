import { Response } from 'express';
import { z } from 'zod';
import validator from 'validator';
import prisma from '../utils/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

// ── Store ──────────────────────────────────────────────────────────────────

const storeSchema = z.object({
  name: z.string().min(3, 'Nama toko minimal 3 karakter'),
  description: z.string().optional(),
});

export const createStore = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = storeSchema.safeParse(req.body);
  if (!parse.success) {
    errorResponse(res, 'Validasi gagal', 400, parse.error.flatten().fieldErrors);
    return;
  }

  const userId = req.user!.userId;
  const existing = await prisma.store.findUnique({ where: { userId } });
  if (existing) {
    errorResponse(res, 'Anda sudah memiliki toko', 400);
    return;
  }

  const nameExists = await prisma.store.findFirst({
    where: { name: { equals: parse.data.name, mode: 'insensitive' } },
  });
  if (nameExists) {
    errorResponse(res, 'Nama toko sudah digunakan', 400);
    return;
  }

  const store = await prisma.store.create({
    data: { userId, name: parse.data.name, description: parse.data.description },
  });

  successResponse(res, store, 'Toko berhasil dibuat', 201);
};

export const getMyStore = async (req: AuthRequest, res: Response): Promise<void> => {
  const store = await prisma.store.findUnique({
    where: { userId: req.user!.userId },
    include: { _count: { select: { products: true } } },
  });

  if (!store) {
    errorResponse(res, 'Toko belum dibuat', 404);
    return;
  }

  successResponse(res, store);
};

export const updateStore = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = storeSchema.partial().safeParse(req.body);
  if (!parse.success) {
    errorResponse(res, 'Validasi gagal', 400, parse.error.flatten().fieldErrors);
    return;
  }

  const userId = req.user!.userId;

  if (parse.data.name) {
    const nameExists = await prisma.store.findFirst({
      where: { name: { equals: parse.data.name, mode: 'insensitive' }, NOT: { userId } },
    });
    if (nameExists) {
      errorResponse(res, 'Nama toko sudah digunakan', 400);
      return;
    }
  }

  const store = await prisma.store.update({
    where: { userId },
    data: parse.data,
  });

  successResponse(res, store, 'Toko berhasil diupdate');
};

// ── Products ───────────────────────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter'),
  description: z.string().optional(),
  price: z.number().positive('Harga harus lebih dari 0'),
  stock: z.number().int().nonnegative('Stok tidak boleh negatif'),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = productSchema.safeParse(req.body);
  if (!parse.success) {
    errorResponse(res, 'Validasi gagal', 400, parse.error.flatten().fieldErrors);
    return;
  }

  const store = await prisma.store.findUnique({ where: { userId: req.user!.userId } });
  if (!store) {
    errorResponse(res, 'Buat toko terlebih dahulu sebelum menambah produk', 400);
    return;
  }

  const product = await prisma.product.create({
    data: { ...parse.data, storeId: store.id },
  });

  successResponse(res, product, 'Produk berhasil ditambahkan', 201);
};

export const getMyProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  const store = await prisma.store.findUnique({ where: { userId: req.user!.userId } });
  if (!store) {
    errorResponse(res, 'Toko belum dibuat', 404);
    return;
  }

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
  const search = (req.query.search as string) || '';
  const skip = (page - 1) * limit;

  const where = {
    storeId: store.id,
    ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.product.count({ where }),
  ]);

  successResponse(res, { products, total, page, totalPages: Math.ceil(total / limit) });
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = productSchema.partial().safeParse(req.body);
  if (!parse.success) {
    errorResponse(res, 'Validasi gagal', 400, parse.error.flatten().fieldErrors);
    return;
  }

  const productId = req.params.id as string;
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { store: true },
  });

  if (!product) {
    errorResponse(res, 'Produk tidak ditemukan', 404);
    return;
  }

  if (product.store.userId !== req.user!.userId) {
    errorResponse(res, 'Akses ditolak: bukan produk Anda', 403);
    return;
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: parse.data,
  });

  successResponse(res, updated, 'Produk berhasil diupdate');
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const productId = req.params.id as string;
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { store: true },
  });

  if (!product) {
    errorResponse(res, 'Produk tidak ditemukan', 404);
    return;
  }

  if (product.store.userId !== req.user!.userId) {
    errorResponse(res, 'Akses ditolak: bukan produk Anda', 403);
    return;
  }

  await prisma.product.update({ where: { id: productId }, data: { isActive: false } });
  successResponse(res, null, 'Produk berhasil dihapus');
};

// ── Public store ───────────────────────────────────────────────────────────

export const getPublicStore = async (req: AuthRequest, res: Response): Promise<void> => {
  const store = await prisma.store.findUnique({
    where: { id: req.params.id as string },
    include: {
      products: { where: { isActive: true }, orderBy: { createdAt: 'desc' } },
      user: { select: { username: true } },
    },
  });

  if (!store) {
    errorResponse(res, 'Toko tidak ditemukan', 404);
    return;
  }

  successResponse(res, store);
};

// ── Seller Orders ──────────────────────────────────────────────────────────

export const getSellerOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const store = await prisma.store.findUnique({ where: { userId: req.user!.userId } });
  if (!store) { errorResponse(res, 'Toko tidak ditemukan', 404); return; }

  const status = req.query.status as string | undefined;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    storeId: store.id,
    ...(status && { status: status as any }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        buyer: { select: { username: true, email: true } },
        items: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  successResponse(res, { orders, total, page, totalPages: Math.ceil(total / limit) });
};

export const getSellerOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  const store = await prisma.store.findUnique({ where: { userId: req.user!.userId } });
  if (!store) { errorResponse(res, 'Toko tidak ditemukan', 404); return; }

  const order = await prisma.order.findFirst({
    where: { id: req.params.id as string, storeId: store.id },
    include: {
      buyer: { select: { username: true, email: true } },
      items: { include: { product: { select: { name: true, imageUrl: true } } } },
      statusHistory: { orderBy: { createdAt: 'asc' } },
      address: true,
      deliveryJob: { include: { driver: { select: { username: true } } } },
    },
  });

  if (!order) { errorResponse(res, 'Pesanan tidak ditemukan', 404); return; }
  successResponse(res, order);
};

export const processOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const store = await prisma.store.findUnique({ where: { userId: req.user!.userId } });
  if (!store) { errorResponse(res, 'Toko tidak ditemukan', 404); return; }

  const order = await prisma.order.findFirst({
    where: { id: req.params.id as string, storeId: store.id },
  });

  if (!order) { errorResponse(res, 'Pesanan tidak ditemukan', 404); return; }
  if (order.status !== 'SEDANG_DIKEMAS') {
    errorResponse(res, 'Pesanan tidak dalam status Sedang Dikemas', 400);
    return;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const o = await tx.order.update({
      where: { id: order.id },
      data: { status: 'MENUNGGU_PENGIRIM' },
    });
    await tx.orderStatusHistory.create({
      data: { orderId: order.id, status: 'MENUNGGU_PENGIRIM', note: 'Seller memproses pesanan' },
    });
    return o;
  });

  successResponse(res, updated, 'Pesanan berhasil diproses');
};

export const getSellerIncome = async (req: AuthRequest, res: Response): Promise<void> => {
  const store = await prisma.store.findUnique({ where: { userId: req.user!.userId } });
  if (!store) { errorResponse(res, 'Toko tidak ditemukan', 404); return; }

  const orders = await prisma.order.findMany({
    where: { storeId: store.id, status: 'PESANAN_SELESAI' },
    select: { totalAmount: true, deliveryFee: true, createdAt: true },
  });

  const totalIncome = orders.reduce(
    (sum, o) => sum + (Number(o.totalAmount) - Number(o.deliveryFee)),
    0
  );

  successResponse(res, { totalIncome, orderCount: orders.length, orders });
};

// ── Check store name ───────────────────────────────────────────────────────

export const checkStoreName = async (req: AuthRequest, res: Response): Promise<void> => {
  const name = req.query.name as string;
  if (!name) { errorResponse(res, 'Nama diperlukan', 400); return; }

  const userId = req.user!.userId;
  const existing = await prisma.store.findFirst({
    where: { name: { equals: name, mode: 'insensitive' }, NOT: { userId } },
  });

  successResponse(res, { available: !existing });
};

// Escape helper untuk deskripsi produk
export const sanitizeText = (text: string) => validator.escape(text);
