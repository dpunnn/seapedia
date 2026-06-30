import { Router } from 'express';
import { createReview, getReviews } from '../controllers/review.controller';
import { optionalJWT } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getReviews);
router.post('/', optionalJWT, createReview);

export default router;
