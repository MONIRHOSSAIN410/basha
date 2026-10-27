import express from 'express';
import { loginAdmin, getMe, logoutAdmin, updateAdmin } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/me', protect, getMe);
router.post('/logout', protect, logoutAdmin);
router.put('/update', protect, updateAdmin);

export default router;
