import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { applyColorPreset } from '../utils/colorPresets';

const ThemeContext = createContext(null);

const getInitialDark = () => {
  try {
    const stored = localStorage.getItem('theme:dark');
    if (stored !== null) return stored === 'true';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  } catch {
    return false;
  }
};

const getInitialColor = () => {
  try {
    return localStorage.getItem('theme:color') || 'teal';
  } catch {
    return 'teal';
  }
};

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(getInitialDark);
  const [color, setColor] = useState(getInitialColor);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme:dark', String(dark));
    } catch {
      /* private-browsing / storage blocked — dark mode still applies for this session */
    }
  }, [dark]);

  useEffect(() => {
    applyColorPreset(color);
    try {
      localStorage.setItem('theme:color', color);
    } catch {
      /* ignore */
    }
  }, [color]);

  const toggleDark = useCallback(() => setDark((prev) => !prev), []);

  return (
    <ThemeContext.Provider value={{ dark, toggleDark, setDark, color, setColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
