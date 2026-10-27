import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { COLOR_PRESETS } from '../utils/colorPresets';

export default function ColorPicker() {
  const { color, setColor } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {Object.entries(COLOR_PRESETS).map(([key, preset]) => (
        <motion.button
          key={key}
          type="button"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setColor(key)}
          aria-label={preset.label}
          className="relative h-6 w-6 rounded-full ring-offset-2 ring-offset-white dark:ring-offset-slate-900"
          style={{ backgroundColor: preset.swatch, boxShadow: color === key ? `0 0 0 2px ${preset.swatch}` : 'none' }}
        >
          {color === key && (
            <Check size={14} className="absolute inset-0 m-auto text-white drop-shadow" strokeWidth={3} />
          )}
        </motion.button>
      ))}
    </div>
  );
}
