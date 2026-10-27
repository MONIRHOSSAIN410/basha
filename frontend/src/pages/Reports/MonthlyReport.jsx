import { useEffect, useState, useCallback } from 'react';
import { Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { Select } from '../../components/ui/Field.jsx';
import { formatBDT, formatDate } from '../../utils/formatCurrency';
import { FUND_LABELS, EXPENSE_CATEGORY_LABELS, INCOME_TYPE_LABELS } from '../../utils/constants';

const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
];

const now = new Date();

export default function MonthlyReport() {
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/dashboard/monthly-report', { params: { year, month } });
      setReport(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'রিপোর্ট লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 sm:text-2xl">মাসিক আয়-ব্যয়ের রিপোর্ট</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">নিরীক্ষক / অর্থ সম্পাদক / সাধারণ সম্পাদক / সভাপতির স্বাক্ষরের জন্য প্রস্তুত</p>
        </div>
        <div className="flex gap-2">
          <Select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-auto">
            {MONTH_NAMES_BN.map((m, idx) => (
              <option key={m} value={idx + 1}>
                {m}
              </option>
            ))}
          </Select>
          <Select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-auto">
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer size={16} />
            প্রিন্ট
          </Button>
        </div>
      </div>

      {loading || !report ? (
        <Loader />
      ) : (
        <Card className="print:shadow-none">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              মাসিক আয়-ব্যয়ের প্রতিবেদন — {MONTH_NAMES_BN[report.month - 1]} {report.year}
            </h2>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-900/20">
              <p className="text-xs text-emerald-600 dark:text-emerald-300">মোট আয়</p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{formatBDT(report.totalIncome)}</p>
            </div>
            <div className="rounded-xl bg-rose-50 p-4 text-center dark:bg-rose-900/20">
              <p className="text-xs text-rose-600 dark:text-rose-300">মোট ব্যয়</p>
              <p className="text-xl font-bold text-rose-700 dark:text-rose-300">{formatBDT(report.totalExpense)}</p>
            </div>
            <div className="rounded-xl bg-primary-50 p-4 text-center dark:bg-primary-900/20">
              <p className="text-xs text-primary-600 dark:text-primary-300">নীট উদ্বৃত্ত</p>
              <p className="text-xl font-bold text-primary-700 dark:text-primary-300">{formatBDT(report.net)}</p>
            </div>
          </div>

          <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">আয়ের বিবরণ</h3>
          <div className="mb-6 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-400 dark:border-slate-800">
                  <th className="py-2">তারিখ</th>
                  <th className="py-2">দাতা</th>
                  <th className="py-2">ফান্ড</th>
                  <th className="py-2">ধরন</th>
                  <th className="py-2 text-right">পরিমাণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {report.incomeItems.map((item) => (
                  <tr key={item._id}>
                    <td className="py-2">{formatDate(item.date)}</td>
                    <td className="py-2">{item.donorName}</td>
                    <td className="py-2">{FUND_LABELS[item.fund]}</td>
                    <td className="py-2 text-xs">{INCOME_TYPE_LABELS[item.incomeType]}</td>
                    <td className="py-2 text-right font-medium text-emerald-600">{formatBDT(item.amount)}</td>
                  </tr>
                ))}
                {report.incomeItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      এই মাসে কোনো আয় নেই
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">ব্যয়ের বিবরণ</h3>
          <div className="mb-8 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-400 dark:border-slate-800">
                  <th className="py-2">তারিখ</th>
                  <th className="py-2">প্রাপক</th>
                  <th className="py-2">ফান্ড</th>
                  <th className="py-2">খাত</th>
                  <th className="py-2 text-right">পরিমাণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {report.expenseItems.map((item) => (
                  <tr key={item._id}>
                    <td className="py-2">{formatDate(item.date)}</td>
                    <td className="py-2">{item.paidTo}</td>
                    <td className="py-2">{FUND_LABELS[item.fund]}</td>
                    <td className="py-2 text-xs">{EXPENSE_CATEGORY_LABELS[item.category]}</td>
                    <td className="py-2 text-right font-medium text-rose-600">{formatBDT(item.amount)}</td>
                  </tr>
                ))}
                {report.expenseItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      এই মাসে কোনো ব্যয় নেই
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-6 text-center text-sm text-slate-500 sm:grid-cols-4">
            <div className="border-t border-slate-300 pt-2 dark:border-slate-700">প্রস্তুতকারী</div>
            <div className="border-t border-slate-300 pt-2 dark:border-slate-700">নিরীক্ষক</div>
            <div className="border-t border-slate-300 pt-2 dark:border-slate-700">অর্থ সম্পাদক</div>
            <div className="border-t border-slate-300 pt-2 dark:border-slate-700">সভাপতি</div>
          </div>
        </Card>
      )}
    </div>
  );
}
