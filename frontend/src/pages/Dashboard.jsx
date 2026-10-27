import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import StatCard from '../components/ui/StatCard.jsx';
import Card from '../components/ui/Card.jsx';
import Loader from '../components/ui/Loader.jsx';
import { formatBDT } from '../utils/formatCurrency';
import { FUND_LABELS } from '../utils/constants';

const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
];

const PIE_COLORS = ['#0d9488', '#2563eb', '#d97706', '#e11d48', '#7c3aed'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const [summaryRes, trendRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/trend?months=6'),
        ]);
        if (ignore) return;

        setSummary(summaryRes.data);

        const map = new Map();
        trendRes.data.incomeTrend.forEach((t) => {
          const key = `${t._id.year}-${t._id.month}`;
          map.set(key, { key, year: t._id.year, month: t._id.month, income: t.total, expense: 0 });
        });
        trendRes.data.expenseTrend.forEach((t) => {
          const key = `${t._id.year}-${t._id.month}`;
          const existing = map.get(key) || { key, year: t._id.year, month: t._id.month, income: 0, expense: 0 };
          existing.expense = t.total;
          map.set(key, existing);
        });
        const merged = Array.from(map.values())
          .sort((a, b) => a.year - b.year || a.month - b.month)
          .map((row) => ({ ...row, label: MONTH_NAMES_BN[row.month - 1] }));
        setTrend(merged);
      } catch (err) {
        toast.error(err.response?.data?.message || 'ড্যাশবোর্ড লোড করা যায়নি');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) return <Loader full />;
  if (!summary) return null;

  const fundPieData = summary.incomeByFund.map((f) => ({ name: FUND_LABELS[f._id] || f._id, value: f.total }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 sm:text-2xl">ড্যাশবোর্ড</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500">সার্বিক আয়-ব্যয়ের একনজর</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="মোট আয়" value={formatBDT(summary.totalIncome)} icon={TrendingUp} tone="green" />
        <StatCard label="মোট ব্যয়" value={formatBDT(summary.totalExpense)} icon={TrendingDown} tone="red" />
        <StatCard label="বর্তমান ব্যালেন্স" value={formatBDT(summary.balance)} icon={Wallet} tone="primary" />
        <StatCard
          label="অপেক্ষমান চাহিদাপত্র"
          value={summary.pendingDemandNotes}
          icon={ClipboardList}
          tone="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
            মাসিক আয়-ব্যয়ের ধারা (গত ৬ মাস)
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(value) => formatBDT(value)} />
                <Area type="monotone" dataKey="income" name="আয়" stroke="#0d9488" fill="url(#incomeGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" name="ব্যয়" stroke="#e11d48" fill="url(#expenseGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">খাত অনুযায়ী আয় বণ্টন</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fundPieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {fundPieData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatBDT(value)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">সাম্প্রতিক আয়</h2>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {summary.recentIncome.map((item) => (
              <li key={item._id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="truncate text-slate-600 dark:text-slate-300">{item.donorName}</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatBDT(item.amount)}</span>
              </li>
            ))}
            {summary.recentIncome.length === 0 && <p className="py-4 text-sm text-slate-400">কোনো তথ্য নেই</p>}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">সাম্প্রতিক ব্যয়</h2>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {summary.recentExpense.map((item) => (
              <li key={item._id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="truncate text-slate-600 dark:text-slate-300">{item.paidTo}</span>
                <span className="font-medium text-rose-600 dark:text-rose-400">{formatBDT(item.amount)}</span>
              </li>
            ))}
            {summary.recentExpense.length === 0 && <p className="py-4 text-sm text-slate-400">কোনো তথ্য নেই</p>}
          </ul>
        </Card>
      </div>
    </div>
  );
}
