import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { dark, toggleDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleDark}
      aria-label="Toggle dark mode"
      className="relative flex h-9 w-16 items-center rounded-full bg-slate-200 px-1 transition-colors duration-300 dark:bg-slate-700"
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md dark:bg-slate-900"
        style={{ marginLeft: dark ? 'auto' : 0 }}
      >
        {dark ? <Moon size={16} className="text-primary-400" /> : <Sun size={16} className="text-primary-600" />}
      </motion.span>
    </button>
  );
}
