import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'কোনো তথ্য পাওয়া যায়নি', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-slate-400 dark:text-slate-500">
      <Icon size={40} strokeWidth={1.5} />
      <p className="text-sm">{message}</p>
    </div>
  );
}
