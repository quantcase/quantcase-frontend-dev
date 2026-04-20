export type ThemeId = 'light-modern' | 'dark-modern' | 'light-enterprise' | 'dark-enterprise';

export const THEME_STORAGE_KEY = 'qc-theme';
export const DEFAULT_THEME: ThemeId = 'light-modern';

export const THEME_CLASS_MAP: Record<ThemeId, string | null> = {
  'light-modern': null,
  'dark-modern': 'theme-dark-modern',
  'light-enterprise': 'theme-light-enterprise',
  'dark-enterprise': 'theme-dark-enterprise',
};

export const THEME_LABELS: Record<ThemeId, string> = {
  'light-modern': 'Light Modern',
  'dark-modern': 'Dark Modern',
  'light-enterprise': 'Light Enterprise',
  'dark-enterprise': 'Dark Enterprise',
};

export function applyTheme(theme: ThemeId) {
  const root = document.documentElement;
  root.classList.remove('theme-dark-modern', 'theme-light-enterprise', 'theme-dark-enterprise', 'dark');
  const cls = THEME_CLASS_MAP[theme];
  if (cls) root.classList.add(cls);
  if (theme === 'dark-modern' || theme === 'dark-enterprise') {
    root.classList.add('dark');
  }
}
