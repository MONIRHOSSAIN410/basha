import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { Field, Input, Select, Textarea } from '../../components/ui/Field.jsx';
import { FUND_LABELS } from '../../utils/constants';

const EMPTY_FORM = { fund: 'mosque', purpose: '', amountRequested: '', requestedBy: '' };

export default function DemandNoteFormModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/demand-notes', form);
      toast.success('চাহিদাপত্র তৈরি করা হয়েছে');
      setForm(EMPTY_FORM);
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'সংরক্ষণ করা যায়নি');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="নতুন চাহিদাপত্র (Demand Note)">
      <form onSubmit={handleSubmit}>
        <Field label="ফান্ড" required>
          <Select value={form.fund} onChange={update('fund')} required>
            {Object.entries(FUND_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="উদ্দেশ্য / কারণ" required>
          <Textarea rows={3} required value={form.purpose} onChange={update('purpose')} placeholder="কী কাজের জন্য টাকা প্রয়োজন" />
        </Field>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Field label="প্রয়োজনীয় অর্থের পরিমাণ (টাকা)" required>
            <Input type="number" min="1" required value={form.amountRequested} onChange={update('amountRequested')} />
          </Field>
          <Field label="আবেদনকারীর নাম" required>
            <Input required value={form.requestedBy} onChange={update('requestedBy')} />
          </Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            বাতিল
          </Button>
          <Button type="submit" loading={saving}>
            জমা দিন
          </Button>
        </div>
      </form>
    </Modal>
  );
}
