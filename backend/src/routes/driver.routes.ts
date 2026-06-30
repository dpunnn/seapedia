import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
  getAvailableJobs, getActiveJob, getJobHistory, getJobDetail, takeJob, completeJob,
} from '../controllers/driver.controller';

const router = Router();

router.use(verifyJWT, requireRole('DRIVER'));

router.get('/jobs', getAvailableJobs);
router.get('/jobs/active', getActiveJob);
router.get('/jobs/history', getJobHistory);
router.get('/jobs/:orderId', getJobDetail);
router.post('/jobs/:orderId/take', takeJob);
router.post('/jobs/:orderId/complete', completeJob);

export default router;
