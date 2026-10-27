import asyncHandler from 'express-async-handler';
import Income from '../models/Income.js';

// @desc    List income entries (filterable by fund, incomeType, date range, search)
// @route   GET /api/income
export const getIncomes = asyncHandler(async (req, res) => {
  const { fund, incomeType, paymentMethod, from, to, search, page = 1, limit = 20 } = req.query;

  const query = {};
  if (fund) query.fund = fund;
  if (incomeType) query.incomeType = incomeType;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }
  if (search) {
    query.$or = [
      { donorName: { $regex: search, $options: 'i' } },
      { donorPhone: { $regex: search, $options: 'i' } },
      { receiptNo: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 100);

  const [items, total, totalAmountAgg] = await Promise.all([
    Income.find(query)
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Income.countDocuments(query),
    Income.aggregate([{ $match: query }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
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

// @desc    Get single income entry
// @route   GET /api/income/:id
export const getIncomeById = asyncHandler(async (req, res) => {
  const income = await Income.findById(req.params.id);
  if (!income) {
    res.status(404);
    throw new Error('আয়ের তথ্য পাওয়া যায়নি');
  }
  res.status(200).json({ success: true, item: income });
});

// @desc    Create a manual income/donation entry
// @route   POST /api/income
export const createIncome = asyncHandler(async (req, res) => {
  const income = await Income.create({ ...req.body, source: 'manual' });
  res.status(201).json({ success: true, item: income });
});

// @desc    Update an income entry
// @route   PUT /api/income/:id
export const updateIncome = asyncHandler(async (req, res) => {
  const income = await Income.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!income) {
    res.status(404);
    throw new Error('আয়ের তথ্য পাওয়া যায়নি');
  }
  res.status(200).json({ success: true, item: income });
});

// @desc    Delete an income entry
// @route   DELETE /api/income/:id
export const deleteIncome = asyncHandler(async (req, res) => {
  const income = await Income.findByIdAndDelete(req.params.id);
  if (!income) {
    res.status(404);
    throw new Error('আয়ের তথ্য পাওয়া যায়নি');
  }
  res.status(200).json({ success: true, message: 'মুছে ফেলা হয়েছে' });
});

// @desc    Summary grouped by fund + incomeType, for dashboard cards
// @route   GET /api/income/summary
export const getIncomeSummary = asyncHandler(async (req, res) => {
  const byFund = await Income.aggregate([
    { $group: { _id: '$fund', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  const byMethod = await Income.aggregate([
    { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  res.status(200).json({ success: true, byFund, byMethod });
});
