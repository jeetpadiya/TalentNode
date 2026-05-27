import express from 'express';
import { registerUser, loginUser, getUserProfile, checkUserEmail, updateUserProfile } from '../controllers/UserControlller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/check-email', checkUserEmail);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);

export default router;
