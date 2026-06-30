import { Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';


// ── Wallet ─────────────────────────────────────────────────────────────────

export const getWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId: req.user!.userId },
    include: {
      transactions: { orderBy: { createdAt: 'desc' }, take: 50 },
    },
  });
  if (!wallet) { errorResponse(res, 'Wallet tidak ditemukan', 404); return; }
  successResponse(res, wallet);
};

export const topUp = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = z.object({ amount: z.number().min(10000, 'Minimal top-up Rp 10.000') }).safeParse(req.body);
  if (!parse.success) { errorResponse(res, 'Validasi gagal', 400, parse.error.flatten().fieldErrors); return; }

  const { amount } = parse.data;
  const userId = req.user!.userId;

  const wallet = await prisma.$transaction(async (tx) => {
    const w = await tx.wallet.update({
      where: { userId },
      data: { balance: { increment: amount } },
    });
    await tx.walletTransaction.create({
      data: { walletId: w.id, type: 'TOPUP', amount, description: 'Top Up Saldo' },
    });
    return w;
  });

  successResponse(res, { balance: wallet.balance }, 'Top up berhasil');
};

// ── Addresses ──────────────────────────────────────────────────────────────

const addressSchema = z.object({
  label: z.string().min(1),
  fullAddress: z.string().min(5),
  city: z.string().min(2),
  province: z.string().min(2),
  postalCode: z.string().min(5).max(6),
  isDefault: z.boolean().optional(),
});

export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  successResponse(res, addresses);
};

export const createAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = addressSchema.safeParse(req.body);
  if (!parse.success) { errorResponse(res, 'Validasi gagal', 400, parse.error.flatten().fieldErrors); return; }

  const userId = req.user!.userId;
  const count = await prisma.address.count({ where: { userId } });
  const isDefault = parse.data.isDefault ?? count === 0;

  const address = await prisma.$transaction(async (tx) => {
    if (isDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.address.create({ data: { ...parse.data, userId, isDefault } });
  });

  successResponse(res, address, 'Alamat berhasil ditambahkan', 201);
};

export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = addressSchema.partial().safeParse(req.body);
  if (!parse.success) { errorResponse(res, 'Validasi gagal', 400, parse.error.flatten().fieldErrors); return; }

  const addr = await prisma.address.findUnique({ where: { id: req.params.id as string } });
  if (!addr || addr.userId !== req.user!.userId) { errorResponse(res, 'Alamat tidak ditemukan', 404); return; }

  const updated = await prisma.address.update({ where: { id: req.params.id as string }, data: parse.data });
  successResponse(res, updated, 'Alamat berhasil diupdate');
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const addr = await prisma.address.findUnique({ where: { id: req.params.id as string } });
  if (!addr || addr.userId !== req.user!.userId) { errorResponse(res, 'Alamat tidak ditemukan', 404); return; }
  await prisma.address.delete({ where: { id: req.params.id as string } });
  successResponse(res, null, 'Alamat berhasil dihapus');
};

export const setDefaultAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const addr = await prisma.address.findUnique({ where: { id: req.params.id as string } });
  if (!addr || addr.userId !== userId) { errorResponse(res, 'Alamat tidak ditemukan', 404); return; }

  await prisma.$transaction(async (tx) => {
    await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    await tx.address.update({ where: { id: addr.id }, data: { isDefault: true } });
  });

  successResponse(res, null, 'Alamat default berhasil diubah');
};

