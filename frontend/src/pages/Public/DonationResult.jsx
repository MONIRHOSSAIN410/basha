import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function DonationResult() {
  const [params] = useSearchParams();
  const status = params.get('status');
  const trxID = params.get('trxID');
  const success = status === 'success';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 18 }}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900"
      >
        {success ? (
          <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
        ) : (
          <XCircle size={56} className="mx-auto text-rose-500" />
        )}
        <h1 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
          {success ? 'জাযাকাল্লাহু খাইরান!' : 'পেমেন্ট সম্পন্ন হয়নি'}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {success ? 'আপনার দান সফলভাবে গ্রহণ করা হয়েছে।' : 'দুঃখিত, আপনার পেমেন্টটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।'}
        </p>
        {trxID && <p className="mt-2 text-xs text-slate-400">Transaction ID: {trxID}</p>}
        <Link
          to="/donate"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          {success ? 'আরও দান করুন' : 'আবার চেষ্টা করুন'}
        </Link>
      </motion.div>
    </div>
  );
}
