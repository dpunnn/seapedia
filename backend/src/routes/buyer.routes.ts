import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
  getWallet, topUp,
  getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress,
  getCart, addToCart, updateCartItem, removeCartItem, clearCart,
  previewCheckout, createCheckout, validateDiscountCode,
  getBuyerOrders, getBuyerOrderById, getBuyerSpendingReport,
} from '../controllers/buyer.controller';

const router = Router();

router.use(verifyJWT, requireRole('BUYER'));

router.get('/wallet', getWallet);
router.post('/wallet/topup', topUp);

router.get('/addresses', getAddresses);
router.post('/addresses', createAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.post('/addresses/:id/default', setDefaultAddress);

router.get('/cart', getCart);
router.post('/cart/items', addToCart);
router.put('/cart/items/:id', updateCartItem);
router.delete('/cart/items/:id', removeCartItem);
router.delete('/cart', clearCart);

router.post('/checkout/preview', previewCheckout);
router.post('/checkout', createCheckout);
router.post('/discount/validate', validateDiscountCode);

router.get('/orders', getBuyerOrders);
router.get('/orders/:id', getBuyerOrderById);
router.get('/report/spending', getBuyerSpendingReport);

export default router;
