import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const getSystemTheme = (): Theme =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

  const getInitialTheme = (): Theme => {
    const saved = localStorage.getItem('theme') as Theme | null;
    return saved || getSystemTheme();
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
}