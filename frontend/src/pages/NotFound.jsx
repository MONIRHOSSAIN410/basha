import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-6xl font-bold text-primary-600"
      >
        ৪০৪
      </motion.h1>
      <p className="mt-3 text-slate-500 dark:text-slate-400">পৃষ্ঠাটি খুঁজে পাওয়া যায়নি</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        <Home size={16} />
        হোমে ফিরে যান
      </Link>
    </div>
  );
}
