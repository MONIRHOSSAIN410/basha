import asyncHandler from 'express-async-handler';
import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import DemandNote from '../models/DemandNote.js';

// @desc    Aggregate numbers for the main dashboard (cards + charts)
// @route   GET /api/dashboard/summary
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const [totalIncomeAgg, totalExpenseAgg, incomeByFund, expenseByFund, pendingNotes, recentIncome, recentExpense] =
    await Promise.all([
      Income.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Income.aggregate([{ $group: { _id: '$fund', total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $group: { _id: '$fund', total: { $sum: '$amount' } } }]),
      DemandNote.countDocuments({ status: { $nin: ['paid', 'rejected'] } }),
      Income.find().sort({ date: -1 }).limit(5),
      Expense.find().sort({ date: -1 }).limit(5),
    ]);

  const totalIncome = totalIncomeAgg[0]?.total || 0;
  const totalExpense = totalExpenseAgg[0]?.total || 0;

  res.status(200).json({
    success: true,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    incomeByFund,
    expenseByFund,
    pendingDemandNotes: pendingNotes,
    recentIncome,
    recentExpense,
  });
});

// @desc    Month-by-month income vs expense trend for the last N months (default 6)
// @route   GET /api/dashboard/trend
export const getMonthlyTrend = asyncHandler(async (req, res) => {
  const months = Math.min(Math.max(Number(req.query.months) || 6, 1), 24);
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const groupStage = {
    _id: { year: { $year: '$date' }, month: { $month: '$date' } },
    total: { $sum: '$amount' },
  };

  const [incomeTrend, expenseTrend] = await Promise.all([
    Income.aggregate([{ $match: { date: { $gte: since } } }, { $group: groupStage }, { $sort: { '_id.year': 1, '_id.month': 1 } }]),
    Expense.aggregate([{ $match: { date: { $gte: since } } }, { $group: groupStage }, { $sort: { '_id.year': 1, '_id.month': 1 } }]),
  ]);

  res.status(200).json({ success: true, incomeTrend, expenseTrend });
});

// @desc    Monthly report matching bidhi section 8/12: income & expense report for one month
// @route   GET /api/dashboard/monthly-report?year=2026&month=9
export const getMonthlyReport = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const month = Number(req.query.month) || new Date().getMonth() + 1;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const [incomeItems, expenseItems] = await Promise.all([
    Income.find({ date: { $gte: start, $lt: end } }).sort({ date: 1 }),
    Expense.find({ date: { $gte: start, $lt: end } }).sort({ date: 1 }),
  ]);

  const totalIncome = incomeItems.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = expenseItems.reduce((sum, e) => sum + e.amount, 0);

  res.status(200).json({
    success: true,
    year,
    month,
    incomeItems,
    expenseItems,
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
  });
});
