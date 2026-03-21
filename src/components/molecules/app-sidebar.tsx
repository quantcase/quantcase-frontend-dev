"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, SlidersHorizontal, FileText, BarChart2, TrendingUp, Settings, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Screener", href: "/screener/home", icon: SlidersHorizontal, activePrefix: "/screener" },
  { label: "WealthOS", href: "/wealthos/dashboard", icon: Briefcase, activePrefix: "/wealthos" },
  { label: "IC Report", href: "/ic-report", icon: FileText },
  { label: "Model Builder", href: "/model-builder", icon: TrendingUp },
  { label: "Model Analytics", href: "/model-analytics", icon: BarChart2 },
  { label: "Settings", href: "#", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-gray-200 px-5 dark:border-gray-800">
        <span className="text-base font-bold text-gray-900 dark:text-white">
          <span className="text-blue-600">Quant</span>Case
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-2 py-3 px-3">
        {navItems.map(({ label, href, icon: Icon, ...rest }) => {
          const activePrefix = (rest as { activePrefix?: string }).activePrefix;
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
      <div className="border-t border-gray-200 px-5 py-3 dark:border-gray-800">
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
