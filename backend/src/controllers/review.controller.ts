import { Request, Response } from 'express';
import { z } from 'zod';
import validator from 'validator';
import prisma from '../utils/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const createReviewSchema = z.object({
  reviewerName: z.string().min(2, 'Nama minimal 2 karakter'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, 'Komentar minimal 5 karakter'),
});

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = createReviewSchema.safeParse(req.body);
  if (!parse.success) {
    errorResponse(res, 'Validasi gagal', 400, parse.error.flatten().fieldErrors);
    return;
  }

  const { reviewerName, rating, comment } = parse.data;
  const safeComment = validator.escape(comment);
  const safeName = validator.escape(reviewerName);

  const review = await prisma.appReview.create({
    data: {
      reviewerName: safeName,
      rating,
      comment: safeComment,
      userId: req.user?.userId ?? null,
    },
  });

  successResponse(res, review, 'Review berhasil ditambahkan', 201);
};

export const getReviews = async (_req: Request, res: Response): Promise<void> => {
  const reviews = await prisma.appReview.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  successResponse(res, reviews);
};
