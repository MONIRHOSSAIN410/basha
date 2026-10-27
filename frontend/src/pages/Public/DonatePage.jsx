import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HandHeart, Landmark } from 'lucide-react';
import api from '../../api/axios';
import { Field, Input, Select } from '../../components/ui/Field.jsx';
import Button from '../../components/ui/Button.jsx';
import ThemeToggle from '../../components/ThemeToggle.jsx';
import { FUND_LABELS, INCOME_TYPE_LABELS } from '../../utils/constants';

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

export default function DonatePage() {
  const [form, setForm] = useState({
    fund: 'mosque',
    incomeType: 'one_time_donation',
    donorName: '',
    donorPhone: '',
    amount: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) < 10) {
      toast.error('সর্বনিম্ন ১০ টাকা দান করা যাবে');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/bkash/create', form);
      // Send the donor straight to bKash's hosted checkout page.
      window.location.href = data.bkashURL;
    } catch (err) {
      toast.error(err.response?.data?.message || 'বিকাশ পেমেন্ট শুরু করা যায়নি, একটু পরে চেষ্টা করুন');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-8"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white">
            <Landmark size={26} />
          </div>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">দান করুন</h1>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">বিকাশের মাধ্যমে নিরাপদে দান করুন</p>
        </div>

        <form onSubmit={handleDonate}>
          <Field label="কোন খাতে দান করবেন" required>
            <Select value={form.fund} onChange={update('fund')} required>
              {Object.entries(FUND_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="দানের ধরন" required>
            <Select value={form.incomeType} onChange={update('incomeType')} required>
              {Object.entries(INCOME_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="আপনার নাম">
            <Input value={form.donorName} onChange={update('donorName')} placeholder="ঐচ্ছিক" />
          </Field>
          <Field label="মোবাইল নম্বর">
            <Input value={form.donorPhone} onChange={update('donorPhone')} placeholder="01XXXXXXXXX" />
          </Field>
          <Field label="পরিমাণ (টাকা)" required>
            <Input type="number" min="10" required value={form.amount} onChange={update('amount')} placeholder="0" />
          </Field>

          <div className="mb-4 flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => setForm((f) => ({ ...f, amount: String(amt) }))}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-primary-400 hover:text-primary-600 dark:border-slate-700 dark:text-slate-300"
              >
                {amt}৳
              </button>
            ))}
          </div>

          <Button type="submit" loading={submitting} className="w-full">
            <HandHeart size={16} />
            বিকাশে দান করুন
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
