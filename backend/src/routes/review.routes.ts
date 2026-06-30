import { Router } from 'express';
import { createReview, getReviews } from '../controllers/review.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getReviews);
router.post('/', verifyJWT, createReview);

export default router;
