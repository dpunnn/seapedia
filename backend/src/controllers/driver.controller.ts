import { Response } from 'express';
import prisma from '../utils/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAvailableJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  const jobs = await prisma.deliveryJob.findMany({
    where: { status: 'AVAILABLE', driverId: null },
    include: {
      order: {
        include: {
          store: { select: { name: true } },
          address: true,
          items: { select: { productName: true, quantity: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
  successResponse(res, jobs);
};

export const getActiveJob = async (req: AuthRequest, res: Response): Promise<void> => {
  const job = await prisma.deliveryJob.findFirst({
    where: { driverId: req.user!.userId, status: 'TAKEN' },
    include: {
      order: {
        include: {
          store: { select: { name: true } },
          address: true,
          buyer: { select: { username: true } },
          items: true,
        },
      },
    },
  });
  successResponse(res, job);
};

export const getJobHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const jobs = await prisma.deliveryJob.findMany({
    where: { driverId: req.user!.userId, status: 'COMPLETED' },
    include: {
      order: { include: { store: { select: { name: true } }, address: true } },
    },
    orderBy: { completedAt: 'desc' },
  });

  const totalEarnings = jobs.reduce((sum, j) => sum + Number(j.earnings ?? 0), 0);
  successResponse(res, { jobs, totalEarnings });
};

export const getJobDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  const job = await prisma.deliveryJob.findFirst({
    where: {
      orderId: req.params.orderId as string,
      OR: [{ status: 'AVAILABLE', driverId: null }, { driverId: req.user!.userId }],
    },
    include: {
      order: {
        include: {
          store: true,
          address: true,
          items: true,
          buyer: { select: { username: true } },
        },
      },
    },
  });

  if (!job) { errorResponse(res, 'Job tidak ditemukan', 404); return; }
  successResponse(res, job);
};

export const takeJob = async (req: AuthRequest, res: Response): Promise<void> => {
  const driverId = req.user!.userId;
  const orderId = req.params.orderId as string;

  // Cek driver sudah punya job aktif
  const activeJob = await prisma.deliveryJob.findFirst({
    where: { driverId, status: 'TAKEN' },
  });
  if (activeJob) {
    errorResponse(res, 'Anda masih memiliki job yang sedang dikerjakan', 400);
    return;
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Atomic take: hanya berhasil jika masih AVAILABLE dan belum ada driver
      const updated = await tx.deliveryJob.updateMany({
        where: { orderId, status: 'AVAILABLE', driverId: null },
        data: { driverId, status: 'TAKEN', takenAt: new Date() },
      });

      if (updated.count === 0) {
        throw new Error('Job sudah diambil oleh driver lain atau tidak tersedia');
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'SEDANG_DIKIRIM', driverId },
      });

      await tx.orderStatusHistory.create({
        data: { orderId, status: 'SEDANG_DIKIRIM', note: 'Driver sedang mengantarkan pesanan' },
      });

      return tx.deliveryJob.findUnique({
        where: { orderId },
        include: { order: { include: { store: true, address: true } } },
      });
    });

    successResponse(res, result, 'Job berhasil diambil');
  } catch (err: any) {
    errorResponse(res, err.message || 'Gagal mengambil job', 400);
  }
};

export const completeJob = async (req: AuthRequest, res: Response): Promise<void> => {
  const driverId = req.user!.userId;
  const orderId = req.params.orderId as string;

  const job = await prisma.deliveryJob.findUnique({
    where: { orderId },
    include: { order: true },
  });

  if (!job) { errorResponse(res, 'Job tidak ditemukan', 404); return; }
  if (job.driverId !== driverId) { errorResponse(res, 'Bukan job Anda', 403); return; }
  if (job.status !== 'TAKEN') { errorResponse(res, 'Job tidak dalam status aktif', 400); return; }

  const earnings = Number(job.order.deliveryFee) * 0.8;

  const driverWallet = await prisma.wallet.findUnique({ where: { userId: driverId } });
  if (!driverWallet) { errorResponse(res, 'Wallet driver tidak ditemukan', 404); return; }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: 'PESANAN_SELESAI' } });
    await tx.orderStatusHistory.create({
      data: { orderId, status: 'PESANAN_SELESAI', note: 'Pesanan berhasil diterima oleh pembeli' },
    });
    await tx.deliveryJob.update({
      where: { orderId },
      data: { status: 'COMPLETED', earnings, completedAt: new Date() },
    });
    await tx.wallet.update({
      where: { userId: driverId },
      data: { balance: { increment: earnings } },
    });
    await tx.walletTransaction.create({
      data: {
        walletId: driverWallet.id,
        type: 'EARNING',
        amount: earnings,
        description: `Penghasilan pengiriman #${orderId.slice(-8).toUpperCase()}`,
        orderId,
      },
    });
  });

  successResponse(res, { orderId, earnings }, 'Pengiriman berhasil dikonfirmasi');
};
