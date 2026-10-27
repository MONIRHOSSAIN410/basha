import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { Field, Input, Select } from '../../components/ui/Field.jsx';
import { FUND_LABELS, EXPENSE_CATEGORY_LABELS, EXPENSE_METHOD_LABELS } from '../../utils/constants';
import { formatDateInput } from '../../utils/formatCurrency';

const EMPTY_FORM = {
  fund: 'mosque',
  category: 'staff_salary',
  method: 'advance_cash',
  paidTo: '',
  amount: '',
  voucherNo: '',
  date: formatDateInput(new Date()),
  paymentChannel: 'cash',
  notes: '',
};

export default function ExpenseFormModal({ open, onClose, onSaved, editing }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({ ...EMPTY_FORM, ...editing, date: formatDateInput(editing.date) });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editing, open]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/expense/${editing._id}`, form);
        toast.success('আপডেট করা হয়েছে');
      } else {
        await api.post('/expense', form);
        toast.success('ব্যয় যোগ করা হয়েছে');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'সংরক্ষণ করা যায়নি');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'ব্যয় সম্পাদনা করুন' : 'নতুন ব্যয় যোগ করুন'}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field label="ফান্ড" required>
            <Select value={form.fund} onChange={update('fund')} required>
              {Object.entries(FUND_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="ব্যয়ের খাত" required>
            <Select value={form.category} onChange={update('category')} required>
              {Object.entries(EXPENSE_CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="প্রাপক (কাকে প্রদান করা হয়েছে)" required>
            <Input required value={form.paidTo} onChange={update('paidTo')} placeholder="নাম" />
          </Field>
          <Field label="পরিমাণ (টাকা)" required>
            <Input type="number" min="1" required value={form.amount} onChange={update('amount')} placeholder="0" />
          </Field>
          <Field label="ব্যয়ের মাধ্যম" required>
            <Select value={form.method} onChange={update('method')} required>
              {Object.entries(EXPENSE_METHOD_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="পেমেন্ট চ্যানেল">
            <Select value={form.paymentChannel} onChange={update('paymentChannel')}>
              <option value="cash">নগদ</option>
              <option value="bank">ব্যাংক</option>
              <option value="bkash">বিকাশ</option>
              <option value="rocket">রকেট</option>
            </Select>
          </Field>
          <Field label="ভাউচার নম্বর">
            <Input value={form.voucherNo} onChange={update('voucherNo')} placeholder="যেমনঃ ০০১" />
          </Field>
          <Field label="তারিখ" required>
            <Input type="date" required value={form.date} onChange={update('date')} />
          </Field>
        </div>
        <Field label="মন্তব্য">
          <Input value={form.notes} onChange={update('notes')} placeholder="ঐচ্ছিক" />
        </Field>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            বাতিল
          </Button>
          <Button type="submit" loading={saving}>
            সংরক্ষণ করুন
          </Button>
        </div>
      </form>
    </Modal>
  );
}