// ── Cart ───────────────────────────────────────────────────────────────────

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const cart = await prisma.cart.findUnique({
    where: { buyerId: req.user!.userId },
    include: {
      items: {
        include: {
          product: { include: { store: { select: { id: true, name: true } } } },
        },
      },
      store: { select: { id: true, name: true } },
    },
  });

  if (!cart) { errorResponse(res, 'Cart tidak ditemukan', 404); return; }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  successResponse(res, { ...cart, subtotal });
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = z.object({ productId: z.string(), quantity: z.number().int().min(1) }).safeParse(req.body);
  if (!parse.success) { errorResponse(res, 'Validasi gagal', 400, parse.error.flatten().fieldErrors); return; }

  const { productId, quantity } = parse.data;
  const userId = req.user!.userId;

  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
    include: { store: true },
  });

  if (!product) { errorResponse(res, 'Produk tidak ditemukan', 404); return; }
  if (product.stock < quantity) { errorResponse(res, 'Stok produk tidak cukup', 400); return; }

  const cart = await prisma.cart.findUnique({
    where: { buyerId: userId },
    include: { items: true, store: true },
  });

  if (!cart) { errorResponse(res, 'Cart tidak ditemukan', 404); return; }

  // Single-store rule
  if (cart.storeId && cart.storeId !== product.storeId && cart.items.length > 0) {
    errorResponse(res, `Cart sudah berisi produk dari toko "${cart.store?.name}". Kosongkan cart terlebih dahulu untuk membeli dari toko berbeda.`, 409, { cartStore: cart.store });
    return;
  }

  await prisma.$transaction(async (tx) => {
    const existing = await tx.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    const newQty = (existing?.quantity ?? 0) + quantity;
    if (newQty > product.stock) throw new Error('Stok tidak mencukupi');

    if (existing) {
      await tx.cartItem.update({
        where: { cartId_productId: { cartId: cart.id, productId } },
        data: { quantity: newQty },
      });
    } else {
      await tx.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
    }

    await tx.cart.update({ where: { id: cart.id }, data: { storeId: product.storeId } });
  });

  const updatedCart = await prisma.cart.findUnique({
    where: { buyerId: userId },
    include: { items: { include: { product: true } }, store: true },
  });

  successResponse(res, updatedCart, 'Produk ditambahkan ke keranjang');
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = z.object({ quantity: z.number().int().min(1) }).safeParse(req.body);
  if (!parse.success) { errorResponse(res, 'Validasi gagal', 400); return; }

  const itemId = req.params.id as string;
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true, product: true },
  });

  if (!item || item.cart.buyerId !== req.user!.userId) {
    errorResponse(res, 'Item tidak ditemukan', 404);
    return;
  }

  if (parse.data.quantity > item.product.stock) {
    errorResponse(res, 'Melebihi stok tersedia', 400);
    return;
  }

  const updated = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity: parse.data.quantity },
  });

  successResponse(res, updated, 'Jumlah berhasil diupdate');
};

export const removeCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  const itemId = req.params.id as string;
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item || item.cart.buyerId !== req.user!.userId) {
    errorResponse(res, 'Item tidak ditemukan', 404);
    return;
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

  const remaining = await prisma.cartItem.count({ where: { cartId: item.cartId } });
  if (remaining === 0) {
    await prisma.cart.update({ where: { id: item.cartId }, data: { storeId: null } });
  }

  successResponse(res, null, 'Item dihapus dari keranjang');
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const cart = await prisma.cart.findUnique({ where: { buyerId: req.user!.userId } });
  if (!cart) { errorResponse(res, 'Cart tidak ditemukan', 404); return; }

  await prisma.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.update({ where: { id: cart.id }, data: { storeId: null } });
  });

  successResponse(res, null, 'Keranjang dikosongkan');
};

// ── Checkout helpers ───────────────────────────────────────────────────────

const DELIVERY_FEES: Record<string, number> = { INSTANT: 25000, NEXT_DAY: 15000, REGULAR: 10000 };

const validateDiscount = async (code: string, subtotal: number) => {
  // Cek Voucher
  const voucher = await prisma.voucher.findUnique({ where: { code: code.toUpperCase() } });
  if (voucher) {
    if (!voucher.isActive || voucher.expiryDate < new Date()) return { error: 'Voucher sudah expired' };
    if (voucher.usedCount >= voucher.usageLimit) return { error: 'Voucher sudah habis' };
    if (subtotal < Number(voucher.minPurchase)) return { error: `Minimum pembelian Rp ${voucher.minPurchase}` };

    let disc = voucher.discountType === 'PERCENTAGE'
      ? (subtotal * Number(voucher.discountValue)) / 100
      : Number(voucher.discountValue);
    if (voucher.maxDiscount) disc = Math.min(disc, Number(voucher.maxDiscount));

    return { type: 'VOUCHER', discountAmount: disc, voucherId: voucher.id };
  }

  // Cek Promo
  const promo = await prisma.promo.findUnique({ where: { code: code.toUpperCase() } });
  if (promo) {
    if (!promo.isActive || promo.expiryDate < new Date()) return { error: 'Promo sudah expired' };
    if (subtotal < Number(promo.minPurchase)) return { error: `Minimum pembelian Rp ${promo.minPurchase}` };

    let disc = promo.discountType === 'PERCENTAGE'
      ? (subtotal * Number(promo.discountValue)) / 100
      : Number(promo.discountValue);
    if (promo.maxDiscount) disc = Math.min(disc, Number(promo.maxDiscount));

    return { type: 'PROMO', discountAmount: disc, promoId: promo.id };
  }

  return { error: 'Kode diskon tidak ditemukan' };
};

