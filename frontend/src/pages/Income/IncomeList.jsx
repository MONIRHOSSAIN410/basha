import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Loader from '../../components/ui/Loader.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Input, Select } from '../../components/ui/Field.jsx';
import { formatBDT, formatDate } from '../../utils/formatCurrency';
import { FUND_LABELS, INCOME_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '../../utils/constants';
import IncomeFormModal from './IncomeFormModal.jsx';

export default function IncomeList() {
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ fund: '', paymentMethod: '', search: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await api.get('/income', { params });
      setItems(data.items);
      setTotalAmount(data.totalAmount);
    } catch (err) {
      toast.error(err.response?.data?.message || 'আয়ের তালিকা লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchItems, 250); // debounce search typing
    return () => clearTimeout(timer);
  }, [fetchItems]);

  const handleDelete = async (id) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই তথ্যটি মুছে ফেলতে চান?')) return;
    try {
      await api.delete(`/income/${id}`);
      toast.success('মুছে ফেলা হয়েছে');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'মুছে ফেলা যায়নি');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 sm:text-2xl">আয় ব্যবস্থাপনা</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">মোট: {formatBDT(totalAmount)}</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} />
          নতুন আয় যোগ করুন
        </Button>
      </div>

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="দাতার নাম, ফোন বা রশিদ নম্বর দিয়ে খুঁজুন"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="pl-9"
            />
          </div>
          <Select value={filters.fund} onChange={(e) => setFilters((f) => ({ ...f, fund: e.target.value }))}>
            <option value="">সকল ফান্ড</option>
            {Object.entries(FUND_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Select
            value={filters.paymentMethod}
            onChange={(e) => setFilters((f) => ({ ...f, paymentMethod: e.target.value }))}
          >
            <option value="">সকল মাধ্যম</option>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>

        {loading ? (
          <Loader />
        ) : items.length === 0 ? (
          <EmptyState message="কোনো আয়ের তথ্য পাওয়া যায়নি" />
        ) : (
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                  <th className="px-4 py-2.5 sm:px-2">তারিখ</th>
                  <th className="px-4 py-2.5 sm:px-2">দাতা</th>
                  <th className="px-4 py-2.5 sm:px-2">ফান্ড</th>
                  <th className="px-4 py-2.5 sm:px-2">ধরন</th>
                  <th className="px-4 py-2.5 sm:px-2">মাধ্যম</th>
                  <th className="px-4 py-2.5 text-right sm:px-2">পরিমাণ</th>
                  <th className="px-4 py-2.5 text-right sm:px-2">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => (
                  <tr key={item._id} className="text-slate-600 dark:text-slate-300">
                    <td className="whitespace-nowrap px-4 py-3 sm:px-2">{formatDate(item.date)}</td>
                    <td className="px-4 py-3 sm:px-2">
                      <p className="font-medium text-slate-700 dark:text-slate-200">{item.donorName}</p>
                      {item.donorPhone && <p className="text-xs text-slate-400">{item.donorPhone}</p>}
                    </td>
                    <td className="px-4 py-3 sm:px-2">
                      <Badge tone={item.fund === 'orphan_poor_fund' ? 'amber' : 'primary'}>
                        {FUND_LABELS[item.fund]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs sm:px-2">{INCOME_TYPE_LABELS[item.incomeType]}</td>
                    <td className="px-4 py-3 sm:px-2">
                      <Badge tone={item.paymentMethod === 'bkash' ? 'green' : 'slate'}>
                        {PAYMENT_METHOD_LABELS[item.paymentMethod]}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 sm:px-2">
                      {formatBDT(item.amount)}
                    </td>
                    <td className="px-4 py-3 sm:px-2">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditing(item);
                            setModalOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          aria-label="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                          aria-label="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <IncomeFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          fetchItems();
        }}
        editing={editing}
      />
    </div>
  );
}
