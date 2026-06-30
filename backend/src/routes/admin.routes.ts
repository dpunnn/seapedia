import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
  getStats, getUsers, getAdminOrders, getOverdueOrders,
  getVirtualTime, advanceTime,
  createVoucher, getVouchers, getVoucherById,
  createPromo, getPromos, getPromoById,
  getAdminDeliveries, getAdminStores, getAdminProducts,
} from '../controllers/admin.controller';

const router = Router();

router.use(verifyJWT, requireRole('ADMIN'));

router.get('/stats', getStats);
router.get('/users', getUsers);

router.get('/orders', getAdminOrders);
router.get('/orders/overdue', getOverdueOrders);

router.get('/time', getVirtualTime);
router.post('/time/advance', advanceTime);

router.get('/vouchers', getVouchers);
router.post('/vouchers', createVoucher);
router.get('/vouchers/:id', getVoucherById);

router.get('/promos', getPromos);
router.post('/promos', createPromo);
router.get('/promos/:id', getPromoById);

router.get('/deliveries', getAdminDeliveries);
router.get('/stores', getAdminStores);
router.get('/products', getAdminProducts);

export default router;
