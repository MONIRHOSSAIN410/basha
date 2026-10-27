export default function Loader({ full = false, label = 'লোড হচ্ছে...' }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${full ? 'min-h-[60vh]' : 'py-10'}`}>
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-900 dark:border-t-primary-400" />
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}
