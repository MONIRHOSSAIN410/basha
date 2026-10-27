export const FUND_LABELS = {
  mosque: 'মসজিদ',
  madrasha: 'মাদ্রাসা',
  orphan_poor_fund: 'এতিম ও মিসকিন ফান্ড',
};

export const INCOME_TYPE_LABELS = {
  monthly_regular_donation: 'মাসিক নিয়মিত চাঁদা/অনুদান',
  one_time_donation: 'অনিয়মিত/এককালীন অনুদান',
  friday_box_donation: 'জুমার দান বাক্স',
  other_box_donation: 'অন্যান্য দান বাক্স',
  annual_mahfil_donation: 'বার্ষিক মাহফিলের দান',
  direct_expense_donation: 'দাতা কর্তৃক সরাসরি ব্যয়',
  orphan_poor_fund: 'এতিম ও মিসকিন ফান্ড (যাকাত/ফিতরা/চামড়া)',
  property_rent: 'সম্পদ ভাড়া',
  old_item_sale: 'পুরনো জিনিস বিক্রি',
  other: 'অন্যান্য',
};

export const PAYMENT_METHOD_LABELS = {
  cash: 'নগদ',
  bkash: 'বিকাশ',
  rocket: 'রকেট',
  bank: 'ব্যাংক',
  other: 'অন্যান্য',
};

export const EXPENSE_CATEGORY_LABELS = {
  staff_salary: 'ইমাম/শিক্ষক/স্টাফ বেতন-ভাতা',
  student_food: 'ছাত্রদের খাবার',
  utility_bill: 'ইউটিলিটি বিল (বিদ্যুৎ/পানি)',
  maintenance: 'রক্ষণাবেক্ষণ',
  small_infrastructure: 'স্বল্পমেয়াদী অবকাঠামো/সংস্কার',
  mahfil_expense: 'মাহফিল ব্যয়',
  student_scholarship: 'ছাত্র বৃত্তি/উপবৃত্তি',
  student_clothing: 'ছাত্র পোশাক-পরিচ্ছদ',
  hospitality: 'আপ্যায়ণ',
  other: 'অন্যান্য',
};

export const EXPENSE_METHOD_LABELS = {
  advance_cash: 'অগ্রিম নগদ অর্থ প্রদান',
  tender: 'দরপত্র আহবান',
};

export const APPROVAL_STAGE_LABELS = {
  auditor: 'নিরীক্ষক',
  treasurer: 'অর্থ সম্পাদক',
  general_secretary: 'সাধারণ সম্পাদক',
  president: 'সভাপতি',
};

export const DEMAND_NOTE_STATUS_LABELS = {
  pending: 'অপেক্ষমান',
  auditor_approved: 'নিরীক্ষক অনুমোদিত',
  treasurer_approved: 'অর্থ সম্পাদক অনুমোদিত',
  secretary_approved: 'সাধারণ সম্পাদক অনুমোদিত',
  president_approved: 'সভাপতি অনুমোদিত (পরিশোধযোগ্য)',
  rejected: 'বাতিল',
  paid: 'পরিশোধিত',
};

export const DEMAND_NOTE_STATUS_ORDER = [
  'pending',
  'auditor_approved',
  'treasurer_approved',
  'secretary_approved',
  'president_approved',
  'paid',
];
