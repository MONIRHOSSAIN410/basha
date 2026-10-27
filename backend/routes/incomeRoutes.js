import express from 'express';
import {
  getIncomes,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeSummary,
} from '../controllers/incomeController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getIncomeSummary);
router.route('/').get(getIncomes).post(createIncome);
router.route('/:id').get(getIncomeById).put(updateIncome).delete(deleteIncome);

export default router;
