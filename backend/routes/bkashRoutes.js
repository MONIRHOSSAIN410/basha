import express from 'express';
import { createBkashPayment, bkashCallback, getBkashStatus } from '../controllers/bkashController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: donors are not admins, so payment creation + callback stay unauthenticated
router.post('/create', createBkashPayment);
router.get('/callback', bkashCallback);

// Admin-only: checking status from the dashboard
router.get('/status/:paymentID', protect, getBkashStatus);

export default router;
