import { Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import ThemeToggle from '../ThemeToggle.jsx';
import ColorPicker from '../ColorPicker.jsx';

export default function Navbar({ onMenuClick }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('লগআউট সফল হয়েছে');
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <ColorPicker />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{admin?.name}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{admin?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-rose-100 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-900/40 dark:hover:text-rose-300"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">লগআউট</span>
        </button>
      </div>
    </header>
  );
}
