import asyncHandler from 'express-async-handler';
import Expense from '../models/Expense.js';

// @desc    List expense entries (filterable)
// @route   GET /api/expense
export const getExpenses = asyncHandler(async (req, res) => {
  const { fund, category, from, to, search, page = 1, limit = 20 } = req.query;

  const query = {};
  if (fund) query.fund = fund;
  if (category) query.category = category;
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }
  if (search) {
    query.$or = [
      { paidTo: { $regex: search, $options: 'i' } },
      { voucherNo: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 100);

  const [items, total, totalAmountAgg] = await Promise.all([
    Expense.find(query)
      .populate('demandNote', 'purpose status')
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Expense.countDocuments(query),
    Expense.aggregate([{ $match: query }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);

  res.status(200).json({
    success: true,
    items,
    total,
    totalAmount: totalAmountAgg[0]?.total || 0,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
  });
});

// @desc    Get single expense
// @route   GET /api/expense/:id
export const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id).populate('demandNote');
  if (!expense) {
    res.status(404);
    throw new Error('ব্যয়ের তথ্য পাওয়া যায়নি');
  }
  res.status(200).json({ success: true, item: expense });
});

// @desc    Create expense entry
// @route   POST /api/expense
export const createExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.create(req.body);
  res.status(201).json({ success: true, item: expense });
});

// @desc    Update expense entry (e.g. toggle signatures once physically signed)
// @route   PUT /api/expense/:id
export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!expense) {
    res.status(404);
    throw new Error('ব্যয়ের তথ্য পাওয়া যায়নি');
  }
  res.status(200).json({ success: true, item: expense });
});

// @desc    Delete expense entry
// @route   DELETE /api/expense/:id
export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) {
    res.status(404);
    throw new Error('ব্যয়ের তথ্য পাওয়া যায়নি');
  }
  res.status(200).json({ success: true, message: 'মুছে ফেলা হয়েছে' });
});

// @desc    Summary grouped by fund + category, for dashboard cards
// @route   GET /api/expense/summary
export const getExpenseSummary = asyncHandler(async (req, res) => {
  const byFund = await Expense.aggregate([
    { $group: { _id: '$fund', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  const byCategory = await Expense.aggregate([
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  res.status(200).json({ success: true, byFund, byCategory });
});
