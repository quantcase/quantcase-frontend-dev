"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

interface NavTab {
  label: string;
  href: string;
}

const NAV_TABS: NavTab[] = [
  { label: "Overview", href: "/screener/overview" },
  { label: "Management Factor", href: "/screener/management" },
  { label: "Opportunity Factor", href: "/screener/opportunity" },
  { label: "Deal Factor", href: "/screener/deal" },
  { label: "Entry/Exit Factor", href: "/screener/entry-exit" },
  { label: "Forward Trajectory", href: "/screener/forward-trajectory" },
];

function ScreenerSubpageNavInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol");

  return (
    <nav className="fixed left-56 right-0 top-14 z-20 h-11 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex h-full items-end px-6 gap-1">
        {NAV_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          const href = symbol
            ? `${tab.href}?symbol=${encodeURIComponent(symbol)}`
            : tab.href;

          return (
            <Link
              key={tab.href}
              href={href}
              className={cn(
                "relative flex h-full items-center px-3 text-sm transition-colors whitespace-nowrap",
                isActive
                  ? "text-gray-900 dark:text-white font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gray-900 after:dark:bg-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function ScreenerSubpageNav() {
  return (
    <Suspense fallback={
      <nav className="fixed left-56 right-0 top-14 z-20 h-11 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950" />
    }>
      <ScreenerSubpageNavInner />
    </Suspense>
  );
}
