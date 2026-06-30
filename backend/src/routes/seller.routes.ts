import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
  createStore, getMyStore, updateStore,
  createProduct, getMyProducts, updateProduct, deleteProduct,
  getPublicStore,
  getSellerOrders, getSellerOrderById, processOrder,
  getSellerIncome, checkStoreName,
} from '../controllers/seller.controller';

const router = Router();

// Public
router.get('/stores/:id', getPublicStore);

// Authenticated seller
router.use(verifyJWT, requireRole('SELLER'));

router.get('/store', getMyStore);
router.post('/store', createStore);
router.put('/store', updateStore);
router.get('/store/check-name', checkStoreName);

router.get('/products', getMyProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/orders', getSellerOrders);
router.get('/orders/:id', getSellerOrderById);
router.post('/orders/:id/process', processOrder);

router.get('/income', getSellerIncome);

export default router;
