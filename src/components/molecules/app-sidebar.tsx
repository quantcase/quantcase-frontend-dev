"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Monitor, Briefcase, TrendingUp, Settings, Shield, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useTheme } from "@/components/providers/ThemeProvider";

const navItems = [
  { label: "Home",     href: "/dashboard",          icon: Home,       isActive: (p: string) => p === "/dashboard" },
  { label: "Terminal", href: "/screener/home",      icon: Monitor,    isActive: (p: string) => p.startsWith("/screener") },
  { label: "WealthOS", href: "/wealthos/dashboard", icon: Briefcase,  isActive: (p: string) => p.startsWith("/wealthos") },
  { label: "Models",   href: "/model-builder",      icon: TrendingUp, isActive: (p: string) => p === "/model-builder" || p.startsWith("/model-builder/") || p === "/model-analytics" },
  { label: "Settings", href: "/settings",           icon: Settings,   isActive: (p: string) => p.startsWith("/settings") },
  { label: "Admin",    href: "/admin/pipelines",    icon: Shield,     isActive: (p: string) => p.startsWith("/admin") },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  function handleLogout() {
    localStorage.clear();
    router.push("/signin");
  }

  if (pathname === "/signin") return null;
  const isDark = theme === "dark-purple";

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-[72px] flex-col items-center py-[22px] gap-1.5"
      style={{
        borderRight: "1px solid var(--qc-sidebar-border)",
        background: "var(--qc-sidebar-bg)",
      }}
    >
      {/* Logo mark — lime circle */}
      <div
        className="mb-2 flex items-center justify-center rounded-full"
        style={{ width: 40, height: 40, background: "var(--qc-accent-primary)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--qc-accent-primary-fg)" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </div>

      {/* Nav icons */}
      <TooltipProvider delayDuration={300}>
        <nav className="flex flex-1 flex-col items-center gap-1.5">
          {navItems.map(({ label, href, icon: Icon, isActive }) => {
            const active = isActive(pathname);
            return (
              <TooltipRoot key={label}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center justify-center rounded-[10px] transition-colors",
                    )}
                    style={{
                      width: 40,
                      height: 40,
                      background: active ? "var(--qc-sidebar-icon-active-bg)" : "transparent",
                      color: active ? "var(--qc-sidebar-icon-active-fg)" : "var(--qc-sidebar-icon-idle-fg)",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "var(--qc-sidebar-icon-hover-bg)";
                        (e.currentTarget as HTMLElement).style.color = "var(--qc-text-heading)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "var(--qc-sidebar-icon-idle-fg)";
                      }
                    }}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </TooltipRoot>
            );
          })}
        </nav>
      </TooltipProvider>

      {/* Logout */}
      <TooltipProvider delayDuration={300}>
        <TooltipRoot>
          <TooltipTrigger asChild>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center rounded-[10px] transition-colors mb-1"
              style={{
                width: 40,
                height: 40,
                color: "var(--qc-sidebar-icon-idle-fg)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--qc-sidebar-icon-hover-bg)";
                (e.currentTarget as HTMLElement).style.color = "var(--qc-text-heading)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "var(--qc-sidebar-icon-idle-fg)";
              }}
            >
              <LogOut size={18} strokeWidth={1.8} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Logout</TooltipContent>
        </TooltipRoot>
      </TooltipProvider>

    </aside>
  );
}
