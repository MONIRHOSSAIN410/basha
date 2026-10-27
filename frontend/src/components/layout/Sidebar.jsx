import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  HandCoins,
  ReceiptText,
  ClipboardCheck,
  BarChart3,
  Settings as SettingsIcon,
  X,
  Landmark,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, end: true },
  { to: '/income', label: 'আয় ব্যবস্থাপনা', icon: HandCoins },
  { to: '/expense', label: 'ব্যয় ব্যবস্থাপনা', icon: ReceiptText },
  { to: '/demand-notes', label: 'চাহিদাপত্র (অনুমোদন)', icon: ClipboardCheck },
  { to: '/reports', label: 'মাসিক রিপোর্ট', icon: BarChart3 },
  { to: '/settings', label: 'সেটিংস', icon: SettingsIcon },
];

function NavItems({ onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`
          }
        >
          <Icon size={18} />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
      <Brand />
      <NavItems />
    </aside>
  );
}

export function MobileSidebar({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-2xl dark:bg-slate-900 lg:hidden"
          >
            <div className="flex items-center justify-between">
              <Brand />
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="mr-3 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>
            <NavItems onNavigate={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
        <Landmark size={18} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">মসজিদ ও মাদ্রাসা</p>
        <p className="truncate text-xs text-slate-400 dark:text-slate-500">আর্থিক ব্যবস্থাপনা</p>
      </div>
    </div>
  );
}
