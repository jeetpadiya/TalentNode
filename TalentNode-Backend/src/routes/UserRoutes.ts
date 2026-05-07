import express from 'express';
import { registerUser, loginUser, getUserProfile, checkUserEmail } from '../controllers/UserControlller.js';
import { authenticateToken } from '../middleware/UserMiddleware.js';

const router = express.Router();

router.post('/check-email', checkUserEmail);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authenticateToken, getUserProfile);

export default router;
