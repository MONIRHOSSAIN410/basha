import express from 'express';
import { getDashboardSummary, getMonthlyTrend, getMonthlyReport } from '../controllers/dashboardController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/trend', getMonthlyTrend);
router.get('/monthly-report', getMonthlyReport);

export default router;
