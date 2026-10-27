import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { Field, Input, Select } from '../../components/ui/Field.jsx';
import { FUND_LABELS, INCOME_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '../../utils/constants';
import { formatDateInput } from '../../utils/formatCurrency';

const EMPTY_FORM = {
  fund: 'mosque',
  incomeType: 'monthly_regular_donation',
  donorName: '',
  donorPhone: '',
  amount: '',
  paymentMethod: 'cash',
  receiptNo: '',
  collectedBy: '',
  date: formatDateInput(new Date()),
  notes: '',
};

export default function IncomeFormModal({ open, onClose, onSaved, editing }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        ...EMPTY_FORM,
        ...editing,
        date: formatDateInput(editing.date),
      });
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
        await api.put(`/income/${editing._id}`, form);
        toast.success('আপডেট করা হয়েছে');
      } else {
        await api.post('/income', form);
        toast.success('আয় যোগ করা হয়েছে');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'সংরক্ষণ করা যায়নি');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'আয় সম্পাদনা করুন' : 'নতুন আয় যোগ করুন'}>
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
          <Field label="আয়ের ধরন" required>
            <Select value={form.incomeType} onChange={update('incomeType')} required>
              {Object.entries(INCOME_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="দাতার নাম">
            <Input value={form.donorName} onChange={update('donorName')} placeholder="অজ্ঞাত দাতা" />
          </Field>
          <Field label="দাতার মোবাইল নম্বর">
            <Input value={form.donorPhone} onChange={update('donorPhone')} placeholder="01XXXXXXXXX" />
          </Field>
          <Field label="পরিমাণ (টাকা)" required>
            <Input type="number" min="1" required value={form.amount} onChange={update('amount')} placeholder="0" />
          </Field>
          <Field label="পেমেন্ট মাধ্যম" required>
            <Select value={form.paymentMethod} onChange={update('paymentMethod')} required>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="রশিদ নম্বর">
            <Input value={form.receiptNo} onChange={update('receiptNo')} placeholder="যেমনঃ ০০১" />
          </Field>
          <Field label="আদায়কারী">
            <Input value={form.collectedBy} onChange={update('collectedBy')} placeholder="আদায়কারীর নাম" />
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
