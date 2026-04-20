"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ThemeId } from "@/lib/theme";
import { THEME_STORAGE_KEY, DEFAULT_THEME, THEME_CLASS_MAP, applyTheme } from "@/lib/theme";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    if (stored && stored in THEME_CLASS_MAP) {
      applyTheme(stored);
      setThemeState(stored);
    }
  }, []);

  function setTheme(newTheme: ThemeId) {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyTheme(newTheme);
    setThemeState(newTheme);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
