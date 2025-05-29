import { useEffect, useState } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  useEffect(() => {
    const applyTheme = (selectedTheme) => {
      if (selectedTheme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', selectedTheme);
      }
    };

    applyTheme(theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e) => {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const changeTheme = (selectedTheme) => {
    let normalizedTheme = selectedTheme.toLowerCase();

    if (normalizedTheme === 'claro') normalizedTheme = 'light';
    if (normalizedTheme === 'escuro') normalizedTheme = 'dark';
    if (normalizedTheme === 'sistema') normalizedTheme = 'system';

    localStorage.setItem('theme', normalizedTheme);
    setTheme(normalizedTheme);
  };

  return { theme, changeTheme };
}
