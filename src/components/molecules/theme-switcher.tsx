"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import type { ThemeId } from "@/lib/theme";
import { THEME_LABELS } from "@/lib/theme";
import { cn } from "@/lib/utils";

const THEMES: ThemeId[] = ["light-modern", "dark-modern", "light-enterprise", "dark-enterprise"];

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {THEMES.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={cn(
            "w-full rounded px-2 py-1 text-left text-xs transition-colors",
            theme === t
              ? "bg-[var(--qc-sidebar-icon-active-bg)] font-medium text-[var(--qc-sidebar-icon-active-fg)]"
              : "text-[var(--qc-sidebar-icon-idle-fg)] hover:bg-[var(--qc-sidebar-icon-hover-bg)]"
          )}
        >
          {THEME_LABELS[t]}
        </button>
      ))}
    </div>
  );
}
