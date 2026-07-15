"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Briefcase, TrendingUp, Settings, Shield, BarChart2, Code2, Activity, Sparkles, Mail, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useUser } from "@/components/providers/UserContext";
import { UserMenu } from "@/components/molecules/user-menu";

const managerNavItems = [
  { label: "Home",     href: "/dashboard",          icon: Home,       isActive: (p: string) => p === "/dashboard" },
  { label: "WealthOS", href: "/wealthos/dashboard", icon: Briefcase,  isActive: (p: string) => p.startsWith("/wealthos"), adminOnly: true },
  { label: "Models",   href: "/model-builder",      icon: TrendingUp, isActive: (p: string) => p === "/model-builder" || p.startsWith("/model-builder/") || p === "/model-analytics", adminOnly: true },
  { label: "Settings", href: "/settings",           icon: Settings,   isActive: (p: string) => p.startsWith("/settings") },
  { label: "HTML Skills", href: "/admin/html-skills",  icon: Code2,    isActive: (p: string) => p.startsWith("/admin/html-skills"), adminOnly: true },
  { label: "Post-HTML Skills", href: "/admin/post-html-skills", icon: Sparkles, isActive: (p: string) => p.startsWith("/admin/post-html-skills"), adminOnly: true },
  { label: "Coverage",   href: "/admin/coverage",     icon: Activity, isActive: (p: string) => p.startsWith("/admin/coverage"), adminOnly: true },
  { label: "Beta Invites", href: "/admin/invites",    icon: Mail,     isActive: (p: string) => p.startsWith("/admin/invites"), adminOnly: true },
  { label: "Error Reports", href: "/admin/error-reports", icon: Flag, isActive: (p: string) => p.startsWith("/admin/error-reports"), adminOnly: true },
  { label: "Admin",      href: "/admin/pipelines",    icon: Shield,   isActive: (p: string) => p.startsWith("/admin") && !p.startsWith("/admin/html-skills") && !p.startsWith("/admin/post-html-skills") && !p.startsWith("/admin/coverage") && !p.startsWith("/admin/invites") && !p.startsWith("/admin/error-reports"), adminOnly: true },
];

const investorNavItems = [
  { label: "Home",        href: "/investor/dashboard",  icon: Home,      isActive: (p: string) => p === "/investor/dashboard" },
  { label: "Diary",       href: "/diary",                icon: BarChart2, isActive: (p: string) => p.startsWith("/diary") },
  { label: "Settings",    href: "/settings",             icon: Settings,  isActive: (p: string) => p.startsWith("/settings") },
  { label: "HTML Skills", href: "/admin/html-skills",    icon: Code2,     isActive: (p: string) => p.startsWith("/admin/html-skills"), adminOnly: true },
  { label: "Post-HTML Skills", href: "/admin/post-html-skills", icon: Sparkles, isActive: (p: string) => p.startsWith("/admin/post-html-skills"), adminOnly: true },
  { label: "Coverage",   href: "/admin/coverage",       icon: Activity,  isActive: (p: string) => p.startsWith("/admin/coverage"), adminOnly: true },
  { label: "Beta Invites", href: "/admin/invites",      icon: Mail,      isActive: (p: string) => p.startsWith("/admin/invites"), adminOnly: true },
  { label: "Error Reports", href: "/admin/error-reports", icon: Flag,    isActive: (p: string) => p.startsWith("/admin/error-reports"), adminOnly: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { accountType, subscription, openPaywall, isAdmin } = useUser();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  if (pathname === "/signin") return null;
  const baseNavItems = mounted && accountType === "investor" ? investorNavItems : managerNavItems;
  const navItems = baseNavItems.filter((item) => !item.adminOnly || (mounted && isAdmin));

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
                background: "var(--qc-golden-ink)",
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
          className="mb-2 flex items-center justify-center overflow-hidden rounded-[10px]"
          style={{ width: 40, height: 40 }}
        >
          <Image
            src="/logos/logo-dark.png"
            alt="QuantCase"
            width={40}
            height={40}
            priority
            className="h-full w-full object-cover"
          />
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
              color: "var(--qc-golden-ink)",
              background: "var(--qc-warn-soft)",
              border: "1px solid var(--qc-warn-soft)",
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

        <div className="mb-1">
          <UserMenu />
        </div>
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
        </TooltipProvider>
        <UserMenu placement="up" />
      </nav>
    </>
  );
}
