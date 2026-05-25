import express from 'express';
import { registerUser, loginUser, getUserProfile, checkUserEmail } from '../controllers/UserControlller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/check-email', checkUserEmail);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authenticate, getUserProfile);

export default router;
