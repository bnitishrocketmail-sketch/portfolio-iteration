import { useCallback, useEffect, useState } from 'react';

const KEY = 'imakeuimove-theme';
type Theme = 'light' | 'dark';

function systemDark() { return window.matchMedia('(prefers-color-scheme: dark)').matches; }
function stored(): Theme | null {
  try { const s = localStorage.getItem(KEY); return s === 'dark' || s === 'light' ? s : null; } catch { return null; }
}

/* Three states: explicit light, explicit dark, or follow the system (no attribute). */
export function useTheme() {
  const [explicit, setExplicit] = useState<Theme | null>(() => stored());
  const [sys, setSys] = useState(() => systemDark());

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => setSys(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (explicit) root.setAttribute('data-theme', explicit); else root.removeAttribute('data-theme');
  }, [explicit]);

  const isDark = explicit ? explicit === 'dark' : sys;
  const toggle = useCallback(() => {
    const next: Theme = isDark ? 'light' : 'dark';
    setExplicit(next);
    try { localStorage.setItem(KEY, next); } catch { /* storage may be unavailable */ }
  }, [isDark]);

  return { isDark, toggle };
}
