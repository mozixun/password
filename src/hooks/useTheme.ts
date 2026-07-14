import { useEffect } from 'react';
import { useStore } from '@/store';

/**
 * 将 store 中的 theme 状态同步到 <html> 的 class 属性，
 * 使 CSS 变量切换生效，实现深色/浅色/跟随系统主题。
 */
export function useThemeEffect() {
  const theme = useStore((s) => s.ui.theme);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (isDark: boolean) => {
      root.classList.toggle('dark', isDark);
    };

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches);

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);
}
