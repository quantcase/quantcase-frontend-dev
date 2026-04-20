"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Monitor, Briefcase, TrendingUp, Settings, Shield, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { ThemeId } from "@/lib/theme";
import { THEME_LABELS } from "@/lib/theme";

const THEMES: ThemeId[] = ["light-modern", "dark-modern", "light-enterprise", "dark-enterprise", "luxury"];

const navItems = [
  { label: "Home",     href: "/",                  icon: Home,       isActive: (p: string) => p === "/" },
  { label: "Terminal", href: "/screener/home",      icon: Monitor,    isActive: (p: string) => p.startsWith("/screener") },
  { label: "WealthOS", href: "/wealthos/dashboard", icon: Briefcase,  isActive: (p: string) => p.startsWith("/wealthos") },
  { label: "Models",   href: "/model-builder",      icon: TrendingUp, isActive: (p: string) => p === "/model-builder" || p.startsWith("/model-builder/") || p === "/model-analytics" },
  { label: "Settings", href: "/settings",           icon: Settings,   isActive: (p: string) => p.startsWith("/settings") },
  { label: "Admin",    href: "/admin/pipelines",    icon: Shield,     isActive: (p: string) => p.startsWith("/admin") },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-14 flex-col border-r bg-[var(--qc-sidebar-bg)]" style={{ borderColor: "var(--qc-sidebar-border)" }}>
      {/* Logo */}
      <div className="flex h-12 items-center justify-center border-b" style={{ borderColor: "var(--qc-sidebar-border)" }}>
        <span className="text-base font-bold" style={{ color: "var(--qc-accent-logo)" }}>Q</span>
      </div>

      {/* Nav icons */}
      <TooltipProvider delayDuration={300}>
        <nav className="flex flex-1 flex-col gap-1 py-3 px-2">
          {navItems.map(({ label, href, icon: Icon, isActive }) => {
            const active = isActive(pathname);
            return (
              <TooltipRoot key={label}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      "flex w-full items-center justify-center rounded-md p-2 transition-colors",
                      active
                        ? "bg-[var(--qc-sidebar-icon-active-bg)] text-[var(--qc-sidebar-icon-active-fg)]"
                        : "text-[var(--qc-sidebar-icon-idle-fg)] hover:bg-[var(--qc-sidebar-icon-hover-bg)] hover:text-[var(--qc-sidebar-icon-active-fg)]"
                    )}
                  >
                    <Icon className="size-5 shrink-0" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </TooltipRoot>
            );
          })}
        </nav>
      </TooltipProvider>

      {/* Footer */}
      <div className="border-t py-3 flex flex-col items-center gap-2" style={{ borderColor: "var(--qc-sidebar-border)" }}>
        <ThemeSwitcherButton />
        <p className="text-[8px]" style={{ color: "var(--qc-text-muted)" }}>v2.4</p>
      </div>
    </aside>
  );
}

function ThemeSwitcherButton() {
  const { theme, setTheme } = useTheme();

  return (
    <Popover>
      <TooltipProvider delayDuration={300}>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex items-center justify-center rounded-md p-2 transition-colors",
                "text-[var(--qc-sidebar-icon-idle-fg)] hover:bg-[var(--qc-sidebar-icon-hover-bg)] hover:text-[var(--qc-sidebar-icon-active-fg)]"
              )}
            >
              <Palette className="size-5 shrink-0" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">Theme</TooltipContent>
      </TooltipRoot>
      </TooltipProvider>
      <PopoverContent
        side="right"
        align="end"
        className="w-52 p-2"
        style={{
          background: "var(--qc-sidebar-bg)",
          border: "1px solid var(--qc-sidebar-border)",
          borderRadius: 10,
        }}
      >
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--qc-text-muted)" }}>
          Theme
        </p>
        <div className="flex flex-col gap-0.5">
          {THEMES.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                "w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                theme === t
                  ? "font-medium bg-[var(--qc-sidebar-icon-active-bg)] text-[var(--qc-sidebar-icon-active-fg)]"
                  : "text-[var(--qc-sidebar-icon-idle-fg)] hover:bg-[var(--qc-sidebar-icon-hover-bg)] hover:text-[var(--qc-sidebar-icon-active-fg)]"
              )}
            >
              {THEME_LABELS[t]}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
