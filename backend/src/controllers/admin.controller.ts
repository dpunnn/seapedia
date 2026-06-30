import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { processOverdueOrders } from '../services/overdue.service';

export const getStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [users, stores, products, ordersByStatus, vouchers, promos, deliveries, overdue] =
    await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.voucher.count(),
      prisma.promo.count(),
      prisma.deliveryJob.count(),
      prisma.order.count({ where: { isOverdueProcessed: false, status: 'SEDANG_DIKIRIM' } }),
    ]);

  const settings = await prisma.systemSettings.findUnique({ where: { key: 'virtual_date' } });

  successResponse(res, {
    users,
    stores,
    products,
    orders: ordersByStatus,
    vouchers,
    promos,
    deliveries,
    overdueOrders: overdue,
    virtualDate: settings?.value,
  });
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = 20;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      include: { roles: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count(),
  ]);
  successResponse(res, { users: users.map(u => ({ ...u, passwordHash: undefined })), total, page });
};

export const getAdminOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const status = req.query.status as string | undefined;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = 20;
  const where = status ? { status: status as any } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { buyer: { select: { username: true } }, store: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);
  successResponse(res, { orders, total, page });
};

export const getOverdueOrders = async (_req: AuthRequest, res: Response): Promise<void> => {
  const settings = await prisma.systemSettings.findUnique({ where: { key: 'virtual_date' } });
  const virtualDate = settings ? new Date(settings.value) : new Date();

  const orders = await prisma.order.findMany({
    where: { status: 'SEDANG_DIKIRIM', isOverdueProcessed: false },
    include: { buyer: { select: { username: true } }, store: { select: { name: true } }, statusHistory: true },
  });

  const SLA: Record<string, number> = { INSTANT: 1, NEXT_DAY: 2, REGULAR: 5 };
  const overdue = orders.filter((o) => {
    const deliveredAt = o.statusHistory.find((h) => h.status === 'SEDANG_DIKIRIM')?.createdAt;
    if (!deliveredAt) return false;
    const deadline = new Date(deliveredAt);
    deadline.setDate(deadline.getDate() + SLA[o.deliveryMethod]);
    return virtualDate >= deadline;
  });

  successResponse(res, overdue);
};

export const getVirtualTime = async (_req: AuthRequest, res: Response): Promise<void> => {
  const s = await prisma.systemSettings.findUnique({ where: { key: 'virtual_date' } });
  successResponse(res, { virtualDate: s?.value ?? new Date().toISOString() });
};

export const advanceTime = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = z.object({ days: z.number().int().min(1).max(30) }).safeParse(req.body);
  if (!parse.success) { errorResponse(res, 'Validasi gagal', 400, parse.error.flatten().fieldErrors); return; }

  const s = await prisma.systemSettings.findUnique({ where: { key: 'virtual_date' } });
  const current = s ? new Date(s.value) : new Date();
  current.setDate(current.getDate() + parse.data.days);

  await prisma.systemSettings.upsert({
    where: { key: 'virtual_date' },
    create: { key: 'virtual_date', value: current.toISOString() },
    update: { value: current.toISOString() },
  });

  const processed = await processOverdueOrders(current);
  successResponse(res, { newVirtualDate: current.toISOString(), overdueProcessed: processed });
};

// ── Vouchers ───────────────────────────────────────────────────────────────

const voucherSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive(),
  minPurchase: z.number().nonnegative().optional().default(0),
  maxDiscount: z.number().positive().optional(),
  expiryDate: z.string().datetime(),
  usageLimit: z.number().int().min(1),
});

export const createVoucher = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = voucherSchema.safeParse(req.body);
  if (!parse.success) { errorResponse(res, 'Validasi gagal', 400, parse.error.flatten().fieldErrors); return; }

  if (new Date(parse.data.expiryDate) <= new Date()) {
    errorResponse(res, 'Expiry date harus di masa depan', 400);
    return;
  }

  const existing = await prisma.voucher.findUnique({ where: { code: parse.data.code } });
  if (existing) { errorResponse(res, 'Kode voucher sudah digunakan', 400); return; }

  const voucher = await prisma.voucher.create({ data: parse.data as any });
  successResponse(res, voucher, 'Voucher berhasil dibuat', 201);
};

export const getVouchers = async (_req: AuthRequest, res: Response): Promise<void> => {
  const vouchers = await prisma.voucher.findMany({ orderBy: { createdAt: 'desc' } });
  successResponse(res, vouchers);
};

export const getVoucherById = async (req: AuthRequest, res: Response): Promise<void> => {
  const v = await prisma.voucher.findUnique({ where: { id: req.params.id as string } });
  if (!v) { errorResponse(res, 'Voucher tidak ditemukan', 404); return; }
  successResponse(res, v);
};

// ── Promos ─────────────────────────────────────────────────────────────────

const promoSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive(),
  minPurchase: z.number().nonnegative().optional().default(0),
  maxDiscount: z.number().positive().optional(),
  expiryDate: z.string().datetime(),
});

export const createPromo = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = promoSchema.safeParse(req.body);
  if (!parse.success) { errorResponse(res, 'Validasi gagal', 400, parse.error.flatten().fieldErrors); return; }

  if (new Date(parse.data.expiryDate) <= new Date()) {
    errorResponse(res, 'Expiry date harus di masa depan', 400);
    return;
  }

  const existing = await prisma.promo.findUnique({ where: { code: parse.data.code } });
  if (existing) { errorResponse(res, 'Kode promo sudah digunakan', 400); return; }

  const promo = await prisma.promo.create({ data: parse.data as any });
  successResponse(res, promo, 'Promo berhasil dibuat', 201);
};

export const getPromos = async (_req: AuthRequest, res: Response): Promise<void> => {
  const promos = await prisma.promo.findMany({ orderBy: { createdAt: 'desc' } });
  successResponse(res, promos);
};

export const getPromoById = async (req: AuthRequest, res: Response): Promise<void> => {
  const p = await prisma.promo.findUnique({ where: { id: req.params.id as string } });
  if (!p) { errorResponse(res, 'Promo tidak ditemukan', 404); return; }
  successResponse(res, p);
};

export const getAdminDeliveries = async (req: AuthRequest, res: Response): Promise<void> => {
  const jobs = await prisma.deliveryJob.findMany({
    include: {
      order: { include: { store: { select: { name: true } }, buyer: { select: { username: true } } } },
      driver: { select: { username: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  successResponse(res, jobs);
};

export const getAdminStores = async (_req: AuthRequest, res: Response): Promise<void> => {
  const stores = await prisma.store.findMany({
    include: {
      user: { select: { username: true, email: true } },
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  successResponse(res, stores);
};

export const getAdminProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      include: { store: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * 20,
      take: 20,
    }),
    prisma.product.count(),
  ]);
  successResponse(res, { products, total, page });
};
