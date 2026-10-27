import mongoose from 'mongoose';

// Income source categories, following the mosque/madrasha financial bidhi document
export const INCOME_TYPES = [
  'monthly_regular_donation', // মাসিক নিয়মিত চাঁদা বা অনুদান
  'one_time_donation', // অনিয়মিত বা এককালীন অনুদান
  'friday_box_donation', // জুমার দিনের দান বাক্স
  'other_box_donation', // অন্যান্য দান বাক্স
  'annual_mahfil_donation', // বার্ষিক মাহফিল থেকে প্রাপ্ত দান
  'direct_expense_donation', // দাতা কর্তৃক সরাসরি ব্যয় করার মাধ্যমে অনুদান
  'orphan_poor_fund', // এতিম ও মিসকিন ফান্ডে প্রাপ্ত অনুদান (যাকাত, ফিতরা, কোরবানির চামড়া)
  'property_rent', // মসজিদের সম্পদ ভাড়া থেকে প্রাপ্ত আয়
  'old_item_sale', // পুরনো ও অব্যবহৃত জিনিস বিক্রি থেকে প্রাপ্ত অর্থ
  'other',
];

export const FUNDS = ['mosque', 'madrasha', 'orphan_poor_fund'];

export const PAYMENT_METHODS = ['cash', 'bkash', 'rocket', 'bank', 'other'];

const incomeSchema = new mongoose.Schema(
  {
    fund: { type: String, enum: FUNDS, required: true, default: 'mosque' },
    incomeType: { type: String, enum: INCOME_TYPES, required: true },
    donorName: { type: String, trim: true, default: 'অজ্ঞাত দাতা' },
    donorPhone: { type: String, trim: true },
    amount: { type: Number, required: true, min: 1 },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true, default: 'cash' },
    // Receipt paper color per the bidhi: yellow for orphan/poor fund, blue for everything else
    receiptColor: { type: String, enum: ['yellow', 'blue'], default: 'blue' },
    receiptNo: { type: String, trim: true },
    collectedBy: { type: String, trim: true, default: 'Admin' },
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true },
    source: { type: String, enum: ['manual', 'public_donation'], default: 'manual' },
    bkash: {
      paymentID: { type: String },
      trxID: { type: String },
      status: { type: String, enum: ['initiated', 'completed', 'failed', 'cancelled'] },
    },
    verified: { type: Boolean, default: true }, // manual entries auto-verified by admin; bKash flips true on execute success
  },
  { timestamps: true }
);

incomeSchema.pre('validate', function setReceiptColor(next) {
  this.receiptColor = this.fund === 'orphan_poor_fund' ? 'yellow' : 'blue';
  next();
});

incomeSchema.index({ date: -1 });
incomeSchema.index({ fund: 1, date: -1 });

const Income = mongoose.model('Income', incomeSchema);

export default Income;
