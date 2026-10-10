import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(undefined);

const THEME_KEY = 'rejlers-hrms-theme';

/** Reads the user's saved theme choice, or null to fall back to the OS preference. */
const readStoredTheme = () => {
  const raw = window.localStorage.getItem(THEME_KEY);
  return raw === 'dark' || raw === 'light' ? raw : null;
};

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

/** App-wide light/dark theme, applied as a `dark` class on `<html>` and persisted to localStorage. */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => readStoredTheme() || (prefersDark() ? 'dark' : 'light'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/** Accesses the shared theme state and toggle action; must be called within a ThemeProvider. */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