const checkoutSchema = z.object({
  addressId: z.string(),
  deliveryMethod: z.enum(['INSTANT', 'NEXT_DAY', 'REGULAR']),
  discountCode: z.string().optional(),
});

export const previewCheckout = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = checkoutSchema.safeParse(req.body);
  if (!parse.success) { errorResponse(res, 'Validasi gagal', 400, parse.error.flatten().fieldErrors); return; }

  const userId = req.user!.userId;
  const { addressId, deliveryMethod, discountCode } = parse.data;

  const cart = await prisma.cart.findUnique({
    where: { buyerId: userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) { errorResponse(res, 'Keranjang kosong', 400); return; }

  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) { errorResponse(res, 'Alamat tidak ditemukan', 404); return; }

  for (const item of cart.items) {
    if (!item.product.isActive) { errorResponse(res, `Produk "${item.product.name}" sudah tidak tersedia`, 400); return; }
    if (item.product.stock < item.quantity) { errorResponse(res, `Stok produk "${item.product.name}" tidak cukup`, 400); return; }
  }

  const subtotal = cart.items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
  const deliveryFee = DELIVERY_FEES[deliveryMethod];

  let discountAmount = 0;
  let discountType: string | null = null;
  let voucherId: string | null = null;
  let promoId: string | null = null;

  if (discountCode) {
    const result = await validateDiscount(discountCode, subtotal);
    if (result.error) { errorResponse(res, result.error, 400); return; }
    discountAmount = result.discountAmount!;
    discountType = result.type!;
    voucherId = result.voucherId ?? null;
    promoId = result.promoId ?? null;
  }

  const ppnBase = subtotal - discountAmount;
  const ppnAmount = ppnBase * 0.12;
  const total = ppnBase + ppnAmount + deliveryFee;

  successResponse(res, {
    items: cart.items.map((i) => ({
      product: i.product,
      quantity: i.quantity,
      subtotal: Number(i.product.price) * i.quantity,
    })),
    subtotal,
    discountAmount,
    discountType,
    deliveryFee,
    ppnAmount,
    total,
    voucherId,
    promoId,
  });
};

