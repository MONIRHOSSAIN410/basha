import asyncHandler from 'express-async-handler';
import Income from '../models/Income.js';
import * as bkash from '../utils/bkashService.js';

// @desc    Start a bKash payment for a public donation (donor is NOT required to log in)
// @route   POST /api/bkash/create
// @body    { fund, incomeType, donorName, donorPhone, amount }
export const createBkashPayment = asyncHandler(async (req, res) => {
  const { fund, incomeType, donorName, donorPhone, amount } = req.body;

  if (!amount || Number(amount) < 10) {
    res.status(400);
    throw new Error('সর্বনিম্ন ১০ টাকা দান করা যাবে');
  }

  // Create a "pending" income record first so we have an invoice number to hand to bKash
  const income = await Income.create({
    fund: fund || 'mosque',
    incomeType: incomeType || 'one_time_donation',
    donorName: donorName || 'অজ্ঞাত দাতা',
    donorPhone,
    amount,
    paymentMethod: 'bkash',
    source: 'public_donation',
    verified: false,
    bkash: { status: 'initiated' },
  });

  try {
    const payment = await bkash.createPayment({
      amount,
      invoiceNumber: String(income._id),
      callbackURL: `${process.env.BKASH_CALLBACK_URL}?incomeId=${income._id}`,
    });

    income.bkash.paymentID = payment.paymentID;
    await income.save();

    res.status(201).json({ success: true, bkashURL: payment.bkashURL, paymentID: payment.paymentID, incomeId: income._id });
  } catch (err) {
    income.bkash.status = 'failed';
    await income.save();
    res.status(err.statusCode || 502);
    throw new Error(err.response?.data?.msg || err.message || 'bKash পেমেন্ট শুরু করা যায়নি');
  }
});

// @desc    bKash redirects the donor's browser here after they approve/cancel payment
// @route   GET /api/bkash/callback
export const bkashCallback = asyncHandler(async (req, res) => {
  const { paymentID, status, incomeId } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  if (status !== 'success') {
    if (incomeId) {
      await Income.findByIdAndUpdate(incomeId, { 'bkash.status': status === 'cancel' ? 'cancelled' : 'failed' });
    }
    return res.redirect(`${clientUrl}/donate/result?status=${status || 'failed'}`);
  }

  try {
    const result = await bkash.executePayment(paymentID);
    const income = incomeId ? await Income.findById(incomeId) : null;

    if (result.transactionStatus === 'Completed') {
      if (income) {
        income.bkash.status = 'completed';
        income.bkash.trxID = result.trxID;
        income.verified = true;
        await income.save();
      }
      return res.redirect(`${clientUrl}/donate/result?status=success&trxID=${result.trxID}`);
    }

    if (income) {
      income.bkash.status = 'failed';
      await income.save();
    }
    res.redirect(`${clientUrl}/donate/result?status=failed`);
  } catch (err) {
    if (incomeId) {
      await Income.findByIdAndUpdate(incomeId, { 'bkash.status': 'failed' });
    }
    res.redirect(`${clientUrl}/donate/result?status=failed`);
  }
});

// @desc    Poll a payment's status from the admin/donor UI
// @route   GET /api/bkash/status/:paymentID
export const getBkashStatus = asyncHandler(async (req, res) => {
  const result = await bkash.queryPayment(req.params.paymentID);
  res.status(200).json({ success: true, result });
});
