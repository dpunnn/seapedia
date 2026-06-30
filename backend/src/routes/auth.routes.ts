import { Router } from 'express';
import { register, login, selectRole, logout, getMe } from '../controllers/auth.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/select-role', verifyJWT, selectRole);
router.post('/logout', verifyJWT, logout);
router.get('/me', verifyJWT, getMe);

export default router;
