"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  SlidersHorizontal,
  BarChart2,
  TrendingUp,
  Settings,
  Briefcase,
  Monitor,
  Users,
  UserCheck,
  LineChart,
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type SubItem = { label: string; href: string; icon: React.ElementType };
type NavItem =
  | { label: string; href: string; icon: React.ElementType; activePrefix?: string; children?: never }
  | { label: string; href?: never; icon: React.ElementType; activePrefix: string; children: SubItem[] };

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  {
    label: "Terminal",
    icon: Monitor,
    activePrefix: "/screener",
    children: [
      { label: "Screener", href: "/screener/home", icon: SlidersHorizontal },
      { label: "Model Builder", href: "/model-builder", icon: TrendingUp },
      { label: "Model Analytics", href: "/model-analytics", icon: BarChart2 },
    ],
  },
  {
    label: "WealthOS",
    icon: Briefcase,
    activePrefix: "/wealthos",
    children: [
      { label: "Dashboard", href: "/wealthos/dashboard", icon: LayoutDashboard },
      { label: "Clients", href: "/wealthos/clients", icon: Users },
      { label: "RMs", href: "/wealthos/rms", icon: UserCheck },
      { label: "Models", href: "/wealthos/models", icon: TrendingUp },
      { label: "Analytics", href: "/wealthos/analytics", icon: LineChart },
    ],
  },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  const defaultOpen = navItems.reduce<Record<string, boolean>>((acc, item) => {
    if (item.children) {
      acc[item.label] = pathname.startsWith(item.activePrefix);
    }
    return acc;
  }, {});

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(defaultOpen);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-gray-200 px-5 dark:border-gray-800">
        <span className="text-base font-bold text-gray-900 dark:text-white">
          <span className="text-blue-600">Quant</span>Case
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 py-3 px-3">
        {navItems.map((item) => {
          if (item.children) {
            const isGroupActive = pathname.startsWith(item.activePrefix);
            const isOpen = openMenus[item.label] ?? false;
            const Icon = item.icon;
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                    isGroupActive
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-white"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isOpen ? (
                    <ChevronDown className="size-3.5 shrink-0" />
                  ) : (
                    <ChevronRight className="size-3.5 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="mt-1 ml-3 flex flex-col gap-0.5 border-l border-gray-200 pl-3 dark:border-gray-700">
                    {item.children.map(({ label, href, icon: SubIcon }) => {
                      const isActive = pathname === href || pathname.startsWith(href + "/");
                      return (
                        <Link
                          key={label}
                          href={href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-white"
                          )}
                        >
                          <SubIcon className="size-3.5 shrink-0" />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const { label, href, icon: Icon } = item as { label: string; href: string; icon: React.ElementType; activePrefix?: string };
          const activePrefix = (item as { activePrefix?: string }).activePrefix;
          const isActive =
            href !== "#" &&
            (activePrefix
              ? pathname.startsWith(activePrefix)
              : pathname === href || (href !== "/" && pathname.startsWith(href)));

          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-white"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-5 py-3 dark:border-gray-800 mt-auto">
        <p className="text-[10px] leading-tight text-gray-400 dark:text-gray-600">
          Institutional Platform v2.4
        </p>
        <p className="text-[10px] leading-tight text-gray-400 dark:text-gray-600">
          © QuantCase FinTech
        </p>
      </div>
    </aside>
  );
}
