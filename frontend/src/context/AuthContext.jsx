import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

// Restoring from localStorage synchronously (no loading spinner, no
// "checking session" round trip) is what makes the very first paint feel
// instant instead of buffering on a network call before showing the app.
const getStoredAdmin = () => {
  try {
    const raw = localStorage.getItem('admin');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(getStoredAdmin);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      setAdmin(data.admin);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setAdmin(null);
    try {
      await api.post('/auth/logout');
    } catch {
      /* already logged out client-side either way */
    }
  }, []);

  const value = useMemo(
    () => ({ admin, isAuthenticated: Boolean(admin), loading, login, logout }),
    [admin, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
