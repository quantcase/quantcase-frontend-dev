"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Monitor, Briefcase, TrendingUp, Settings, Shield, LogOut, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useUser } from "@/components/providers/UserContext";

const managerNavItems = [
  { label: "Home",     href: "/dashboard",          icon: Home,       isActive: (p: string) => p === "/dashboard" },
  { label: "Terminal", href: "/screener/home",      icon: Monitor,    isActive: (p: string) => p.startsWith("/screener") },
  { label: "WealthOS", href: "/wealthos/dashboard", icon: Briefcase,  isActive: (p: string) => p.startsWith("/wealthos") },
  { label: "Models",   href: "/model-builder",      icon: TrendingUp, isActive: (p: string) => p === "/model-builder" || p.startsWith("/model-builder/") || p === "/model-analytics" },
  { label: "Settings", href: "/settings",           icon: Settings,   isActive: (p: string) => p.startsWith("/settings") },
  { label: "Admin",    href: "/admin/pipelines",    icon: Shield,     isActive: (p: string) => p.startsWith("/admin") },
];

const investorNavItems = [
  { label: "Home",      href: "/investor/dashboard", icon: Home,      isActive: (p: string) => p === "/investor/dashboard" },
  { label: "Terminal",  href: "/screener/home",      icon: Monitor,   isActive: (p: string) => p.startsWith("/screener") },
  { label: "Portfolio", href: "/investor/portfolio", icon: BarChart2, isActive: (p: string) => p.startsWith("/investor/portfolio") },
  { label: "Settings",  href: "/settings",           icon: Settings,  isActive: (p: string) => p.startsWith("/settings") },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { accountType } = useUser();

  function handleLogout() {
    localStorage.clear();
    router.push("/signin");
  }

  if (pathname === "/signin") return null;
  const isDark = theme === "dark-purple";
  const navItems = accountType === "investor" ? investorNavItems : managerNavItems;

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-[72px] flex-col items-center py-[22px] gap-1.5"
      style={{
        borderRight: "1px solid var(--qc-hair)",
        background: "var(--qc-card)",
      }}
    >
      {/* Logo mark — lime circle */}
      <div
        className="mb-2 flex items-center justify-center rounded-full"
        style={{ width: 40, height: 40, background: "var(--qc-ink)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--qc-on-dark)" strokeWidth="2">
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
                      background: active ? "var(--qc-ink)" : "transparent",
                      color: active ? "var(--qc-on-dark)" : "var(--qc-ink-3)",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "var(--qc-section)";
                        (e.currentTarget as HTMLElement).style.color = "var(--qc-ink)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "var(--qc-ink-3)";
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
                color: "var(--qc-ink-3)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--qc-section)";
                (e.currentTarget as HTMLElement).style.color = "var(--qc-ink)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "var(--qc-ink-3)";
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
