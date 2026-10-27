import mongoose from 'mongoose';

// Expense categories, following the mosque/madrasha financial bidhi document, section 10
export const EXPENSE_CATEGORIES = [
  'staff_salary', // ইমাম/খতিব, শিক্ষক, খাদেম ও অন্যান্য স্টাফের বেতন-ভাতা
  'student_food', // মাদ্রাসার ছাত্র ও শিক্ষকদের দৈনন্দিনের খাবার
  'utility_bill', // বিদ্যুৎ, পানি ও অন্যান্য ইউটিলিটি বিল
  'maintenance', // মসজিদ ও মাদ্রাসার দৈনন্দিন রক্ষণাবেক্ষণ
  'small_infrastructure', // স্বল্পমেয়াদী অবকাঠামো তৈরি/পরিবর্তন/পরিবর্ধন/সংস্কার
  'mahfil_expense', // মাসিক/বাৎসরিক মাহফিল ব্যয়
  'student_scholarship', // ছাত্রদের বৃত্তি বা উপবৃত্তি
  'student_clothing', // ছাত্রদের পোশাক-পরিচ্ছদ বাবদ ব্যয়
  'hospitality', // আপ্যায়ণ বাবদ ব্যয়
  'other',
];

export const FUNDS = ['mosque', 'madrasha', 'orphan_poor_fund'];

// Two disbursement modes described in the bidhi, section 11
export const EXPENSE_METHODS = ['advance_cash', 'tender'];

const expenseSchema = new mongoose.Schema(
  {
    fund: { type: String, enum: FUNDS, required: true, default: 'mosque' },
    category: { type: String, enum: EXPENSE_CATEGORIES, required: true },
    method: { type: String, enum: EXPENSE_METHODS, required: true, default: 'advance_cash' },
    paidTo: { type: String, trim: true, required: true },
    amount: { type: Number, required: true, min: 1 },
    voucherNo: { type: String, trim: true },
    date: { type: Date, required: true, default: Date.now },
    demandNote: { type: mongoose.Schema.Types.ObjectId, ref: 'DemandNote' },
    deliveryChalanAttached: { type: Boolean, default: false },
    paymentChannel: { type: String, enum: ['bank', 'cash', 'bkash', 'rocket'], default: 'cash' },
    notes: { type: String, trim: true },
    // Section 15 required signatures on the expense register
    signatures: {
      auditor: { type: Boolean, default: false },
      treasurer: { type: Boolean, default: false },
      generalSecretary: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

expenseSchema.index({ date: -1 });
expenseSchema.index({ fund: 1, date: -1 });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
