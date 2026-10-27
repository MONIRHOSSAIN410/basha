import { useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Palette, Moon } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import { Field, Input } from '../components/ui/Field.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import ColorPicker from '../components/ColorPicker.jsx';

export default function Settings() {
  const { admin } = useAuth();
  const { dark } = useTheme();
  const [form, setForm] = useState({ name: admin?.name || '', email: admin?.email || '', password: '' });
  const [saving, setSaving] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const { data } = await api.put('/auth/update', payload);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      toast.success('প্রোফাইল আপডেট হয়েছে');
      setForm((f) => ({ ...f, password: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'আপডেট করা যায়নি');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 sm:text-2xl">সেটিংস</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500">প্রোফাইল এবং থিম কাস্টমাইজ করুন</p>
      </div>

      <Card>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <Palette size={16} /> থিম কালার
        </h2>
        <ColorPicker />

        <div className="mt-6 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Moon size={16} /> ডার্ক মোড {dark ? '(চালু)' : '(বন্ধ)'}
          </span>
          <ThemeToggle />
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">এডমিন প্রোফাইল</h2>
        <form onSubmit={handleSubmit}>
          <Field label="নাম" required>
            <Input required value={form.name} onChange={update('name')} />
          </Field>
          <Field label="ইমেইল" required>
            <Input type="email" required value={form.email} onChange={update('email')} />
          </Field>
          <Field label="নতুন পাসওয়ার্ড">
            <Input type="password" value={form.password} onChange={update('password')} placeholder="পরিবর্তন করতে না চাইলে খালি রাখুন" />
          </Field>
          <Button type="submit" loading={saving}>
            <Save size={16} />
            সংরক্ষণ করুন
          </Button>
        </form>
      </Card>
    </div>
  );
}
