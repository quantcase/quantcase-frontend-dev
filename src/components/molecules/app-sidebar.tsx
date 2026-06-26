"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Monitor, Briefcase, TrendingUp, Settings, Shield, LogOut, BarChart2, Code2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useUser } from "@/components/providers/UserContext";

const managerNavItems = [
  { label: "Home",     href: "/dashboard",          icon: Home,       isActive: (p: string) => p === "/dashboard" },
  { label: "Terminal", href: "/screener/home",      icon: Monitor,    isActive: (p: string) => p.startsWith("/screener") },
  { label: "WealthOS", href: "/wealthos/dashboard", icon: Briefcase,  isActive: (p: string) => p.startsWith("/wealthos") },
  { label: "Models",   href: "/model-builder",      icon: TrendingUp, isActive: (p: string) => p === "/model-builder" || p.startsWith("/model-builder/") || p === "/model-analytics" },
  { label: "Settings", href: "/settings",           icon: Settings,   isActive: (p: string) => p.startsWith("/settings") },
  { label: "HTML Skills", href: "/admin/html-skills",  icon: Code2,    isActive: (p: string) => p.startsWith("/admin/html-skills") },
  { label: "Coverage",   href: "/admin/coverage",     icon: Activity, isActive: (p: string) => p.startsWith("/admin/coverage") },
  { label: "Admin",      href: "/admin/pipelines",    icon: Shield,   isActive: (p: string) => p.startsWith("/admin") && !p.startsWith("/admin/html-skills") && !p.startsWith("/admin/coverage") },
];

const investorNavItems = [
  { label: "Home",        href: "/investor/dashboard",  icon: Home,      isActive: (p: string) => p === "/investor/dashboard" },
  { label: "Terminal",    href: "/screener/home",        icon: Monitor,   isActive: (p: string) => p.startsWith("/screener") },
  { label: "Portfolio",   href: "/investor/portfolio",   icon: BarChart2, isActive: (p: string) => p.startsWith("/investor/portfolio") },
  { label: "Settings",    href: "/settings",             icon: Settings,  isActive: (p: string) => p.startsWith("/settings") },
  { label: "HTML Skills", href: "/admin/html-skills",    icon: Code2,     isActive: (p: string) => p.startsWith("/admin/html-skills") },
  { label: "Coverage",   href: "/admin/coverage",       icon: Activity,  isActive: (p: string) => p.startsWith("/admin/coverage") },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { accountType, subscription, openPaywall } = useUser();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  function handleLogout() {
    localStorage.clear();
    router.push("/signin");
  }

  if (pathname === "/signin") return null;
  const navItems = mounted && accountType === "investor" ? investorNavItems : managerNavItems;

  const showTrialDot = subscription?.status === "trialing" && (subscription.days_remaining ?? 0) > 0;

  const navIconLink = (label: string, href: string, Icon: React.ElementType, active: boolean, tooltipSide: "right" | "top" = "right") => (
    <TooltipRoot key={label}>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn("flex items-center justify-center rounded-[10px] transition-colors")}
          style={{
            width: 40,
            height: 40,
            background: active ? "var(--qc-ink)" : "transparent",
            color: active ? "var(--qc-on-dark)" : "var(--qc-ink-3)",
            position: "relative",
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
          {showTrialDot && label === "Settings" && (
            <span
              style={{
                position: "absolute",
                top: 7,
                right: 7,
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#c8952a",
                border: "1.5px solid var(--qc-card)",
              }}
            />
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>{label}</TooltipContent>
    </TooltipRoot>
  );

  return (
    <>
      {/* Desktop: fixed left sidebar */}
      <aside
        className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-[72px] flex-col items-center gap-1.5"
        style={{
          paddingTop: 10,
          paddingBottom: 10,
          borderRight: "1px solid var(--qc-hair)",
          background: "var(--qc-card)",
        }}
      >
        {/* Logo mark */}
        <div
          className="mb-2 flex items-center justify-center rounded-full"
          style={{ width: 40, height: 40, background: "var(--qc-ink)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--qc-on-dark)" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </div>

        <TooltipProvider delayDuration={300}>
          <nav className="flex flex-1 flex-col items-center gap-1.5">
            {navItems.map(({ label, href, icon: Icon, isActive }) =>
              navIconLink(label, href, Icon, isActive(pathname), "right")
            )}
          </nav>
        </TooltipProvider>

        {subscription?.status === "trialing" && (subscription.days_remaining ?? 0) > 0 && (
          <button
            onClick={openPaywall}
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#c8952a",
              background: "#fdf6e3",
              border: "1px solid #EFD6A0",
              borderRadius: 4,
              padding: "3px 6px",
              textAlign: "center",
              marginBottom: 4,
              lineHeight: 1.4,
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {subscription.days_remaining}d trial
          </button>
        )}

        <TooltipProvider delayDuration={300}>
          <TooltipRoot>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center rounded-[10px] transition-colors mb-1"
                style={{ width: 40, height: 40, color: "var(--qc-ink-3)" }}
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

      {/* Mobile: sticky bottom nav bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around"
        style={{
          height: 60,
          borderTop: "1px solid var(--qc-hair)",
          background: "var(--qc-card)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <TooltipProvider delayDuration={300}>
          {navItems.map(({ label, href, icon: Icon, isActive }) =>
            navIconLink(label, href, Icon, isActive(pathname), "top")
          )}
          <TooltipRoot>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center rounded-[10px] transition-colors"
                style={{ width: 40, height: 40, color: "var(--qc-ink-3)" }}
              >
                <LogOut size={18} strokeWidth={1.8} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Logout</TooltipContent>
          </TooltipRoot>
        </TooltipProvider>
      </nav>
    </>
  );
}
