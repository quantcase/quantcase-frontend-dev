export type ThemeId = 'purple' | 'dark-purple';

export const THEME_STORAGE_KEY = 'qc-theme';
export const DEFAULT_THEME: ThemeId = 'purple';

export const THEME_CLASS_MAP: Record<ThemeId, string | null> = {
  'purple': null,
  'dark-purple': 'theme-dark-purple',
};

const DARK_THEMES: ThemeId[] = ['dark-purple'];

export function applyTheme(theme: ThemeId) {
  const root = document.documentElement;
  root.classList.remove('theme-dark-purple', 'dark');
  const cls = THEME_CLASS_MAP[theme];
  if (cls) root.classList.add(cls);
  if (DARK_THEMES.includes(theme)) {
    root.classList.add('dark');
  }
}
