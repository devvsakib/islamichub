import { useState, useEffect, useCallback } from 'react';
import { getTheme, saveTheme } from '@/utils/storage';

export function useTheme() {
  const [theme, setThemeState] = useState(() => getTheme());

  const applyTheme = useCallback((t) => {
    const html = document.documentElement;
    if (t === 'dark' || (t === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('auto');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme, applyTheme]);

  const setTheme = useCallback((t) => {
    saveTheme(t);
    setThemeState(t);
    applyTheme(t);
  }, [applyTheme]);

  return { theme, setTheme };
}
