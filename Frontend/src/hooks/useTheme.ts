import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

let globalTheme: ThemeMode = (typeof window !== 'undefined' 
  ? (localStorage.getItem('solo-track-mode') as ThemeMode) || 'system' 
  : 'system');

const listeners = new Set<(theme: ThemeMode) => void>();

export function useTheme() {
  const [theme, setInternalTheme] = useState<ThemeMode>(globalTheme);

  useEffect(() => {
    listeners.add(setInternalTheme);
    return () => {
      listeners.delete(setInternalTheme);
    };
  }, []);

  const setTheme = (newMode: ThemeMode) => {
    globalTheme = newMode;
    localStorage.setItem('solo-track-mode', newMode);
    
    listeners.forEach((update) => update(newMode));
  };

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = () => {
      let effectiveTheme: 'light' | 'dark';
      if (globalTheme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        effectiveTheme = globalTheme;
      }
      root.setAttribute('data-theme', effectiveTheme);
    };

    applyTheme();

    if (globalTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const toggleTheme = () => {
    const currentOnScreen = document.documentElement.getAttribute('data-theme');
    const nextTheme = currentOnScreen === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return { theme, setTheme, toggleTheme };
}