export const createCheckout = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = checkoutSchema.safeParse(req.body);
  if (!parse.success) { errorResponse(res, 'Validasi gagal', 400, parse.error.flatten().fieldErrors); return; }

  const userId = req.user!.userId;
  const { addressId, deliveryMethod, discountCode } = parse.data;

  const [cart, address, wallet] = await Promise.all([
    prisma.cart.findUnique({
      where: { buyerId: userId },
      include: { items: { include: { product: { include: { store: true } } } } },
    }),
    prisma.address.findFirst({ where: { id: addressId, userId } }),
    prisma.wallet.findUnique({ where: { userId } }),
  ]);

  if (!cart || cart.items.length === 0) { errorResponse(res, 'Keranjang kosong', 400); return; }
  if (!address) { errorResponse(res, 'Alamat tidak ditemukan', 404); return; }
  if (!wallet) { errorResponse(res, 'Wallet tidak ditemukan', 404); return; }

  const storeId = cart.items[0].product.storeId;

  for (const item of cart.items) {
    if (!item.product.isActive) { errorResponse(res, `Produk "${item.product.name}" tidak tersedia`, 400); return; }
    if (item.product.stock < item.quantity) { errorResponse(res, `Stok "${item.product.name}" tidak cukup`, 400); return; }
  }

  const subtotal = cart.items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
  const deliveryFee = DELIVERY_FEES[deliveryMethod];

  let discountAmount = 0;
  let discountType: string | null = null;
  let voucherId: string | null = null;
  let promoId: string | null = null;

  if (discountCode) {
    const result = await validateDiscount(discountCode, subtotal);
    if (result.error) { errorResponse(res, result.error, 400); return; }
    discountAmount = result.discountAmount!;
    discountType = result.type!;
    voucherId = result.voucherId ?? null;
    promoId = result.promoId ?? null;
  }

  const ppnBase = subtotal - discountAmount;
  const ppnAmount = ppnBase * 0.12;
  const total = ppnBase + ppnAmount + deliveryFee;

  if (Number(wallet.balance) < total) {
    errorResponse(res, 'Saldo tidak mencukupi untuk melakukan checkout', 400);
    return;
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Kurangi stok
      for (const item of cart.items) {
        const prod = await tx.product.findUnique({ where: { id: item.productId } });
        if (!prod || prod.stock < item.quantity) throw new Error(`Stok "${item.product.name}" habis`);
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Debit wallet
      await tx.wallet.update({ where: { userId }, data: { balance: { decrement: total } } });

      // Buat order
      const newOrder = await tx.order.create({
        data: {
          buyerId: userId,
          storeId,
          addressId,
          deliveryMethod,
          subtotal,
          discountAmount,
          voucherId,
          promoId,
          deliveryFee,
          ppnAmount,
          totalAmount: total,
          status: 'SEDANG_DIKEMAS',
        },
      });

      // Order items (snapshot harga)
      await tx.orderItem.createMany({
        data: cart.items.map((i) => ({
          orderId: newOrder.id,
          productId: i.productId,
          productName: i.product.name,
          productPrice: i.product.price,
          quantity: i.quantity,
          subtotal: Number(i.product.price) * i.quantity,
        })),
      });

      // Status history
      await tx.orderStatusHistory.create({
        data: { orderId: newOrder.id, status: 'SEDANG_DIKEMAS', note: 'Pesanan berhasil dibuat' },
      });

      // Wallet transaction
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'PAYMENT',
          amount: -total,
          description: `Pembayaran pesanan #${newOrder.id.slice(-8).toUpperCase()}`,
          orderId: newOrder.id,
        },
      });

      // Increment voucher usage
      if (voucherId) {
        await tx.voucher.update({ where: { id: voucherId }, data: { usedCount: { increment: 1 } } });
      }

      // Buat delivery job
      await tx.deliveryJob.create({ data: { orderId: newOrder.id } });

      // Kosongkan cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({ where: { id: cart.id }, data: { storeId: null } });

      return newOrder;
    });

    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true, statusHistory: true, store: true, address: true },
    });

    successResponse(res, fullOrder, 'Pesanan berhasil dibuat', 201);
  } catch (err: any) {
    errorResponse(res, err.message || 'Gagal membuat pesanan', 400);
  }
};

export const validateDiscountCode = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = z.object({ code: z.string(), subtotal: z.number() }).safeParse(req.body);
  if (!parse.success) { errorResponse(res, 'Validasi gagal', 400); return; }

  const result = await validateDiscount(parse.data.code, parse.data.subtotal);
  if (result.error) { errorResponse(res, result.error, 400); return; }

  successResponse(res, { valid: true, type: result.type, discountAmount: result.discountAmount });
};

// ── Buyer Orders ───────────────────────────────────────────────────────────

export const getBuyerOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const status = req.query.status as string | undefined;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = { buyerId: userId, ...(status && { status: status as any }) };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { store: { select: { name: true } }, items: true, statusHistory: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  successResponse(res, { orders, total, page, totalPages: Math.ceil(total / limit) });
};

export const getBuyerOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id as string, buyerId: req.user!.userId },
    include: {
      store: true,
      address: true,
      items: { include: { product: { select: { imageUrl: true } } } },
      statusHistory: { orderBy: { createdAt: 'asc' } },
      deliveryJob: { include: { driver: { select: { username: true } } } },
      voucher: { select: { code: true } },
      promo: { select: { code: true } },
    },
  });

  if (!order) { errorResponse(res, 'Pesanan tidak ditemukan', 404); return; }
  successResponse(res, order);
};

export const getBuyerSpendingReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const orders = await prisma.order.findMany({
    where: { buyerId: req.user!.userId, status: 'PESANAN_SELESAI' },
    select: { totalAmount: true, createdAt: true, id: true, store: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  successResponse(res, { totalSpent, orderCount: orders.length, orders });
};
